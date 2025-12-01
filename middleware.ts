import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/((?!login).)*"],
};
