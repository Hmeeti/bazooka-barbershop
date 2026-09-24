import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const duration = Number(searchParams.get("duration") || 45);
  const barberId = searchParams.get("barberId");

  if (!dateStr) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const slots = await getAvailableSlots({
    date,
    durationMin: duration,
    barberId: barberId && barberId !== "any" ? barberId : null,
  });

  // Group unique start times for "any barber" UX
  const uniqueStarts = Array.from(
    new Map(slots.map((s) => [s.startAt, s])).values()
  );

  return NextResponse.json({
    slots: barberId && barberId !== "any" ? slots : uniqueStarts,
    all: slots,
  });
}
