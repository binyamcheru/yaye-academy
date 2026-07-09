import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireRole } from "@/modules/auth/session";

export default async function LearnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("LEARNER");

  return (
    <WorkspaceShell area="Learner" user={session.user}>
      {children}
    </WorkspaceShell>
  );
}
