// src/lib/api.ts
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { auth } from "./firebase";

let appJwt: string | null = null;

/**
 * Exchange a Firebase ID token for the app‑specific JWT.
 * This runs once whenever the Firebase auth state becomes “signed‑in”.
 */
async function exchangeToken(idToken: string): Promise<void> {
  const resp = await fetch("/api/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${txt}`);
  }

  const data = await resp.json(); // { token: "…" }
  appJwt = data.token;
}

/* Listen for Firebase auth changes – this runs once per page load */
onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    const idToken = await user.getIdToken();
    await exchangeToken(idToken);
  } else {
    appJwt = null; // signed out
  }
});

/**
 * Generic helper for calling protected API routes.
 * Usage: `await api<Profile>("/me")`.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (appJwt) {
    headers.set("Authorization", `Bearer ${appJwt}`);
  }

  const resp = await fetch(`/api${path}`, {
    ...init,
    headers
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }

  return resp.json() as Promise<T>;
}