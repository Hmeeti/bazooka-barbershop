import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [services, barbers, portfolio, branches] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.barber.findMany({
      where: { isActive: true },
      include: {
        portfolio: { orderBy: { sortOrder: "asc" }, take: 4 },
      },
      orderBy: { name: "asc" },
    }),
    prisma.portfolioImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.branch.findMany({ orderBy: [{ isPrimary: "desc" }, { name: "asc" }] }),
  ]);

  return NextResponse.json({ services, barbers, portfolio, branches });
}
