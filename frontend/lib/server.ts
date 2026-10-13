import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const backendURL = (process.env.AEGIS_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
export const cookieName = "aegis_employee";
const developmentSecret = randomBytes(32).toString("hex");

function secret() {
  const value = process.env.SESSION_SECRET;
  if ((!value || value.length < 32) && process.env.NODE_ENV === "production") {
    throw new Error("Configure SESSION_SECRET with at least 32 characters");
  }
  return createHash("sha256").update(value || developmentSecret).digest();
}

export function seal(key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secret(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ key, expires: Date.now() + 8 * 3600_000 })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

export async function employeeKey(): Promise<string | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const data = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", secret(), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const value = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString());
    return typeof value.key === "string" && value.expires > Date.now() ? value.key : null;
  } catch { return null; }
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === (process.env.APP_ORIGIN || new URL(request.url).origin);
}

export async function boundedBody(request: Request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 32768) { await reader.cancel(); throw new Error("Request too large"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
