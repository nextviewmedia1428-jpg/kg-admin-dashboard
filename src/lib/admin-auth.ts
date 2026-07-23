// Cookie stores a hash of the passphrase, never the passphrase itself — a leaked cookie
// (devtools, a proxy log) then isn't equivalent to the master credential. Web Crypto works
// in both the edge (proxy.ts) and Node (route handlers) runtimes, so no extra dependency.
export async function hashPassphrase(passphrase: string): Promise<string> {
  const bytes = new TextEncoder().encode(passphrase);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
