import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { parse } from "csv-parse/sync";
import { getSession } from "@/app/lib/session";

const VALID_STATUS = new Set([
  "NEW_LEAD",
  "RESEARCHING",
  "READY_FOR_OUTREACH",
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
  "INTERESTED",
  "MEETING_BOOKED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
]);

export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (
    !contentType.includes("text/csv") &&
    !contentType.includes("application/csv")
  ) {
    return NextResponse.json({ error: "CSV file required." }, { status: 400 });
  }

  const text = await request.text();
  let rows: any[];

  try {
    rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to parse CSV file." },
      { status: 400 },
    );
  }

  if (!rows.length) {
    return NextResponse.json(
      { error: "CSV file contains no rows." },
      { status: 400 },
    );
  }

  const leads = rows.map((row: any, index: number) => {
    const fullName = row["Full Name"] ?? row.fullName ?? "";
    const companyName = row["Company Name"] ?? row.companyName ?? "";
    const email = row.Email ?? row.email ?? null;
    const phone = row.Phone ?? row.phone ?? null;
    const website = row.Website ?? row.website ?? null;
    const linkedIn = row.LinkedIn ?? row.linkedIn ?? null;
    const industry = row.Industry ?? row.industry ?? null;
    const country = row.Country ?? row.country ?? null;
    const source = row["Lead Source"] ?? row.source ?? null;
    const statusRaw = row.Status ?? row.status ?? undefined;
    const status =
      statusRaw && VALID_STATUS.has(statusRaw.toString().trim().toUpperCase())
        ? statusRaw.toString().trim().toUpperCase()
        : undefined;

    const missingFields = [];
    if (!fullName) missingFields.push("Full Name");
    if (!companyName) missingFields.push("Company Name");
    if (missingFields.length) {
      throw new Error(
        `Row ${index + 2} is missing required field(s): ${missingFields.join(", ")}`,
      );
    }

    return {
      fullName: fullName.toString().trim(),
      companyName: companyName.toString().trim(),
      email: email?.toString().trim() || null,
      phone: phone?.toString().trim() || null,
      website: website?.toString().trim() || null,
      linkedIn: linkedIn?.toString().trim() || null,
      industry: industry?.toString().trim() || null,
      country: country?.toString().trim() || null,
      source: source?.toString().trim() || null,
      status: status ?? undefined,
    };
  });

  try {
    const created = await prisma.lead.createMany({
      data: leads,
    });
    return NextResponse.json({ success: true, created: created.count });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to import leads." },
      { status: 500 },
    );
  }
}
