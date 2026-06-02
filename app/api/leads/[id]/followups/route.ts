import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const followUps = await prisma.followUp.findMany({
    where: { leadId: params.id },
    include: { owner: true },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(followUps);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const followUp = await prisma.followUp.create({
    data: {
      leadId: params.id,
      ownerId: session.userId,
      dueDate: new Date(body.dueDate),
      note: body.note,
      status: body.status ?? "PENDING",
    },
  });

  return NextResponse.json(followUp);
}
