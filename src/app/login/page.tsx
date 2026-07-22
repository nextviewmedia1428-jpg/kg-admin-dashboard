"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={onSubmit} className="card elev-md" style={{ width: "100%", maxWidth: 380, padding: 32 }}>
        <div style={{ width: 30, height: 30, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16, marginBottom: 16 }}>V</div>
        <h1 style={{ fontSize: 25, marginBottom: 4 }}>Admin sign in</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 24 }}>Enter the access passphrase to manage businesses.</p>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Passphrase</label>
          <input
            type="password"
            autoFocus
            className="input"
            placeholder="Access passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--color-accent-700)", fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !passphrase}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
