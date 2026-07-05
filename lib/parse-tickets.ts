// lib/parse-tickets.ts
// Runtime call #0: splits raw pasted text into structured tickets.
// Real API call, unconditionally. No dry mode. No fallback fabrication.
// If this call fails, the error surfaces in the UI — the run does not proceed.

import type { Ticket } from "./ticket-types";

export type { Ticket };

export interface ParseResult {
  tickets: Ticket[];
  headers: {
    requestId: string;
    cacheTier: string;
    benchmarkCost: number;
    customerCharge: number;
    saved: number;
  };
}

const PARSE_PROMPT = `You are a message-parsing utility for a customer support system.

Split the raw input text into individual, distinct customer support messages. The input
might be a WhatsApp export, copy-pasted DM thread, email thread, multiple messages run
together, or a jumbled mix with timestamps — handle any formatting you encounter.

For each distinct customer message, produce one entry in a JSON array with EXACTLY these fields:
{
  "id": "T001",
  "channel": "dm" | "email" | "public_comment",
  "customerType": "first_time" | "repeat" | "unknown",
  "text": "<cleaned message text>"
}

Rules:
• id: sequential T001, T002, T003... in the order found
• channel: infer from context — WhatsApp/Instagram/DM phrasing → "dm"; email salutation/format → "email";
  "@brand" mentions, public review language → "public_comment"; default to "dm" if genuinely unclear
• customerType: "repeat" ONLY if text explicitly signals prior orders ("again", "my usual", "last time", "loyal").
  "first_time" if it's clearly a first contact. Otherwise "unknown".
• text: the cleaned customer message. Remove timestamps, usernames, "read" receipts,
  WhatsApp system messages ("end-to-end encrypted", "Messages and calls are..."). Keep customer's actual words.
• Do NOT split one coherent message into multiple entries.
• Do NOT merge separate, distinct concerns into one entry.
• Skip any purely system messages or metadata with no customer content.
• Maximum 30 entries — if input is longer, parse the first 30 distinct messages only.

Return ONLY a valid JSON array. Start with [ and end with ]. No markdown. No code fences. No prose.`;

function extractHeaders(headers: Headers) {
  const benchmarkCost = parseFloat(headers.get("x-btl-benchmark-cost") ?? "0");
  const customerCharge = parseFloat(headers.get("x-btl-customer-charge") ?? "0");

  return {
    requestId:     headers.get("x-btl-request-id")      ?? "",
    cacheTier:     headers.get("x-btl-cache-tier")       ?? "none",
    benchmarkCost,
    customerCharge,
    saved:         benchmarkCost - customerCharge,
  };
}

async function callParse(text: string, forceJson = false): Promise<{ raw: string; headers: ParseResult["headers"] }> {
  const key = process.env.GATEWAY_API_KEY;
  if (!key) throw new Error("GATEWAY_API_KEY is not set — Dispatch requires a live Runtime connection.");

  const systemContent = PARSE_PROMPT + (forceJson ? "\n\nCRITICAL: Your entire response must be a valid JSON array starting with [ — no other characters before or after." : "");

  const res = await fetch("https://api.badtheorylabs.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "btl-2",
      messages: [
        { role: "system", content: systemContent },
        { role: "user",   content: text },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  });

  if (res.status === 401) throw new Error("Invalid GATEWAY_API_KEY — check your credentials.");
  if (res.status === 402) throw new Error("Insufficient credits in your BTL Runtime workspace.");
  if (!res.ok)            throw new Error(`Parse call failed: ${res.status} ${await res.text().catch(() => "")}`);

  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content ?? "";
  const headers = extractHeaders(res.headers);

  if (!headers.requestId && data.id) {
    if (data.id.startsWith("chatcmpl_")) {
      headers.requestId = "req_" + data.id.slice(9, 17);
    } else {
      headers.requestId = data.id;
    }
  }

  return { raw, headers };
}

function parseTicketArray(raw: string): Ticket[] {
  const cleaned = raw.replace(/```json?/g, "").replace(/```/g, "").trim();
  const arr = JSON.parse(cleaned);
  if (!Array.isArray(arr)) throw new Error("Response is not a JSON array");

  return arr
    .slice(0, 30)
    .map((t: { id?: string; channel?: string; customerType?: string; text?: string }, i: number): Ticket => ({
      id:           t.id || `T${String(i + 1).padStart(3, "0")}`,
      channel:      (t.channel === "dm" || t.channel === "email" || t.channel === "public_comment") ? t.channel : "dm",
      customerType: (t.customerType === "first_time" || t.customerType === "repeat" || t.customerType === "unknown") ? t.customerType : "unknown",
      text:         String(t.text ?? "").trim(),
    }))
    .filter((t: Ticket) => t.text.length > 0);
}

export async function parseRawMessages(rawText: string): Promise<ParseResult> {
  // Attempt 1
  const { raw: raw1, headers } = await callParse(rawText);
  try {
    const tickets = parseTicketArray(raw1);
    return { tickets, headers };
  } catch (e1) {
    console.warn(`[parse] Attempt 1 failed (${e1}). Raw: "${raw1.slice(0, 100)}". Retrying with explicit JSON instruction.`);
  }

  // Attempt 2 — explicit JSON forcing
  const { raw: raw2, headers: headers2 } = await callParse(rawText, true);
  try {
    const tickets = parseTicketArray(raw2);
    return { tickets, headers: headers2 };
  } catch {
    throw new Error(
      `Could not parse your input into structured messages after two attempts. ` +
      `Last model response: "${raw2.slice(0, 200)}". Try separating messages with blank lines.`
    );
  }
}
