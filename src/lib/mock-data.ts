// Phase 1 static data — shape matches ../../platform/supabase.sql (businesses, calls,
// kb_chunks) plus this build's planned additions (industry/timezone/business_hours,
// activity_log). Replaced field-by-field with real n8n webhook calls in Phase 3 — see
// ../../CLAUDE.md's build order. Nothing here should invent a field the real schema
// doesn't have.

export type BusinessStatus = "active" | "disabled";
export type CallOutcome = "Booked" | "Transferred" | "Voicemail" | "Completed" | "Missed";

export interface Business {
  id: string;
  name: string;
  industry: string;
  status: BusinessStatus;
  phone: string;
  timezone: string;
  businessHours: string;
  address: string;
  agentName: string;
  businessDescription: string;
  customInstructions: string;
  greeting: string;
  handoverNumber: string;
  recordingEnabled: boolean;
  callsToday: number;
  callsMonth: number;
  lastActivity: string;
}

export interface KbDocument {
  businessId: string;
  filename: string;
  chunks: number;
  uploadedAt: string;
}

export interface Call {
  id: string;
  businessId: string;
  time: string;
  caller: string;
  callerName: string;
  durationSecs: number;
  outcome: CallOutcome;
  cost: string;
  summary: string;
}

export interface ActivityEntry {
  businessId: string | null;
  text: string;
  time: string;
}

// The shared, single Retell agent's voice/speech settings — same for every business (see
// the re-architecture note in ../../CLAUDE.md: one reusable agent, not per-tenant voice
// customization). Configuration tab shows this read-only. Agent role, transfer conditions,
// and emergency handling used to live here too but are now real per-business columns
// (agent_role/transfer_conditions/emergency_handling — see supabase/004_agent_parameters.sql)
// so they can actually be passed to the agent at call time.
export const GLOBAL_AGENT_CONFIG = {
  voice: "Aria — Warm, Female",
  language: "English (US)",
  speakingStyle: "Professional",
  speechSpeed: "1.0x",
  allowInterruptions: true,
};

