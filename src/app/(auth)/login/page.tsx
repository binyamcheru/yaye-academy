import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { isAppRole, roleHomePath } from "@/modules/auth/roles";
import { getCurrentSession } from "@/modules/auth/session";

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const session = await getCurrentSession();
  const query = await searchParams;
  const returnTo =
    query.returnTo?.startsWith("/") && !query.returnTo.startsWith("//")
      ? query.returnTo
      : undefined;

  if (session && isAppRole(session.user.role)) {
    redirect(
      session.user.role === "LEARNER" && returnTo
        ? returnTo
        : roleHomePath(session.user.role),
    );
  }

  return <AuthForm mode="login" returnTo={returnTo} />;
}
