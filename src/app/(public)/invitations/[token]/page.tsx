import Link from "next/link";

import { acceptInvitationAction } from "@/modules/invitations/actions";
import { getCurrentSession } from "@/modules/auth/session";
import { getInvitationPreview } from "@/modules/invitations/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function InvitationPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}>) {
  const [{ token }, query, session] = await Promise.all([
    params,
    searchParams,
    getCurrentSession(),
  ]);
  const invitation = await getInvitationPreview(token);
  const returnTo = `/invitations/${token}`;

  return (
    <section className="bg-workspace">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="border-t-2 border-ink bg-white px-5 py-8 sm:px-8">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Private program invitation
          </p>
          {!invitation ? (
            <>
              <h1 className="mt-4 text-4xl font-semibold text-ink">
                Invitation not found
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted">
                This invitation link is invalid or no longer available.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-ink">
                {invitation.cohort.program.title}
              </h1>
              <p className="mt-3 text-base text-muted">
                {invitation.cohort.name}
              </p>
              <dl className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
                <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-mono text-[0.62rem] text-muted uppercase">
                    Invited email
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {invitation.email}
                  </dd>
                </div>
                <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-mono text-[0.62rem] text-muted uppercase">
                    Expires
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {dateFormatter.format(invitation.expiresAt)}
                  </dd>
                </div>
                <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-mono text-[0.62rem] text-muted uppercase">
                    Status
                  </dt>
                  <dd className="text-sm font-semibold text-yaye-blue">
                    {invitation.state}
                  </dd>
                </div>
              </dl>

              {query.error && (
                <p
                  className="mt-6 border-l-2 border-danger bg-danger/7 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {query.error}
                </p>
              )}

              {invitation.state === "PENDING" && !session && (
                <div className="mt-7">
                  <Link
                    href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                    className="inline-block bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
                  >
                    Log in to accept ↗
                  </Link>
                  <p className="mt-3 text-xs text-muted">
                    Use the learner account matching the invited email.
                  </p>
                </div>
              )}

              {invitation.state === "PENDING" &&
                session?.user.role === "LEARNER" && (
                  <form action={acceptInvitationAction} className="mt-7">
                    <input type="hidden" name="token" value={token} />
                    <button
                      type="submit"
                      className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
                    >
                      Accept invitation
                    </button>
                  </form>
                )}

              {invitation.state === "PENDING" &&
                session &&
                session.user.role !== "LEARNER" && (
                  <p className="mt-7 border-l-2 border-yaye-teal bg-yaye-pale px-4 py-3 text-sm text-ink">
                    Sign in with the invited learner account to accept this
                    invitation.
                  </p>
                )}

              {invitation.state !== "PENDING" && (
                <p className="mt-7 text-sm text-muted">
                  {invitation.state === "ACCEPTED"
                    ? "This invitation has already been accepted."
                    : `This invitation is ${invitation.state.toLowerCase()} and cannot be accepted.`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
