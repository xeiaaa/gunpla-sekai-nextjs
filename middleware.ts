import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/api/clerk"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    return req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/');
  });

  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    return;
  }

  // Protect all other routes
  auth.protect()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
