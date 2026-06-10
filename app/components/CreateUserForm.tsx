"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "SALES",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error || "Unable to create user.");
      return;
    }

    setForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "SALES",
    });
    alert("User created successfully");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Full Name
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="SALES">Sales</option>
            <option value="MANAGER">Manager</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </label>
        <label className="block text-sm text-slate-400">
          Password
          <div className="mt-2 flex items-center rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent text-white outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="ml-3 text-sm text-slate-400 transition hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <label className="block text-sm text-slate-400">
          Confirm Password
          <div className="mt-2 flex items-center rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-transparent text-white outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="ml-3 text-sm text-slate-400 transition hover:text-white"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-70"
      >
        {isLoading ? "Creating..." : "Create user"}
      </button>
    </form>
  );
}
