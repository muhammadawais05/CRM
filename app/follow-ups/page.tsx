import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import AppShell from "@/app/components/AppShell";

export default async function FollowUpsPage() {
  const session = getSession();
  if (!session) redirect("/login");

  const where: any = {};
  if (session.role === "SALES") {
    where.OR = [
      { ownerId: session.userId },
      { lead: { assignedToId: session.userId } },
    ];
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: { lead: true, owner: true },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const overdue = followUps.filter(
    (followUp) =>
      new Date(followUp.dueDate) < now && followUp.status !== "COMPLETED",
  );
  const upcoming = followUps.filter(
    (followUp) => new Date(followUp.dueDate) >= now,
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Follow-ups
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Follow-up manager
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Keep track of overdue and upcoming outreach tasks for your
              pipeline.
            </p>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Overdue follow-ups
                </h2>
                <span className="text-sm text-slate-400">
                  {overdue.length} overdue
                </span>
              </div>
              <div className="space-y-4">
                {overdue.length ? (
                  overdue.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="rounded-3xl border border-rose-500 bg-rose-500/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-white">
                          {followUp.lead.fullName}
                        </p>
                        <span className="text-xs uppercase tracking-[0.18em] text-rose-300">
                          Due {new Date(followUp.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {followUp.note}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <span>{followUp.owner.fullName}</span>
                        <span>{followUp.status.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
                      No overdue follow-ups currently.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Upcoming follow-ups
                </h2>
                <span className="text-sm text-slate-400">
                  {upcoming.length} scheduled
                </span>
              </div>
              <div className="space-y-4">
                {upcoming.length ? (
                  upcoming.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-white">
                          {followUp.lead.fullName}
                        </p>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Due {new Date(followUp.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {followUp.note}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <span>{followUp.owner.fullName}</span>
                        <span>{followUp.status.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
                      No upcoming follow-ups scheduled.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Follow-up summary
            </h2>
            <p className="mt-3 text-slate-400">
              Organize your outreach and keep a pulse on tasks that need
              attention.
            </p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
