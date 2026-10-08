const TIME_ZONE = "Asia/Seoul";

const monthDay = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  timeZone: TIME_ZONE,
});

const fullDate = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: TIME_ZONE,
});

export function formatMonthDay(iso) {
  return monthDay.format(new Date(iso));
}

export function formatFullDate(iso) {
  return fullDate.format(new Date(iso));
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function monthLabel(year, month) {
  return `${year}년 ${month}월`;
}
