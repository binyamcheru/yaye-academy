import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { type AppRole, isAppRole, roleHomePath } from "@/modules/auth/roles";

export const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireRole(allowedRole: AppRole) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAppRole(session.user.role)) {
    throw new Error("The signed-in account has an invalid role.");
  }

  if (session.user.role !== allowedRole) {
    redirect(roleHomePath(session.user.role));
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: session.user.role,
    },
  };
}
