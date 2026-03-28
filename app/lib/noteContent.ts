/**
 * El backend guarda `note_contents.content` como texto o JSON serializado.
 * Unificamos a string Markdown para el visor.
 */
export function normalizeNoteContentBody(raw: string): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === "string") return parsed;
    if (Array.isArray(parsed)) {
      return parsed.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n\n");
    }
    if (parsed && typeof parsed === "object") {
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    /* no es JSON: devolver tal cual */
  }
  return raw;
}

/** Título de bloque para el acordeón: prioriza NoteContent.tema del backend. */
export function noteSectionHeading(
  tema: string | undefined,
  title: string | undefined,
  order: number,
): string {
  if (tema?.trim()) return tema.trim();
  if (title?.trim()) return title.trim();
  return `Sección ${order + 1}`;
}
