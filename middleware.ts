import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail, supabaseConfigured } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if ((code || tokenHash) && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (!supabaseConfigured()) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emailOk = isAllowedEmail(user?.email);

  if (user && !emailOk) {
    await supabase.auth.signOut();
    return redirectWithSession(request, "/login", "indirizzo", supabaseResponse);
  }

  if (!user && !isPublic) {
    return redirectWithSession(request, "/login", null, supabaseResponse);
  }

  if (user && emailOk && pathname.startsWith("/login")) {
    return redirectWithSession(request, "/", null, supabaseResponse);
  }

  return supabaseResponse;
}

function redirectWithSession(
  request: NextRequest,
  pathname: string,
  errore: string | null,
  supabaseResponse: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (errore) url.searchParams.set("errore", errore);
  const redirect = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
