import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const patchSchema = z.object({
  action: z.enum(["cancel", "reschedule"]),
  startAt: z.string().datetime().optional(),
  barberId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const appointment = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
      include: { services: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return NextResponse.json({ error: "Запись нельзя изменить" }, { status: 400 });
    }

    if (body.action === "cancel") {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "cancelled" },
        include: {
          barber: true,
          services: { include: { service: true } },
        },
      });
      return NextResponse.json({ appointment: updated });
    }

    if (!body.startAt) {
      return NextResponse.json({ error: "Укажите новое время" }, { status: 400 });
    }

    const startAt = new Date(body.startAt);
    const endAt = addMinutes(startAt, appointment.totalDuration);
    const barberId = body.barberId || appointment.barberId;

    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        barberId,
        status: { in: ["confirmed", "rescheduled"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (conflict) {
      return NextResponse.json({ error: "Новый слот занят" }, { status: 409 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        startAt,
        endAt,
        barberId,
        status: "rescheduled",
        reminder24Sent: false,
        reminder2hSent: false,
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}
