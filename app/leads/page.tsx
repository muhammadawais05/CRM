import Link from "next/link";
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

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function LeadsPage() {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  const filter: any = {};
  if (session.role === "SALES") {
    filter.assignedToId = session.userId;
  }

  const leads = await prisma.lead.findMany({
    where: filter,
    include: { assignedTo: true, followUps: true },
    orderBy: { updatedAt: "desc" },
  });

  const followUps = leads
    .flatMap((lead) =>
      lead.followUps.map((followUp) => ({
        ...followUp,
        lead,
      })),
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const overdueFollowUps = followUps.filter(
    (item) =>
      new Date(item.dueDate) < new Date() && item.status !== "COMPLETED",
  );
  const nextFollowUps = followUps.filter(
    (item) => new Date(item.dueDate) >= new Date(),
  );

  const stageGroups = pipelineStages.map((stage) => ({
    ...stage,
    leads: leads.filter((lead) => lead.status === stage.id),
  }));

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Leads
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Your pipeline
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              {session.role === "ADMIN"
                ? "Admin view with all leads and full pipeline visibility."
                : "Sales view filtered to your assigned leads and follow-ups."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/leads/new"
              className="rounded-2xl bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-400"
            >
              New lead
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Follow-up reminders
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">
                Stay on schedule
              </h2>
            </div>

            <div className="space-y-4">
              {overdueFollowUps.length ? (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <p className="text-sm uppercase tracking-[0.16em] text-rose-300">
                    Overdue
                  </p>
                  <p className="mt-2 text-white">
                    {overdueFollowUps.length} follow-up(s) overdue
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">
                    No overdue follow-ups right now.
                  </p>
                </div>
              )}

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
                  Next actions
                </p>
                <div className="mt-4 space-y-3">
                  {nextFollowUps.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-900 p-3">
                      <p className="font-medium text-white">
                        {item.lead.fullName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {item.note || "Follow-up scheduled"}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Due {formatDate(item.dueDate)}
                      </p>
                    </div>
                  ))}
                  {!nextFollowUps.length ? (
                    <p className="text-sm text-slate-400">
                      No upcoming follow-ups scheduled.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Assigned leads
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {leads.length}
                </p>
                <p className="mt-2 text-slate-400">
                  {session.role === "ADMIN"
                    ? "All visible leads in the system."
                    : "Leads assigned to you."}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Pipeline stages
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {stageGroups.filter((group) => group.leads.length).length}
                </p>
                <p className="mt-2 text-slate-400">
                  Stages currently holding at least one lead.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Kanban board
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Pipeline stages
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 overflow-x-auto lg:grid-cols-2 xl:grid-cols-3">
                {stageGroups.map((stage) => (
                  <div
                    key={stage.id}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-semibold text-white">{stage.label}</p>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {stage.leads.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {stage.leads.slice(0, 4).map((lead) => (
                        <Link
                          key={lead.id}
                          href={`/leads/${lead.id}`}
                          className="block rounded-3xl border border-slate-800 bg-slate-900 p-4 transition hover:border-brand-500"
                        >
                          <p className="font-medium text-white">
                            {lead.fullName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {lead.companyName}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {lead.assignedTo?.fullName || "Unassigned"}
                          </p>
                        </Link>
                      ))}
                      {!stage.leads.length ? (
                        <p className="text-sm text-slate-500">
                          No leads in this stage.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    List view
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Filtered leads
                  </h2>
                </div>
              </div>
              <div className="min-w-full overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Lead</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-t border-slate-800 hover:bg-slate-950/80"
                      >
                        <td className="px-6 py-4 text-white">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-brand-300 hover:underline"
                          >
                            {lead.fullName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {lead.companyName}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {lead.status.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {lead.assignedTo?.fullName || "Unassigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
