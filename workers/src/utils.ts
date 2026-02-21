/**
 * Cloudflare Workers secrets are stored as a single line.
 * This helper replaces the escaped "\n" sequences with real newline characters
 * and trims any stray whitespace.
 */
export function decodePem(pemString: string): string {
  // Replace the literal "\n" with an actual newline character.
  // Some editors also escape backslashes, so we replace double‑escaped "\\" as well.
  return pemString.replace(/\\n/g, "\n").trim();
}