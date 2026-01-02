import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  const cookie = cookies();

  const formData = await req.formData();

  const supabase = createRouteHandlerClient({
    cookies: () => cookie,
  });

  await supabase.auth.signOut();

  return NextResponse.redirect(url.origin, {
    status: 301,
  });
}
