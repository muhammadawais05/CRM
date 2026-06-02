"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LeadEngagementFormProps {
  leadId: string;
}

export default function LeadEngagementForm({
  leadId,
}: LeadEngagementFormProps) {
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [error, setError] = useState("");
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const router = useRouter();

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoadingNote(true);

    const response = await fetch(`/api/leads/${leadId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: note, type: "NOTE", actorId: "system" }),
    });

    const data = await response.json();
    setIsLoadingNote(false);

    if (!response.ok) {
      setError(data?.error || "Unable to save note.");
      return;
    }

    setNote("");
    router.refresh();
  }

  async function handleAddFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoadingFollowUp(true);

    const response = await fetch(`/api/leads/${leadId}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: followUpNote, dueDate, ownerId: "system" }),
    });

    const data = await response.json();
    setIsLoadingFollowUp(false);

    if (!response.ok) {
      setError(data?.error || "Unable to schedule follow-up.");
      return;
    }

    setFollowUpNote("");
    setDueDate("");
    router.refresh();
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">Engagement</h2>
      <form onSubmit={handleAddNote} className="space-y-4">
        <label className="block text-sm text-slate-400">
          New note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isLoadingNote}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
        >
          {isLoadingNote ? "Saving note..." : "Add note"}
        </button>
      </form>

      <form onSubmit={handleAddFollowUp} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-400">
            Follow-up note
            <input
              value={followUpNote}
              onChange={(event) => setFollowUpNote(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoadingFollowUp}
          className="rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-70"
        >
          {isLoadingFollowUp ? "Scheduling..." : "Schedule follow-up"}
        </button>
      </form>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
