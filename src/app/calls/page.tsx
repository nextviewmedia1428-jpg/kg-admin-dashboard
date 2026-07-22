"use client";

import { useEffect, useMemo, useState } from "react";
import { outcomeTagClass, formatCost, formatDuration, formatRelativeTime } from "@/lib/mock-data";
import CallDrawer, { useCallDrawer } from "@/components/CallDrawer";

interface CallRow {
  id: string;
  business_id: string | null;
  business_name: string | null;
  caller_name: string | null;
  from_number: string | null;
  started_at: string | null;
  duration_secs: number | null;
  outcome: string | null;
  call_cost: string | null;
  transferred: boolean;
  sentiment: string | null;
  status: string | null;
  has_recording: boolean;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState("all");
  const [outcome, setOutcome] = useState("all");

  const drawer = useCallDrawer();

  useEffect(() => {
    fetch("/api/calls")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load calls");
        setCalls(data.calls ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const businessOptions = useMemo(
    () => Array.from(new Set(calls.map((c) => c.business_name).filter((n): n is string => !!n))),
    [calls]
  );
  const outcomeOptions = useMemo(
    () => Array.from(new Set(calls.map((c) => c.outcome).filter((o): o is string => !!o))),
    [calls]
  );

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (business !== "all" && c.business_name !== business) return false;
      if (outcome !== "all" && c.outcome !== outcome) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${c.caller_name ?? ""} ${c.from_number ?? ""} ${c.business_name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [calls, search, business, outcome]);

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Calls</h1>
      <p className="text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>Every call handled by your AI receptionists</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Search caller, number, business..."
          style={{ maxWidth: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 190 }} value={business} onChange={(e) => setBusiness(e.target.value)}>
          <option value="all">All businesses</option>
          {businessOptions.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 170 }} value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          {outcomeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {loading && <p className="text-muted">Loading calls…</p>}
      {error && <p style={{ color: "var(--color-accent-700)" }}>{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ padding: "8px 20px" }}>
          <table className="table">
            <thead><tr><th>Time</th><th>Caller</th><th>Business</th><th>Duration</th><th>Outcome</th><th>Cost</th><th>Recording</th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => drawer.open(c.id)} style={{ cursor: "pointer" }}>
                  <td className="text-muted">{formatRelativeTime(c.started_at)}</td>
                  <td>{c.caller_name || c.from_number || "Unknown Caller"}</td>
                  <td>{c.business_name || "—"}</td>
                  <td>{formatDuration(c.duration_secs ?? 0)}</td>
                  <td>{c.outcome && <span className={`tag ${outcomeTagClass(c.outcome)}`}>{c.outcome}</span>}</td>
                  <td>{formatCost(c.call_cost)}</td>
                  <td>
                    {c.has_recording ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ opacity: 0.7 }}><path d="M6 4l14 8-14 8z" /></svg>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-muted" style={{ textAlign: "center", padding: 20 }}>No calls match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CallDrawer openId={drawer.openId} onClose={drawer.close} />
    </div>
  );
}
