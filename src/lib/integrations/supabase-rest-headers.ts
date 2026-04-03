/**
 * Headers Supabase PostgREST expects when using the anon (or service) key.
 * @see https://supabase.com/docs/guides/api
 */
export function supabaseRestHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    apikey: apiKey,
    Accept: "application/json",
  };
}
