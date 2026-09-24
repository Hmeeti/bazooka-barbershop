import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { sendBookingConfirmation } from "@/lib/email";

const createSchema = z.object({
  serviceIds: z.array(z.string()).min(1),
  barberId: z.string().nullable(),
  startAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    include: {
      barber: true,
      services: { include: { service: true } },
    },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

    const body = createSchema.parse(await req.json());
    const services = await prisma.service.findMany({
      where: { id: { in: body.serviceIds }, isActive: true },
    });
    if (services.length !== body.serviceIds.length) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 400 });
    }

    const totalDuration = services.reduce((s, x) => s + x.durationMin, 0);
    const totalPrice = services.reduce((s, x) => s + x.price, 0);
    const startAt = new Date(body.startAt);
    const endAt = addMinutes(startAt, totalDuration);

    let barberId = body.barberId;
    if (!barberId) {
      const candidates = await prisma.barber.findMany({ where: { isActive: true } });
      const busy = await prisma.appointment.findMany({
        where: {
          status: { in: ["confirmed", "rescheduled"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });
      const free = candidates.find((b) => !busy.some((a) => a.barberId === b.id));
      if (!free) {
        return NextResponse.json({ error: "Нет свободных мастеров на это время" }, { status: 409 });
      }
      barberId = free.id;
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId,
        status: { in: ["confirmed", "rescheduled"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (conflict) {
      return NextResponse.json({ error: "Слот уже занят" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        barberId,
        startAt,
        endAt,
        totalPrice,
        totalDuration,
        notes: body.notes,
        status: "confirmed",
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.price,
            durationMin: s.durationMin,
          })),
        },
      },
      include: {
        barber: true,
        services: { include: { service: true } },
        user: true,
      },
    });

    const branch = await prisma.branch.findFirst({ where: { isPrimary: true } });

    await sendBookingConfirmation({
      clientName: appointment.user.name,
      clientEmail: appointment.user.email,
      serviceNames: appointment.services.map((s) => s.service.name),
      barberName: appointment.barber.name,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      totalPrice: appointment.totalPrice,
      address: branch?.address || "ул. Желтоксан, 76, Тараз",
      appointmentId: appointment.id,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Некорректные данные записи" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Не удалось создать запись" }, { status: 500 });
  }
}
