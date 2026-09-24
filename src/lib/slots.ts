import { addMinutes, setHours, setMinutes, setSeconds, startOfDay, isBefore, isAfter } from "date-fns";
import { prisma } from "./prisma";

export async function getAvailableSlots(params: {
  date: Date;
  durationMin: number;
  barberId?: string | null;
}) {
  const dayStart = startOfDay(params.date);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  const barbers = await prisma.barber.findMany({
    where: {
      isActive: true,
      ...(params.barberId ? { id: params.barberId } : {}),
    },
  });

  if (!barbers.length) return [] as { barberId: string; startAt: string; endAt: string }[];

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: { in: barbers.map((b) => b.id) },
      status: { in: ["confirmed", "rescheduled"] },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
  });

  const now = new Date();
  const slots: { barberId: string; startAt: string; endAt: string }[] = [];
  const step = 30;

  for (const barber of barbers) {
    let cursor = setSeconds(setMinutes(setHours(dayStart, barber.workStart), 0), 0);
    const workEnd = setSeconds(setMinutes(setHours(dayStart, barber.workEnd), 0), 0);

    while (true) {
      const end = addMinutes(cursor, params.durationMin);
      if (isAfter(end, workEnd)) break;

      const overlaps = appointments.some(
        (a) =>
          a.barberId === barber.id &&
          cursor < a.endAt &&
          end > a.startAt
      );

      if (!overlaps && !isBefore(cursor, now)) {
        slots.push({
          barberId: barber.id,
          startAt: cursor.toISOString(),
          endAt: end.toISOString(),
        });
      }

      cursor = addMinutes(cursor, step);
    }
  }

  return slots.sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
}

export function pickAnyBarberSlot(
  slots: { barberId: string; startAt: string; endAt: string }[],
  preferredStart: string
) {
  return slots.find((s) => s.startAt === preferredStart) || null;
}
