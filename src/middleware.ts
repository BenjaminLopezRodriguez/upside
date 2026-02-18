import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { NextRequest } from "next/server";

export default withAuth(function middleware(_request: NextRequest) {
  // Additional middleware logic can go here
}, {
  isReturnToCurrentPage: true,
});

export const config = {
  matcher: [
    // Require auth for all paths except: static assets, api/auth, sign-in, and root landing
    "/((?!_next/static|_next/image|favicon.ico|api/auth|logo.svg|sign-in).+)",
  ],
};
