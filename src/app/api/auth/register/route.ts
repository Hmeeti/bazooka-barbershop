import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  attachSessionCookie,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const phone = body.phone.replace(/\s+/g, "");

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Пользователь с таким email или телефоном уже существует" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        phone,
        passwordHash: await hashPassword(body.password),
      },
    });

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
    console.error(e);
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
