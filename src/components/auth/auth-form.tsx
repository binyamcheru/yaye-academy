"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  type AuthFormState,
  loginAction,
  registerAction,
} from "@/modules/auth/actions";

type AuthFormProps = Readonly<{
  mode: "login" | "register";
  returnTo?: string;
}>;

const initialState: AuthFormState = {};

function FieldError({ errors }: Readonly<{ errors?: string[] }>) {
  if (!errors?.length) return null;

  return (
    <p className="mt-2 text-sm text-danger" role="alert">
      {errors[0]}
    </p>
  );
}

function SubmitButton({ label }: Readonly<{ label: string }>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-between bg-ink px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-yaye-blue disabled:cursor-wait disabled:opacity-60"
    >
      <span>{pending ? "Working…" : label}</span>
      <span aria-hidden="true">↗</span>
    </button>
  );
}

export function AuthForm({ mode, returnTo }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, formAction] = useActionState(
    isLogin ? loginAction : registerAction,
    initialState,
  );

  return (
    <div>
      <div className="border-b-2 border-ink pb-6">
        <p className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-yaye-blue uppercase">
          {isLogin ? "Academy access" : "Learner registration"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          {isLogin ? "Welcome back." : "Join the academy."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isLogin
            ? "Continue your work from the role-specific workspace."
            : "Create a learner account. You can start with free programs and enroll in paid cohorts later."}
        </p>
      </div>

      <form action={formAction} className="mt-7 space-y-5" noValidate>
        {isLogin && returnTo && (
          <input type="hidden" name="returnTo" value={returnTo} />
        )}
        {!isLogin && (
          <label className="block">
            <span className="auth-label">Full name</span>
            <input
              className="auth-input"
              type="text"
              name="name"
              aria-label="Full name"
              autoComplete="name"
              aria-invalid={Boolean(state.errors?.name)}
              required
            />
            <FieldError errors={state.errors?.name} />
          </label>
        )}

        <label className="block">
          <span className="auth-label">Email address</span>
          <input
            className="auth-input"
            type="email"
            name="email"
            aria-label="Email address"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(state.errors?.email)}
            required
          />
          <FieldError errors={state.errors?.email} />
        </label>

        <label className="block">
          <span className="auth-label">Password</span>
          <input
            className="auth-input"
            type="password"
            name="password"
            aria-label="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-invalid={Boolean(state.errors?.password)}
            required
          />
          <FieldError errors={state.errors?.password} />
          {!isLogin && !state.errors?.password && (
            <p className="mt-2 text-xs text-muted">At least 10 characters.</p>
          )}
        </label>

        {!isLogin && (
          <label className="block">
            <span className="auth-label">Confirm password</span>
            <input
              className="auth-input"
              type="password"
              name="confirmPassword"
              aria-label="Confirm password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.errors?.confirmPassword)}
              required
            />
            <FieldError errors={state.errors?.confirmPassword} />
          </label>
        )}

        {state.message && (
          <div
            className="border-l-2 border-danger bg-danger/7 px-4 py-3 text-sm leading-6 text-danger"
            role="alert"
          >
            {state.message}
          </div>
        )}

        <SubmitButton
          label={isLogin ? "Enter workspace" : "Create learner account"}
        />
      </form>

      <p className="mt-7 text-sm text-muted">
        {isLogin ? "New to Yaye Academy?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-yaye-blue underline decoration-yaye-teal underline-offset-4"
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
