import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().email(),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const action = json.action as "request" | "verify";

    if (action === "request") {
      const { email } = requestSchema.parse(json);
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (!user) {
        return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
      }
      const code = await createOtp(user.email, user.id);
      await sendOtpEmail(user.email, code);
      return NextResponse.json({ ok: true, message: "Код отправлен на email" });
    }

    if (action === "verify") {
      const { email, code } = verifySchema.parse(json);
      const { verifyOtp, createSessionToken, attachSessionCookie } = await import("@/lib/auth");
      const record = await verifyOtp(email.toLowerCase().trim(), code);
      if (!record) {
        return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 401 });
      }
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (!user) {
        return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
      }
      const token = await createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
      const res = NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      });
      return attachSessionCookie(res, token);
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте корректность данных" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Ошибка OTP" }, { status: 500 });
  }
}
