"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      setError(text || "Unable to parse login response.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error || "Unable to sign in.");
      return;
    }

    router.push(data.user?.role === "ADMIN" ? "/" : "/leads");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-10 shadow-2xl shadow-black/20">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Internal CRM
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Sign in to continue
          </h1>
          <p className="mt-2 text-slate-400">
            Access leads, outreach sequences, and follow-up reminders.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-400">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Use admin@example.com / password for seed login.
        </p>
        <div className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="text-brand-300 hover:text-brand-200">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
