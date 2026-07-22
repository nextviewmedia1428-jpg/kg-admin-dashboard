"use client";

import { useEffect, useState } from "react";
import { outcomeTagClass, formatCost, formatDuration, formatRelativeTime } from "@/lib/mock-data";

interface TranscriptTurn { role: string; content: string }
interface CallDetail {
  id: string;
  business_name: string | null;
  caller_name: string | null;
  from_number: string | null;
  started_at: string | null;
  duration_secs: number | null;
  outcome: string | null;
  call_cost: string | null;
  summary: string | null;
  reason: string | null;
  transcript: TranscriptTurn[] | null;
  has_recording: boolean;
}

export function useCallDrawer() {
  const [openId, setOpenId] = useState<string | null>(null);
  return { openId, open: setOpenId, close: () => setOpenId(null) };
}

export default function CallDrawer({ openId, onClose }: { openId: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!openId) { setDetail(null); return; }
    setLoading(true);
    fetch(`/api/calls/${openId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? "Failed to load call");
        setDetail(data);
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [openId]);

  return (
    <>
      <div className={`drawer-backdrop${openId ? " open" : ""}`} onClick={onClose} />
      <aside className={`drawer${openId ? " open" : ""}`}>
        {loading && <p className="text-muted">Loading…</p>}
        {!loading && detail && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="card-title">{detail.business_name || "Unknown business"}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {detail.caller_name || detail.from_number || "Unknown Caller"} &middot; {formatRelativeTime(detail.started_at)}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", padding: 10 }}>
                <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{formatDuration(detail.duration_secs ?? 0)}</div>
              </div>
              <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", padding: 10 }}>
                <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cost</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{formatCost(detail.call_cost)}</div>
              </div>
              <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", padding: 10 }}>
                <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Outcome</div>
                {detail.outcome ? <span className={`tag ${outcomeTagClass(detail.outcome)}`}>{detail.outcome}</span> : <span className="text-muted">—</span>}
              </div>
            </div>

            {detail.reason && (
              <>
                <div className="card-kicker" style={{ marginBottom: 6 }}>Reason for Call</div>
                <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 20px" }}>{detail.reason}</p>
              </>
            )}

            <div className="card-kicker" style={{ marginBottom: 6 }}>Summary</div>
            <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 20px" }}>{detail.summary || "No summary available."}</p>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="card-kicker">Recording</div>
              {detail.has_recording && (
                <a className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} href={`/api/calls/${detail.id}/recording`} download={`call-${detail.id}.wav`}>
                  Download
                </a>
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              {detail.has_recording ? (
                <audio controls style={{ width: "100%" }} src={`/api/calls/${detail.id}/recording`} />
              ) : (
                <p className="text-muted" style={{ fontSize: 13 }}>No recording for this call.</p>
              )}
            </div>

            <div className="card-kicker" style={{ marginBottom: 8 }}>Transcript</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20, fontSize: 13 }}>
              {detail.transcript && detail.transcript.length > 0 ? (
                detail.transcript.map((t, i) => (
                  <div key={i}>
                    <span style={{ fontWeight: 700, color: t.role === "agent" ? "var(--color-accent-700)" : "inherit" }}>
                      {t.role === "agent" ? "AI:" : "Caller:"}
                    </span> {t.content}
                  </div>
                ))
              ) : (
                <p className="text-muted">No transcript available.</p>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
