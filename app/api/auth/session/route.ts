import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("crm_session")?.value;
  if (!token) {
    return NextResponse.json(null);
  }

  const payload = verifyToken(token);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(null);
  }

  return NextResponse.json(payload);
}
