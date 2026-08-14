"use client";

import { useActionState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createCohortAction,
  type EntityFormState,
  updateCohortAction,
} from "@/modules/programs/actions";

type Option = Readonly<{
  id: string;
  title?: string;
  name?: string;
  email?: string;
}>;

type CohortFormValues = Readonly<{
  id?: string;
  programId?: string;
  instructorId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  status?: "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}>;

export function CohortForm({
  programs,
  instructors,
  initial,
}: Readonly<{
  programs: readonly Option[];
  instructors: readonly Option[];
  initial?: CohortFormValues;
}>) {
  const isEditing = Boolean(initial?.id);
  const [state, formAction] = useActionState(
    isEditing ? updateCohortAction : createCohortAction,
    {} as EntityFormState,
  );

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {initial?.id && (
        <input type="hidden" name="cohortId" value={initial.id} />
      )}
      <FormFeedback state={state} />
      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="auth-label">Program</span>
            <select
              className="auth-input"
              name="programId"
              defaultValue={initial?.programId ?? ""}
              required
            >
              <option value="" disabled>
                Choose a program
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.programId} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Batch name</span>
            <input
              className="auth-input"
              name="name"
              defaultValue={initial?.name}
              placeholder="September 2026 Batch"
              required
            />
            <FieldError errors={state.errors?.name} />
          </label>
          <label className="block">
            <span className="auth-label">Start date</span>
            <input
              className="auth-input"
              type="date"
              name="startDate"
              defaultValue={initial?.startDate}
              required
            />
            <FieldError errors={state.errors?.startDate} />
          </label>
          <label className="block">
            <span className="auth-label">End date</span>
            <input
              className="auth-input"
              type="date"
              name="endDate"
              defaultValue={initial?.endDate}
              required
            />
            <FieldError errors={state.errors?.endDate} />
          </label>
          <label className="block">
            <span className="auth-label">Capacity (optional)</span>
            <input
              className="auth-input"
              type="number"
              min="1"
              name="capacity"
              defaultValue={initial?.capacity}
            />
            <FieldError errors={state.errors?.capacity} />
          </label>
          <label className="block">
            <span className="auth-label">Status</span>
            <select
              className="auth-input"
              name="status"
              defaultValue={initial?.status ?? "UPCOMING"}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Main instructor</span>
            <select
              className="auth-input"
              name="instructorId"
              defaultValue={initial?.instructorId ?? ""}
            >
              <option value="">Unassigned</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name} · {instructor.email}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.instructorId} />
          </label>
        </div>
      </section>
      <div className="flex justify-end">
        <FormSubmit>{isEditing ? "Save batch" : "Create batch"}</FormSubmit>
      </div>
    </form>
  );
}
