/**
 * Supabase JS expects the project origin only (https://YOUR_REF.supabase.co).
 * If VITE_SUPABASE_URL includes /rest/v1 (easy to copy from API examples), the Auth
 * client builds https://.../rest/v1/auth/v1 and the server returns "Invalid path specified in request URL".
 */
export function supabaseUrlToOrigin(raw) {
  let s = String(raw ?? "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (!s) return "";
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withProto);
    if (u.hostname.endsWith(".supabase.co") && u.protocol === "http:") {
      u.protocol = "https:";
    }
    return u.origin;
  } catch {
    return s;
  }
}

export function stripEnvQuotes(raw) {
  let s = String(raw ?? "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

/** Decode JWT payload `role` (legacy anon / service_role keys). Returns null if not a JWT. */
export function jwtRoleFromKey(key) {
  const t = stripEnvQuotes(key);
  if (!t || !t.startsWith("eyJ")) return null;
  const parts = t.split(".");
  if (parts.length < 2) return null;
  let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  try {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const p = JSON.parse(json);
    return typeof p.role === "string" ? p.role : null;
  } catch {
    return null;
  }
}
