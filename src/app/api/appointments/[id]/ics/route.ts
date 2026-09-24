import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      barber: true,
      services: { include: { service: true } },
      user: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const branch = await prisma.branch.findFirst({ where: { isPrimary: true } });
  const stamp = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
  const title = `Bazooka — ${appointment.services.map((s) => s.service.name).join(", ")}`;
  const description = `Мастер: ${appointment.barber.name}\\nКлиент: ${appointment.user.name}`;
  const location = branch?.address || "ул. Желтоксан, 76, Тараз";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bazooka Barbershop//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@bazooka.barbershop`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(appointment.startAt)}`,
    `DTEND:${stamp(appointment.endAt)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bazooka-${appointment.id}.ics"`,
    },
  });
}
