import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 保護したいルートを定義
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/protected(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 保護されたルートへのアクセス時は認証を要求
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 静的ファイルと_next以外のすべてのルート
    "/((?!.*\\..*|_next).*)",
    "/",
    // APIルート
    "/(api|trpc)(.*)",
  ],
};
