"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STATUS_TAG_CLASS, STATUS_LABEL, BusinessStatus, formatRelativeTime } from "@/lib/mock-data";

interface BusinessRow {
  id: string;
  name: string;
  status: BusinessStatus;
  callsToday: number;
  callsMonth: number;
  lastActivityAt: string | null;
}

const STATUS_OPTIONS: (BusinessStatus | "all")[] = ["all", "active", "disabled"];

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BusinessStatus | "all">("all");

  useEffect(() => {
    fetch("/api/businesses")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load businesses");
        setBusinesses(data.businesses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (search.trim() && !b.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [businesses, search, status]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Businesses</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>All businesses connected to your AI receptionist</p>
        </div>
        <Link href="/businesses/new" className="btn btn-primary">+ Add Business</Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Search businesses..."
          style={{ maxWidth: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value as BusinessStatus | "all")}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-muted">Loading businesses…</p>}
      {error && <p style={{ color: "var(--color-accent-700)" }}>{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ padding: "8px 20px" }}>
          <table className="table">
            <thead><tr><th>Business</th><th>Status</th><th>Today</th><th>Monthly</th><th>Last Activity</th><th></th></tr></thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/businesses/${b.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                    </Link>
                  </td>
                  <td><span className={`tag ${STATUS_TAG_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                  <td>{b.callsToday}</td>
                  <td>{b.callsMonth}</td>
                  <td className="text-muted">{formatRelativeTime(b.lastActivityAt)}</td>
                  <td>
                    <Link href={`/businesses/${b.id}`} className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: 13, opacity: 0.6 }}>
        <span>Showing {filtered.length} of {businesses.length} businesses</span>
      </div>
    </div>
  );
}
