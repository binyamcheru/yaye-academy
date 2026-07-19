import { WorkspaceOverview } from "@/components/layout/workspace-overview";
import { prisma } from "@/lib/db";
import { requireRole } from "@/modules/auth/session";

export default async function AdminDashboardPage() {
  const [session, userCount] = await Promise.all([
    requireRole("ADMIN"),
    prisma.user.count(),
  ]);

  return (
    <WorkspaceOverview
      eyebrow="Administration overview · Phase 1"
      name={session.user.name}
      title="The academy control desk is ready"
      description="Role boundaries and account sessions are now live. Administrative course, enrollment, payment, and certificate operations follow in later phases."
      register={[
        { label: "Accounts", value: `${userCount} registered` },
        { label: "Roles", value: "Admin · Instructor · Learner" },
        { label: "Security", value: "Database sessions active" },
      ]}
      nextStep="Manage the public course catalog."
    />
  );
}