export const BUSINESSES: Business[] = [
  {
    id: "biz-1", name: "Bright Smile Dental", industry: "Dental Clinic", status: "active",
    phone: "15552014471", timezone: "America/New_York", businessHours: "Mon–Fri, 8:00 AM – 6:00 PM",
    address: "128 Orchard Ave, Suite 4, Springfield", agentName: "Aria",
    businessDescription: "A family dental practice offering cleanings, fillings, and cosmetic dentistry.",
    customInstructions: "Always confirm the caller's full name, phone number, and reason for calling before offering to book an appointment. If the caller mentions pain or swelling, prioritize same-day scheduling.",
    greeting: "Thanks for calling Bright Smile Dental, this is Aria — how can I help you today?",
    handoverNumber: "(555) 201-4471", recordingEnabled: true,
    callsToday: 14, callsMonth: 412, lastActivity: "12 min ago",
  },
  {
    id: "biz-2", name: "Riverside Family Dentistry", industry: "Dental Clinic", status: "active",
    phone: "15553842210", timezone: "America/Chicago", businessHours: "Mon–Fri, 7:30 AM – 5:00 PM",
    address: "44 Riverside Dr, Unit 2, Millbrook", agentName: "Aria",
    businessDescription: "General dentistry practice serving families in Millbrook for over 20 years.",
    customInstructions: "Offer the earliest available slot first. Ask if this is the caller's first visit.",
    greeting: "Thanks for calling Riverside Family Dentistry, this is Aria — how can I help you today?",
    handoverNumber: "(555) 384-2210", recordingEnabled: false,
    callsToday: 9, callsMonth: 298, lastActivity: "34 min ago",
  },
  {
    id: "biz-3", name: "Maple Street Orthodontics", industry: "Orthodontics", status: "disabled",
    phone: "15551189042", timezone: "America/Denver", businessHours: "Mon–Thu, 9:00 AM – 5:00 PM",
    address: "802 Maple St, Denver", agentName: "Aria",
    businessDescription: "Orthodontic care for teens and adults — braces, Invisalign, retainers.",
    customInstructions: "New patients get a free consultation. Mention this when booking a first visit.",
    greeting: "Thanks for calling Maple Street Orthodontics, this is Aria — how can I help you today?",
    handoverNumber: "(555) 118-9042", recordingEnabled: false,
    callsToday: 3, callsMonth: 61, lastActivity: "2 hr ago",
  },
  {
    id: "biz-4", name: "Downtown Dental Studio", industry: "Dental Clinic", status: "active",
    phone: "15556603391", timezone: "America/Los_Angeles", businessHours: "Mon–Sat, 8:00 AM – 7:00 PM",
    address: "19 Market St, Suite 100, Downtown", agentName: "Aria",
    businessDescription: "Modern dental studio focused on cosmetic and general dentistry.",
    customInstructions: "Weekend appointments are popular — offer Saturday slots proactively.",
    greeting: "Thanks for calling Downtown Dental Studio, this is Aria — how can I help you today?",
    handoverNumber: "(555) 660-3391", recordingEnabled: true,
    callsToday: 21, callsMonth: 588, lastActivity: "5 min ago",
  },
  {
    id: "biz-5", name: "Sunrise Pediatric Dentistry", industry: "Pediatric Dentistry", status: "active",
    phone: "15559027715", timezone: "America/New_York", businessHours: "Mon–Fri, 9:00 AM – 5:00 PM",
    address: "6 Sunrise Blvd, East Harbor", agentName: "Aria",
    businessDescription: "Pediatric dental care in a kid-friendly office.",
    customInstructions: "Ask for the child's age. If under 3, mention this is a first-visit-friendly practice.",
    greeting: "Thanks for calling Sunrise Pediatric Dentistry, this is Aria — how can I help you today?",
    handoverNumber: "(555) 902-7715", recordingEnabled: false,
    callsToday: 7, callsMonth: 214, lastActivity: "1 hr ago",
  },
  {
    id: "biz-6", name: "Lakeview Dental Group", industry: "Dental Clinic", status: "disabled",
    phone: "15554472098", timezone: "America/Chicago", businessHours: "Mon–Fri, 8:00 AM – 5:00 PM",
    address: "301 Lakeview Rd, Chicago", agentName: "Aria",
    businessDescription: "General dental group practice.",
    customInstructions: "",
    greeting: "Thanks for calling Lakeview Dental Group, this is Aria — how can I help you today?",
    handoverNumber: "(555) 447-2098", recordingEnabled: false,
    callsToday: 0, callsMonth: 18, lastActivity: "6 days ago",
  },
  {
    id: "biz-7", name: "Harbor View Dental Care", industry: "Dental Clinic", status: "active",
    phone: "15552736650", timezone: "America/New_York", businessHours: "Mon–Fri, 8:00 AM – 6:00 PM",
    address: "77 Harbor View Ln, Portsmouth", agentName: "Aria",
    businessDescription: "Full-service dental care with a harbor-view office.",
    customInstructions: "Mention free parking when giving directions.",
    greeting: "Thanks for calling Harbor View Dental Care, this is Aria — how can I help you today?",
    handoverNumber: "(555) 273-6650", recordingEnabled: true,
    callsToday: 11, callsMonth: 349, lastActivity: "48 min ago",
  },
  {
    id: "biz-8", name: "Evergreen Family Dental", industry: "Dental Clinic", status: "disabled",
    phone: "15558103324", timezone: "America/Denver", businessHours: "Mon–Fri, 8:30 AM – 5:30 PM",
    address: "12 Evergreen Ct, Boulder", agentName: "Aria",
    businessDescription: "Family dental practice new to the platform.",
    customInstructions: "",
    greeting: "Thanks for calling Evergreen Family Dental, this is Aria — how can I help you today?",
    handoverNumber: "(555) 810-3324", recordingEnabled: false,
    callsToday: 2, callsMonth: 44, lastActivity: "3 hr ago",
  },
];

