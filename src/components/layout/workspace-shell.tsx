import { BrandMark } from "@/components/brand/brand-mark";
import { WorkspaceNav } from "@/components/layout/workspace-nav";
import { logoutAction } from "@/modules/auth/actions";

type WorkspaceShellProps = Readonly<{
  area: "Learner" | "Instructor" | "Admin";
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
}>;

export function WorkspaceShell({ area, children, user }: WorkspaceShellProps) {
  const homeHref =
    area === "Learner"
      ? "/dashboard"
      : area === "Instructor"
        ? "/instructor"
        : "/admin";
  const navItems =
    area === "Admin"
      ? [
          { href: homeHref, label: "Overview" },
          { href: "/admin/programs", label: "Programs" },
          { href: "/admin/cohorts", label: "Batches" },
          { href: "/admin/enrollments", label: "Invitations" },
          { href: "/admin/payments", label: "Payments" },
        ]
      : area === "Learner"
        ? [
            { href: homeHref, label: "Overview" },
            { href: "/dashboard/my-learning", label: "My learning" },
            { href: "/dashboard/notifications", label: "Notifications" },
            { href: "/dashboard/payments", label: "Payments" },
          ]
        : [
            { href: homeHref, label: "Overview" },
            { href: "/instructor/programs", label: "Programs" },
          ];

  return (
    <div className="min-h-screen bg-workspace md:grid md:grid-cols-[17rem_1fr]">
      <aside className="border-r border-white/10 bg-ink text-white">
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <BrandMark compact className="bg-white px-3 py-2 text-ink" />
        </div>
        <div className="px-5 py-7">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-yaye-teal uppercase">
            {area} workspace
          </p>
          <WorkspaceNav items={navItems} />
        </div>
      </aside>
      <div>
        <header className="flex h-20 items-center justify-between border-b border-ink/10 bg-white px-5 sm:px-8">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase">
              Yaye Academy
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {area} operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="mt-0.5 text-xs text-muted">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="status-label cursor-pointer bg-transparent hover:border-yaye-blue hover:bg-yaye-pale"
              >
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
