import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "bazooka_session";
const OTP_COOKIE = "bazooka_otp_pending";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      phone: String(payload.phone),
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      phone: String(payload.phone),
    };
  } catch {
    return null;
  }
}

export function attachSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export function attachClearSession(res: NextResponse) {
  res.cookies.delete(COOKIE_NAME);
  return res;
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(email: string, userId?: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpCode.create({
    data: { email: email.toLowerCase(), code, expiresAt, userId },
  });
  return code;
}

export async function verifyOtp(email: string, code: string) {
  const record = await prisma.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return null;
  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used: true },
  });
  return record;
}

export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export { COOKIE_NAME, OTP_COOKIE };
