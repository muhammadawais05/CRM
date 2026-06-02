import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prismadb";
import { getSession } from "@/app/lib/session";
import LeadForm from "@/app/components/LeadForm";
import AppShell from "@/app/components/AppShell";

export default async function NewLeadPage() {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  const salesReps = await prisma.user.findMany({
    where: { role: "SALES" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Create lead
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Add a new prospect
          </h1>
          <p className="mt-2 text-slate-400">
            Create a lead and assign it to your sales team to begin outreach.
          </p>
        </div>

        <LeadForm
          reps={salesReps}
          currentUserId={session.userId}
          role={session.role}
        />
      </main>
    </AppShell>
  );
}
