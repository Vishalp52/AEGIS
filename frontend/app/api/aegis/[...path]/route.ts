import { backendURL, employeeKey, sameOrigin, boundedBody } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const publicGet = /^(health|auth\/nonce|demo\/scenarios|customer\/status\/[A-Za-z0-9_]+|access\/[A-Za-z0-9_]+\/(challenge|resume)|vault\/[a-z0-9_-]+)$/;
const publicPost = /^(access\/request|access\/[A-Za-z0-9_]+\/(verify|resume))$/;
const privateGet = /^(health\/details|cases|cases\/[A-Za-z0-9_]+|incidents|wallet\/0x[a-fA-F0-9]{40}\/(features|risk))$/;
const privatePost = /^(score|demo\/reset|incident\/confirm|cases\/[A-Za-z0-9_]+\/(review|registry))$/;

async function forward(request: Request, context: Context) {
  const path = (await context.params).path.join("/");
  const isGet = request.method === "GET";
  if (!isGet && !sameOrigin(request)) return Response.json({ detail: "Origin not allowed" }, { status: 403 });
  const isPublic = (isGet ? publicGet : publicPost).test(path);
  if (!isPublic && !(isGet ? privateGet : privatePost).test(path)) return Response.json({ detail: "Not found" }, { status: 404 });
  const key = isPublic ? null : await employeeKey();
  if (!isPublic && !key) return Response.json({ detail: "Employee sign-in required" }, { status: 401 });
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (key) headers["X-API-Key"] = key;
    if (path.startsWith("vault/") && request.headers.get("authorization")) headers.Authorization = request.headers.get("authorization")!;
    const result = await fetch(`${backendURL}/${path}${new URL(request.url).search}`, {
      method: request.method, headers, body: isGet ? undefined : await boundedBody(request),
      cache: "no-store", signal: AbortSignal.timeout(45000), redirect: "error",
    });
    return new Response(await result.text(), { status: result.status, headers: {
      "Content-Type": "application/json", "Cache-Control": "no-store",
      ...(result.headers.get("retry-after") ? { "Retry-After": result.headers.get("retry-after")! } : {}),
    } });
  } catch { return Response.json({ detail: "The security service is unavailable. Please retry shortly." }, { status: 503 }); }
}

export const GET = forward;
export const POST = forward;
