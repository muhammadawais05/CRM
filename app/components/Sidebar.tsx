"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Layers,
  Clock4,
  Upload,
  Settings,
  Users,
  LogIn,
} from "lucide-react";

type Session = {
  userId: string;
  role: "ADMIN" | "SALES";
  email: string;
  fullName: string;
} | null;

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Leads", href: "/leads", icon: FileText },
  { label: "Pipeline", href: "/pipeline", icon: Layers },
  { label: "Follow-ups", href: "/follow-ups", icon: Clock4 },
  { label: "Import / Export", href: "/import", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

async function fetchSession(): Promise<Session> {
  try {
    const response = await fetch("/api/auth/session");
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession().then((sessionData) => {
      setSession(sessionData);
      setLoading(false);
    });

    const handleFocus = () => fetchSession().then(setSession);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 text-slate-200 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-500 text-lg font-bold text-white">
          C
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            CRMFlow
          </p>
          <p className="text-xs text-slate-500">Agency Sales Platform</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white shadow shadow-black/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        {session?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/admin"
                ? "bg-slate-900 text-white shadow shadow-black/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Users size={18} />
            Admin
          </Link>
        )}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-700" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-700" />
          </div>
        ) : session ? (
          <>
            <p className="font-medium text-white">{session.fullName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              {session.role}
            </p>
            <p className="mt-3 text-xs text-slate-400">{session.email}</p>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-brand-300 hover:text-brand-200"
          >
            <LogIn size={16} /> Login
          </Link>
        )}
      </div>
    </aside>
  );
}
