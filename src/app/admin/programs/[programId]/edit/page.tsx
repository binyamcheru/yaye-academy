import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgramForm } from "@/components/admin/program-form";
import { requireRole } from "@/modules/auth/session";
import { getAdminProgram } from "@/modules/programs/service";

function jsonLines(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join("\n")
    : "";
}

export default async function EditProgramPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  await requireRole("ADMIN");
  const { programId } = await params;
  const program = await getAdminProgram(programId);
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/admin/programs/${program.id}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← {program.title}
      </Link>
      <header className="mt-6 border-b border-ink/15 pb-7">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Program settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Edit program
        </h1>
      </header>
      <div className="mt-8">
        <ProgramForm
          initial={{
            id: program.id,
            title: program.title,
            slug: program.slug,
            shortDescription: program.shortDescription,
            description: program.description,
            thumbnailUrl: program.thumbnailUrl ?? "",
            level: program.level,
            accessType: program.accessType,
            price: program.price?.toString(),
            durationWeeks: program.durationWeeks ?? undefined,
            learningOutcomes: jsonLines(program.learningOutcomes),
            requirements: jsonLines(program.requirements),
          }}
        />
      </div>
    </div>
  );
}
