import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/scripts(.*)",
  "/sessions(.*)",
  "/analytics(.*)",
  "/call-analysis(.*)",
  "/settings(.*)",
  "/billing(.*)",
]);

function needsAccessCheck(pathname: string) {
  if (pathname.startsWith("/access")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/sign-in")) return false;
  if (pathname.startsWith("/sign-up")) return false;
  if (/\.\w+$/.test(pathname)) return false;
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (needsAccessCheck(pathname)) {
    const cookie = req.cookies.get("rumios_access");
    if (!cookie || cookie.value !== "granted") {
      const url = req.nextUrl.clone();
      url.pathname = "/access";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
