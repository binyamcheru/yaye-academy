"use client";

import { useActionState } from "react";

import { FormSubmit } from "@/components/ui/form-submit";
import {
  createInvitationAction,
  type InvitationActionState,
} from "@/modules/invitations/actions";

type CohortOption = Readonly<{
  id: string;
  name: string;
  program: Readonly<{ title: string }>;
}>;

export function InvitationForm({
  cohorts,
}: Readonly<{ cohorts: CohortOption[] }>) {
  const [state, formAction] = useActionState(
    createInvitationAction,
    {} as InvitationActionState,
  );

  return (
    <form
      action={formAction}
      className="border-t-2 border-ink bg-white px-5 py-6"
      noValidate
    >
      <h2 className="text-xl font-semibold text-ink">Invite a learner</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Invitations expire after seven days and can be accepted once by the
        matching learner email.
      </p>
      {state.message && (
        <p
          className={`mt-5 border-l-2 px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-yaye-teal bg-yaye-pale text-ink"
              : "border-danger bg-danger/7 text-danger"
          }`}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
      {state.previewUrl && (
        <div className="mt-5 border border-yaye-blue/25 bg-yaye-pale p-4">
          <p className="font-mono text-[0.6rem] tracking-[0.1em] text-yaye-blue uppercase">
            Development invitation link
          </p>
          <a
            className="mt-2 block text-sm font-semibold break-all text-yaye-blue underline"
            href={state.previewUrl}
          >
            {state.previewUrl}
          </a>
        </div>
      )}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label>
          <span className="auth-label">Private batch</span>
          <select
            className="auth-input"
            name="cohortId"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Choose a batch
            </option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.program.title} · {cohort.name}
              </option>
            ))}
          </select>
          {state.errors?.cohortId?.[0] && (
            <p className="mt-2 text-xs text-danger">
              {state.errors.cohortId[0]}
            </p>
          )}
        </label>
        <label>
          <span className="auth-label">Learner email</span>
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="learner@example.com"
            required
          />
          {state.errors?.email?.[0] && (
            <p className="mt-2 text-xs text-danger">{state.errors.email[0]}</p>
          )}
        </label>
      </div>
      <div className="mt-6">
        <FormSubmit>Create invitation</FormSubmit>
      </div>
    </form>
  );
}
