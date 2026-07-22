"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TIMEZONES,
  GLOBAL_AGENT_CONFIG, STATUS_TAG_CLASS, STATUS_LABEL, outcomeTagClass, BusinessStatus,
  formatDuration, formatRelativeTime, formatCost, dailyCallTrend,
} from "@/lib/mock-data";
import CallDrawer, { useCallDrawer } from "@/components/CallDrawer";

const TABS = ["overview", "configuration", "knowledge", "calls", "analytics", "settings"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: "Overview", configuration: "Configuration", knowledge: "Knowledge Base",
  calls: "Calls", analytics: "Analytics", settings: "Settings",
};

interface KbDoc { filename: string; chunks: number; uploaded_at: string }
interface CallRow {
  id: string; caller_name: string | null; from_number: string | null; started_at: string | null;
  duration_secs: number | null; outcome: string | null; call_cost: string | null;
}
interface ActivityRow { id: string; text: string; created_at: string }
interface Biz {
  id: string; name: string; status: BusinessStatus; address: string | null; phone: string;
  industry: string | null; timezone: string | null; businessHours: string | null;
  agentName: string; businessDescription: string; customInstructions: string; greeting: string | null;
  agentRole: string; transferConditions: string; emergencyHandling: string;
  handoverNumber: string | null; recordingEnabled: boolean; updatedAt: string; kbDocuments: KbDoc[];
  contactEmail: string | null; portalInvitedAt: string | null;
}

function fromApi(j: Record<string, unknown>): Biz {
  return {
    id: j.id as string, name: j.name as string, status: j.status as BusinessStatus,
    address: j.address as string | null, phone: j.phone as string,
    industry: j.industry as string | null, timezone: j.timezone as string | null, businessHours: j.business_hours as string | null,
    agentName: j.agent_name as string, businessDescription: j.business_description as string,
    customInstructions: (j.custom_instructions as string) ?? "", greeting: j.greeting as string | null,
    agentRole: (j.agent_role as string) ?? "", transferConditions: (j.transfer_conditions as string) ?? "",
    emergencyHandling: (j.emergency_handling as string) ?? "",
    handoverNumber: j.handover_number as string | null, recordingEnabled: Boolean(j.recording_enabled),
    updatedAt: j.updated_at as string, kbDocuments: (j.kb_documents as KbDoc[]) ?? [],
    contactEmail: (j.contact_email as string | null) ?? null, portalInvitedAt: (j.portal_invited_at as string | null) ?? null,
  };
}

