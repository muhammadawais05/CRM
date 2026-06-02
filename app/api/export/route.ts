import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";

export async function GET(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("stage") || undefined;

  const where: any = {};
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (session.role === "SALES") {
    where.assignedToId = session.userId;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { assignedTo: true },
  });
  const csv = ["Full Name,Company Name,Email,Phone,Status,Assigned To"]
    .concat(
      leads.map((lead) =>
        [
          lead.fullName,
          lead.companyName,
          lead.email ?? "",
          lead.phone ?? "",
          lead.status,
          lead.assignedTo?.fullName ?? "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(","),
      ),
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="leads-export.csv"',
    },
  });
}
