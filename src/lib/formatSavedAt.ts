/** Short relative label + accessible full timestamp for “last saved” UI. */
export function formatSavedAt(iso: string): { label: string; title: string } {
  const d = new Date(iso);
  const title = d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (!Number.isFinite(sec)) return { label: title, title };
  if (sec < 45) return { label: "Just now", title };
  if (sec < 3600) return { label: `${Math.floor(sec / 60)} min ago`, title };
  if (sec < 86400) return { label: `${Math.floor(sec / 3600)} h ago`, title };
  if (sec < 86400 * 7) return { label: `${Math.floor(sec / 86400)} d ago`, title };
  return { label: title, title };
}