export const KB_DOCUMENTS: KbDocument[] = [
  { businessId: "biz-1", filename: "Doctor Schedules.pdf", chunks: 18, uploadedAt: "2026-07-10" },
  { businessId: "biz-1", filename: "Services & Pricing.pdf", chunks: 24, uploadedAt: "2026-07-10" },
  { businessId: "biz-1", filename: "Insurance Accepted.pdf", chunks: 12, uploadedAt: "2026-07-10" },
  { businessId: "biz-4", filename: "Clinic Policies.pdf", chunks: 9, uploadedAt: "2026-07-15" },
  { businessId: "biz-4", filename: "Services & Pricing.pdf", chunks: 21, uploadedAt: "2026-07-15" },
];

export const CALLS: Call[] = [
  { id: "c-1", businessId: "biz-1", time: "9:41 AM", caller: "(555) 902-1187", callerName: "Dana Ruiz", durationSecs: 252, outcome: "Booked", cost: "$0.62", summary: "Caller requested a routine cleaning appointment. AI confirmed availability, collected contact details, and confirmed a booked appointment." },
  { id: "c-2", businessId: "biz-4", time: "9:23 AM", caller: "(555) 447-2065", callerName: "Marcus Lee", durationSecs: 125, outcome: "Transferred", cost: "$0.31", summary: "Caller had a billing question. AI transferred the caller to the front desk." },
  { id: "c-3", businessId: "biz-2", time: "9:10 AM", caller: "(555) 118-9522", callerName: "Priya Nair", durationSecs: 108, outcome: "Voicemail", cost: "$0.19", summary: "No answer at the front desk. AI left a voicemail for the caller." },
  { id: "c-4", businessId: "biz-7", time: "8:58 AM", caller: "(555) 660-4471", callerName: "Sam O'Neal", durationSecs: 333, outcome: "Booked", cost: "$0.81", summary: "Caller booked a same-day appointment for tooth pain. AI prioritized scheduling per custom instructions." },
  { id: "c-5", businessId: "biz-1", time: "8:47 AM", caller: "(555) 384-9021", callerName: "Unknown Caller", durationSecs: 42, outcome: "Missed", cost: "$0.06", summary: "The call went unanswered." },
  { id: "c-6", businessId: "biz-4", time: "8:31 AM", caller: "(555) 273-1187", callerName: "Jamie Cho", durationSecs: 201, outcome: "Booked", cost: "$0.54", summary: "Caller requested a Saturday cleaning slot. AI confirmed a booked appointment." },
  { id: "c-7", businessId: "biz-4", time: "8:19 AM", caller: "(555) 902-6650", callerName: "Alex Turner", durationSecs: 177, outcome: "Completed", cost: "$0.44", summary: "Caller asked about accepted insurance. AI answered from the knowledge base without further action." },
  { id: "c-8", businessId: "biz-1", time: "8:02 AM", caller: "(555) 810-2098", callerName: "Robin Patel", durationSecs: 72, outcome: "Voicemail", cost: "$0.15", summary: "No answer at the front desk. AI left a voicemail for the caller." },
  { id: "c-9", businessId: "biz-2", time: "7:48 AM", caller: "(555) 201-7715", callerName: "Chris Bell", durationSecs: 362, outcome: "Transferred", cost: "$0.92", summary: "Caller had a complaint about a prior visit. AI transferred the caller to the front desk." },
  { id: "c-10", businessId: "biz-1", time: "7:30 AM", caller: "(555) 118-3391", callerName: "Taylor Wong", durationSecs: 224, outcome: "Booked", cost: "$0.58", summary: "Caller requested a routine cleaning appointment. AI confirmed a booked appointment." },
  { id: "c-11", businessId: "biz-7", time: "7:12 AM", caller: "(555) 774-2201", callerName: "Morgan Diaz", durationSecs: 140, outcome: "Booked", cost: "$0.39", summary: "Caller booked a follow-up visit. AI confirmed a booked appointment." },
];

