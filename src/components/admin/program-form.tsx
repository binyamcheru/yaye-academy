"use client";

import { useActionState, useState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createProgramAction,
  type EntityFormState,
  updateProgramAction,
} from "@/modules/programs/actions";
import { slugify } from "@/modules/programs/schemas";

type ProgramFormValues = Readonly<{
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  thumbnailUrl?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  accessType?: "FREE" | "PAID" | "PRIVATE";
  price?: string;
  durationWeeks?: number;
  learningOutcomes?: string;
  requirements?: string;
}>;

const initialState: EntityFormState = {};

export function ProgramForm({
  initial,
}: Readonly<{ initial?: ProgramFormValues }>) {
  const isEditing = Boolean(initial?.id);
  const [state, formAction] = useActionState(
    isEditing ? updateProgramAction : createProgramAction,
    initialState,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugWasEdited, setSlugWasEdited] = useState(isEditing);
  const [accessType, setAccessType] = useState(initial?.accessType ?? "FREE");

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {initial?.id && (
        <input type="hidden" name="programId" value={initial.id} />
      )}
      <FormFeedback state={state} />

      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <h2 className="text-lg font-semibold text-ink">Program identity</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="auth-label">Title</span>
            <input
              className="auth-input"
              name="title"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!slugWasEdited) setSlug(slugify(nextTitle));
              }}
              required
            />
            <FieldError errors={state.errors?.title} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">URL slug</span>
            <input
              className="auth-input font-mono text-sm"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugWasEdited(true);
              }}
              required
            />
            <FieldError errors={state.errors?.slug} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Short description</span>
            <textarea
              className="auth-input min-h-24 resize-y"
              name="shortDescription"
              defaultValue={initial?.shortDescription}
              required
            />
            <FieldError errors={state.errors?.shortDescription} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Full description</span>
            <textarea
              className="auth-input min-h-40 resize-y"
              name="description"
              defaultValue={initial?.description}
              required
            />
            <FieldError errors={state.errors?.description} />
          </label>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <h2 className="text-lg font-semibold text-ink">Catalog details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="auth-label">Level</span>
            <select
              className="auth-input"
              name="level"
              defaultValue={initial?.level ?? "BEGINNER"}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <label className="block">
            <span className="auth-label">Access type</span>
            <select
              className="auth-input"
              name="accessType"
              value={accessType}
              onChange={(event) =>
                setAccessType(event.target.value as typeof accessType)
              }
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="PRIVATE">Private</option>
            </select>
          </label>
          <label className="block">
            <span className="auth-label">Price (ETB)</span>
            <input
              className="auth-input"
              type="number"
              min="0"
              step="0.01"
              name="price"
              defaultValue={initial?.price}
              disabled={accessType !== "PAID"}
              required={accessType === "PAID"}
            />
            <FieldError errors={state.errors?.price} />
          </label>
          <label className="block">
            <span className="auth-label">Duration (weeks)</span>
            <input
              className="auth-input"
              type="number"
              min="1"
              name="durationWeeks"
              defaultValue={initial?.durationWeeks}
            />
            <FieldError errors={state.errors?.durationWeeks} />
          </label>
          <label className="block sm:col-span-2">
            <span className="auth-label">Thumbnail URL (optional)</span>
            <input
              className="auth-input"
              type="url"
              name="thumbnailUrl"
              defaultValue={initial?.thumbnailUrl}
            />
            <FieldError errors={state.errors?.thumbnailUrl} />
          </label>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <h2 className="text-lg font-semibold text-ink">Learning proposition</h2>
        <p className="mt-2 text-sm text-muted">Enter one item per line.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="auth-label">Learning outcomes</span>
            <textarea
              className="auth-input min-h-40 resize-y"
              name="learningOutcomes"
              defaultValue={initial?.learningOutcomes}
            />
            <FieldError errors={state.errors?.learningOutcomes} />
          </label>
          <label className="block">
            <span className="auth-label">Requirements</span>
            <textarea
              className="auth-input min-h-40 resize-y"
              name="requirements"
              defaultValue={initial?.requirements}
            />
            <FieldError errors={state.errors?.requirements} />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <FormSubmit>{isEditing ? "Save program" : "Create program"}</FormSubmit>
      </div>
    </form>
  );
}
