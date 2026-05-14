/**
 * Turns generic browser/network errors from Supabase into actionable copy.
 */
export function describeSupabaseFetchError(message: string | undefined | null): string {
  const m = (message ?? "").trim();
  if (!m) return "Request failed.";
  const low = m.toLowerCase();
  if (
    m === "Failed to fetch" ||
    low === "load failed" ||
    low.includes("networkerror") ||
    low.includes("network request failed") ||
    (low.includes("fetch") && low.includes("failed"))
  ) {
    return [
      "Could not reach Supabase (browser blocked the request or the server did not respond).",
      "Check: copy Project URL from Dashboard → Settings → API into VITE_SUPABASE_URL (must be https://….supabase.co, no spaces).",
      "Unpause the project if Supabase shows it as paused, restart npm run dev after editing .env, and use http://localhost:5173 (not a file:// path).",
      "If you use a VPN, corporate proxy, or strict extensions, try disabling them for localhost.",
    ].join(" ");
  }
  return m;
}
