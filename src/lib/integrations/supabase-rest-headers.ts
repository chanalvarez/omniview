/**
 * Headers Supabase PostgREST expects when using the anon (or service) key.
 *
 * Supports both key formats:
 * - Legacy JWT keys (eyJ…)
 * - New publishable keys (sb_publishable_…)
 *
 * Both are sent in `apikey` and `Authorization: Bearer`. For the new format,
 * Supabase's API gateway intercepts the request and converts the opaque key
 * to the appropriate JWT before forwarding to PostgREST.
 *
 * @see https://supabase.com/docs/guides/api
 */
export function supabaseRestHeaders(apiKey: string): HeadersInit {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}
