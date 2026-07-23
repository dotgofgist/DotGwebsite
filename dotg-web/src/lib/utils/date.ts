export function formatDate(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateRange(
  startsAt?: string,
  endsAt?: string,
): string | null {
  const start = startsAt ? formatDate(startsAt) : null;
  const end = endsAt ? formatDate(endsAt) : null;

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  if (start) {
    return `${start}부터`;
  }

  if (end) {
    return `${end}까지`;
  }

  return null;
}
