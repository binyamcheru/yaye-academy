import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireRole } from "@/modules/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("ADMIN");

  return (
    <WorkspaceShell area="Admin" user={session.user}>
      {children}
    </WorkspaceShell>
  );
}
