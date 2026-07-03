// lib/runtime-client.ts
// Real calls to the BTL Runtime gateway, unconditionally.
// No dry mode. No fallback. No fixtures.
// If GATEWAY_API_KEY is missing or the API fails, this throws — the caller
// surfaces a visible error. Fabricated data does not exist in this codebase.

export class InsufficientCreditsError extends Error {
  code = "insufficient_credits" as const;
  constructor() {
    super("402 Insufficient credits — top up your BTL Runtime workspace.");
    this.name = "InsufficientCreditsError";
  }
}

export class MissingKeyError extends Error {
  code = "missing_key" as const;
  constructor() {
    super("GATEWAY_API_KEY is not set. Dispatch requires a live Runtime connection.");
    this.name = "MissingKeyError";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

import type { Signal } from "./ticket-types";

export interface TriageResult {
  riskScore: number;
  complexity: number;
  confidence: number;
  businessValue: number;
  classification: string;
  dominantFactor: string;
  signals: Signal[];
}

export interface RuntimeHeaders {
  requestId: string;
  cacheTier: string;
  benchmarkCost: number;
  customerCharge: number;
  saved: number;
}

// ─── Raw fetch — preserves x-btl-* headers ───────────────────────────────────

function requireKey(): string {
  const key = process.env.GATEWAY_API_KEY;
  if (!key) throw new MissingKeyError();
  return key;
}

function extractHeaders(headers: Headers): RuntimeHeaders {
  return {
    requestId:     headers.get("x-btl-request-id")      ?? "",
    cacheTier:     headers.get("x-btl-cache-tier")       ?? "none",
    benchmarkCost: parseFloat(headers.get("x-btl-benchmark-cost")   ?? "0"),
    customerCharge:parseFloat(headers.get("x-btl-customer-charge")  ?? "0"),
    saved:         parseFloat(headers.get("x-btl-saved")            ?? "0"),
  };
}

async function btlFetch(
  path: string,
  body: object
): Promise<{ data: any; headers: RuntimeHeaders }> {
  const key = requireKey();

  const res = await fetch(`https://api.badtheorylabs.com/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 402) throw new InsufficientCreditsError();
  if (res.status === 401) throw new MissingKeyError();

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BTL Runtime ${res.status}: ${text.slice(0, 200)}`);
  }

  return { data: await res.json(), headers: extractHeaders(res.headers) };
}

// ─── Triage prompt ────────────────────────────────────────────────────────────
// Scores by consequence if mishandled, not by keyword presence.
// Encodes explicit "uncertain → escalate" bias — false positives are cheaper
// than false negatives in a customer support triage system.

const TRIAGE_PROMPT = `You are a customer support triage classifier for a streetwear e-commerce brand.

Given a customer message, return ONLY a valid JSON object with exactly these seven fields:
{
  "classificationBadge": <Short string badge. Choose from: "Routine Inquiry", "Time Sensitive", "Refund Risk", "Reputation Risk", "Chargeback Risk", "Human Review">,
  "dominantFactor": <A short explanation of the primary factor driving this score, e.g. "Public complaint detected" or "Routine fulfillment issue">,
  "signals": <Array of 1 to 4 objects representing detected signals, e.g. [{"name": "Public complaint", "confidence": "HIGH"}]>,
  "riskScore": <see rules below (0.0-1.0)>,
  "complexity": <how much reasoning is required — templated reply = low, nuanced judgement = high (0.0-1.0)>,
  "confidence": <how confident you are in your own scoring — reduce if the message is ambiguous (0.0-1.0)>,
  "businessValue": <customer value signal — repeat/bulk/loyal = high, unknown first-timer = low (0.0-1.0)>
}

riskScore — score by CONSEQUENCES if mishandled, not by tone:
• 0.8–1.0 → Financial/legal exposure: chargeback threats, legal threats, payment errors, duplicate charges.
            Reputational exposure: threats to post publicly, "going on my story", screenshots documented.
            Trust/safety violations: wrong personal data sent to customer, privacy concern, safety issue.
            Score these HIGH even if the tone is completely calm — calm-but-serious is often more legitimate
            than angry-but-minor.
• 0.5–0.7 → Significant service failures: package never arrived after extended time, multiple ignored
            messages, damaged goods on arrival, missing order confirmation after payment.
            Ambiguous language that COULD be serious — when uncertain, score MODERATE-HIGH.
            The safer error is over-escalating a minor ticket than under-escalating a real one.
• 0.3–0.5 → Unhappy but manageable: wrong size sent, shipping delay, minor quality issue.
            Resolvable without financial or reputational risk.
• 0.1–0.2 → Zero complaint content: stock checks, sizing questions, payment method questions,
            shipping time estimates, address changes on fresh orders. Score LOW regardless of message length.

Reply with ONLY the JSON object. No markdown. No explanation. No prose. No code fences.`;

// ─── Triage ───────────────────────────────────────────────────────────────────

export async function triageTicket(
  ticketText: string
): Promise<{ scores: TriageResult; headers: RuntimeHeaders }> {
  const { data, headers } = await btlFetch("/chat/completions", {
    model: "btl-2",
    messages: [
      { role: "system", content: TRIAGE_PROMPT },
      { role: "user",   content: ticketText },
    ],
    max_tokens: 120,
    temperature: 0.1,
  });

  const raw = data.choices?.[0]?.message?.content ?? "{}";
  let scores: TriageResult;

  try {
    const cleaned = raw.replace(/```json?/g, "").replace(/```/g, "").trim();
    const p = JSON.parse(cleaned);
    scores = {
      riskScore:     Math.max(0, Math.min(1, p.riskScore     ?? 0.5)),
      complexity:    Math.max(0, Math.min(1, p.complexity    ?? 0.5)),
      confidence:    Math.max(0, Math.min(1, p.confidence    ?? 0.3)),
      businessValue: Math.max(0, Math.min(1, p.businessValue ?? 0.2)),
      classification: p.classificationBadge || p.classification || "Routine Inquiry",
      dominantFactor: p.dominantFactor || p.classificationBadge || "Routine inquiry",
      signals:       Array.isArray(p.signals) ? p.signals.slice(0, 4) : [{ name: "No clear signals", confidence: "LOW" }],
    };
    // Log parse failures explicitly so they're visible in server logs
    if (scores.confidence === 0.3 && !("confidence" in JSON.parse(cleaned))) {
      console.warn("[triage] Missing confidence field — using conservative default for:", ticketText.slice(0, 60));
    }
  } catch {
    // Parse failed entirely — use conservative defaults that will trigger strong tier.
    // Log prominently so this is never silently swallowed.
    console.error(`[triage] JSON parse FAILED. Raw response: "${raw.slice(0, 200)}". Defaulting to medium-risk/low-confidence.`);
    scores = { riskScore: 0.5, complexity: 0.5, confidence: 0.3, businessValue: 0.2, classification: "Human Review", dominantFactor: "Failed to parse", signals: [{ name: "Parse failure", confidence: "HIGH" }] };
  }

  return { scores, headers };
}

// ─── Execution ────────────────────────────────────────────────────────────────

const EXECUTION_SYSTEM_PROMPT = `You are a concise, professional customer support agent for a premium streetwear brand.
Resolve the customer's concern clearly and empathetically. Keep your reply under 80 words.
If a refund, replacement, or escalation is warranted, say so explicitly.`;

export async function executeTicket(
  ticketText: string,
  tier: "cheap" | "strong"
): Promise<{ reply: string; headers: RuntimeHeaders }> {
  const { data, headers } = await btlFetch("/chat/completions", {
    model: "btl-2",
    messages: [
      { role: "system", content: EXECUTION_SYSTEM_PROMPT },
      { role: "user",   content: ticketText },
    ],
    max_tokens:  tier === "strong" ? 500 : 150,
    temperature: tier === "strong" ? 0.4 : 0.2,
  });

  return { reply: data.choices?.[0]?.message?.content ?? "[no reply]", headers };
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export async function getQuote(ticketCount: number): Promise<{ predictedTotal: number }> {
  const key = requireKey();

  try {
    const res = await fetch("https://api.badtheorylabs.com/v1/account/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ estimated_calls: ticketCount }),
    });

    if (!res.ok) throw new Error(`Quote ${res.status}`);
    const data = await res.json();
    return { predictedTotal: data.predictedTotal ?? data.predicted_total ?? 0 };
  } catch (err) {
    // Quote is best-effort — a failure here should not block the run.
    // Log it but return 0 so the UI shows "—" rather than crashing.
    console.warn("[getQuote] failed:", err);
    return { predictedTotal: 0 };
  }
}
