"use client";

import { useActionState } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  type EntityFormState,
  programStatusAction,
} from "@/modules/programs/actions";

export function ProgramStatusControls({
  programId,
  status,
}: Readonly<{
  programId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}>) {
  const [state, formAction] = useActionState(
    programStatusAction,
    {} as EntityFormState,
  );

  return (
    <div className="space-y-4">
      <FormFeedback state={state} />
      <div className="flex flex-wrap gap-3">
        {status !== "PUBLISHED" && (
          <form action={formAction}>
            <input type="hidden" name="programId" value={programId} />
            <input type="hidden" name="status" value="PUBLISHED" />
            <FormSubmit>Publish program</FormSubmit>
          </form>
        )}
        {status === "PUBLISHED" && (
          <form action={formAction}>
            <input type="hidden" name="programId" value={programId} />
            <input type="hidden" name="status" value="DRAFT" />
            <FormSubmit className="border border-ink/25 bg-white text-ink hover:bg-yaye-pale">
              Unpublish
            </FormSubmit>
          </form>
        )}
        {status !== "ARCHIVED" && (
          <form action={formAction}>
            <input type="hidden" name="programId" value={programId} />
            <input type="hidden" name="status" value="ARCHIVED" />
            <FormSubmit className="border border-ink/25 bg-white text-ink hover:border-danger hover:text-danger">
              Archive
            </FormSubmit>
          </form>
        )}
        {status === "ARCHIVED" && (
          <form action={formAction}>
            <input type="hidden" name="programId" value={programId} />
            <input type="hidden" name="status" value="DRAFT" />
            <FormSubmit className="border border-ink/25 bg-white text-ink hover:bg-yaye-pale">
              Restore as draft
            </FormSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
