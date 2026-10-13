import { cookies } from "next/headers";
import { backendURL, cookieName, seal, sameOrigin, employeeKey, boundedBody, RequestBodyError } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ authenticated: Boolean(await employeeKey()) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Origin not allowed" }, { status: 403 });
  try {
    let input: unknown;
    try { input = JSON.parse(await boundedBody(request)); }
    catch (error) { if (error instanceof SyntaxError) throw new RequestBodyError("Invalid JSON request", 400); throw error; }
    const key = input && typeof input === "object" ? (input as { key?: unknown }).key : undefined;
    if (typeof key !== "string" || key.length < 24 || key.length > 256) return Response.json({ detail: "Enter a valid employee or admin key" }, { status: 400 });
    const result = await fetch(`${backendURL}/health/details`, { headers: { "X-API-Key": key }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!result.ok) return Response.json({ detail: "Employee sign-in failed" }, { status: result.status === 401 ? 401 : 503 });
    const token = seal(key);
    (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "strict", secure: process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
    return Response.json({ authenticated: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ detail: error.message }, { status: error.status });
    return Response.json({ detail: "Sign-in unavailable. Check server configuration." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Origin not allowed" }, { status: 403 });
  (await cookies()).delete(cookieName);
  return Response.json({ authenticated: false });
}
