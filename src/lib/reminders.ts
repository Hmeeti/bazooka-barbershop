import { prisma } from "@/lib/prisma";
import { sendReminder } from "@/lib/email";
import { addHours } from "date-fns";

export async function processReminders() {
  const now = new Date();
  const in26h = addHours(now, 26);
  const in22h = addHours(now, 22);
  const in3h = addHours(now, 3);
  const in2h = addHours(now, 2);

  const for24h = await prisma.appointment.findMany({
    where: {
      status: "confirmed",
      reminder24Sent: false,
      startAt: { gte: in22h, lte: in26h },
    },
    include: {
      user: true,
      barber: true,
      services: { include: { service: true } },
    },
  });

  const for2h = await prisma.appointment.findMany({
    where: {
      status: "confirmed",
      reminder2hSent: false,
      startAt: { gte: in2h, lte: in3h },
    },
    include: {
      user: true,
      barber: true,
      services: { include: { service: true } },
    },
  });

  const primary = await prisma.branch.findFirst({ where: { isPrimary: true } });
  const address = primary?.address || "ул. Желтоксан, 76, Тараз";

  let sent24 = 0;
  let sent2h = 0;

  for (const appt of for24h) {
    await sendReminder({
      clientName: appt.user.name,
      clientEmail: appt.user.email,
      serviceNames: appt.services.map((s) => s.service.name),
      barberName: appt.barber.name,
      startAt: appt.startAt,
      endAt: appt.endAt,
      totalPrice: appt.totalPrice,
      address,
      appointmentId: appt.id,
      hoursBefore: 24,
    });
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminder24Sent: true },
    });
    sent24 += 1;
  }

  for (const appt of for2h) {
    await sendReminder({
      clientName: appt.user.name,
      clientEmail: appt.user.email,
      serviceNames: appt.services.map((s) => s.service.name),
      barberName: appt.barber.name,
      startAt: appt.startAt,
      endAt: appt.endAt,
      totalPrice: appt.totalPrice,
      address,
      appointmentId: appt.id,
      hoursBefore: 2,
    });
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminder2hSent: true },
    });
    sent2h += 1;
  }

  return { sent24, sent2h };
}
