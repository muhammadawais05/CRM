import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "SALES" | "MANAGER" | "VIEWER";
  email: string;
  fullName: string;
};

export function getSession() {
  const token = cookies().get("crm_session")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || typeof payload !== "object") return null;
  if (!("userId" in payload) || !("role" in payload)) return null;

  return payload as SessionPayload;
}
