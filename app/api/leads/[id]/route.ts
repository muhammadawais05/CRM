import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { assignedTo: true, activities: true, followUps: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  if (session.role === "SALES" && lead.assignedToId !== session.userId) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json(lead);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  if (session.role === "SALES" && lead.assignedToId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const assignedToId =
    session.role === "SALES" ? session.userId : body.assignedToId;

  const updated = await prisma.lead.update({
    where: { id: params.id },
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
      status: body.status,
      assignedToId,
    },
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const body = await request.json();
  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...(body.assignedToId !== undefined && {
        assignedToId: body.assignedToId,
      }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  if (session.role === "SALES" && lead.assignedToId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.followUp.deleteMany({ where: { leadId: params.id } });
  await prisma.activity.deleteMany({ where: { leadId: params.id } });
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
