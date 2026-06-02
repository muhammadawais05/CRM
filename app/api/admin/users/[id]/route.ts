import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

interface Params {
  params: { id: string };
}

export async function DELETE(request: Request, { params }: Params) {
  const session = getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "SALES") {
    return NextResponse.json(
      { error: "Sales rep not found." },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.followUp.deleteMany({ where: { ownerId: id } }),
    prisma.activity.deleteMany({ where: { actorId: id } }),
    prisma.lead.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null },
    }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const { fullName, email } = body;

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "Full name and email are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "SALES") {
    return NextResponse.json(
      { error: "Sales rep not found." },
      { status: 404 },
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id },
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already belongs to another user." },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      fullName,
      email,
    },
  });

  return NextResponse.json({
    success: true,
    user: { id: updated.id, fullName: updated.fullName, email: updated.email },
  });
}
