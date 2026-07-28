import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// NOTE: exchangeCodeForSession()'s internal fetch() call throws
// "Cannot convert argument to a ByteString ..." on Vercel's production
// (Turbopack) build only - a known class of Next.js/Turbopack bug where
// unrelated Unicode content elsewhere in the app corrupts header
// construction in a compiled chunk. It never reproduces in `next dev`.
// Workaround: do the PKCE code exchange with a plain fetch() ourselves,
// bypassing whatever bundled code path is broken, then hand the tokens
// to supabase-js just to persist the session via our cookie handlers.
async function exchangeCodeManually(code: string) {
  const cookieStore = await cookies();
  const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const verifierCookieName = `sb-${projectRef}-auth-token-code-verifier`;
  const rawCookie = cookieStore.get(verifierCookieName)?.value;

  if (!rawCookie) {
    return { error: "code verifier cookie missing" };
  }

  const codeVerifier = JSON.parse(
    Buffer.from(rawCookie.replace("base64-", ""), "base64").toString("utf-8"),
  ) as string;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    return { error: `token endpoint ${res.status}: ${body}` };
  }

  const tokens = (await res.json()) as {
    access_token: string;
    refresh_token: string;
  };

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  return { error: error?.message };
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const { error } = await exchangeCodeManually(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("manual code exchange failed:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?reason=${encodeURIComponent(error)}`,
      );
    } catch (e) {
      const err = e as Error;
      console.error("manual code exchange threw:", err.message, "\n", err.stack);
      return NextResponse.redirect(
        `${origin}/auth/error?reason=${encodeURIComponent("THROW: " + err.message)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
