import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/prismadb";
import CreateUserForm from "@/app/components/CreateUserForm";
import SalesRepManager from "@/app/components/SalesRepManager";
import AppShell from "@/app/components/AppShell";

export default async function AdminPage() {
  const session = getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const salesReps = await prisma.user.findMany({
    where: { role: "SALES" },
    orderBy: { fullName: "asc" },
  });

  const totalLeads = await prisma.lead.count();
  const activeFollowUps = await prisma.followUp.count({
    where: { status: { not: "COMPLETED" } },
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Team management
          </h1>
          <p className="mt-2 text-slate-400">
            Create, edit, and remove sales users while monitoring pipeline
            activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Sales reps
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {salesReps.length}
            </p>
            <p className="mt-2 text-slate-400">
              Active members in your sales team
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Total leads
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {totalLeads}
            </p>
            <p className="mt-2 text-slate-400">Leads currently in the system</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Active follow-ups
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {activeFollowUps}
            </p>
            <p className="mt-2 text-slate-400">
              Open follow-up tasks across the team
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">
              Create new sales person
            </h2>
            <CreateUserForm />
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Sales team
            </h3>
            <SalesRepManager reps={salesReps} />
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
