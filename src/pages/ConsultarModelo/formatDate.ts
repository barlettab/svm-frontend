/** "2026-05-10" → "10/05/2026"; "2026-05-10T14:32" → "10/05/2026 - 14:32" */
export function formatDate(iso: string) {
  const [data, hora] = iso.split("T");
  const [y, m, d] = data.split("-");
  return hora ? `${d}/${m}/${y} - ${hora.slice(0, 5)}` : `${d}/${m}/${y}`;
}
