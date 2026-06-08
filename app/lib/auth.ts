import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "SALES" | "MANAGER" | "VIEWER";
  email: string;
  fullName: string;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const COOKIE_NAME = "crm_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
}
