import { InvitationForm } from "@/components/admin/invitation-form";
import { requireRole } from "@/modules/auth/session";
import { cancelInvitationAction } from "@/modules/invitations/actions";
import {
  listPrivateCohortOptions,
  listPrivateInvitations,
} from "@/modules/invitations/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function AdminEnrollmentsPage() {
  await requireRole("ADMIN");
  const [cohorts, invitations] = await Promise.all([
    listPrivateCohortOptions(),
    listPrivateInvitations(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Private enrollment operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Invitations
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Grant access to invitation-only batches without exposing a public
          enrollment action.
        </p>
      </header>

      <div className="mt-8">
        <InvitationForm cohorts={cohorts} />
      </div>

      <section className="mt-10 overflow-x-auto bg-white">
        <div className="grid min-w-[54rem] grid-cols-[1.1fr_1fr_8rem_8rem_7rem] border-b-2 border-ink px-5 py-4 font-mono text-[0.6rem] tracking-[0.1em] text-muted uppercase">
          <span>Learner</span>
          <span>Program · Batch</span>
          <span>Expires</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="min-w-[54rem] divide-y divide-ink/10">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="grid grid-cols-[1.1fr_1fr_8rem_8rem_7rem] items-center px-5 py-5 text-sm"
            >
              <span className="font-semibold text-ink">{invitation.email}</span>
              <span className="text-muted">
                {invitation.cohort.program.title} · {invitation.cohort.name}
              </span>
              <span className="text-xs text-muted">
                {dateFormatter.format(invitation.expiresAt)}
              </span>
              <span className="font-mono text-[0.62rem] font-semibold text-yaye-blue">
                {invitation.state}
              </span>
              {invitation.state === "PENDING" ? (
                <form action={cancelInvitationAction}>
                  <input
                    type="hidden"
                    name="invitationId"
                    value={invitation.id}
                  />
                  <button
                    className="text-xs font-semibold text-danger underline"
                    type="submit"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="text-xs text-muted">—</span>
              )}
            </div>
          ))}
          {!invitations.length && (
            <p className="px-5 py-10 text-sm text-muted">
              No private invitations yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