export const ACTIVITY: ActivityEntry[] = [
  { businessId: "biz-1", text: "Bright Smile Dental booked an appointment via AI", time: "12 min ago" },
  { businessId: "biz-4", text: "Downtown Dental Studio call transferred to front desk", time: "23 min ago" },
  { businessId: "biz-8", text: "Evergreen Family Dental connected to the platform", time: "1 hr ago" },
  { businessId: "biz-7", text: "Harbor View Dental Care updated custom instructions", time: "2 hr ago" },
  { businessId: "biz-6", text: "Lakeview Dental Group disabled", time: "6 days ago" },
];

export const TREND: number[] = [38, 52, 44, 60, 55, 70, 64, 58, 72, 66, 80, 74, 68, 82, 77, 90, 85, 79, 94, 88, 83, 96, 91, 86, 99, 93, 88, 97, 92, 89];

export const OUTCOME_TAG_CLASS: Record<CallOutcome, string> = {
  Booked: "tag-accent", Transferred: "tag-outline", Voicemail: "tag-neutral", Completed: "tag-neutral", Missed: "tag-neutral",
};
export const STATUS_TAG_CLASS: Record<BusinessStatus, string> = {
  active: "tag-accent", disabled: "tag-neutral",
};
export const STATUS_LABEL: Record<BusinessStatus, string> = {
  active: "Active", disabled: "Disabled",
};

export function businessById(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}
export function callsForBusiness(businessId: string): Call[] {
  return CALLS.filter((c) => c.businessId === businessId);
}
export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern — America/New_York" },
  { value: "America/Chicago", label: "Central — America/Chicago" },
  { value: "America/Denver", label: "Mountain — America/Denver" },
  { value: "America/Phoenix", label: "Mountain, no DST — America/Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific — America/Los_Angeles" },
  { value: "America/Anchorage", label: "Alaska — America/Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii — Pacific/Honolulu" },
];

// Retell's call_outcome custom field is operator-configured free text (not a fixed
// enum on our side) — fall back to a neutral tag for any value we haven't seen.
const KNOWN_OUTCOME_TAG_CLASS: Record<string, string> = {
  Booked: "tag-accent", Transferred: "tag-outline", Voicemail: "tag-neutral",
  "Information Only": "tag-neutral", Missed: "tag-neutral", Other: "tag-neutral",
};
export function outcomeTagClass(outcome: string | null): string {
  return (outcome && KNOWN_OUTCOME_TAG_CLASS[outcome]) || "tag-neutral";
}

export function formatCost(cost: string | number | null): string {
  if (cost == null) return "—";
  const n = typeof cost === "string" ? parseFloat(cost) : cost;
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
export function outcomeBreakdown(calls: Call[]): { outcome: CallOutcome; pct: number }[] {
  if (calls.length === 0) return [];
  const counts: Record<string, number> = {};
  for (const c of calls) counts[c.outcome] = (counts[c.outcome] ?? 0) + 1;
  return Object.entries(counts).map(([outcome, n]) => ({
    outcome: outcome as CallOutcome,
    pct: Math.round((n / calls.length) * 100),
  }));
}

// Client-side zero-filled daily bucketing, mirroring the dashboard-stats n8n webhook's
// `generate_series` trend query — used for the per-business charts, which don't have their
// own aggregate webhook (the business's own call list is small enough to bucket in the browser).
export function dailyCallTrend(calls: { started_at: string | null }[], days = 30): { date: string; count: number }[] {
  const buckets: Record<string, number> = {};
  // Bucket in UTC throughout — started_at is a UTC timestamp from Postgres, and mixing in
  // local-time Date methods here would shift "today" by the browser's UTC offset.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const c of calls) {
    if (!c.started_at) continue;
    const key = c.started_at.slice(0, 10);
    if (key in buckets) buckets[key] += 1;
  }
  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}
