import { JWTVerifyResult, createRemoteJWKSet, jwtVerify } from "jose";
import { decodePem } from "./utils";

/**
 * Verifies a Firebase ID token using the service‑account credentials.
 * Returns the decoded payload (which includes the UID and email).
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string,
  clientEmail: string,
  rawPrivateKey: string
): Promise<JWTVerifyResult["payload"]> {
  const privateKey = decodePem(rawPrivateKey);

  //console.log("PEM preview:", privateKey.slice(0, 30));

  // Build a JWKS-like verifier using the service‑account private key.
  // The token is signed by Google's certs; we can verify via the public keys
  // fetched from https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com
  // For simplicity we rely on the `jose` library's built‑in `jwtVerify` with the
  // Google public keys URL.

  const GOOGLE_CERTS_URL =
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");

  const { payload } = await jwtVerify(idToken, createRemoteJWKSet(GOOGLE_CERTS_URL), {
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`
  });

  return payload;
}