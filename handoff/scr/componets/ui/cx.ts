/** Concatena classes ignorando valores falsos. Usado em toda a UI SVM. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
