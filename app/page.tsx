import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LayoutDashboard, Users } from "lucide-react";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import AppShell from "@/app/components/AppShell";

export default async function DashboardPage() {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch data based on role
  const where: any = {};
  if (session.role === "SALES") {
    where.assignedToId = session.userId;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { followUps: true, assignedTo: true },
  });

  const wonLeads = leads.filter((lead) => lead.status === "WON").length;
  const bookedMeetings = leads.filter(
    (lead) => lead.status === "MEETING_BOOKED",
  ).length;
  const totalLeads = leads.length;
  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";

  // Get pipeline stages
  const stages: Record<string, number> = {};
  [
    "NEW_LEAD",
    "RESEARCHING",
    "READY_FOR_OUTREACH",
    "CONTACTED",
    "FOLLOW_UP_1",
    "FOLLOW_UP_2",
    "INTERESTED",
    "MEETING_BOOKED",
    "PROPOSAL_SENT",
    "WON",
    "LOST",
  ].forEach((stage) => {
    stages[stage] = leads.filter((lead) => lead.status === stage).length;
  });

  // Top performing reps (admin only)
  let topReps: any[] = [];
  if (session.role === "ADMIN") {
    const reps = await prisma.user.findMany({
      where: { role: "SALES" },
      include: { leads: true },
    });

    topReps = reps
      .map((rep) => ({
        name: rep.fullName,
        leadsCount: rep.leads.length,
        wonCount: rep.leads.filter((l) => l.status === "WON").length,
      }))
      .sort((a, b) => b.wonCount - a.wonCount)
      .slice(0, 3);
  }

  const pipelineStages = [
    { label: "New Lead", key: "NEW_LEAD" },
    { label: "Contacted", key: "CONTACTED" },
    { label: "Follow-up 1", key: "FOLLOW_UP_1" },
    { label: "Meeting Booked", key: "MEETING_BOOKED" },
    { label: "Won", key: "WON" },
  ];

  const stats = [
    { label: "Total Leads", value: totalLeads.toString() },
    { label: "Meetings Booked", value: bookedMeetings.toString() },
    { label: "Conversion Rate", value: `${conversionRate}%` },
    { label: "Won Deals", value: wonLeads.toString() },
  ];
  return (
    <AppShell>
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Pipeline overview
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              {session.role === "ADMIN"
                ? "System-wide pipeline and team performance."
                : "Your assigned leads and follow-ups."}
            </p>
          </div>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
          >
            Explore leads <ArrowRight size={18} />
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-4 text-3xl font-semibold text-white">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} />
                <span className="font-medium">Lead pipeline</span>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                Live
              </span>
            </div>
            <div className="space-y-3">
              {pipelineStages.map((stage) => {
                const count = stages[stage.key] || 0;
                const maxLeads = Math.max(...Object.values(stages));
                const percentage = maxLeads > 0 ? (count / maxLeads) * 100 : 0;

                return (
                  <div
                    key={stage.key}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{stage.label}</p>
                      <span className="text-sm text-slate-500">{count}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-brand-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {session.role === "ADMIN" && topReps.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <Users size={20} />
                <span className="font-medium">Top reps</span>
              </div>
              <div className="space-y-4">
                {topReps.map((rep) => (
                  <div
                    key={rep.name}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{rep.name}</p>
                      <span className="text-sm font-semibold text-brand-400">
                        {rep.wonCount} won
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {rep.leadsCount} total leads
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
