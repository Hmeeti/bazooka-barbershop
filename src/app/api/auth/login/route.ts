import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  attachSessionCookie,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
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
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте корректность данных" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
