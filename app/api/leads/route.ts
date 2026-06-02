import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

export async function GET(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;
  if (session.role === "SALES") {
    where.assignedToId = session.userId;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const assignedToId =
    session.role === "SALES" ? session.userId : body.assignedToId;

  const lead = await prisma.lead.create({
    data: {
      fullName: body.fullName,
      companyName: body.companyName,
      website: body.website,
      email: body.email,
      phone: body.phone,
      linkedIn: body.linkedIn,
      socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
      industry: body.industry,
      country: body.country,
      source: body.source,
      notes: body.notes,
      status: body.status ?? "NEW_LEAD",
      assignedToId,
    },
  });

  return NextResponse.json(lead);
}
