"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Session = {
  userId: string;
  role: "ADMIN" | "SALES";
  email: string;
  fullName: string;
} | null;

async function getSessionFromServer(): Promise<Session> {
  try {
    const response = await fetch("/api/auth/session");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Session fetch failed
  }
  return null;
}

export default function Header() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSessionFromServer().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Set up a listener for session changes
    const handleStorageChange = () => {
      getSessionFromServer().then(setSession);
    };

    window.addEventListener("focus", handleStorageChange);
    return () => window.removeEventListener("focus", handleStorageChange);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <header className="border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-white">
            CRM Platform
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-white">
            CRM Platform
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden flex-col items-end text-right sm:flex">
                <span className="text-sm text-slate-300">
                  {session.fullName}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {session.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
