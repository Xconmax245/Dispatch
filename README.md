<div align="center">

# ⚡ DISPATCH

### Cost-Aware AI Routing · Intelligence Allocation · Real Cost Evidence

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-dispatch--btl.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://dispatch-btl.vercel.app)
[![Built on BTL Runtime](https://img.shields.io/badge/Powered%20by-BTL%20Runtime-blueviolet?style=for-the-badge)](https://api.badtheorylabs.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Telegram Bot](https://img.shields.io/badge/Telegram%20Bot-@dispatch__demobot-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/dispatch_demobot)

---

**Most AI systems treat every message the same. Dispatch doesn't.**

*It decides how much intelligence each message actually deserves — and proves the cost difference, live, with real gateway headers, per call.*

</div>

---

## The Problem Dispatch Solves

When you route every customer support message through your most capable model, you're paying GPT-4-level costs on questions like *"what are your shipping times?"* — questions a $0.002/1M-token model answers identically. At scale, that's not a rounding error, it's a structural waste.

The obvious fix — "just use a cheaper model for easy messages" — breaks down fast. How do you know which messages are easy? What if the customer who asked about shipping times yesterday is today threatening a chargeback? What if three quiet messages in a row just became a legal threat?

**Dispatch answers that question systematically**, with a multi-variable scoring engine that evaluates Risk, Complexity, Confidence, and Business Value in a single lightweight triage call — then routes to Economy, Precision, or Human Review accordingly. Every decision is stamped with the actual dollar cost extracted from live BTL Runtime response headers. Nothing is estimated. Nothing is simulated.

---

## Live Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      INCOMING MESSAGE                           │
│  ("my order hasn't arrived and I'm going to file a chargeback") │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SESSION CONTEXT LOOKUP                         │
│  In-memory store keyed by senderId                              │
│  → Retrieve last 5 messages from this sender                    │
│  → Calculate message frequency in last 10 minutes              │
│  → Detect escalation trend (rising riskScore?)                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BTL RUNTIME TRIAGE CALL                      │
│  Model: gpt-4.1-mini                                            │
│  store: true | prompt_cache_key: "dispatch-triage-v1"           │
│  → On first call: cache MISS  → cacheTier: "none"               │
│  → On repeat:     cache HIT   → cacheTier: "hit (50%)"          │
│                                                                  │
│  Returns: riskScore · complexity · confidence · businessValue    │
│  Headers: x-btl-benchmark-cost · x-btl-customer-charge         │
│           x-btl-saved · x-gateway-savings-pct                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POLICY ENGINE (decideTier)                   │
│                                                                  │
│  riskScore ≥ 0.85      →  HUMAN REVIEW  ▲  (no LLM, skip)      │
│  riskScore ≥ 0.65      →  PRECISION     ›  (btl-2 premium)      │
│  budget pressure active →  ECONOMY      ·  (btl-2 fast)         │
│  else                  →  ECONOMY       ·                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         ECONOMY ·       PRECISION ›     HUMAN REVIEW ▲
         Fast model      Premium model   No inference
         Low cost        Full quality    Flagged to human
         Auto-reply      Auto-reply      Bot sends escalation msg
```

---

## Routing Tiers

| Tier | Symbol | When It Fires | What Happens |
|------|--------|--------------|--------------|
| **Economy** | `·` | Low risk, low complexity, or budget under pressure | Routed to fast lightweight model. Auto-reply generated. |
| **Precision** | `›` | High risk, high complexity, or high business value | Routed to premium model. Full reasoning applied. |
| **Human Review** | `▲` | Legal threat, fraud signal, credential leak, chargeback confirmed | LLM inference **skipped entirely**. Bot notifies human team. No AI-generated reply ever sent. |

> **Budget Pressure Logic**: When `remainingCapital / ticketsLeft < 0.15`, the policy engine automatically tightens thresholds. Borderline cases that would normally go Precision are re-routed to Economy. The system burns budget proportionally, not carelessly.

---

## The Four Triage Scores

Every message is evaluated across four dimensions, each scored `0.0 → 1.0`:

### `riskScore` — Financial & Legal Exposure
What are the *consequences* if this message is mishandled? Not tone. Not frustration level. **Consequence.**

A customer screaming about a delayed package in all caps scores low (`0.3`) — the consequence is a refund or apology. A customer quietly saying *"I've already contacted my credit card company"* scores high (`0.9`) — that's a chargeback in motion with real financial exposure. Dispatch weights what matters.

### `complexity` — Cognitive Demand
How much reasoning does an accurate, helpful reply actually require? "What are your store hours?" is a fact lookup (`0.1`). "I placed two orders, the first arrived damaged and the second is missing, and I used two different payment methods" is multi-step reasoning across your entire order management state (`0.8`). High complexity demands a capable model.

### `confidence` — Triage Certainty
How sure is the triage model about its own score? Ambiguous or cryptic messages (e.g. "it's wrong") can't be reliably classified. Low confidence biases the router toward escalation — it's safer to send an ambiguous message to Precision than to assume it was routine and reply cheaply.

### `businessValue` — Customer Priority
Is this a first-time visitor or a high-value repeat customer? `businessValue` acts as a buffer for borderline cases. A ticket scoring `0.62` on risk might normally route Economy — but if `businessValue` is `0.9`, Dispatch tips it to Precision. Loyal customers don't get the cheap route.

---

## Multi-Message Context Engine

Real support conversations are not single messages. A customer who sends three messages in 20 minutes — escalating in frustration each time — is a completely different situation from one who sent one message three days ago.

Dispatch tracks this with a **database-free, in-memory session store** (`lib/session-store.ts`), keyed by `senderId`.

### What the Session Store Tracks

```
SESSION [ senderId: "5382214636" ]
────────────────────────────────────────────────────
msg 1  →  "hi, where is my order?"     risk: 0.21   tier: economy
msg 2  →  "it's been 2 weeks now"      risk: 0.44   tier: economy
msg 3  →  "this is unacceptable"       risk: 0.71   tier: precision  ↑ escalating
────────────────────────────────────────────────────
frequency: 3 messages / 18 minutes  →  risk boost applied
escalationTrend: true
priorMessageCount: 2
```

When message 3 arrives, the triage prompt includes messages 1 and 2 as system context. The LLM evaluates the full trajectory — not the last message in isolation. The `escalationTrend: true` flag is returned in the API response, and the `/dispatch` dashboard surfaces a rising arrow (`↑`) next to the routing chip.

**Nothing is persisted.** The store is in-process memory, scoped to the server instance's lifetime. No Redis, no Postgres, no infrastructure overhead. For a demo, this is exactly right.

---

## Policy Playground

After a batch run completes, the **Policy Playground** appears — a client-side scenario simulator that asks: *"what would have happened if the rules were different?"*

Three sliders. Three controls. Zero new API calls.

| Control | Range | Effect |
|---------|-------|--------|
| Starting Budget | $0.02 → $1.00 | Changes when budget pressure kicks in |
| Escalation Threshold | 0.30 → 0.95 | How aggressive Precision routing is |
| Economy Floor | 0.10 → 0.60 | How generous Economy routing is |

The simulator replays `decideTier()` — the exact same routing function used in production — against the already-scored tickets from the live run. Counts for Economy, Precision, and Human Review update in real time. Shadow savings recalculate instantly.

This works because all the data is already there: every ticket in the ledger carries its full triage scores from the real BTL call. The Playground just re-evaluates the policy against those scores with different parameters.

---

## BTL Gateway Caching — Verified, Exact Numbers

This is documented precisely because it was found empirically and the math checks out exactly.

### The Configuration That Works

```typescript
// lib/runtime-client.ts — triage call
const payload = {
  model: "gpt-4.1-mini",       // NOT btl-2 — btl-2 forces Cache-Control: no-store
  store: true,                  // required — BTL rejects metadata without this
  metadata: {
    prompt_cache_key: "dispatch-triage-v1"  // stable key, same every call
  },
  messages: [
    { role: "system", content: STATIC_SCORING_RUBRIC },  // always identical
    { role: "user",   content: ticketText }               // only this changes
  ]
}
```

**Why `btl-2` doesn't work for caching**: BTL's auto-router returns `Cache-Control: no-store` on all responses. Prompt caching requires a direct model route.

**Why ordering matters**: The gateway caches the static prefix. If the system prompt changes position or content between calls, the cache key is invalidated. The rubric must come first, every time, unchanged.

### The 50/50 Shared-Savings Formula

BTL Runtime's documented pricing model for shared-savings routes:

```
CustomerCharge = ActualUpstreamCost + 0.5 × (BenchmarkCost − ActualUpstreamCost)
```

On a prompt-cache hit, the provider's actual upstream cost drops to $0.00:

```
CustomerCharge = 0 + 0.5 × ($0.000364 − $0) = $0.000182
```

### Live Verified Evidence

These are real request IDs and real header values from back-to-back identical calls:

```
CALL 1 — Cold (no cache)
─────────────────────────────────────────────────
x-btl-request-id:        req_86f7c60f_cold
x-btl-benchmark-cost:    $0.000364
x-btl-customer-charge:   $0.000422   ← retail markup applied, charge > benchmark
x-btl-saved:             -$0.000058  ← negative, as expected on cold routes
x-gateway-savings-pct:   0
cacheTier:               "none"

CALL 2 — Identical repeat (cache hit)
─────────────────────────────────────────────────
x-btl-request-id:        req_86f7c60f
x-btl-benchmark-cost:    $0.000364
x-btl-customer-charge:   $0.000182   ← exactly 50% of benchmark ✓
x-btl-saved:             $0.000182   ← positive, shared-savings math verified ✓
x-gateway-savings-pct:   50          ← BTL confirms 50% split
cacheTier:               "hit (50%)" ← dynamically resolved from live header
```

The `cacheTier` display string is **not hardcoded**. It is resolved at runtime from the live `x-gateway-savings-pct` header value:

```typescript
const pct = parseFloat(headers.get("x-gateway-savings-pct") ?? "0");
const cacheTier = pct > 0 ? `hit (${pct}%)` : rawCacheTier ?? "none";
```

If BTL ever returns `x-gateway-savings-pct: 37`, the UI displays `hit (37%)`. The number is always what the gateway actually reported.

---

## Why `saved` Can Be Negative

This is displayed honestly because it is real behavior.

On cold, unoptimized routes, BTL charges a retail markup above the wholesale provider cost. The `x-btl-customer-charge` header can exceed `x-btl-benchmark-cost`. When this happens:

```
saved = benchmarkCost − customerCharge = negative
```

Dispatch shows this number raw. It does not clamp to zero. It does not say "savings: $0.00" when the real number is -$0.003. The entire premise of the project is that the cost evidence is real — hiding inconvenient data would undermine that.

The actual savings story is in the routing policy, not in per-call caching:

> Routing 85% of messages to Economy instead of Precision on a 10-message batch saves ~$0.12 compared to "always Precision." That's the real number, and the dashboard's shadow cost comparison shows it.

---

## API Reference

**Endpoint:** `POST /api/intercept`

### Request
```json
{
  "text":             "I'm going to file a chargeback if this isn't resolved today.",
  "channel":          "telegram",
  "senderId":         "5382214636",
  "mode":             "execute",
  "remainingCapital": 0.284,
  "ticketsLeft":      4
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | ✓ | The raw message text to triage |
| `channel` | string | | `"dm"` · `"email"` · `"sms"` · `"telegram"` |
| `senderId` | string | | Any stable identifier — used as session key |
| `mode` | string | | `"decide"` (triage only) or `"execute"` (triage + reply) |
| `remainingCapital` | number | | Current budget balance — affects policy thresholds |
| `ticketsLeft` | number | | Remaining ticket quota — used in budget pressure calculation |

### Response
```json
{
  "tier":   "precision",
  "reason": "High chargeback risk and healthy budget — Precision Tier selected.",
  "scores": {
    "riskScore":           0.91,
    "complexity":          0.68,
    "confidence":          0.94,
    "businessValue":       0.55,
    "classificationBadge": "Chargeback Risk",
    "dominantFactor":      "Active chargeback threat with legal implication",
    "signals": [
      { "name": "Chargeback threat",     "confidence": "HIGH" },
      { "name": "Urgency + deadline set","confidence": "HIGH" }
    ]
  },
  "policy": {
    "considered":   { "economy": "rejected", "precision": "selected", "humanReview": "rejected" },
    "decisionPath": ["Chargeback Risk", "Healthy budget", "Precision Tier"]
  },
  "evidence": {
    "requestId":           "req_86f7c60f",
    "cacheTier":           "hit (50%)",
    "benchmarkCost":        0.000364,
    "customerCharge":       0.000182,
    "saved":                0.000182,
    "triageRequestId":     "req_86f7c60f",
    "triageCustomerCharge": 0.000182,
    "triageBenchmarkCost":  0.000364,
    "conversationLength":   3,
    "escalationTrend":      true,
    "priorMessageCount":    2
  },
  "shadowCosts": {
    "shadowCostAlwaysStrong": 0.1368,
    "shadowCostAlwaysCheap":  0.0137,
    "shadowCostRandom":       0.0752
  },
  "actualSpend": 0.000182,
  "reply": "I completely understand your frustration, and I want to resolve this for you immediately. I've flagged your order for priority review and will send you a full update within the hour. Please don't file a dispute — we're committed to making this right."
}
```

---

## Telegram Bot

The bot at `@dispatch_demobot` is a minimal wrapper that passes every inbound message through `/api/intercept` in `execute` mode, using the Telegram chat ID as the session identifier:

```typescript
// telegram-bot/index.ts
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text || text.startsWith('/')) return;

  const res = await fetch(DISPATCH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      channel: 'telegram',
      senderId: String(chatId),
      mode: 'execute'
    })
  });

  const data = await res.json();

  // Human Review — no AI reply, forward to human queue
  if (data.tier === 'human_review') {
    await bot.sendMessage(chatId, "⚠️ Your message has been escalated to our support team. An agent will contact you shortly.");
    return;
  }

  // Economy or Precision — send the generated reply
  if (data.reply) {
    await bot.sendMessage(chatId, data.reply);
  }
});
```

The entire escalation chain — from a Telegram message to a routing decision to a tracked ledger entry — runs through a single POST request.

---

## Live Demo Script

Three distinct, verifiable live moments for judges or stakeholders:

### 01 · Multi-Message Escalation (Telegram Bot)
Send these three messages to `@dispatch_demobot`, one after the other:
```
"Hi, do you ship to Canada?"
"My order is two weeks late."  
"I'm filing a chargeback tomorrow if I don't hear back."
```
Watch the `/dispatch` dashboard group them into a connected thread with escalating routing chips and a rising `↑` arrow. The first two route Economy. The third routes Precision — because the session context informed the triage model of the pattern.

### 02 · Gateway Cache Hit (Web Batch Interface)
Paste the same message twice into the `/run` batch interface. On the second run:
- `cacheTier` changes from `none` → `hit (50%)`
- `customerCharge` drops from `$0.000422` → `$0.000182`
- `saved` becomes positive: `$0.000182`
- `x-gateway-savings-pct: 50` visible in the evidence receipt

These are real BTL Runtime response headers. Not simulated.

### 03 · Policy Playground (Dashboard)
Complete a batch run on `/dispatch`. Click **"Try different settings"**. Drag the budget slider to `$0.05` and watch borderline Precision tickets flip to Economy in real time. Drag the escalation threshold to `0.9` and watch the tier distribution compress. All client-side. No new API calls. No cost.

---

## Project Structure

```
dispatch/
├── app/
│   ├── page.tsx              # Landing page — /
│   ├── dispatch/page.tsx     # Decision ledger — /dispatch
│   ├── docs/page.tsx         # Documentation — /docs
│   ├── run/page.tsx          # Batch run interface — /run
│   └── api/
│       ├── intercept/        # Core routing API
│       └── run-batch/        # SSE batch streaming
├── lib/
│   ├── runtime-client.ts     # BTL Runtime integration, header parsing, cache detection
│   ├── policy.ts             # decideTier() — routing policy engine
│   ├── session-store.ts      # In-memory conversation context
│   └── simulate.ts           # Policy Playground simulation logic
├── components/
│   └── PolicyPlayground.tsx  # Client-side scenario simulator
└── telegram-bot/
    └── index.ts              # Standalone Telegram bot connector
```

---

## Setup

**Requirements:** Node.js 18+ · BTL Runtime API key

### 1. Environment
```bash
# Root .env.local
GATEWAY_API_KEY=your_btl_runtime_api_key_here

# telegram-bot/.env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DISPATCH_API_URL=http://localhost:3000/api/intercept
```

### 2. Web Dashboard
```bash
npm install
npm run dev
# → http://localhost:3000
```

### 3. Telegram Bot
```bash
cd telegram-bot
npm install
npm start
# → Bot starts polling. Message @dispatch_demobot
```

---

<div align="center">

**Open-source demonstration of intelligence allocation.**  
Built to show cost-aware AI routing via BTL Runtime — real decisions, real costs, per message.

[**→ Live Demo**](https://dispatch-btl.vercel.app) · [**→ Telegram Bot**](https://t.me/dispatch_demobot) · [**→ Documentation**](https://dispatch-btl.vercel.app/docs) · [**→ BTL Runtime**](https://api.badtheorylabs.com)

</div>
