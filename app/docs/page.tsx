import Link from "next/link";
import { CornerMarks } from "@/components/CornerMarks";

export const metadata = {
  title: "Docs — Dispatch",
  description: "Technical documentation for Dispatch: API reference, integration guide, scoring dimensions, and Telegram bot walkthrough.",
};

// ─── Inline code ──────────────────────────────────────────────────────────────
function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[11px] bg-[#EDEBE3] border border-[#D8D5C9] px-1 py-0.5 text-[#26263A]">
      {children}
    </code>
  );
}

function CDark({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[11px] bg-[#1E1E2C] border border-[#3E3E56] px-1 py-0.5 text-[#2CE8A5]">
      {children}
    </code>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <div id={id} className="mb-8 pt-16 first:pt-0">
      <div className="text-[9px] uppercase tracking-[0.25em] opacity-40 mb-2">{label}</div>
      <h2 className="text-2xl md:text-3xl text-[#26263A]" style={{ fontFamily: "'Zodiak', serif" }}>
        {title}
      </h2>
      <div className="w-12 h-px bg-[#2CE8A5] mt-4" />
    </div>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ label, code, lang = "bash" }: { label?: string; code: string; lang?: string }) {
  void lang; // lang prop reserved for future syntax highlighting
  return (
    <div className="bg-[#1E1E2C] border border-[#3E3E56] relative mb-6">
      <CornerMarks dark />
      {label && (
        <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 px-5 pt-4 pb-2 border-b border-[#3E3E56]/50 text-[#F1EFE7]">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto text-[#2CE8A5] font-mono text-[11px] leading-relaxed p-5 whitespace-pre">
        {code.trim()}
      </pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocsPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col font-mono" style={{ backgroundColor: "#F1EFE7" }}>

      {/* Nav */}
      <header className="px-8 py-4 border-b flex justify-between items-center sticky top-0 z-50" style={{ backgroundColor: "#EDEBE3", borderColor: "#D8D5C9" }}>
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] hover:opacity-70 transition-opacity" style={{ color: "#26263A" }}>
          Dispatch
        </Link>
        <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#26263A" }}>
          <Link href="/run" className="opacity-50 hover:opacity-100 transition-opacity">Run</Link>
          <Link href="/docs" className="opacity-100 font-bold">Docs</Link>
          <span className="opacity-30">BTL Runtime Demo</span>
        </nav>
      </header>

      <div className="flex-1 flex">

        {/* Sidebar — hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r px-6 py-10 sticky top-[49px] h-[calc(100vh-49px)] overflow-y-auto" style={{ borderColor: "#D8D5C9", backgroundColor: "#EDEBE3" }}>
          <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-4">On this page</div>
          <nav className="space-y-3 text-[11px]">
            {[
              ["#overview",    "Overview"],
              ["#concepts",    "Core Concepts"],
              ["#scoring",     "Scoring Dimensions"],
              ["#tiers",       "Tier Logic"],
              ["#api",         "API Reference"],
              ["#curl",        "Curl Example"],
              ["#evidence",    "Evidence Object"],
              ["#pricing",     "Pricing Reality"],
              ["#bot",         "Connecting a Bot"],
              ["#telegram",    "Telegram Example"],
              ["#limits",      "Limitations"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="block opacity-50 hover:opacity-100 transition-opacity uppercase tracking-[0.14em] text-[#26263A]"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 lg:px-16 py-10 max-w-3xl">

          {/* ── 1. Overview ────────────────────────────────────────────────── */}
          <SectionHead label="Introduction" title="Overview" id="overview" />
          <p className="text-sm leading-relaxed opacity-80 mb-4">
            Dispatch is a cost-aware AI routing middleware. It sits in front of your LLM calls and decides how much inference capacity each message deserves, based on four scoring dimensions: risk, complexity, confidence, and business value. Low-stakes messages go to the cheap model. High-stakes ones go to the precision model. Messages requiring human judgment are flagged for review and skipped entirely.
          </p>
          <p className="text-sm leading-relaxed opacity-80 mb-6">
            Every routing decision is backed by live cost data from BTL Runtime — real response headers, not estimates. The result is a per-call receipt that shows exactly what was spent and what a naive always-premium strategy would have cost instead.
          </p>
          <div className="flex gap-4 mb-6">
            <Link href="/run" className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] bg-[#26263A] text-[#F1EFE7] hover:opacity-90 transition-opacity">
              Try the live demo →
            </Link>
          </div>

          <div className="h-px bg-[#D8D5C9] my-10" />

          {/* ── 2. Core Concepts ───────────────────────────────────────────── */}
          <SectionHead label="Foundation" title="Core Concepts" id="concepts" />

          <div id="scoring" className="mb-8">
            <h3 className="text-lg font-bold mb-4">Scoring Dimensions</h3>
            <p className="text-sm leading-relaxed opacity-70 mb-6">
              Every message is scored across four dimensions before a routing decision is made. Scores run from 0.0 to 1.0.
            </p>
            <div className="space-y-4">
              {[
                {
                  key: "riskScore",
                  title: "Risk Score",
                  desc: "How serious are the consequences of mishandling this message? A calm-but-serious refund request scores higher than an angry-but-minor shipping delay, because mishandling a refund has real financial and reputational consequences. Tone is irrelevant — consequence is everything.",
                },
                {
                  key: "complexity",
                  title: "Complexity",
                  desc: "How much reasoning is required to respond correctly? A templated answer (\"yes, we ship to Canada\") is low complexity. A nuanced judgement call about a damaged goods claim with partial fulfillment is high. Complexity determines whether the cheap model's simpler reasoning is sufficient.",
                },
                {
                  key: "confidence",
                  title: "Confidence",
                  desc: "How certain is the triage model about its own scoring? Ambiguous messages that could be read multiple ways get lower confidence scores, which biases the routing system toward escalation — false positives (over-escalating a minor ticket) are cheaper than false negatives (under-escalating a real one).",
                },
                {
                  key: "businessValue",
                  title: "Business Value",
                  desc: "What is the customer's apparent value to the business? Repeat purchasers, high-volume buyers, and customers with clear purchase history signal higher value. Unknown first-timers get a conservative default. This dimension can boost escalation for borderline cases where the customer relationship warrants extra care.",
                },
              ].map((dim) => (
                <div key={dim.key} className="border border-[#D8D5C9] p-5 bg-[#F7F5ED] relative">
                  <div className="flex items-start gap-3">
                    <C>{dim.key}</C>
                    <div>
                      <div className="font-bold text-sm mb-1">{dim.title}</div>
                      <p className="text-xs leading-relaxed opacity-70">{dim.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="tiers" className="mb-8">
            <h3 className="text-lg font-bold mb-4">Tier Logic</h3>
            <p className="text-sm leading-relaxed opacity-70 mb-4">
              Dispatch maps each message to one of three tiers. The exact thresholds are not exposed — what matters is the behavior:
            </p>
            <div className="space-y-3">
              <div className="border border-[#2CE8A5]/40 p-4 bg-[#2CE8A5]/5">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2CE8A5] mb-1">· Economy</div>
                <p className="text-xs leading-relaxed opacity-70">Routine, low-risk messages. Stock checks, shipping questions, address changes on fresh orders. Fast and cheap. As the budget gets tighter, Dispatch raises the bar for what qualifies — borderline cases that might have gone Precision earlier in a run may route Economy instead when capital is running low.</p>
              </div>
              <div className="border border-[#FF6FCF]/40 p-4 bg-[#FF6FCF]/5">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF6FCF] mb-1">› Precision</div>
                <p className="text-xs leading-relaxed opacity-70">High-risk, nuanced, or high-value messages. Refund requests, damaged goods claims, public complaint threats. Gets the best available model. Dispatch does not compromise on routing quality for these — they justify the spend.</p>
              </div>
              <div className="border border-amber-400/40 p-4 bg-amber-400/5">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-400 mb-1">▲ Human Review</div>
                <p className="text-xs leading-relaxed opacity-70">Messages with active legal threats, serious privacy violations, or scenarios where no AI response is appropriate. Dispatch skips inference entirely and flags these for a human. The API returns a tier of <C>human_review</C> and no reply.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#D8D5C9] my-10" />

          {/* ── 3. API Reference ───────────────────────────────────────────── */}
          <SectionHead label="Integration" title="API Reference — /api/intercept" id="api" />

          <div className="mb-8">
            <h3 className="text-base font-bold mb-3 uppercase tracking-wider text-[11px] opacity-60">Request</h3>
            <CodeBlock
              label="POST /api/intercept"
              lang="json"
              code={`{
  "text":     string,    // Required. The incoming message text.
  "channel":  string?,   // Optional. "dm" | "email" | "sms". Defaults to "dm".
  "senderId": string?,   // Optional. Caller identifier for logging.
  "mode":     string?    // Optional. "decide" | "execute". Defaults to "decide".
}`}
            />
            <div className="space-y-3 mb-6">
              <div className="text-xs leading-relaxed opacity-70">
                <span className="font-bold">decide</span> — Runs triage and returns a tier decision, reason, and scores. Does NOT call the LLM to generate a reply. Use this when your system generates its own reply and you only need the routing signal.
              </div>
              <div className="text-xs leading-relaxed opacity-70">
                <span className="font-bold">execute</span> — Runs triage, then routes the message to the appropriate model and generates a reply. Returns everything in decide mode PLUS a <C>reply</C> field. Use this when you want Dispatch to write the response.
              </div>
            </div>

            <h3 className="text-base font-bold mb-3 uppercase tracking-wider text-[11px] opacity-60">Response</h3>
            <CodeBlock
              label="Response Shape"
              lang="json"
              code={`{
  "channel":   string,     // Echoed from request.
  "senderId":  string,     // Echoed from request.
  "tier":      "economy" | "precision" | "human_review",
  "reason":    string,     // Human-readable routing explanation.
  "scores": {
    "riskScore":           number,   // 0.0 – 1.0
    "complexity":          number,   // 0.0 – 1.0
    "confidence":          number,   // 0.0 – 1.0
    "businessValue":       number,   // 0.0 – 1.0
    "classificationBadge": string,   // e.g. "Refund Risk", "Human Review"
    "dominantFactor":      string,   // Primary scoring factor
    "signals":             Array<{ name: string, confidence: "HIGH"|"MEDIUM"|"LOW" }>
  },
  "policy": {
    "considered":   { economy, precision, humanReview },   // "selected"|"rejected"
    "decisionPath": string[]   // Ordered reasoning steps
  },
  "evidence": { ... },       // See Evidence Object below
  "shadowCosts": {
    "shadowCostAlwaysStrong": number,
    "shadowCostAlwaysCheap":  number,
    "shadowCostRandom":       number
  },
  "actualSpend": number,     // Total spend for this call (triage + execution if execute mode)
  "reply":       string?     // Only present in "execute" mode. Absent for human_review.
}`}
            />
          </div>

          {/* Curl example — real output from live test */}
          <div id="curl" className="mb-8">
            <h3 className="text-base font-bold mb-3 uppercase tracking-wider text-[11px] opacity-60">Real Example</h3>
            <p className="text-xs leading-relaxed opacity-60 mb-4">
              This is a sanitized but real request/response from a live test call made against the running instance.
            </p>
            <CodeBlock
              label="Request — curl"
              lang="bash"
              code={`curl -X POST https://dispatch-btl.vercel.app/api/intercept \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "My order arrived with a broken zipper and I need a replacement or refund immediately.",
    "mode": "execute"
  }'`}
            />
            <CodeBlock
              label="Response — live output (abridged)"
              lang="json"
              code={`{
  "tier":   "precision",
  "reason": "Healthy budget allowed Precision Tier inference.",
  "scores": {
    "riskScore":           0.6,
    "complexity":          0.4,
    "confidence":          0.9,
    "businessValue":       0.5,
    "classificationBadge": "Refund Risk",
    "dominantFactor":      "Damaged goods reported",
    "signals": [
      { "name": "Damaged goods",      "confidence": "HIGH" },
      { "name": "Request for refund", "confidence": "HIGH" }
    ]
  },
  "evidence": {
    "requestId":          "req_98736b77",
    "cacheTier":          "none",
    "benchmarkCost":       0.000038,
    "customerCharge":      0.000590,
    "saved":              -0.000552,
    "triageRequestId":    "req_85c02b61",
    "triageCustomerCharge": 0.00336,
    "triageBenchmarkCost":  0.00015
  },
  "actualSpend": 0.00395,
  "reply": "I'm sorry to hear about the broken zipper. We can arrange a replacement — please share your order number and we'll process this immediately."
}`}
            />
          </div>

          {/* Evidence object */}
          <div id="evidence" className="mb-8">
            <h3 className="text-base font-bold mb-4">Evidence Object Fields</h3>
            <div className="border border-[#D8D5C9] overflow-hidden">
              <div className="grid grid-cols-2 bg-[#E5E3DB] p-3 text-[9px] uppercase tracking-[0.2em] opacity-50 border-b border-[#D8D5C9]">
                <div>Field</div>
                <div>Description</div>
              </div>
              {[
                ["requestId",          "Unique identifier for the execution API call. Derived from BTL Runtime's response id."],
                ["cacheTier",          "Cache status from BTL Runtime. \"none\" means no cache hit. \"hit (50%)\" indicates a prompt-cache hit on gpt-4.1-mini via the stable prompt_cache_key parameter."],
                ["benchmarkCost",      "The x-btl-benchmark-cost header: wholesale provider cost before any markup."],
                ["customerCharge",     "The x-btl-customer-charge header: what the workspace is actually billed."],
                ["saved",              "benchmarkCost − customerCharge. Can be negative — see Pricing Reality below."],
                ["triageRequestId",    "Request ID for the triage (scoring) call specifically."],
                ["triageCustomerCharge","Cost billed for the triage inference call."],
                ["execRequestId",      "Request ID for the execution (reply generation) call."],
                ["execCustomerCharge", "Cost billed for the execution inference call."],
              ].map(([field, desc], i, arr) => (
                <div key={field} className={`grid grid-cols-2 p-3 text-xs gap-4 ${i < arr.length - 1 ? "border-b border-[#D8D5C9]" : ""} hover:bg-[#F7F5ED] transition-colors`}>
                  <C>{field}</C>
                  <span className="opacity-70 leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing reality */}
          <div id="pricing" className="mb-8 border border-[#26263A]/10 p-6 bg-[#26263A] text-[#F1EFE7]">
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-3">Important</div>
            <h3 className="text-base font-bold mb-3">Why &apos;saved&apos; can be negative</h3>
            <p className="text-xs leading-relaxed opacity-80 mb-3">
              BTL Runtime&apos;s documented pricing model describes a shared-savings approach: if no caching or optimization reduces cost, the workspace pays the benchmark price and Runtime earns nothing. In practice, the live gateway charges a retail markup above the wholesale benchmark on many routes — meaning <CDark>customerCharge</CDark> can exceed <CDark>benchmarkCost</CDark>, resulting in a negative <CDark>saved</CDark> value.
            </p>
            <p className="text-xs leading-relaxed opacity-80 mb-3">
              This is real behavior — Dispatch does not clamp or hide negative values. We show what the headers actually say.
            </p>
            <p className="text-xs leading-relaxed opacity-80">
              The actual savings story is in Dispatch&apos;s routing policy, not in per-call caching: routing 80–90% of messages to the Economy tier instead of always using Precision produces substantial policy savings regardless of per-call gateway behavior. See the benchmark comparison on <Link href="/dispatch" className="underline opacity-80 hover:opacity-100">/dispatch</Link> after a run.
            </p>
          </div>

          <div className="h-px bg-[#D8D5C9] my-10" />

          {/* ── 4. Connecting a bot ────────────────────────────────────────── */}
          <SectionHead label="Integration Guide" title="Connecting a Bot" id="bot" />

          <p className="text-sm leading-relaxed opacity-70 mb-6">
            Any system that can make an HTTP POST request can attach Dispatch as a pre-reply decision layer. The pattern is always the same:
          </p>
          <ol className="space-y-3 mb-8 text-sm opacity-70">
            <li className="flex gap-3"><span className="font-mono text-[#2CE8A5] font-bold flex-shrink-0">01</span><span>Receive an incoming message from your platform (Telegram, WhatsApp, Discord, email, etc.)</span></li>
            <li className="flex gap-3"><span className="font-mono text-[#2CE8A5] font-bold flex-shrink-0">02</span><span>POST the message text to <C>/api/intercept</C> with <C>{'mode: "execute"'}</C>.</span></li>
            <li className="flex gap-3"><span className="font-mono text-[#2CE8A5] font-bold flex-shrink-0">03</span><span>Read the <C>reply</C> field from the response and forward it to your user using your platform&apos;s send-message API.</span></li>
            <li className="flex gap-3"><span className="font-mono text-[#2CE8A5] font-bold flex-shrink-0">04</span><span>If <C>{'tier === "human_review"'}</C>, skip sending the AI reply and route to a human queue instead.</span></li>
          </ol>
          <p className="text-xs leading-relaxed opacity-60 mb-8">
            Telegram was used for this demo because it requires no business verification for bot creation. The same pattern applies to WhatsApp, Discord, Slack, or any platform with an incoming webhook and a send-message API.
          </p>

          {/* Telegram example */}
          <div id="telegram" className="mb-8">
            <h3 className="text-base font-bold mb-4">Telegram Bot — Core Loop</h3>
            <p className="text-xs leading-relaxed opacity-60 mb-4">
              This is the real logic from the Dispatch Telegram bot, simplified and annotated. The full source is in <C>telegram-bot/index.ts</C>.
            </p>
            <CodeBlock
              label="telegram-bot/index.ts — core message handler"
              lang="typescript"
              code={`import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });
const DISPATCH_API_URL = process.env.DISPATCH_API_URL!; // e.g. http://localhost:3000

bot.on("message", async (msg) => {
  const text = msg.text?.trim();
  if (!text || text.startsWith("/")) return;

  try {
    // ① Call Dispatch as the decision layer
    const res = await fetch(\`\${DISPATCH_API_URL}/api/intercept\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        channel: "telegram",
        senderId: String(msg.from?.id),
        mode: "execute",
      }),
    });

    const data = await res.json();

    if (data.tier === "human_review") {
      // ② Flag for human — don't send an AI reply
      await bot.sendMessage(msg.chat.id,
        "Your message has been escalated to our support team."
      );
      return;
    }

    // ③ Forward Dispatch's reply to the user
    if (data.reply) {
      await bot.sendMessage(msg.chat.id, data.reply);
    }

    // ④ Log the routing decision for observability
    console.log(\`[Dispatch] Tier: \${data.tier} | Spent: \$\${data.actualSpend?.toFixed(4)}\`);

  } catch (err) {
    console.error("[Dispatch] Error:", err);
    await bot.sendMessage(msg.chat.id, "Something went wrong. Please try again.");
  }
});`}
            />
          </div>

          <div className="h-px bg-[#D8D5C9] my-10" />

          {/* ── 5. Limitations ─────────────────────────────────────────────── */}
          <SectionHead label="Honesty" title="Limitations" id="limits" />
          <p className="text-sm leading-relaxed opacity-70 mb-6">
            Dispatch is a hackathon-scoped demo. Here is exactly what it is and is not:
          </p>
          <div className="space-y-3 mb-8">
            {[
              ["Single-tenant",           "There is no authentication, user management, or multi-workspace support. Anyone who can reach the URL can call /api/intercept."],
              ["No persistent database",  "Processed tickets exist only in the browser session. Closing the tab discards the ledger. There is no run history."],
              ["No multi-bot management", "The Telegram integration is a single bot with hardcoded environment variables. Managing multiple bots, channels, or accounts is out of scope."],
              ["Fixed budget",            "The $0.30 starting capital is hardcoded. There is no per-user budget management, quota enforcement, or billing integration."],
              ["Triage Caching",          "Triage scoring runs on gpt-4.1-mini with prompt_cache_key metadata to trigger BTL gateway prompt caching. Execution uses the btl-2 router."],
              ["Session-scoped memory",   "Conversation context memory is kept strictly in-memory per senderId. It does not persist across server restarts (this is intentional, keeping the design database-free and lightweight)."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-4 text-xs border-b border-[#D8D5C9] pb-3 last:border-0">
                <span className="font-bold w-36 flex-shrink-0">{title}</span>
                <span className="opacity-70 leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed opacity-60">
            These are not apologetics — they are scope boundaries. A production version would add auth, persistent storage, per-tenant budgets, and multi-channel management. The routing logic, cost attribution, and API surface are the proof-of-concept, and they work.
          </p>

          {/* Bottom CTA */}
          <div className="mt-16 pt-10 border-t border-[#D8D5C9] flex gap-4">
            <Link href="/run" className="px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] bg-[#26263A] text-[#F1EFE7] hover:opacity-90 transition-opacity">
              Try the demo →
            </Link>
            <Link href="/" className="px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] border border-[#D8D5C9] text-[#26263A] hover:bg-[#EDEBE3] transition-colors">
              ← Back to landing
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
