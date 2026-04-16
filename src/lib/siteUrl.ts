/**
 * Public origin of the SPA (scheme + host, no trailing slash).
 *
 * Set `VITE_APP_URL` in production (e.g. Cloudflare Pages) to the canonical site
 * URL so OAuth `redirectTo` matches Supabase "Redirect URLs" and avoids falling
 * back to the dashboard "Site URL" (often still localhost during setup).
 *
 * When unset, uses `window.location.origin` so local dev (`vite` on :3000) keeps working.
 */
export function getSiteOrigin(): string {
  const raw = import.meta.env.VITE_APP_URL as string | undefined;
  if (raw && raw.trim()) {
    try {
      return new URL(raw.trim()).origin;
    } catch {
      // Invalid URL: fall through to window
    }
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
