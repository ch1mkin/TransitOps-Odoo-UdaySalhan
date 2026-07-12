import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let url: string;
  let anonKey: string;

  try {
    ({ url, anonKey } = getSupabaseEnv());
  } catch {
    if (request.nextUrl.pathname.startsWith("/auth")) {
      return supabaseResponse;
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isWelcomeRoute = request.nextUrl.pathname === "/";
  const isUploadRoute = request.nextUrl.pathname.startsWith("/upload");
  const isTrackRoute = request.nextUrl.pathname.startsWith("/track");
  const isRegisterRoute = request.nextUrl.pathname.startsWith("/register");
  const isPublicApiRoute =
    request.nextUrl.pathname.startsWith("/api/upload/") ||
    request.nextUrl.pathname.startsWith("/api/trips/location/");
  const isPublicRoute =
    isAuthRoute ||
    isWelcomeRoute ||
    isUploadRoute ||
    isTrackRoute ||
    isRegisterRoute ||
    isPublicApiRoute;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isWelcomeRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
