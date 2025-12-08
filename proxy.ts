import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);

    // 檢查是否為管理員
    if (!payload.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token 無效或過期
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/admin/((?!login).)*"],
};
