import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const activities = await prisma.activity.findMany({
    where: { leadId: params.id },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(activities);
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
  const activity = await prisma.activity.create({
    data: {
      leadId: params.id,
      actorId: session.userId,
      type: body.type ?? "NOTE",
      message: body.message,
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    },
  });

  return NextResponse.json(activity);
}
