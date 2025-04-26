import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
// import type { Database } from "@/lib/supabase.types"; // Optional: Import your generated DB types

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Use Database generic if you have types, otherwise omit it
  const supabase = createServerClient(
    // <Database>
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing clean code here. The code below should be duplicated in server components/
  // routes to ensure the session is refreshed and potentially updated behind the scenes.
  // However, we need to grab the session here to perform the redirect logic.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/auth/callback"]; // Add any other public paths

  // Redirect to login if user is not authenticated and accessing a protected route
  // Exclude Next.js specific paths, API routes, and static files.
  if (
    !session &&
    !publicPaths.includes(pathname) &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/static") &&
    !pathname.includes(".")
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    // Optionally, add the intended destination as a query parameter
    // redirectUrl.searchParams.set(`redirectedFrom`, pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Refresh session before returning the response
  await supabase.auth.getSession();

  return response;
}
