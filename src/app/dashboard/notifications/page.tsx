import Link from "next/link";

import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/modules/communication/actions";
import { listLearnerNotifications } from "@/modules/communication/service";

export default async function NotificationsPage() {
  const session = await requireRole("LEARNER");
  const notifications = await listLearnerNotifications(session.user.id);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-8">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Learning updates
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Notifications
          </h1>
          <p className="mt-3 text-sm text-muted">
            {unreadCount} unread · {notifications.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="border border-ink/25 bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-yaye-pale"
            >
              Mark all as read
            </button>
          </form>
        )}
      </header>
      <section className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] ${
              notification.readAt ? "" : "border-l-4 border-yaye-teal"
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-ink">{notification.title}</h2>
                {!notification.readAt && (
                  <span className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-yaye-blue uppercase">
                    Unread
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{notification.body}</p>
              <p className="mt-2 text-xs text-muted">
                <LocalDateTime value={notification.createdAt} />
              </p>
              {notification.href && (
                <Link
                  href={notification.href}
                  className="mt-3 inline-block text-sm font-semibold text-yaye-blue underline"
                >
                  Open update
                </Link>
              )}
            </div>
            {!notification.readAt && (
              <form action={markNotificationReadAction}>
                <input
                  type="hidden"
                  name="notificationId"
                  value={notification.id}
                />
                <button
                  type="submit"
                  className="text-xs font-semibold text-yaye-blue underline"
                >
                  Mark as read
                </button>
              </form>
            )}
          </article>
        ))}
        {!notifications.length && (
          <div className="px-5 py-12 text-center">
            <h2 className="text-lg font-semibold text-ink">
              You are up to date
            </h2>
            <p className="mt-2 text-sm text-muted">
              New session and announcement updates will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
