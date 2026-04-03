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
  // Send key as `apikey` header only (no Authorization: Bearer).
  // The key is also passed as ?apikey= URL param in every request, giving
  // PostgREST two ways to find it without the Bearer validation step that
  // some Supabase projects reject with 401.
  return {
    apikey: apiKey,
    Accept: "application/json",
  };
}
