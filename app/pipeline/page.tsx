import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import AppShell from "@/app/components/AppShell";

const pipelineStages = [
  { id: "NEW_LEAD", label: "New Lead" },
  { id: "RESEARCHING", label: "Researching" },
  { id: "READY_FOR_OUTREACH", label: "Ready for Outreach" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "FOLLOW_UP_1", label: "Follow-up 1" },
  { id: "FOLLOW_UP_2", label: "Follow-up 2" },
  { id: "INTERESTED", label: "Interested" },
  { id: "MEETING_BOOKED", label: "Meeting Booked" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
];

export default async function PipelinePage() {
  const session = getSession();
  if (!session) redirect("/login");

  const where: any = {};
  if (session.role === "SALES") {
    where.assignedToId = session.userId;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  const stageCounts = pipelineStages.map((stage) => ({
    ...stage,
    count: leads.filter((lead) => lead.status === stage.id).length,
  }));

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Pipeline
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Pipeline board
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Track every lead by stage and surface the pipeline for your team.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stageCounts.map((stage) => (
            <div
              key={stage.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  {stage.label}
                </p>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {stage.count}
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${Math.min(100, stage.count * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.status === stage.id);
            return (
              <section
                key={stage.id}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {stage.label}
                  </h2>
                  <span className="text-sm text-slate-400">
                    {stageLeads.length} lead(s)
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {stageLeads.length ? (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <p className="font-medium text-white">
                          {lead.fullName}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {lead.companyName}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {lead.assignedTo?.fullName || "Unassigned"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No leads in this stage.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
