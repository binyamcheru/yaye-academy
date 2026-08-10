"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  lessonCompletionAction,
  type LearningActionState,
} from "@/modules/enrollments/actions";

function CompletionButton({ completed }: Readonly<{ completed: boolean }>) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer px-5 py-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
        completed
          ? "border border-ink/25 bg-white text-ink hover:bg-yaye-pale"
          : "bg-ink text-white hover:bg-yaye-blue"
      }`}
    >
      {pending
        ? "Updating…"
        : completed
          ? "Mark as incomplete"
          : "Mark lesson complete ✓"}
    </button>
  );
}

export function LessonCompletionForm({
  programId,
  lessonId,
  completed,
}: Readonly<{ programId: string; lessonId: string; completed: boolean }>) {
  const [state, formAction] = useActionState(
    lessonCompletionAction,
    {} as LearningActionState,
  );
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="programId" value={programId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input
        type="hidden"
        name="complete"
        value={completed ? "false" : "true"}
      />
      {state.message && (
        <p
          role="status"
          className={`border-l-2 px-3 py-2 text-xs ${
            state.status === "success"
              ? "border-yaye-teal bg-yaye-pale text-ink"
              : "border-danger bg-danger/7 text-danger"
          }`}
        >
          {state.message}
        </p>
      )}
      <CompletionButton completed={completed} />
    </form>
  );
}
