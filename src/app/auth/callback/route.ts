import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const next = requestUrl.searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = requestUrl.origin + next;
      return NextResponse.redirect(redirectUrl);
    }
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
