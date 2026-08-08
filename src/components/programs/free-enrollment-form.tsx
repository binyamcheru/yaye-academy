"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  freeEnrollmentAction,
  type LearningActionState,
} from "@/modules/enrollments/actions";

function EnrollButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full cursor-pointer bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Creating enrollment…" : "Enroll in this free program ↗"}
    </button>
  );
}

export function FreeEnrollmentForm({
  programId,
}: Readonly<{ programId: string }>) {
  const [state, formAction] = useActionState(
    freeEnrollmentAction,
    {} as LearningActionState,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="programId" value={programId} />
      {state.message && (
        <p className="mb-3 border-l-2 border-danger bg-danger/7 px-3 py-2 text-xs text-danger">
          {state.message}
        </p>
      )}
      <EnrollButton />
    </form>
  );
}
