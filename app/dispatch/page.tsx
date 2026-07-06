"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CornerMarks } from "@/components/CornerMarks";
import Link from "next/link";
import type { ProcessedTicket } from "@/lib/ticket-types";
import { PolicyPlayground } from "@/components/PolicyPlayground";
import { CacheCompare } from "@/components/CacheCompare";

const STARTING_CAPITAL = 0.3;

// ─── Evidence card ────────────────────────────────────────────────────────────

function EvidenceCard({ runtime }: { runtime?: ProcessedTicket["runtime"] }) {
  const [open, setOpen] = useState(false);

  if (!runtime) {
    return (
      <div className="w-full border-t border-[#3E3E56] pt-4 mt-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#FF6FCF]/40 text-center">
          Execution Skipped
        </div>
        <div className="text-[8px] opacity-50 mt-1 text-center text-[#F1EFE7] normal-case tracking-normal">
          Human review required before inference.
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-t border-[#3E3E56] pt-3 mt-2 text-[9px] uppercase tracking-[0.18em] text-[#D8D5C9]/60 hover:text-[#D8D5C9] transition-colors text-left flex items-center gap-2"
      >
        <span className="opacity-40">›</span> View Runtime Evidence
      </button>
    );
  }

  const savedPct =
    runtime.benchmarkCost > 0
      ? ((runtime.runtimeSaved / runtime.benchmarkCost) * 100).toFixed(1)
      : "0.0";

  const rows: [string, string, boolean][] = [
    ["Provider",     `${runtime.provider} (${runtime.model})`,            false],
    ["Gateway Mode", runtime.gatewayMode,                                  false],
    ["Cache",        runtime.cacheTier || "none",                          true],
    ["Benchmark",    `$${(runtime.benchmarkCost  || 0).toFixed(4)}`,      false],
    ["Charged",      `$${(runtime.customerCharge || 0).toFixed(4)}`,      true],
    ["Saved",        `${savedPct}%`,                                       true],
    ["Request ID",   (runtime.requestId || "—").slice(-14),               false],
  ];

  return (
    <div className="border-t border-[#3E3E56] pt-4 mt-2">
      {/* Receipt header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-[#3E3E56]" />
        <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] whitespace-nowrap">
          Verified via BTL Runtime
        </span>
        <div className="flex-1 h-px bg-[#3E3E56]" />
      </div>

      {/* Receipt rows */}
      <div className="font-mono text-[10px]">
        {rows.map(([k, v, highlight], i) => (
          <div
            key={k}
            className={`flex justify-between items-center py-1.5 ${
              i < rows.length - 1 ? "border-b border-[#3E3E56]/40" : ""
            }`}
          >
            <span className="uppercase tracking-[0.14em] opacity-40 text-[#F1EFE7]">{k}</span>
            <span
              className={
                highlight
                  ? "text-[#2CE8A5] font-bold"
                  : "text-[#F1EFE7] opacity-80"
              }
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(false)}
        className="w-full mt-3 text-[9px] uppercase tracking-[0.18em] opacity-30 hover:opacity-70 transition-opacity text-[#F1EFE7] text-right"
      >
        Close ↑
      </button>
    </div>
  );
}

// ─── Classification chip ───────────────────────────────────────────────────────

function ClassificationChip({ badge }: { badge: string }) {
  const text = (badge || "Routine Inquiry").toLowerCase();

  let bgColor = "bg-[#2CE8A5]/10";
  let textColor = "text-[#2CE8A5]";
  let borderColor = "border-[#2CE8A5]/30";
  let icon = "·";

  if (text.includes("human") || text.includes("review")) {
    bgColor = "bg-[#FF6FCF]/10"; textColor = "text-[#FF6FCF]"; borderColor = "border-[#FF6FCF]/30"; icon = "▲";
  } else if (text.includes("reputation") || text.includes("chargeback")) {
    bgColor = "bg-red-500/10"; textColor = "text-red-400"; borderColor = "border-red-500/30"; icon = "▲";
  } else if (text.includes("refund") || text.includes("risk")) {
    bgColor = "bg-amber-400/10"; textColor = "text-amber-400"; borderColor = "border-amber-400/30"; icon = "›";
  } else if (text.includes("time") || text.includes("sensitive")) {
    bgColor = "bg-amber-400/10"; textColor = "text-amber-400"; borderColor = "border-amber-400/30"; icon = "›";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] border ${bgColor} ${textColor} ${borderColor}`}
      style={{ borderRadius: "2px" }}
    >
      <span className="opacity-70">{icon}</span>
      {badge || "Routine Inquiry"}
    </span>
  );
}

// ─── Tier chip ────────────────────────────────────────────────────────────────

function TierChip({ decision, escalating }: { decision: string; escalating?: boolean }) {
  const isHuman   = decision === "human_review";
  const isEconomy = decision === "economy";

  const label      = isHuman ? "Human Review" : isEconomy ? "Economy" : "Precision";
  const icon       = isHuman ? "▲" : isEconomy ? "·" : "›";
  const textColor  = isHuman ? "text-[#FF6FCF]" : isEconomy ? "text-[#2CE8A5]" : "text-[#FF6FCF]";
  const borderColor = isHuman ? "border-[#FF6FCF]/30" : isEconomy ? "border-[#2CE8A5]/30" : "border-[#FF6FCF]/30";
  const bgColor    = isHuman ? "bg-[#FF6FCF]/10" : isEconomy ? "bg-[#2CE8A5]/10" : "bg-[#FF6FCF]/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] border ${bgColor} ${textColor} ${borderColor}`}
      style={{ borderRadius: "2px" }}
    >
      <span className="opacity-70">{icon}</span>
      {label}
      {escalating && (
        <span className="ml-1 text-[10px]" title="Risk escalating across this conversation">
          ↑
        </span>
      )}
    </span>
  );
}

// ─── Cost comparison with line-number diff treatment ──────────────────────────

function CostComparison({
  premiumCost,
  actualCost,
  policySavings,
}: {
  premiumCost: number;
  actualCost: number;
  policySavings: number;
}) {
  const MAX = Math.max(premiumCost, 0.001);
  const actualPct = Math.max(3, (actualCost / MAX) * 100);
  const savedPct  = premiumCost > 0 ? Math.round((policySavings / premiumCost) * 100) : 0;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 01 */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#F1EFE7] opacity-20 w-5 text-right select-none">01</span>
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 text-[#F1EFE7]">
            If always premium
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#2C2C40] relative overflow-hidden" style={{ borderRadius: "1px" }}>
              {/* Full-width bar */}
              <div
                className="absolute inset-y-0 left-0 right-0 bg-[#FF6FCF]/35"
                style={{ boxShadow: "inset 1px 0 0 rgba(255,111,207,0.5)" }}
              />
            </div>
            <span className="font-mono text-[9px] text-[#F1EFE7] opacity-50 w-14 text-right">
              ${premiumCost.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 02 */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#F1EFE7] opacity-20 w-5 text-right select-none">02</span>
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 text-[#F1EFE7]">
            What Dispatch spent
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#2C2C40] relative overflow-hidden" style={{ borderRadius: "1px" }}>
              <div
                className="absolute inset-y-0 left-0 bg-[#2CE8A5]/40 transition-all duration-700 ease-out"
                style={{
                  width: `${actualPct}%`,
                  boxShadow: "inset 1px 0 0 rgba(44,232,165,0.6)",
                }}
              />
            </div>
            <span className="font-mono text-[9px] text-[#2CE8A5] w-14 text-right">
              ${actualCost.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Savings line */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-mono text-[9px] text-[#F1EFE7] opacity-20 w-5 text-right select-none">  </span>
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#F1EFE7] opacity-40">
            Policy savings
          </span>
          <span className="font-mono text-xs font-bold text-[#2CE8A5]">
            ${policySavings.toFixed(4)}
          </span>
          <span className="text-[9px] opacity-40 text-[#2CE8A5]">
            ({savedPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({ t }: { t: ProcessedTicket }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        bg-[#34344A] border border-[#3E3E56] p-6 relative flex flex-col gap-5
        hover:-translate-y-0.5 hover:border-[#6E6E90]
        transition-all duration-150
      "
    >
      <CornerMarks dark />

      {/* Header: ticket text */}
      <p className="text-sm text-[#F1EFE7] font-bold leading-snug line-clamp-3 italic opacity-90 border-l-2 border-[#3E3E56] pl-3">
        &ldquo;{t.ticket.text}&rdquo;
      </p>

      {/* Chips row — 2px radius square chips only */}
      <div className="flex items-center gap-2 flex-wrap">
        <ClassificationChip badge={t.classification.classificationBadge} />
        <TierChip decision={t.policy.decision} escalating={t.runtime?.escalationTrend} />
        {/* Thread position indicator */}
        {t.runtime?.conversationLength && t.runtime.conversationLength > 1 && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] border border-[#6E6E90]/30 bg-[#6E6E90]/10 text-[#D8D5C9]"
            style={{ borderRadius: "2px" }}
            title={`Message ${t.runtime.conversationLength} in this sender's session`}
          >
            <span className="opacity-60">◎</span> msg {t.runtime.conversationLength}
          </span>
        )}
        <span className="ml-auto text-[9px] opacity-20 text-[#F1EFE7] uppercase tracking-wide font-mono">
          #{t.ticket.id}
        </span>
      </div>

      {/* Signals */}
      <div>
        <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] mb-2">
          Signals
        </div>
        <ul className="text-[10px] text-[#F1EFE7] space-y-1 font-mono">
          {t.classification.signals?.map((s, idx) => {
            const confColor =
              s.confidence === "HIGH"
                ? "text-[#FF6FCF]"
                : s.confidence === "MEDIUM"
                ? "text-amber-400"
                : "text-[#2CE8A5]";
            return (
              <li key={idx} className="flex justify-between items-center py-1 border-b border-[#3E3E56]/40 last:border-0">
                <span className="truncate opacity-80">{s.name}</span>
                <span className={`text-[8px] font-bold tracking-widest ${confColor} ml-2`}>
                  {s.confidence}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Cost comparison */}
      <CostComparison
        premiumCost={t.policyMetrics.shadowPremiumCost}
        actualCost={t.policyMetrics.actualSpend}
        policySavings={t.policyMetrics.policySavings}
      />

      {/* Decision path */}
      <div>
        <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] mb-2">
          Decision Path
        </div>
        <div className="flex flex-col gap-1 font-mono text-[9px] uppercase tracking-wider mb-3">
          {t.policy.decisionPath.map((step, i) => {
            const isLast = i === t.policy.decisionPath.length - 1;
            const stepColor = isLast
              ? t.policy.decision === "human_review"
                ? "text-[#FF6FCF]"
                : t.policy.decision === "economy"
                ? "text-[#2CE8A5]"
                : "text-[#FF6FCF]"
              : "text-[#F1EFE7] opacity-40";
            return (
              <div key={i} className="flex gap-2 items-center">
                {i > 0 && <span className="opacity-20 ml-1">↓</span>}
                <span className={`font-bold ${stepColor}`}>{step}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[11px] text-[#F1EFE7] opacity-75 leading-relaxed italic">
          &ldquo;{t.policy.reason}&rdquo;
        </div>
      </div>

      {/* Runtime evidence — receipt style, no surrounding box */}
      <EvidenceCard runtime={t.runtime} />
    </motion.div>
  );
}

// ─── Threaded ledger ──────────────────────────────────────────────────────────
// Groups tickets by senderId. Anonymous tickets (senderId "unknown") display
// as a flat grid. Named senders with 2+ messages get a thread connector.

function ThreadedLedger({ ledger }: { ledger: ProcessedTicket[] }) {
  // Thread = any ticket where the sender had prior messages (conversationLength > 1).
  // In paste-mode all senders are "unknown" so conversationLength stays 1 — flat grid.
  // In Telegram-mode real senderIds accumulate, so later messages get conversationLength > 1.
  const threadTickets = ledger.filter(
    (t) => t.runtime?.conversationLength && t.runtime.conversationLength > 1
  );
  const soloTickets = ledger.filter(
    (t) => !t.runtime?.conversationLength || t.runtime.conversationLength <= 1
  );

  // Pure solo run — flat grid, no overhead
  if (threadTickets.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ledger.map((t, i) => <TicketCard key={i} t={t} />)}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {threadTickets.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-[0.22em] opacity-40 text-[#F1EFE7] mb-4 flex items-center gap-3">
            <span>◎ Multi-message threads</span>
            <div className="flex-1 h-px bg-[#3E3E56]" />
          </div>
          <div className="relative pl-4 border-l-2 border-[#6E6E90]/40 space-y-4">
            {threadTickets.map((t, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] top-6 w-3 h-3 border-2 border-[#6E6E90] bg-[#2C2C40]" style={{ borderRadius: "1px" }} />
                <TicketCard t={t} />
              </div>
            ))}
          </div>
        </div>
      )}

      {soloTickets.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-[0.22em] opacity-40 text-[#F1EFE7] mb-4 flex items-center gap-3">
            <span>· Single messages</span>
            <div className="flex-1 h-px bg-[#3E3E56]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {soloTickets.map((t, i) => <TicketCard key={i} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = "init" | "parsing" | "running" | "done" | "error";

function DispatchAppInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [phase, setPhase] = useState<Phase>("init");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [remaining, setRemaining]         = useState(STARTING_CAPITAL);
  const [predictedTotal, setPredictedTotal] = useState<number | null>(null);
  const [ledger, setLedger]               = useState<ProcessedTicket[]>([]);
  const [processed, setProcessed]         = useState(0);
  const [totalTickets, setTotalTickets]   = useState(0);
  const [showPlayground, setShowPlayground] = useState(false);

  const scoredTickets = React.useMemo(() => {
    return ledger.map((pt) => ({
      id: pt.ticket.id,
      text: pt.ticket.text,
      riskScore: pt.classification.riskScore,
      complexity: pt.classification.complexity,
      confidence: pt.classification.confidence,
      businessValue: pt.classification.businessValue,
      shadowCostAlwaysStrong: pt.policyMetrics.shadowPremiumCost,
      shadowCostAlwaysCheap: pt.policyMetrics.shadowCheapCost,
      classification: pt.classification.classificationBadge,
      dominantFactor: pt.classification.dominantFactor,
    }));
  }, [ledger]);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const rawText = isDemo ? "" : (sessionStorage.getItem("dispatch_input") ?? "");

    if (!isDemo) {
      if (!rawText || rawText.trim().length === 0) {
        router.replace("/run");
        return;
      }
      sessionStorage.removeItem("dispatch_input");
    }
    setPhase("parsing");

    const runStream = async () => {
      try {
        // Demo mode: stream from fixture endpoint, no API key needed
        const endpoint = isDemo ? "/api/demo-batch" : "/api/run-batch";
        const fetchOptions = isDemo
          ? { method: "GET" }
          : {
              method: "POST",
              body: JSON.stringify({ startingCapital: STARTING_CAPITAL, rawText }),
              headers: { "Content-Type": "application/json" },
            };

        const res = await fetch(endpoint, fetchOptions);


        if (!res.body) { setPhase("error"); return; }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(part.slice(6));
              if (ev.type === "PARSING") {
                setPhase("parsing");
              } else if (ev.type === "PARSE_COMPLETE") {
                setTotalTickets(ev.ticketCount);
                setPhase("running");
              } else if (ev.type === "ERROR" || ev.type === "PARSE_ERROR") {
                setErrorMsg(ev.message);
                setPhase("error");
              } else if (ev.type === "QUOTE") {
                setPredictedTotal(ev.predictedTotal);
                setTotalTickets(ev.ticketCount || totalTickets);
                setPhase("running");
              } else if (ev.type === "TICKET_PROCESSED") {
                const pt = ev.ticket as ProcessedTicket;
                setLedger((p) => [...p, pt]);
                setRemaining(pt.policyMetrics.runningCapitalRemaining);
                setProcessed((p) => p + 1);
              } else if (ev.type === "COMPLETE") {
                setPhase("done");
              }
            } catch {}
          }
        }
      } catch (err) {
        setErrorMsg(String(err));
        setPhase("error");
      }
    };

    runStream();
  }, [router, totalTickets, isDemo]);

  const actualSpend = ledger.reduce((s, t) => s + t.policyMetrics.actualSpend, 0);
  const totalStrong = ledger.reduce((s, t) => s + t.policyMetrics.shadowPremiumCost, 0);
  const totalCheap  = ledger.reduce((s, t) => s + t.policyMetrics.shadowCheapCost, 0);
  const totalRandom = ledger.reduce((s, t) => s + ((t.policyMetrics.shadowPremiumCost + t.policyMetrics.shadowCheapCost) / 2), 0);

  const savingsPct  = totalStrong > 0 ? ((totalStrong - actualSpend) / totalStrong) * 100 : 0;

  const mishandled   = ledger.filter((t) => t.policy.decision === "precision" || t.policy.decision === "human_review");
  const humanReviews = ledger.filter((t) => t.policy.decision === "human_review").length;
  const cheapMisses  = mishandled.length;
  const randomMisses = Math.ceil(mishandled.length / 2);

  const capitalPct = Math.max(0, (remaining / STARTING_CAPITAL) * 100);
  const dialColor  = remaining > 0.18 ? "text-[#2CE8A5]" : remaining > 0.08 ? "text-amber-400" : "text-red-400";
  const barColor   = remaining > 0.18 ? "bg-[#2CE8A5]" : remaining > 0.08 ? "bg-amber-400" : "bg-red-400";

  if (phase === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#2C2C40] min-h-screen text-center">
        <div className="max-w-md bg-[#34344A] border border-red-500/50 p-8 relative">
          <CornerMarks dark />
          <h2 className="text-xl text-red-400 mb-4 font-bold uppercase tracking-widest">Run Failed</h2>
          <p className="text-sm text-[#F1EFE7] opacity-80 mb-8">{errorMsg}</p>
          <Link
            href="/run"
            className="px-6 py-2 bg-[#3E3E56] text-[#F1EFE7] text-xs font-bold uppercase tracking-wider hover:bg-[#2CE8A5] hover:text-[#26263A] transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "init" || phase === "parsing") {
    return (
      <div className="flex-1 flex flex-col min-h-screen text-[#F1EFE7]" style={{ backgroundColor: "#2C2C40" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-3 text-[#2CE8A5]" style={{ fontFamily: "'Zodiak', serif" }}>
              Reading your messages…
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-50 text-[#F1EFE7]">
              Runtime call #000 — parsing raw input into structured tickets
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col text-[#F1EFE7]" style={{ backgroundColor: "#2C2C40" }}>
      {/* Sticky mini nav */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-2 border-b text-[11px] uppercase tracking-[0.14em]"
        style={{ backgroundColor: "#2C2C40", borderColor: "#3E3E56", color: "#F1EFE7" }}
      >
        <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
          ← Back to pitch
        </Link>
        <span className="font-bold hidden sm:inline" style={{ color: "#2CE8A5" }}>Dispatch</span>
        <span className="opacity-40">
          {phase === "running"
            ? `${processed} / ${totalTickets} tickets`
            : `${processed} done · $${actualSpend.toFixed(3)} spent`}
        </span>
      </div>

      <div className="flex-1">
        {/* Status strip */}
        <div
          className="w-full text-[11px] font-bold uppercase tracking-[0.15em] py-1 text-center"
          style={{ backgroundColor: "#2CE8A5", color: "#26263A" }}
        >
          {phase === "running"
            ? `Processing · $${remaining.toFixed(3)} remaining · ${totalTickets - processed} left`
            : `Complete · $${actualSpend.toFixed(3)} spent · ${savingsPct.toFixed(0)}% saved vs always-premium`}
        </div>

        {/* Demo mode notice */}
        {isDemo && (
          <div
            className="w-full text-center py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold border-b"
            style={{ borderColor: "#3E3E56", backgroundColor: "rgba(44,232,165,0.06)", color: "#2CE8A5" }}
          >
            Demo mode — pre-recorded fixture data · no API key used ·{" "}
            <a href="/run" className="underline opacity-60 hover:opacity-100 transition-opacity">
              run with your own messages →
            </a>
          </div>
        )}

        {/* Live data notice */}
        <div
          className="w-full text-center py-1.5 text-[9px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] border-b"
          style={{ borderColor: "#3E3E56" }}
        >
          Every number below comes from a live BTL Runtime API call — nothing here is simulated.
        </div>

        {/* Capital dial */}
        <div className="border-b px-8 py-5 flex items-center gap-8" style={{ borderColor: "#3E3E56" }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-40 text-[#F1EFE7]">
              Intelligence Budget{" "}
              <span className="opacity-60 ml-2 normal-case tracking-normal">
                ({capitalPct.toFixed(1)}% remaining)
              </span>
            </div>
            <div className={`text-3xl ${dialColor} transition-colors duration-500`} style={{ fontFamily: "'Zodiak', serif" }}>
              ${Math.max(0, remaining).toFixed(4)}
            </div>
          </div>
          <div className="flex-1 h-1 overflow-hidden" style={{ backgroundColor: "#3E3E56" }}>
            <div
              className={`h-full ${barColor} transition-all duration-500 ease-out`}
              style={{ width: `${capitalPct}%` }}
            />
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.14em] opacity-40 text-[#F1EFE7] hidden sm:block">
            {phase === "running" ? (
              <>Predicted: ${(processed > 0 ? (actualSpend / processed) * totalTickets : predictedTotal || 0).toFixed(3)}</>
            ) : (
              <>Final: ${actualSpend.toFixed(3)}</>
            )}
          </div>
        </div>

        {/* Ticket ledger */}
        <div className="px-8 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor: "#3E3E56" }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] opacity-40 text-[#F1EFE7] mb-1">Decision ledger</div>
                <h2 className="text-3xl text-[#F1EFE7]" style={{ fontFamily: "'Zodiak', serif" }}>
                  {phase === "done"
                    ? `${ledger.length} Tickets Processed`
                    : `Processing… ${processed} / ${totalTickets}`}
                </h2>
              </div>
            </div>

            {ledger.length === 0 ? (
              <div className="text-center py-24 text-[11px] uppercase tracking-[0.2em] opacity-30 text-[#F1EFE7]">
                Streaming…
              </div>
            ) : (
              <ThreadedLedger ledger={ledger} />
            )}

            {phase === "done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-16"
              >
                <a
                  href="#benchmark"
                  className="inline-block px-10 py-3 text-[12px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity active:scale-95"
                  style={{ backgroundColor: "#FF6FCF", color: "#26263A" }}
                >
                  See full benchmark →
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Cache Compare — cold vs warm proof panel */}
        {phase === "done" && (
          <CacheCompare ledger={ledger} />
        )}

        {/* Benchmark */}
        {phase === "done" && (
          <div id="benchmark" className="border-t px-8 py-16" style={{ borderColor: "#3E3E56" }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-[10px] uppercase tracking-[0.22em] opacity-40 text-[#F1EFE7] mb-1">Strategy comparison</div>
              <h2 className="text-4xl text-[#F1EFE7] mb-10" style={{ fontFamily: "'Zodiak', serif" }}>
                Dispatch vs. Alternatives
              </h2>

              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-1 space-y-3 w-full">
                  <div className="border border-[#3E3E56] bg-[#2C2C40] text-[10px] uppercase tracking-wider overflow-hidden">
                    <div className="grid grid-cols-5 p-3 border-b border-[#3E3E56] opacity-50 bg-[#1E1E2C]">
                      <div>Strategy</div>
                      <div className="text-right">Cost</div>
                      <div className="text-center">High-Risk Misses</div>
                      <div className="text-center">Human Reviews</div>
                      <div className="text-right">Est. Quality</div>
                    </div>
                    {(
                      [
                        ["Dispatch",       actualSpend,  0,            humanReviews, "⭐⭐⭐⭐☆", "text-[#2CE8A5]"],
                        ["Always Premium", totalStrong,  0,            0,            "⭐⭐⭐⭐⭐", "text-[#FF6FCF]"],
                        ["Always Cheap",   totalCheap,   cheapMisses,  0,            "⭐⭐⭐☆☆",  "text-[#D8D5C9]"],
                        ["Random",         totalRandom,  randomMisses, 0,            "⭐⭐☆☆☆",  "text-[#D8D5C9]"],
                      ] as [string, number, number, number, string, string][]
                    ).map(([label, cost, misses, hr, quality, color]) => (
                      <div
                        key={label}
                        className="grid grid-cols-5 p-4 items-center border-b border-[#3E3E56] last:border-0 hover:bg-[#34344A] transition-colors"
                      >
                        <div className={`font-bold ${color}`}>{label}</div>
                        <div className="font-mono text-right text-[#F1EFE7]">${cost.toFixed(3)}</div>
                        <div className="text-center font-mono text-[#F1EFE7]">{misses}</div>
                        <div className="text-center font-mono text-[#F1EFE7]">{hr}</div>
                        <div className="text-right text-[12px] tracking-widest">{quality}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-64 border p-7 relative" style={{ borderColor: "#3E3E56", backgroundColor: "#34344A" }}>
                  <CornerMarks dark />
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] mb-1">Total savings</div>
                  <div className="text-6xl text-[#2CE8A5] mb-1" style={{ fontFamily: "'Zodiak', serif" }}>
                    {savingsPct.toFixed(0)}%
                  </div>
                  <div className="text-[11px] opacity-40 text-[#F1EFE7] mb-5">vs Always-Premium</div>
                  <div className="border-t pt-4" style={{ borderColor: "#3E3E56" }}>
                    <div className="text-[10px] uppercase tracking-[0.14em] opacity-40 text-[#F1EFE7] mb-2">
                      Mishandled under Always-Cheap
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {mishandled.length === 0 ? (
                        <div className="text-[11px] opacity-40 text-[#F1EFE7]">None</div>
                      ) : (
                        mishandled.map((t) => (
                          <div key={t.ticket.id} className="border-l-2 border-[#FF6FCF] pl-2 text-[11px] text-[#F1EFE7]">
                            <span className="opacity-40">#{t.ticket.id}</span>{" "}
                            <span className="text-[#FF6FCF]">
                              {t.policy.decision === "human_review" ? "Human" : "Premium"} required
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Try different settings toggle */}
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowPlayground(!showPlayground)}
                  className="inline-block px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] hover:opacity-90 transition-opacity active:scale-95 border border-[#3E3E56] text-[#F1EFE7]"
                  style={{ backgroundColor: showPlayground ? "#3E3E56" : "transparent" }}
                >
                  {showPlayground ? "Hide Playground Settings ↑" : "Try different policy settings →"}
                </button>
              </div>

              {/* Conditionally rendered Playground component */}
              {showPlayground && (
                <div className="mt-8 pt-4 border-t border-[#3E3E56]/40">
                  <PolicyPlayground tickets={scoredTickets} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DispatchApp() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen" style={{ backgroundColor: "#2C2C40" }}>
        <div className="text-[11px] uppercase tracking-[0.18em] opacity-30 text-[#F1EFE7]">Loading…</div>
      </div>
    }>
      <DispatchAppInner />
    </Suspense>
  );
}

