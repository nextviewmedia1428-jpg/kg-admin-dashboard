"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { outcomeTagClass, formatCost, formatDuration, formatRelativeTime } from "@/lib/mock-data";

interface Stats {
  total_businesses: number;
  calls_today: number;
  calls_month: number;
  minutes_used_today: number;
  ai_cost_today: number;
  outcome_breakdown: { outcome: string; pct: number }[];
  trend: { date: string; count: number }[];
}
interface BusinessRow {
  id: string; name: string; callsToday: number; callsMonth: number; lastActivityAt: string | null;
}
interface CallRow {
  id: string; business_id: string | null; business_name: string | null; caller_name: string | null;
  from_number: string | null; started_at: string | null; duration_secs: number | null;
  outcome: string | null; call_cost: string | null;
}

const OUTCOME_BAR_PALETTE = ["var(--color-accent)", "var(--color-accent-300)", "var(--color-neutral-400)", "var(--color-neutral-500)", "var(--color-neutral-300)"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard-stats").then((r) => r.json()),
      fetch("/api/businesses").then((r) => r.json()),
      fetch("/api/calls").then((r) => r.json()),
    ])
      .then(([s, b, c]) => {
        if (s.error) throw new Error(s.error);
        setStats(s);
        setBusinesses(b.businesses ?? []);
        setCalls(c.calls ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Loading dashboard…</p>;
  if (error || !stats) return <p style={{ color: "var(--color-accent-700)" }}>{error ?? "Failed to load dashboard"}</p>;

  const kpis = [
    { label: "Total Businesses", value: String(stats.total_businesses), sub: "Across all statuses" },
    { label: "Today's Calls", value: String(stats.calls_today), sub: "Across all businesses" },
    { label: "Monthly Calls", value: stats.calls_month.toLocaleString(), sub: "This calendar month" },
    { label: "Voice Minutes Used", value: stats.minutes_used_today.toLocaleString(), sub: "Today's logged calls" },
    { label: "AI Cost", value: formatCost(stats.ai_cost_today), sub: "Today's logged calls" },
  ];

  const trendMax = Math.max(1, ...stats.trend.map((t) => t.count));
  const topBusinesses = [...businesses].sort((a, b) => b.callsMonth - a.callsMonth).slice(0, 4);
  const latestCalls = calls.slice(0, 6);
  const recentActivity = calls.slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Dashboard</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>Overview across every connected business</p>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-tile">
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-kicker">Volume</div>
          <div className="card-title" style={{ marginBottom: 16 }}>30-Day Call Trend</div>
          <div className="bar-chart">
            {stats.trend.map((t, i) => <div key={i} className="chart-tip" style={{ height: `${Math.max(4, (t.count / trendMax) * 100)}%` }} data-tip={`${t.date.slice(0, 10)}: ${t.count} call${t.count === 1 ? "" : "s"}`} />)}
          </div>
        </div>
        <div className="card">
          <div className="card-kicker">Outcomes</div>
          <div className="card-title" style={{ marginBottom: 16 }}>Call Outcomes (all businesses)</div>
          {stats.outcome_breakdown.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No calls logged yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stats.outcome_breakdown.map((b, i) => (
                <div key={b.outcome} className="chart-tip" data-tip={`${b.outcome}: ${b.pct}%`}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span className="text-muted">{b.outcome}</span><span style={{ fontWeight: 700 }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "var(--color-neutral-200)" }}>
                    <div style={{ height: "100%", width: `${b.pct}%`, background: OUTCOME_BAR_PALETTE[i % OUTCOME_BAR_PALETTE.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Top Businesses by Volume</div>
          {topBusinesses.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No businesses yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topBusinesses.map((biz) => (
                <Link key={biz.id} href={`/businesses/${biz.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-divider)", textDecoration: "none", color: "inherit" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{biz.name}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{biz.callsMonth} calls</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{biz.callsToday} today</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Recent Activity</div>
          {recentActivity.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No activity yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentActivity.map((c) => (
                <div key={c.id} className="timeline-row">
                  <div className="timeline-dot" />
                  <div>
                    <div style={{ fontSize: 13 }}>
                      {c.business_name || "Unknown business"} — call from {c.caller_name || c.from_number || "unknown caller"}
                      {c.outcome ? `, ${c.outcome}` : ""}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{formatRelativeTime(c.started_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Latest Calls</div>
        {latestCalls.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13 }}>No calls logged yet.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Time</th><th>Business</th><th>Caller</th><th>Duration</th><th>Outcome</th><th>Cost</th></tr></thead>
            <tbody>
              {latestCalls.map((c) => (
                <tr key={c.id}>
                  <td className="text-muted">{formatRelativeTime(c.started_at)}</td>
                  <td>{c.business_name || "—"}</td>
                  <td>{c.caller_name || c.from_number || "Unknown Caller"}</td>
                  <td>{formatDuration(c.duration_secs ?? 0)}</td>
                  <td>{c.outcome && <span className={`tag ${outcomeTagClass(c.outcome)}`}>{c.outcome}</span>}</td>
                  <td>{formatCost(c.call_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
