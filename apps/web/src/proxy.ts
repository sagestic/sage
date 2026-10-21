import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function getCleanHost(req: {
  headers: { get: (key: string) => string | null };
}): string {
  const forwarded =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (forwarded && !forwarded.includes("0.0.0.0")) return forwarded;
  return "localhost:3000";
}

export function getCleanProtocol(req: {
  headers: { get: (key: string) => string | null };
}): string {
  return req.headers.get("x-forwarded-proto") || "http";
}

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
