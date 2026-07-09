import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireRole } from "@/modules/auth/session";

export default async function InstructorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("INSTRUCTOR");

  return (
    <WorkspaceShell area="Instructor" user={session.user}>
      {children}
    </WorkspaceShell>
  );
}
