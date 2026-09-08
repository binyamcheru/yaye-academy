"use client";

const formatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
});

export function LocalDateTime({ value }: Readonly<{ value: string | Date }>) {
  const date = typeof value === "string" ? new Date(value) : value;
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {formatter.format(date)}
    </time>
  );
}
