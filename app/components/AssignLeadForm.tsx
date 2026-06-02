"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssignLeadFormProps {
  leadId: string;
  currentAssignedToId: string | null;
  salesReps: Array<{ id: string; fullName: string }>;
}

export default function AssignLeadForm({
  leadId,
  currentAssignedToId,
  salesReps,
}: AssignLeadFormProps) {
  const router = useRouter();
  const [selectedRepId, setSelectedRepId] = useState(currentAssignedToId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign() {
    setError("");
    setIsLoading(true);

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: selectedRepId || null }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || "Unable to assign lead.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Assign Lead</h2>
      <div className="space-y-4">
        <label className="block text-sm text-slate-400">
          Sales Representative
          <select
            value={selectedRepId}
            onChange={(e) => setSelectedRepId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="">Unassigned</option>
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.fullName}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          onClick={handleAssign}
          disabled={isLoading}
          className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-70"
        >
          {isLoading ? "Assigning..." : "Update assignment"}
        </button>
      </div>
    </div>
  );
}
