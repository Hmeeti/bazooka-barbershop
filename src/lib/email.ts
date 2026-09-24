import nodemailer from "nodemailer";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendMail(payload: MailPayload) {
  const from = process.env.SMTP_FROM || "Bazooka Barbershop <noreply@bazooka.local>";
  const transporter = getTransporter();

  if (!transporter) {
    console.log("\n========== EMAIL (dev console) ==========");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(payload.text || payload.html.replace(/<[^>]+>/g, " "));
    console.log("=========================================\n");
    return { ok: true, mode: "console" as const };
  }

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  return { ok: true, mode: "smtp" as const };
}

export function brandShell(content: string) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:Arial,Helvetica,sans-serif;color:#F5EDE0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#151515;border:1px solid #2A2A2A;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #2A2A2A;">
              <div style="font-size:28px;letter-spacing:0.18em;font-weight:700;color:#C4A574;">BAZOOKA</div>
              <div style="font-size:12px;letter-spacing:0.28em;color:#8A8A8A;margin-top:4px;">BARBERSHOP</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">${content}</td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2A2A;font-size:12px;color:#8A8A8A;">
              ул. Желтоксан, 76 · Тараз · +7 708 199 10 80<br/>
              <a href="https://www.instagram.com/bazooka.barbershop" style="color:#C4A574;text-decoration:none;">@bazooka.barbershop</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type BookingMailData = {
  clientName: string;
  clientEmail: string;
  serviceNames: string[];
  barberName: string;
  startAt: Date;
  endAt: Date;
  totalPrice: number;
  address: string;
  appointmentId: string;
};

function calendarLinks(data: BookingMailData) {
  const start = format(data.startAt, "yyyyMMdd'T'HHmmss");
  const end = format(data.endAt, "yyyyMMdd'T'HHmmss");
  const title = encodeURIComponent(`Bazooka Barbershop — ${data.serviceNames.join(", ")}`);
  const details = encodeURIComponent(
    `Мастер: ${data.barberName}\nУслуги: ${data.serviceNames.join(", ")}\nАдрес: ${data.address}`
  );
  const location = encodeURIComponent(data.address);
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  const ics = `${process.env.APP_URL || "http://localhost:3000"}/api/appointments/${data.appointmentId}/ics`;
  return { google, ics };
}

export async function sendBookingConfirmation(data: BookingMailData) {
  const when = format(data.startAt, "d MMMM yyyy, HH:mm", { locale: ru });
  const { google, ics } = calendarLinks(data);
  const html = brandShell(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#F5EDE0;">Запись подтверждена</h1>
    <p style="margin:0 0 24px;color:#B8B0A4;line-height:1.5;">
      Привет, ${data.clientName}! Ждём вас в Bazooka Barbershop.
    </p>
    <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;color:#8A8A8A;">Услуги</td><td style="padding:8px 0;text-align:right;color:#F5EDE0;">${data.serviceNames.join(", ")}</td></tr>
      <tr><td style="padding:8px 0;color:#8A8A8A;">Мастер</td><td style="padding:8px 0;text-align:right;color:#F5EDE0;">${data.barberName}</td></tr>
      <tr><td style="padding:8px 0;color:#8A8A8A;">Дата и время</td><td style="padding:8px 0;text-align:right;color:#C4A574;">${when}</td></tr>
      <tr><td style="padding:8px 0;color:#8A8A8A;">Адрес</td><td style="padding:8px 0;text-align:right;color:#F5EDE0;">${data.address}</td></tr>
      <tr><td style="padding:8px 0;color:#8A8A8A;">Сумма</td><td style="padding:8px 0;text-align:right;color:#F5EDE0;">${data.totalPrice.toLocaleString("ru-RU")} ₸</td></tr>
    </table>
    <a href="${google}" style="display:inline-block;background:#C4A574;color:#0B0B0B;text-decoration:none;padding:12px 18px;font-weight:700;margin-right:8px;margin-bottom:8px;">Google Календарь</a>
    <a href="${ics}" style="display:inline-block;border:1px solid #C4A574;color:#C4A574;text-decoration:none;padding:12px 18px;font-weight:700;margin-bottom:8px;">Apple Calendar (.ics)</a>
  `);

  return sendMail({
    to: data.clientEmail,
    subject: `Запись подтверждена — ${when}`,
    html,
    text: `Привет, ${data.clientName}! Запись в Bazooka Barbershop: ${data.serviceNames.join(", ")}, мастер ${data.barberName}, ${when}, ${data.address}.`,
  });
}

export async function sendReminder(data: BookingMailData & { hoursBefore: number }) {
  const when = format(data.startAt, "HH:mm", { locale: ru });
  const dayLabel =
    data.hoursBefore >= 20
      ? `завтра в ${when}`
      : `сегодня в ${when}`;

  const html = brandShell(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#F5EDE0;">Напоминание о записи</h1>
    <p style="margin:0;color:#B8B0A4;line-height:1.6;font-size:16px;">
      Привет, ${data.clientName}! Напоминаем о вашей записи в Bazooka Barbershop
      ${dayLabel} к мастеру ${data.barberName}.
    </p>
    <p style="margin:20px 0 0;color:#8A8A8A;">Услуги: ${data.serviceNames.join(", ")} · ${data.address}</p>
  `);

  return sendMail({
    to: data.clientEmail,
    subject: `Напоминание: запись в Bazooka ${dayLabel}`,
    html,
    text: `Привет, ${data.clientName}! Напоминаем о вашей записи в Bazooka Barbershop ${dayLabel} к мастеру ${data.barberName}.`,
  });
}

export async function sendOtpEmail(email: string, code: string) {
  const html = brandShell(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#F5EDE0;">Код входа</h1>
    <p style="margin:0 0 20px;color:#B8B0A4;">Ваш одноразовый код для входа в Bazooka Barbershop:</p>
    <div style="font-size:36px;letter-spacing:0.3em;font-weight:700;color:#C4A574;">${code}</div>
    <p style="margin:20px 0 0;color:#8A8A8A;font-size:13px;">Код действует 10 минут.</p>
  `);
  return sendMail({
    to: email,
    subject: `Код входа: ${code}`,
    html,
    text: `Ваш код входа в Bazooka Barbershop: ${code}. Действует 10 минут.`,
  });
}
