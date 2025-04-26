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
  // Note: Routes covered by the main middleware matcher config (like /onboarding) are already excluded
  // from this middleware function execution. We only need to handle the redirect target here.
  // publicPaths definition might still be useful if middleware logic becomes more complex
  const publicPaths = ["/", "/login", "/register", "/auth/callback"];

  // Redirect to onboarding if user is not authenticated and accessing a protected route
  // Exclude Next.js specific paths, API routes, static files, and public paths.
  if (
    !session &&
    !publicPaths.includes(pathname) && // Keep checking public paths like root, login etc.
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/static") &&
    !pathname.includes(".") // Typically ignore file requests
    // No need to check for /onboarding here due to the matcher config
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding"; // Redirect to onboarding start
    // Optionally, add the intended destination as a query parameter
    // redirectUrl.searchParams.set(`redirectedFrom`, pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Refresh session before returning the response
  await supabase.auth.getSession();

  return response;
}
