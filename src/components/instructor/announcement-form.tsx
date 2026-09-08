"use client";

import { useActionState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createAnnouncementAction,
  type CommunicationActionState,
} from "@/modules/communication/actions";

export function AnnouncementForm({
  programId,
  cohorts,
}: Readonly<{
  programId: string;
  cohorts: ReadonlyArray<Readonly<{ id: string; name: string }>>;
}>) {
  const [state, formAction] = useActionState(
    createAnnouncementAction,
    {} as CommunicationActionState,
  );

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <FormFeedback state={state} />
      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <div className="grid gap-5">
          <label className="block">
            <span className="auth-label">Batch</span>
            <select className="auth-input" name="cohortId" required>
              <option value="" disabled>
                Choose an assigned batch
              </option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.cohortId} />
          </label>
          <label className="block">
            <span className="auth-label">Announcement title</span>
            <input className="auth-input" name="title" required />
            <FieldError errors={state.errors?.title} />
          </label>
          <label className="block">
            <span className="auth-label">Message</span>
            <textarea className="auth-input min-h-48" name="body" required />
            <FieldError errors={state.errors?.body} />
          </label>
        </div>
      </section>
      <div className="flex justify-end">
        <FormSubmit>Publish announcement</FormSubmit>
      </div>
    </form>
  );
}
