import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prismadb";
import { verifyPassword, createToken, setSessionCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const token = createToken({
      userId: user.id,
      role: user.role as "ADMIN" | "SALES",
      email: user.email,
      fullName: user.fullName,
    });
    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Login route error:", error);

    const message =
      error instanceof Error && process.env.NODE_ENV !== "production"
        ? error.message
        : "Login failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
