"use client";

import { useFormStatus } from "react-dom";

export function FormSubmit({
  children,
  className = "bg-ink text-white hover:bg-yaye-blue",
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
