import { MAX_BACKUP_CHARS } from "../core/backup";

/** Download text as a file through a temporary link. */
export function downloadTextFile(fileName: string, text: string, mimeType = "application/json"): void {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ReadFileResult =
  | { ok: true; text: string }
  | { ok: false; error: "too_large" | "read_failed" };

/** Read a picked file as text. Oversized files are refused before being loaded. */
export async function readFileText(file: File): Promise<ReadFileResult> {
  // Bytes can exceed characters for non-ASCII text, so allow double the character cap here.
  // parseBackup applies the exact character cap afterwards.
  if (file.size > MAX_BACKUP_CHARS * 2) return { ok: false, error: "too_large" };
  try {
    return { ok: true, text: await file.text() };
  } catch {
    return { ok: false, error: "read_failed" };
  }
}
