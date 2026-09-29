import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const isDemoCookie =
    request.cookies.get("thermotwin_demo")?.value === "true";
  const hasDemoParam = request.nextUrl.searchParams.get("demo") === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("example.com");

  // If in demo mode or demo parameter provided, allow access
  if (isDemoCookie || hasDemoParam || isPlaceholder) {
    if (hasDemoParam) {
      supabaseResponse.cookies.set("thermotwin_demo", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } catch {
    // If Supabase request fails, allow access in demo mode
    return supabaseResponse;
  }

  return supabaseResponse;
}
