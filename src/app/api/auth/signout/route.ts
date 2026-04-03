import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/signout
 *
 * Signs the user out server-side so the auth cookie is properly cleared
 * before the redirect to /login. Client-only signOut + window.location
 * sometimes fails because the middleware still sees a valid cookie.
 */
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl, { status: 302 });

  // Belt-and-suspenders: also clear the Supabase auth cookies manually
  // so the middleware definitely sees no session on the next request.
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    "supabase-auth-token",
  ];
  for (const name of cookieNames) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
