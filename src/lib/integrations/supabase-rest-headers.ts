/**
 * Headers Supabase PostgREST expects when using the anon (or service) key.
 *
 * Supports both key formats:
 * - Legacy JWT keys (eyJ…) — sent as both `apikey` and `Authorization: Bearer`
 * - New publishable keys (sb_publishable_…) — sent as `apikey` only, because
 *   the Supabase API gateway handles the JWT conversion server-side and
 *   PostgREST cannot decode the opaque key as a Bearer JWT itself.
 *
 * @see https://supabase.com/docs/guides/api
 */
export function supabaseRestHeaders(apiKey: string): HeadersInit {
  const isLegacyJwt = apiKey.startsWith("eyJ");

  return {
    apikey: apiKey,
    ...(isLegacyJwt ? { Authorization: `Bearer ${apiKey}` } : {}),
    Accept: "application/json",
  };
}
