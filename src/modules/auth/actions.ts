"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { roleHomePath, isAppRole } from "@/modules/auth/roles";
import { loginSchema, registerSchema } from "@/modules/auth/schemas";

export type AuthFormState = Readonly<{
  message?: string;
  errors?: Record<string, string[]>;
}>;

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  let role: unknown;

  try {
    const response = await auth.api.signInEmail({
      body: { ...result.data, rememberMe: true },
      headers: await headers(),
    });
    role = response.user.role;
  } catch {
    return { message: "Email or password is incorrect." };
  }

  if (!isAppRole(role)) {
    return { message: "This account does not have a valid academy role." };
  }

  const returnTo = formData.get("returnTo");
  if (
    role === "LEARNER" &&
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//")
  ) {
    redirect(returnTo);
  }

  redirect(roleHomePath(role));
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
      headers: await headers(),
    });
  } catch {
    return {
      message:
        "We could not create that account. The email may already be in use.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
