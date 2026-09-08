"use client";

import { useActionState, useRef } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createLiveSessionAction,
  type CommunicationActionState,
} from "@/modules/communication/actions";

type CohortOption = Readonly<{ id: string; name: string }>;

function toUtcInstant(localValue: string) {
  if (!localValue) return "";
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function LiveSessionForm({
  programId,
  cohorts,
}: Readonly<{ programId: string; cohorts: readonly CohortOption[] }>) {
  const [state, formAction] = useActionState(
    createLiveSessionAction,
    {} as CommunicationActionState,
  );
  const startsAtRef = useRef<HTMLInputElement>(null);
  const endsAtRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <input ref={startsAtRef} type="hidden" name="startsAt" />
      <input ref={endsAtRef} type="hidden" name="endsAt" />
      <FormFeedback state={state} />
      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
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
          <label className="block sm:col-span-2">
            <span className="auth-label">Session title</span>
            <input className="auth-input" name="title" required />
            <FieldError errors={state.errors?.title} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Description (optional)</span>
            <textarea className="auth-input min-h-28" name="description" />
            <FieldError errors={state.errors?.description} />
          </label>
          <label className="block">
            <span className="auth-label">Starts</span>
            <input
              className="auth-input"
              type="datetime-local"
              required
              onChange={(event) => {
                if (startsAtRef.current) {
                  startsAtRef.current.value = toUtcInstant(event.target.value);
                }
              }}
            />
            <FieldError errors={state.errors?.startsAt} />
          </label>
          <label className="block">
            <span className="auth-label">Ends (optional)</span>
            <input
              className="auth-input"
              type="datetime-local"
              onChange={(event) => {
                if (endsAtRef.current) {
                  endsAtRef.current.value = toUtcInstant(event.target.value);
                }
              }}
            />
            <FieldError errors={state.errors?.endsAt} />
          </label>
          <p className="text-xs leading-5 text-muted sm:col-span-2">
            Enter times in your device time zone. Yaye Academy stores the exact
            UTC instant and displays it in each viewer&apos;s local time.
          </p>
          <label className="block sm:col-span-2">
            <span className="auth-label">Meet or Zoom URL</span>
            <input
              className="auth-input"
              type="url"
              name="meetingUrl"
              required
            />
            <FieldError errors={state.errors?.meetingUrl} />
          </label>
          {[
            ["recordingUrl", "Recording URL (optional)"],
            ["slidesUrl", "Slides URL (optional)"],
            ["resourceUrl", "Resource URL (optional)"],
          ].map(([name, label]) => (
            <label className="block" key={name}>
              <span className="auth-label">{label}</span>
              <input className="auth-input" type="url" name={name} />
              <FieldError errors={state.errors?.[name]} />
            </label>
          ))}
        </div>
      </section>
      <div className="flex justify-end">
        <FormSubmit>Publish session</FormSubmit>
      </div>
    </form>
  );
}
