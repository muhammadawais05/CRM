import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import LeadEngagementForm from "@/app/components/LeadEngagementForm";
import AssignLeadForm from "@/app/components/AssignLeadForm";
import AppShell from "@/app/components/AppShell";

interface LeadDetailProps {
  params: { id: string };
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function LeadDetailPage({ params }: LeadDetailProps) {
  const session = getSession();
  if (!session) redirect("/login");

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: true,
      activities: { include: { actor: true }, orderBy: { createdAt: "desc" } },
      followUps: { include: { owner: true }, orderBy: { dueDate: "asc" } },
    },
  });

  if (!lead) {
    return notFound();
  }

  if (session.role === "SALES" && lead.assignedToId !== session.userId) {
    return notFound();
  }

  // Fetch sales reps for admin assignment form
  const salesReps = await prisma.user.findMany({
    where: { role: "SALES" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const overdueFollowUps = lead.followUps.filter(
    (followUp) =>
      new Date(followUp.dueDate) < new Date() &&
      followUp.status !== "COMPLETED",
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Lead detail
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {lead.fullName}
              </h1>
              <p className="mt-2 text-slate-400">
                {lead.companyName} • {lead.industry || "Industry not set"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-slate-800 px-4 py-2 text-slate-200">
                Add note
              </button>
              <button className="rounded-2xl bg-brand-500 px-4 py-2 text-white">
                Schedule follow-up
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Profile</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Company", lead.companyName],
                  ["Email", lead.email || "Not provided"],
                  ["Phone", lead.phone || "Not provided"],
                  ["LinkedIn", lead.linkedIn || "Not provided"],
                  ["Industry", lead.industry || "Not provided"],
                  ["Country", lead.country || "Not provided"],
                  ["Status", lead.status.replace(/_/g, " ")],
                  ["Assigned", lead.assignedTo?.fullName || "Unassigned"],
                ].map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-sm text-slate-500">{key}</p>
                    <p className="mt-2 font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Communication history
              </h2>
              <div className="mt-5 space-y-4">
                {lead.activities.length ? (
                  lead.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="font-medium text-white">{activity.type}</p>
                      <p className="mt-2 text-slate-400">{activity.message}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {activity.actor.fullName} •{" "}
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
                      No activity logged yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Follow-up plan
                </h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {overdueFollowUps.length} overdue
                </span>
              </div>
              <div className="space-y-4">
                {lead.followUps.length ? (
                  lead.followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className={`rounded-3xl border p-4 ${
                        new Date(followUp.dueDate) < new Date() &&
                        followUp.status !== "COMPLETED"
                          ? "border-rose-500 bg-rose-500/5"
                          : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">
                          {followUp.note || "Follow-up task"}
                        </p>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Due {formatDate(followUp.dueDate)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Owner: {followUp.owner.fullName}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Status: {followUp.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
                      No follow-ups scheduled yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <LeadEngagementForm leadId={lead.id} />
            </div>

            {session.role === "ADMIN" && (
              <AssignLeadForm
                leadId={lead.id}
                currentAssignedToId={lead.assignedToId}
                salesReps={salesReps}
              />
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Notes</h2>
              <p className="mt-4 text-slate-300">
                {lead.notes ||
                  "Add notes here to keep the outreach context current."}
              </p>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
