import { SignJWT, jwtVerify } from "jose";

// Replace with your runtime's way of accessing secrets.
// For example, for Cloudflare Workers, use globalThis.JWT_SECRET or import.meta.env.JWT_SECRET.
declare global {
  interface GlobalThis {
    JWT_SECRET: string;
  }
}

const JWT_SECRET = new TextEncoder().encode((globalThis as unknown as GlobalThis).JWT_SECRET);

/**
 * Takes a Firebase UID + email and returns a short‑lived (1 hour) JWT
 * that our API will trust.
 */
export async function signAppJwt(uid: string, email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ sub: uid, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60) // 1 hour
    .sign(JWT_SECRET);
}

/**
 * Verifies the app‑issued JWT and returns the payload (or null if invalid).
 */
export async function verifyAppJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; email: string };
  } catch {
    return null;
  }
}