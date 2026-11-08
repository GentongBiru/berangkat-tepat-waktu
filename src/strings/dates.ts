import { id } from "./id";

/** "Minggu, 8 November 2026" (local date). */
export function formatLongDate(date: Date): string {
  return `${id.days[date.getDay()]}, ${date.getDate()} ${id.months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Local "HH:MM" for an ISO timestamp. */
export function formatIsoTime(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Decimal comma, at most one decimal: 1.2 -> "1,2". */
export function formatMillimetres(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}
