import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/lib/reminders";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await processReminders();
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
