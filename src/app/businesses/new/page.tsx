"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TIMEZONES, BusinessStatus } from "@/lib/mock-data";

export default function NewBusinessPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<BusinessStatus>("active");
  const [contactEmail, setContactEmail] = useState("");

  const [agentName, setAgentName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [greeting, setGreeting] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [transferConditions, setTransferConditions] = useState("");
  const [emergencyHandling, setEmergencyHandling] = useState("");
  const [handoverNumber, setHandoverNumber] = useState("");
  const [calendarId, setCalendarId] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("industry", industry);
    formData.set("phone", phone);
    formData.set("timezone", timezone);
    formData.set("business_hours", businessHours);
    formData.set("address", address);
    formData.set("status", status);
    formData.set("contact_email", contactEmail);
    formData.set("agent_name", agentName);
    formData.set("business_description", businessDescription);
    formData.set("custom_instructions", customInstructions);
    formData.set("greeting", greeting);
    formData.set("agent_role", agentRole);
    formData.set("transfer_conditions", transferConditions);
    formData.set("emergency_handling", emergencyHandling);
    formData.set("handover_number", handoverNumber);
    formData.set("calendar_id", calendarId);
    formData.set("recording_enabled", String(recordingEnabled));
    files.forEach((f, i) => formData.append(`file_${i}`, f));

    const res = await fetch("/api/businesses/onboard", { method: "POST", body: formData });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/businesses");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href="/businesses" className="text-muted" style={{ fontSize: 13, textDecoration: "none" }}>← Back to Businesses</Link>
      <h1 style={{ margin: "8px 0 4px" }}>Add Business</h1>
      <p className="text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>Onboard a new business onto the AI receptionist platform</p>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Business Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field"><label>Business Name</label><input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bright Smile Dental" /></div>
            <div className="field"><label>Industry</label><input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Dental Clinic" /></div>
            <div className="field">
              <label>Phone Number</label>
              <input required type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+14155551234" />
            </div>
            <div className="field">
              <label>Timezone</label>
              <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="">Select a timezone…</option>
                {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
            <div className="field"><label>Business Hours</label><input className="input" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="Mon–Fri, 8:00 AM – 6:00 PM" /></div>
            <div className="field" style={{ gridColumn: "span 2" }}><label>Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="128 Orchard Ave, Suite 4, Springfield" /></div>
            <div className="field">
              <label>Contact Email</label>
              <input type="email" className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="owner@brightsmile.com" />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as BusinessStatus)}>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 10 }}>
            The number the agent answers on — used as the knowledge base key. Enter it exactly as it will be dialed, including the country code (e.g. +14155551234) — it is sent as-is, with no reformatting.
            Contact Email is where the client&apos;s portal invite link gets sent from the business&apos;s Settings tab once onboarding is complete.
          </p>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>AI Configuration</div>
          <div className="field"><label>Agent Name</label><input required className="input" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Aria" /></div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Business Description</label>
            <textarea required className="input" rows={3} value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="A family dental practice offering cleanings, fillings, and cosmetic dentistry." />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Agent Role (optional)</label>
            <textarea className="input" rows={2} value={agentRole} onChange={(e) => setAgentRole(e.target.value)} placeholder="A friendly front-desk receptionist who books, reschedules, and cancels appointments." />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Custom Instructions (optional)</label>
            <textarea className="input" rows={3} value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} placeholder="Always confirm the caller's full name and reason for calling before booking." />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Greeting (optional)</label>
            <input className="input" value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder={`Thanks for calling ${name || "[Business Name]"}, this is ${agentName || "[Agent Name]"} — how can I help you today?`} />
            <span className="text-muted" style={{ fontSize: 12 }}>Leave blank to use the default shown above.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Call Handling</div>
          <div className="field"><label>Handover Number (optional)</label><input type="tel" className="input" value={handoverNumber} onChange={(e) => setHandoverNumber(e.target.value)} placeholder="(415) 555-9876" /></div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Transfer Conditions (optional)</label>
            <textarea className="input" rows={2} value={transferConditions} onChange={(e) => setTransferConditions(e.target.value)} placeholder="Billing questions, complaints, and anything the flow can't resolve." />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Emergency Handling (optional)</label>
            <textarea className="input" rows={2} value={emergencyHandling} onChange={(e) => setEmergencyHandling(e.target.value)} placeholder="If the caller reports an emergency, transfer immediately and skip the queue." />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Google Calendar ID (optional)</label>
            <input className="input" value={calendarId} onChange={(e) => setCalendarId(e.target.value)} placeholder="clinic@group.calendar.google.com" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <input type="checkbox" checked={recordingEnabled} onChange={(e) => setRecordingEnabled(e.target.checked)} />
            <span style={{ fontSize: 14 }}>Save call recordings</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Knowledge Base</div>
          <div className="field">
            <label>Documents (PDF only)</label>
            <input type="file" multiple accept=".pdf" className="input" onChange={onFilesChosen} />
          </div>
          {files.length > 0 && (
            <ul style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, listStyle: "none", padding: 0 }}>
              {files.map((f, i) => (
                <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span className="text-muted">{f.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-muted" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-accent-700)", fontSize: 12 }}>remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p style={{ color: "var(--color-accent-700)", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Onboarding…" : "Onboard Business"}
          </button>
          <Link href="/businesses" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
