import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { isAppRole, roleHomePath } from "@/modules/auth/roles";
import { getCurrentSession } from "@/modules/auth/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session && isAppRole(session.user.role)) {
    redirect(roleHomePath(session.user.role));
  }

  return <AuthForm mode="login" />;
}
