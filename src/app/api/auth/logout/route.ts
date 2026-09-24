import { NextResponse } from "next/server";
import { attachClearSession } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  return attachClearSession(res);
}
