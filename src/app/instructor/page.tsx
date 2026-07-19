import { WorkspaceOverview } from "@/components/layout/workspace-overview";
import { requireRole } from "@/modules/auth/session";

export default async function InstructorDashboardPage() {
  const session = await requireRole("INSTRUCTOR");

  return (
    <WorkspaceOverview
      eyebrow="Instructor overview · Phase 1"
      name={session.user.name}
      title="Your teaching desk is ready"
      description="Instructor access is isolated from learner and administration areas. Course authoring and cohort tools will build on this boundary."
      register={[
        { label: "Account", value: "Active instructor" },
        { label: "Access", value: "Instructor routes only" },
        { label: "Courses", value: "Authoring begins in Phase 3" },
      ]}
      nextStep="Create course structure and curriculum tools."
    />
  );
}
