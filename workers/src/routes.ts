import { Router } from "itty-router";
import { verifyAppJwt } from "./jwt";
import { upsertUser, getUser } from "./db";
import { signAppJwt } from "./jwt";
import { verifyFirebaseIdToken } from "./firebaseVerifier";
import { D1Database } from "@cloudflare/workers-types";

// Initialize DB as a D1Database instance
const DB = (globalThis as any).DB as D1Database;

export const router = Router();

// ------------------------------------------------------------------
// Public endpoint – exchange Firebase ID token for our own JWT
// ------------------------------------------------------------------
router.post("/auth/exchange", async (req) => {
  const { idToken } = (await req.json()) as { idToken: string };

  // Grab the secrets we stored earlier
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  // Verify the Firebase token
  const fbPayload = await verifyFirebaseIdToken(
    idToken,
    projectId,
    clientEmail,
    privateKey
  );

  if (!fbPayload?.sub || !fbPayload?.email) {
    return new Response("Invalid Firebase token", { status: 401 });
  }

  // Ensure the user exists in our D1 DB (upsert)
  await upsertUser(DB, String(fbPayload.sub), String(fbPayload.email));

  // Issue our own short‑lived JWT
  const appJwt = await signAppJwt(String(fbPayload.sub), String(fbPayload.email));
  return new Response(JSON.stringify({ token: appJwt }), {
    headers: { "Content-Type": "application/json" }
  });
});

// ------------------------------------------------------------------
// Protected endpoint – return the logged‑in user's profile
// ------------------------------------------------------------------
router.get("/me", async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Missing token", { status: 401 });
  }
  const token = authHeader.slice(7);
  const payload = await verifyAppJwt(token);
  if (!payload) {
    return new Response("Invalid token", { status: 401 });
  }

  const user = await getUser(DB, payload.sub);
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" }
  });
});

// ------------------------------------------------------------------
// Fallback 404
// ------------------------------------------------------------------
router.all("*", () => new Response("Not Found", { status: 404 }));