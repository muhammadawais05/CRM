import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import ImportExportPanel from "@/app/components/ImportExportPanel";
import AppShell from "@/app/components/AppShell";

export default async function ImportPage() {
  const session = getSession();
  if (!session) redirect("/login");

  const leadCount = await prisma.lead.count();
  const stageCounts = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Import / Export
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Import & export leads
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Upload leads as CSV or export your lead list for downstream
            reporting.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ImportExportPanel />
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Lead stats
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {leadCount} leads
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {stageCounts.map((stage) => (
                <div
                  key={stage.status}
                  className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-300">
                      {stage.status.replace(/_/g, " ")}
                    </p>
                    <span className="text-sm font-semibold text-white">
                      {stage._count.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
