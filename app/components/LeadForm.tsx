"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LeadFormProps {
  reps: Array<{ id: string; fullName: string }>;
  currentUserId: string;
  role: string;
}

export default function LeadForm({ reps, currentUserId, role }: LeadFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    website: "",
    email: "",
    phone: "",
    linkedIn: "",
    socialLinks: "",
    industry: "",
    country: "",
    source: "",
    notes: "",
    status: "NEW_LEAD",
    assignedToId: role === "SALES" ? currentUserId : "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const body = {
      ...form,
      socialLinks: form.socialLinks ? form.socialLinks : null,
      assignedToId:
        role === "SALES" ? currentUserId : form.assignedToId || null,
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error || "Unable to create lead.");
      return;
    }

    router.push("/leads");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-slate-400">Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-slate-400">Company Name</label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Website
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
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
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
        <label className="block text-sm text-slate-400">
          LinkedIn
          <input
            name="linkedIn"
            value={form.linkedIn}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Industry
          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Country
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-400">
          Lead Source
          <input
            name="source"
            value={form.source}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="NEW_LEAD">New Lead</option>
            <option value="RESEARCHING">Researching</option>
            <option value="READY_FOR_OUTREACH">Ready for Outreach</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP_1">Follow-up 1</option>
            <option value="FOLLOW_UP_2">Follow-up 2</option>
            <option value="INTERESTED">Interested</option>
            <option value="MEETING_BOOKED">Meeting Booked</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </label>
      </div>

      <label className="block text-sm text-slate-400">
        Social Links
        <input
          name="socialLinks"
          value={form.socialLinks}
          onChange={handleChange}
          placeholder="Comma-separated URLs"
          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
        />
      </label>

      {role === "ADMIN" ? (
        <label className="block text-sm text-slate-400">
          Assigned Sales Rep
          <select
            name="assignedToId"
            value={form.assignedToId}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="">Unassigned</option>
            {reps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.fullName}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="block text-sm text-slate-400">
        Notes
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
        />
      </label>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-70"
      >
        {isLoading ? "Creating lead..." : "Create lead"}
      </button>
    </form>
  );
}
