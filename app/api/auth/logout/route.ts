import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/app/lib/auth";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ success: true });
}
