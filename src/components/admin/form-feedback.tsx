import type { EntityFormState } from "@/modules/programs/actions";

export function FieldError({ errors }: Readonly<{ errors?: string[] }>) {
  if (!errors?.length) return null;
  return (
    <p className="mt-2 text-xs text-danger" role="alert">
      {errors[0]}
    </p>
  );
}

export function FormFeedback({ state }: Readonly<{ state: EntityFormState }>) {
  if (!state.message) return null;
  const isSuccess = state.status === "success";
  return (
    <p
      className={`border-l-2 px-4 py-3 text-sm ${
        isSuccess
          ? "border-yaye-teal bg-yaye-pale text-ink"
          : "border-danger bg-danger/7 text-danger"
      }`}
      role={isSuccess ? "status" : "alert"}
    >
      {state.message}
    </p>
  );
}
