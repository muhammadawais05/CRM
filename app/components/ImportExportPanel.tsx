"use client";

import { useState } from "react";

const STAGE_OPTIONS = [
  { value: "", label: "All stages" },
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "RESEARCHING", label: "Researching" },
  { value: "READY_FOR_OUTREACH", label: "Ready for Outreach" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "FOLLOW_UP_1", label: "Follow-up 1" },
  { value: "FOLLOW_UP_2", label: "Follow-up 2" },
  { value: "INTERESTED", label: "Interested" },
  { value: "MEETING_BOOKED", label: "Meeting Booked" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export default function ImportExportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFileName(selected?.name ?? "");
    setStatus(selected ? "Ready to import." : "");
  }

  async function handleImport() {
    if (!file) {
      setStatus("Select a CSV file before importing.");
      return;
    }

    setIsUploading(true);
    setStatus("Importing leads...");

    const text = await file.text();
    const response = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });

    const data = await response.json();
    setIsUploading(false);

    if (!response.ok) {
      setStatus(data?.error || "Import failed.");
      return;
    }

    setStatus(`${data.created} leads imported successfully.`);
    setFile(null);
    setFileName("");
  }

  function handleExport() {
    const url = selectedStage
      ? `/api/export?stage=${selectedStage}`
      : "/api/export";
    window.location.href = url;
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Import Leads
        </p>
        <p className="mt-2 text-slate-400">
          Upload a CSV file to create new leads in bulk.
        </p>
      </div>
      <label className="block rounded-3xl border border-dashed border-slate-700 bg-slate-950 px-5 py-10 text-center text-slate-400 transition hover:border-brand-500 hover:text-white">
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-sm">Drop CSV here or click to browse</p>
        <p className="mt-2 text-xs text-slate-500">
          Required: Full Name, Company Name. Optional: Email, Phone, Website,
          LinkedIn, Industry, Country, Source, Status.
        </p>
      </label>
      {fileName ? (
        <p className="text-sm text-slate-300">Selected file: {fileName}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleImport}
          disabled={!file || isUploading}
          className="w-full rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isUploading ? "Importing…" : "Import Leads"}
        </button>
        <div className="text-sm text-slate-500">
          Required columns: <span className="text-slate-300">Full Name</span>,{" "}
          <span className="text-slate-300">Company Name</span>
        </div>
      </div>
      {status ? <p className="text-sm text-slate-400">{status}</p> : null}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Export leads
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedStage}
            onChange={(event) => setSelectedStage(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            {STAGE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Export Leads
          </button>
        </div>
      </div>
    </div>
  );
}
