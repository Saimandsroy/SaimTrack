import type { LearningNote } from "@/features/learning-journal/learning-journal-types";

export function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatNoteDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function getNoteExcerpt(note: LearningNote) {
  const plainText = stripHtml(note.contentHtml);
  return plainText.length > 160 ? `${plainText.slice(0, 160).trim()}...` : plainText;
}

export function collectTags(notes: LearningNote[]) {
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort((left, right) =>
    left.localeCompare(right),
  );
}