export default function BusinessDetail({ id }: { id: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [biz, setBiz] = useState<Biz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const drawer = useCallDrawer();

  // Configuration tab form state (initialized once biz loads)
  const [form, setForm] = useState<Partial<Biz>>({});

  function load() {
    setLoading(true);
    fetch(`/api/businesses/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load business");
        if (data.error === "not found") throw new Error("not found");
        const b = fromApi(data);
        setBiz(b);
        setForm(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  useEffect(() => {
    fetch(`/api/calls?business_id=${id}`)
      .then((res) => res.json())
      .then((data) => setCalls(data.calls ?? []))
      .catch(() => setCalls([]));
  }, [id]);

  useEffect(() => {
    fetch(`/api/businesses/${id}/activity`)
      .then((res) => res.json())
      .then((data) => setActivity(data.activity ?? []))
      .catch(() => setActivity([]));
  }, [id]);

  async function saveChanges() {
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch(`/api/businesses/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name, industry: form.industry, timezone: form.timezone, business_hours: form.businessHours,
        address: form.address, status: form.status, greeting: form.greeting, custom_instructions: form.customInstructions,
        agent_role: form.agentRole, transfer_conditions: form.transferConditions, emergency_handling: form.emergencyHandling,
        handover_number: form.handoverNumber, recording_enabled: form.recordingEnabled, contact_email: form.contactEmail,
      }),
    });
    setSaving(false);
    if (!res.ok) { setSaveMsg("Save failed"); return; }
    setSaveMsg("Saved");
    load();
  }

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file_0", file);
    await fetch(`/api/businesses/${id}/kb`, { method: "POST", body: fd });
    e.target.value = "";
    load();
  }

  async function deleteDoc(filename: string) {
    await fetch(`/api/businesses/${id}/kb`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    load();
  }

  async function sendInvite() {
    setInviting(true);
    setInviteMsg(null);
    const res = await fetch(`/api/businesses/${id}/invite`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setInviting(false);
    if (!res.ok || data.error) { setInviteMsg(data.error ?? "Failed to send invite"); return; }
    setInviteMsg("Invite sent");
    load();
  }

  async function deleteBusiness() {
    if (!biz) return;
    if (!confirm(`Delete "${biz.name}"? This permanently removes the business, its knowledge base, and its call history. This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) { alert("Delete failed."); return; }
    router.push("/businesses");
  }

  if (loading) return <p className="text-muted">Loading…</p>;
  if (error || !biz) {
    return (
      <div>
        <Link href="/businesses" style={{ fontSize: 13, opacity: 0.6 }}>&larr; All businesses</Link>
        <p style={{ marginTop: 16 }}>Business not found.</p>
      </div>
    );
  }

  const breakdown = (() => {
    if (calls.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const c of calls) if (c.outcome) counts[c.outcome] = (counts[c.outcome] ?? 0) + 1;
    return Object.entries(counts).map(([outcome, n]) => ({ outcome, n, pct: Math.round((n / calls.length) * 100) }));
  })();
  const trend = dailyCallTrend(calls);
  const trendMax = Math.max(1, ...trend.map((t) => t.count));

  const totalDuration = calls.reduce((a, c) => a + (c.duration_secs ?? 0), 0);
  const minutesUsed = Math.round(totalDuration / 60);
  const avgDuration = calls.length ? Math.round(totalDuration / calls.length) : 0;
  const avgCost = calls.length ? calls.reduce((a, c) => a + (parseFloat(c.call_cost ?? "0") || 0), 0) / calls.length : 0;
  const booked = calls.filter((c) => c.outcome === "Booked").length;
  const transferred = calls.filter((c) => c.outcome === "Transferred").length;

  const overviewKpis = [
    { label: "Minutes Used", value: minutesUsed.toLocaleString() },
    { label: "Avg Call Duration", value: formatDuration(avgDuration) },
    { label: "Avg Call Cost", value: `$${avgCost.toFixed(2)}` },
    { label: "Appointments Booked", value: String(booked) },
    { label: "Transferred Calls", value: String(transferred) },
  ];

  return (
    <div>
      <Link href="/businesses" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, opacity: 0.6, textDecoration: "none", color: "inherit", marginBottom: 14 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6" /></svg>
        All businesses
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>{biz.name}</h1>
            <span className={`tag ${STATUS_TAG_CLASS[biz.status]}`}>{STATUS_LABEL[biz.status]}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 13 }}>Number {biz.phone} &middot; Last updated {formatRelativeTime(biz.updatedAt)}</div>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab-link${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {overviewKpis.map((k) => (
              <div key={k.label} className="kpi-tile" style={{ padding: 18 }}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={{ fontSize: 22 }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Call Volume — 30 Days</div>
              <div className="bar-chart" style={{ height: 110 }}>
                {trend.map((t, i) => (
                  <div key={i} className="chart-tip" style={{ height: `${Math.max(4, (t.count / trendMax) * 100)}%` }} data-tip={`${t.date}: ${t.count} call${t.count === 1 ? "" : "s"}`} />
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Call Outcomes</div>
              {breakdown.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>No calls logged yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {breakdown.map((b) => (
                    <div key={b.outcome} className="chart-tip" style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }} data-tip={`${b.outcome}: ${b.n} call${b.n === 1 ? "" : "s"}`}>
                      <span><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--color-accent)", marginRight: 6 }} />{b.outcome}</span>
                      <span>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Recent Calls</div>
              {calls.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>No recent calls for this business.</p>
              ) : (
                <table className="table">
                  <thead><tr><th>Time</th><th>Caller</th><th>Duration</th><th>Outcome</th></tr></thead>
                  <tbody>
                    {calls.slice(0, 20).map((c) => (
                      <tr key={c.id} onClick={() => drawer.open(c.id)} style={{ cursor: "pointer" }}>
                        <td className="text-muted">{formatRelativeTime(c.started_at)}</td>
                        <td>{c.caller_name || c.from_number || "Unknown Caller"}</td>
                        <td>{formatDuration(c.duration_secs ?? 0)}</td>
                        <td>{c.outcome && <span className={`tag ${outcomeTagClass(c.outcome)}`}>{c.outcome}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Activity Timeline</div>
              {activity.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>No activity logged yet.</p>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="timeline-row">
                    <div className="timeline-dot" />
                    <div><div style={{ fontSize: 13 }}>{a.text}</div><div className="text-muted" style={{ fontSize: 11 }}>{formatRelativeTime(a.created_at)}</div></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Business Information</div>
              <div className="kv-row"><span className="kv-label">Industry</span><span>{biz.industry || "—"}</span></div>
              <div className="kv-row"><span className="kv-label">Timezone</span><span>{biz.timezone || "—"}</span></div>
              <div className="kv-row"><span className="kv-label">Business Hours</span><span>{biz.businessHours || "—"}</span></div>
              <div className="kv-row"><span className="kv-label">Address</span><span>{biz.address || "—"}</span></div>
              <div className="kv-row"><span className="kv-label">Contact Email</span><span>{biz.contactEmail || "—"}</span></div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>AI Agent</div>
              <div className="kv-row"><span className="kv-label">Agent Name</span><span>{biz.agentName}</span></div>
              <div className="kv-row"><span className="kv-label">Recording</span><span>{biz.recordingEnabled ? "Enabled" : "Disabled"}</span></div>
              <div className="kv-row"><span className="kv-label">Documents Indexed</span><span>{biz.kbDocuments.length}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === "configuration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Business Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Business Name</label><input className="input" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Industry</label><input className="input" value={form.industry ?? ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
              <div className="field">
                <label>Timezone</label>
                <select className="input" value={form.timezone ?? ""} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                  <option value="">Select a timezone…</option>
                  {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>
              <div className="field"><label>Business Hours</label><input className="input" value={form.businessHours ?? ""} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} /></div>
              <div className="field" style={{ gridColumn: "span 2" }}><label>Address</label><input className="input" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="field">
                <label>Contact Email</label>
                <input type="email" className="input" value={form.contactEmail ?? ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div className="field">
                <label>Status</label>
                <select className="input" value={form.status ?? "active"} onChange={(e) => setForm({ ...form, status: e.target.value as BusinessStatus })}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>AI Configuration</div>
            <div className="field"><label>Agent Role</label><textarea className="input" rows={2} value={form.agentRole ?? ""} onChange={(e) => setForm({ ...form, agentRole: e.target.value })} placeholder="A friendly front-desk receptionist who books, reschedules, and cancels appointments." /></div>
            <div className="field" style={{ marginTop: 14 }}><label>Greeting (exact text)</label><input className="input" value={form.greeting ?? ""} onChange={(e) => setForm({ ...form, greeting: e.target.value })} /></div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Custom Instructions</label>
              <textarea className="input" rows={4} value={form.customInstructions ?? ""} onChange={(e) => setForm({ ...form, customInstructions: e.target.value })} />
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Voice &amp; Behavior</div>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 14 }}>
              One shared agent runs every business on this platform — these settings aren&rsquo;t per-business.
            </p>
            <div className="kv-row"><span className="kv-label">Voice</span><span>{GLOBAL_AGENT_CONFIG.voice}</span></div>
            <div className="kv-row"><span className="kv-label">Language</span><span>{GLOBAL_AGENT_CONFIG.language}</span></div>
            <div className="kv-row"><span className="kv-label">Speaking Style</span><span>{GLOBAL_AGENT_CONFIG.speakingStyle}</span></div>
            <div className="kv-row"><span className="kv-label">Speech Speed</span><span>{GLOBAL_AGENT_CONFIG.speechSpeed}</span></div>
            <div className="kv-row"><span className="kv-label">Interruptions</span><span>{GLOBAL_AGENT_CONFIG.allowInterruptions ? "Allowed" : "Not allowed"}</span></div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Call Transfer</div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Transfer Number</label>
              <input className="input" value={form.handoverNumber ?? ""} onChange={(e) => setForm({ ...form, handoverNumber: e.target.value })} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Transfer Conditions</label>
              <textarea className="input" rows={2} value={form.transferConditions ?? ""} onChange={(e) => setForm({ ...form, transferConditions: e.target.value })} placeholder="Billing questions, complaints, and anything the flow can't resolve." />
            </div>
            <div className="field">
              <label>Emergency Handling</label>
              <textarea className="input" rows={2} value={form.emergencyHandling ?? ""} onChange={(e) => setForm({ ...form, emergencyHandling: e.target.value })} placeholder="If the caller reports an emergency, transfer immediately and skip the queue." />
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Business Rules</div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={Boolean(form.recordingEnabled)} onChange={(e) => setForm({ ...form, recordingEnabled: e.target.checked })} />
              <span style={{ fontSize: 13 }}>Call recording {form.recordingEnabled ? "enabled" : "disabled"}</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={saveChanges}>{saving ? "Saving…" : "Save Changes"}</button>
            {saveMsg && <span className="text-muted" style={{ fontSize: 12 }}>{saveMsg}</span>}
          </div>
        </div>
      )}

      {tab === "knowledge" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="card-title">Knowledge Base — {biz.name}</div>
            <label className="btn btn-primary" style={{ cursor: "pointer" }}>
              Upload Document
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={uploadDoc} />
            </label>
          </div>
          {biz.kbDocuments.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No documents uploaded yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Filename</th><th>Chunks</th><th>Uploaded</th><th></th></tr></thead>
              <tbody>
                {biz.kbDocuments.map((d) => (
                  <tr key={d.filename}>
                    <td>{d.filename}</td><td>{d.chunks}</td><td className="text-muted">{formatRelativeTime(d.uploaded_at)}</td>
                    <td><button type="button" className="btn btn-ghost" onClick={() => deleteDoc(d.filename)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "calls" && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Calls — {biz.name}</div>
          {calls.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No calls logged yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Time</th><th>Caller</th><th>Duration</th><th>Outcome</th><th>Cost</th></tr></thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id} onClick={() => drawer.open(c.id)} style={{ cursor: "pointer" }}>
                    <td className="text-muted">{formatRelativeTime(c.started_at)}</td>
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
      )}

      {tab === "analytics" && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Call Volume — 30 Days</div>
          <div className="bar-chart" style={{ height: 120 }}>
            {trend.map((t, i) => (
              <div key={i} className="chart-tip" style={{ height: `${Math.max(4, (t.count / trendMax) * 100)}%` }} data-tip={`${t.date}: ${t.count} call${t.count === 1 ? "" : "s"}`} />
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Client Portal</div>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 14 }}>
              Sends {biz.name} a one-time invite link at its contact email so they can sign in
              and see their own calls, appointments, and team.
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={inviting || !biz.contactEmail}
                title={!biz.contactEmail ? "Add a contact email in the Configuration tab first" : undefined}
                onClick={sendInvite}
              >
                {inviting ? "Sending…" : biz.portalInvitedAt ? "Resend Invite" : "Send Portal Invite"}
              </button>
              {biz.portalInvitedAt && <span className="text-muted" style={{ fontSize: 12 }}>Invited {formatRelativeTime(biz.portalInvitedAt)}</span>}
              {inviteMsg && <span className="text-muted" style={{ fontSize: 12 }}>{inviteMsg}</span>}
            </div>
          </div>

          <div className="card" style={{ borderColor: "var(--color-accent-700)" }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Danger Zone</div>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 14 }}>
              Permanently deletes this business, its knowledge base documents, and its call history. This cannot be undone.
            </p>
            <button type="button" className="btn btn-secondary" style={{ borderColor: "var(--color-accent-700)", color: "var(--color-accent-700)" }} disabled={deleting} onClick={deleteBusiness}>
              {deleting ? "Deleting…" : "Delete Business"}
            </button>
          </div>
        </div>
      )}

      <CallDrawer openId={drawer.openId} onClose={drawer.close} />
    </div>
  );
}
