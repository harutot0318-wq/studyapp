import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.error("DEBUG callback:", {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    origin,
    fullUrl: request.url,
    cookieNames: request.headers.get("cookie")?.split(";").map((c) => c.split("=")[0].trim()),
  });

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error(
        "exchangeCodeForSession failed (full):",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cause = (error as any).cause;
      if (cause) {
        console.error(
          "cause:",
          JSON.stringify(cause, Object.getOwnPropertyNames(cause)),
        );
      }
      return NextResponse.redirect(
        `${origin}/auth/error?reason=${encodeURIComponent(error.message)}`,
      );
    } catch (e) {
      const err = e as Error;
      console.error("exchangeCodeForSession threw:", err.message, "\n", err.stack);
      return NextResponse.redirect(
        `${origin}/auth/error?reason=${encodeURIComponent("THROW: " + err.message)}`,
      );
    }
  }

  console.error("auth callback called without a code param");
  // 失敗した場合はエラーを伝えるページに戻す
  return NextResponse.redirect(`${origin}/auth/error`);
}
