import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAllowedEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const otpTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/login?errore=link`);
  }

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("magic link callback:", error.code, error.message);
      const errore = error.code === "pkce_code_verifier_not_found" ? "browser" : "link";
      return NextResponse.redirect(`${origin}/login?errore=${errore}`);
    }
  } else if (tokenHash && type && otpTypes.has(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?errore=link`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login?errore=link`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAllowedEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?errore=indirizzo`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
