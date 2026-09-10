"use client";

import { useActionState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createQuestionAction,
  type QnaActionState,
} from "@/modules/qna/actions";

export function QuestionForm({ lessonId }: Readonly<{ lessonId: string }>) {
  const [state, formAction] = useActionState(
    createQuestionAction,
    {} as QnaActionState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4" noValidate>
      <input type="hidden" name="lessonId" value={lessonId} />
      <FormFeedback state={state} />
      <label className="block">
        <span className="auth-label">Question title</span>
        <input
          className="auth-input"
          name="title"
          placeholder="What should the instructor help clarify?"
          required
        />
        <FieldError errors={state.errors?.title} />
      </label>
      <label className="block">
        <span className="auth-label">Details</span>
        <textarea
          className="auth-input min-h-32"
          name="body"
          placeholder="Include what you tried and where you became stuck."
          required
        />
        <FieldError errors={state.errors?.body} />
      </label>
      <FormSubmit>Ask question</FormSubmit>
    </form>
  );
}
