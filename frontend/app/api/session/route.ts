import { cookies } from "next/headers";
import { backendURL, cookieName, seal, sameOrigin, employeeKey, boundedBody } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ authenticated: Boolean(await employeeKey()) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Origin not allowed" }, { status: 403 });
  try {
    const { key } = JSON.parse(await boundedBody(request));
    if (typeof key !== "string" || key.length < 24 || key.length > 256) return Response.json({ detail: "Enter a valid employee or admin key" }, { status: 400 });
    const result = await fetch(`${backendURL}/health/details`, { headers: { "X-API-Key": key }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!result.ok) return Response.json({ detail: "Employee sign-in failed" }, { status: result.status === 401 ? 401 : 503 });
    const token = seal(key);
    (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "strict", secure: process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
    return Response.json({ authenticated: true });
  } catch { return Response.json({ detail: "Sign-in unavailable. Check server configuration." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Origin not allowed" }, { status: 403 });
  (await cookies()).delete(cookieName);
  return Response.json({ authenticated: false });
}
