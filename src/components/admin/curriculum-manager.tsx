"use client";

import { useActionState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createLessonAction,
  createModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  type EntityFormState,
  updateLessonAction,
  updateModuleAction,
} from "@/modules/programs/actions";

type LessonRecord = Readonly<{
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
  isPublished: boolean;
}>;

type ModuleRecord = Readonly<{
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: readonly LessonRecord[];
}>;

const blankState: EntityFormState = {};

function LessonEditor({
  lesson,
  moduleId,
  programId,
}: Readonly<{
  lesson: LessonRecord;
  moduleId: string;
  programId: string;
}>) {
  const [state, formAction] = useActionState(updateLessonAction, blankState);

  return (
    <details className="border-t border-ink/10 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
        <span>
          <span className="mr-3 font-mono text-[0.62rem] text-yaye-teal">
            L{String(lesson.order).padStart(2, "0")}
          </span>
          {lesson.title}
        </span>
        <span className="font-mono text-[0.58rem] tracking-[0.1em] text-muted uppercase">
          {lesson.isPublished ? "Published" : "Draft"} · Edit
        </span>
      </summary>
      <form action={formAction} className="mt-5 space-y-4 bg-workspace p-4">
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="moduleId" value={moduleId} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <FormFeedback state={state} />
        <label className="block">
          <span className="auth-label">Lesson title</span>
          <input
            className="auth-input"
            name="title"
            defaultValue={lesson.title}
          />
          <FieldError errors={state.errors?.title} />
        </label>
        <label className="block">
          <span className="auth-label">Lesson content</span>
          <textarea
            className="auth-input min-h-32 resize-y"
            name="content"
            defaultValue={lesson.content}
          />
          <FieldError errors={state.errors?.content} />
        </label>
        <label className="block">
          <span className="auth-label">External video URL</span>
          <input
            className="auth-input"
            type="url"
            name="videoUrl"
            defaultValue={lesson.videoUrl ?? ""}
          />
          <FieldError errors={state.errors?.videoUrl} />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={lesson.isPublished}
            className="size-4 accent-yaye-blue"
          />
          Published in curriculum
        </label>
        <div className="flex flex-wrap justify-between gap-3">
          <FormSubmit>Save lesson</FormSubmit>
        </div>
      </form>
      <form
        action={deleteLessonAction}
        className="mt-3"
        onSubmit={(event) => {
          if (!window.confirm("Delete this lesson permanently?")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <button
          type="submit"
          className="text-xs font-semibold text-danger underline"
        >
          Delete lesson
        </button>
      </form>
    </details>
  );
}

function LessonCreateForm({
  moduleId,
  programId,
}: Readonly<{ moduleId: string; programId: string }>) {
  const [state, formAction] = useActionState(createLessonAction, blankState);
  return (
    <details className="mt-4 border border-dashed border-yaye-blue/35 bg-yaye-pale/35 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-yaye-blue">
        + Add lesson
      </summary>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="moduleId" value={moduleId} />
        <FormFeedback state={state} />
        <label className="block">
          <span className="auth-label">Lesson title</span>
          <input className="auth-input" name="title" required />
          <FieldError errors={state.errors?.title} />
        </label>
        <label className="block">
          <span className="auth-label">Lesson content</span>
          <textarea
            className="auth-input min-h-32 resize-y"
            name="content"
            required
          />
          <FieldError errors={state.errors?.content} />
        </label>
        <label className="block">
          <span className="auth-label">External video URL</span>
          <input className="auth-input" type="url" name="videoUrl" />
          <FieldError errors={state.errors?.videoUrl} />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="isPublished"
            className="size-4 accent-yaye-blue"
          />
          Publish this lesson
        </label>
        <FormSubmit>Add lesson</FormSubmit>
      </form>
    </details>
  );
}

function ModuleEditor({
  moduleRecord,
  programId,
}: Readonly<{ moduleRecord: ModuleRecord; programId: string }>) {
  const [state, formAction] = useActionState(updateModuleAction, blankState);
  return (
    <article className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-teal uppercase">
            Module {String(moduleRecord.order).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {moduleRecord.title}
          </h3>
          {moduleRecord.description && (
            <p className="mt-2 text-sm leading-6 text-muted">
              {moduleRecord.description}
            </p>
          )}
        </div>
        <span className="status-label">
          {moduleRecord.lessons.length} lessons
        </span>
      </div>

      <details className="mt-6 border-y border-ink/10 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-yaye-blue">
          Edit module details
        </summary>
        <form action={formAction} className="mt-5 space-y-4 bg-workspace p-4">
          <input type="hidden" name="programId" value={programId} />
          <input type="hidden" name="moduleId" value={moduleRecord.id} />
          <FormFeedback state={state} />
          <label className="block">
            <span className="auth-label">Module title</span>
            <input
              className="auth-input"
              name="title"
              defaultValue={moduleRecord.title}
            />
            <FieldError errors={state.errors?.title} />
          </label>
          <label className="block">
            <span className="auth-label">Description</span>
            <textarea
              className="auth-input min-h-24 resize-y"
              name="description"
              defaultValue={moduleRecord.description ?? ""}
            />
            <FieldError errors={state.errors?.description} />
          </label>
          <FormSubmit>Save module</FormSubmit>
        </form>
        <form
          action={deleteModuleAction}
          className="mt-3"
          onSubmit={(event) => {
            if (
              !window.confirm("Delete this module and every lesson inside it?")
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="programId" value={programId} />
          <input type="hidden" name="moduleId" value={moduleRecord.id} />
          <button
            type="submit"
            className="text-xs font-semibold text-danger underline"
          >
            Delete module and lessons
          </button>
        </form>
      </details>

      <div className="mt-2">
        {moduleRecord.lessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            moduleId={moduleRecord.id}
            programId={programId}
          />
        ))}
        {!moduleRecord.lessons.length && (
          <p className="py-5 text-sm text-muted">
            No lessons in this module yet.
          </p>
        )}
      </div>
      <LessonCreateForm moduleId={moduleRecord.id} programId={programId} />
    </article>
  );
}

export function CurriculumManager({
  programId,
  modules,
}: Readonly<{ programId: string; modules: readonly ModuleRecord[] }>) {
  const [state, formAction] = useActionState(createModuleAction, blankState);
  return (
    <div className="space-y-6">
      {modules.map((moduleRecord) => (
        <ModuleEditor
          key={moduleRecord.id}
          moduleRecord={moduleRecord}
          programId={programId}
        />
      ))}
      {!modules.length && (
        <div className="border border-dashed border-ink/25 bg-white px-5 py-10 text-center text-sm text-muted">
          No modules yet. Add the first curriculum section below.
        </div>
      )}
      <details className="border-t-2 border-yaye-blue bg-white px-5 py-5 sm:px-6">
        <summary className="cursor-pointer text-sm font-semibold text-yaye-blue">
          + Add module
        </summary>
        <form action={formAction} className="mt-5 space-y-4" noValidate>
          <input type="hidden" name="programId" value={programId} />
          <FormFeedback state={state} />
          <label className="block">
            <span className="auth-label">Module title</span>
            <input className="auth-input" name="title" required />
            <FieldError errors={state.errors?.title} />
          </label>
          <label className="block">
            <span className="auth-label">Description</span>
            <textarea
              className="auth-input min-h-24 resize-y"
              name="description"
            />
            <FieldError errors={state.errors?.description} />
          </label>
          <FormSubmit>Add module</FormSubmit>
        </form>
      </details>
    </div>
  );
}
