"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SalesRep {
  id: string;
  fullName: string;
  email: string;
}

interface SalesRepManagerProps {
  reps: SalesRep[];
}

export default function SalesRepManager({ reps }: SalesRepManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({ fullName: "", email: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleEdit(rep: SalesRep) {
    setError(null);
    setEditingId(rep.id);
    setFormState({ fullName: rep.fullName, email: rep.email });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(repId: string) {
    setSavingId(repId);
    setError(null);

    const response = await fetch(`/api/admin/users/${repId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });

    setSavingId(null);
    if (!response.ok) {
      const body = await response.json();
      setError(body?.error || "Unable to update sales rep.");
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(repId: string) {
    if (!confirm("Delete this sales rep and clear assignment from leads?")) {
      return;
    }

    setDeletingId(repId);
    setError(null);

    const response = await fetch(`/api/admin/users/${repId}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!response.ok) {
      const body = await response.json();
      setError(body?.error || "Unable to delete sales rep.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl bg-rose-950 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {reps.length === 0 ? (
        <p className="text-sm text-slate-400">No sales reps found.</p>
      ) : (
        reps.map((rep) => {
          const isEditing = editingId === rep.id;
          return (
            <div
              key={rep.id}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">
                      Full Name
                      <input
                        name="fullName"
                        value={formState.fullName}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block text-sm text-slate-400">
                      Email
                      <input
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSave(rep.id)}
                      disabled={savingId === rep.id}
                      className="inline-flex items-center justify-center rounded-3xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === rep.id ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{rep.fullName}</p>
                    <p className="text-xs text-slate-500">{rep.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(rep)}
                      className="rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rep.id)}
                      disabled={deletingId === rep.id}
                      className="rounded-3xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === rep.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
