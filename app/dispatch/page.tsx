"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CornerMarks } from "@/components/CornerMarks";
import Link from "next/link";
import type { ProcessedTicket } from "@/lib/ticket-types";

const STARTING_CAPITAL = 0.3;

// ─── Evidence card ────────────────────────────────────────────────────────────

function EvidenceCard({ runtime }: { runtime?: ProcessedTicket["runtime"] }) {
  const [open, setOpen] = useState(false);
  
  if (!runtime) {
    return (
      <div className="w-full border border-[#3E3E56] py-2 text-[10px] uppercase tracking-[0.18em] text-[#FF6FCF]/50 text-center bg-[#2C2C40]">
        Execution Skipped
        <div className="text-[8px] opacity-70 mt-0.5 normal-case tracking-normal">Reason: Human review required before inference.</div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-[#3E3E56] py-2 text-[10px] uppercase tracking-[0.18em] text-[#D8D5C9] hover:bg-[#3E3E56]/30 transition-colors"
      >
        View Runtime Evidence →
      </button>
    );
  }
  
  const savedPct = runtime.benchmarkCost > 0 ? ((runtime.runtimeSaved / runtime.benchmarkCost) * 100).toFixed(1) : "0.0";
  
  const rows: [string, string][] = [
    ["Provider",     `${runtime.provider} (${runtime.model})`],
    ["Gateway Mode", runtime.gatewayMode],
    ["Cache",        runtime.cacheTier || "none"],
    ["Benchmark",    `$${(runtime.benchmarkCost  || 0).toFixed(4)}`],
    ["Charged",      `$${(runtime.customerCharge || 0).toFixed(4)}`],
    ["Saved",        `${savedPct}%`],
    ["Request ID",   (runtime.requestId || "—").slice(-14)],
  ];

  return (
    <div className="border border-[#3E3E56] bg-[#1E1E2C] p-4 text-[10px] uppercase tracking-[0.12em] font-mono space-y-1.5 shadow-lg relative z-20">
      <div className="opacity-40 mb-3 text-[9px] uppercase tracking-widest border-b border-[#3E3E56]/50 pb-2">Runtime Execution</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between py-0.5">
          <span className="opacity-50">{k}</span>
          <span className={["Cache", "Charged", "Saved"].includes(k) ? "text-[#2CE8A5] font-bold" : "text-[#F1EFE7]"}>{v}</span>
        </div>
      ))}
      <button onClick={() => setOpen(false)} className="w-full mt-3 pt-3 border-t border-[#3E3E56]/50 opacity-50 hover:opacity-100 transition-opacity text-[#F1EFE7]">
        Close ↑
      </button>
    </div>
  );
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ badge }: { badge: string }) {
  const text = (badge || "Routine Inquiry").toLowerCase();
  let color = "bg-[#3E3E56] text-[#D8D5C9]";
  
  if (text.includes("human") || text.includes("review")) color = "bg-[#FF6FCF] text-[#26263A]";
  else if (text.includes("reputation") || text.includes("chargeback") || text.includes("risk")) color = "bg-red-400 text-[#26263A]";
  else if (text.includes("time") || text.includes("sensitive")) color = "bg-amber-400 text-[#26263A]";
  else color = "bg-[#2CE8A5] text-[#26263A]";

  return <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${color}`}>{badge || "Routine Inquiry"}</span>;
}

// ─── Cost comparison ──────────────────────────────────────────────────────────

function CostComparison({ premiumCost, actualCost, policySavings }: { premiumCost: number; actualCost: number; policySavings: number }) {
  const MAX = Math.max(premiumCost, 0.001);
  const actualPct = Math.max(3, (actualCost / MAX) * 100);
  const savedPct  = premiumCost > 0 ? Math.round((policySavings / premiumCost) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        <div className="flex-1 flex flex-col gap-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 text-[#F1EFE7] mb-1">If always premium</div>
            <div className="h-2.5 bg-[#2C2C40] border border-[#3E3E56] relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 right-0 bg-[#FF6FCF]/45 border-r border-[#FF6FCF] flex items-center px-1.5" />
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 text-[#F1EFE7] mb-1">What Dispatch spent</div>
            <div className="h-2.5 bg-[#2C2C40] border border-[#3E3E56] relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[#2CE8A5]/40 border-r border-[#2CE8A5] flex items-center px-1.5 transition-all duration-700 ease-out"
                style={{ width: `${actualPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#2CE8A5] flex items-baseline gap-2 mt-1">
        <span className="opacity-70">Policy Savings</span>
        <span className="font-bold text-sm">${policySavings > 0 ? policySavings.toFixed(4) : "0.0000"}</span>
        <span className="opacity-50">({savedPct}%)</span>
      </div>
    </div>
  );
}

// ─── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({ t }: { t: ProcessedTicket }) {
  const isHuman = t.policy.decision === "human_review";
  const tierColor = isHuman ? "text-[#FF6FCF]/70" : t.policy.decision === "economy" ? "text-[#2CE8A5]" : "text-[#FF6FCF]";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-[#34344A] border border-[#3E3E56] p-5 relative flex flex-col gap-4 hover:-translate-y-1 hover:border-[#F1EFE7]/30 transition-all"
    >
      <CornerMarks dark />
      <p className="text-sm text-[#F1EFE7] font-bold leading-snug line-clamp-3 italic opacity-90 border-l-2 border-[#3E3E56] pl-3">"{t.ticket.text}"</p>
      
      <div className="flex items-center gap-3 flex-wrap">
        <PriorityBadge badge={t.classification.classificationBadge} />
        <span className="ml-auto text-[9px] opacity-30 text-[#F1EFE7] uppercase tracking-wide">#{t.ticket.id}</span>
      </div>

      <div className="flex justify-between items-center bg-[#2C2C40] p-2 border border-[#3E3E56]">
        <div className="text-[9px] uppercase tracking-[0.14em] text-[#F1EFE7] opacity-60">Policy Confidence</div>
        <div className="text-[12px] font-mono text-[#F1EFE7] font-bold">{(t.classification.confidence * 100).toFixed(0)}%</div>
      </div>

      <div className="border-t border-[#3E3E56] pt-3">
        <div className="text-[9px] uppercase tracking-[0.14em] opacity-40 text-[#F1EFE7] mb-2">Signals</div>
        <ul className="text-[10px] text-[#F1EFE7] space-y-1.5 opacity-80 pl-1 font-mono">
          {t.classification.signals?.map((s, idx) => {
            const confColor = s.confidence === "HIGH" ? "text-[#FF6FCF]" : s.confidence === "MEDIUM" ? "text-amber-400" : "text-[#2CE8A5]";
            return (
              <li key={idx} className="flex justify-between items-center bg-[#2C2C40] p-1.5 border border-[#3E3E56]">
                <span className="truncate">{s.name}</span>
                <span className={`text-[8px] font-bold tracking-widest px-1 bg-[#1E1E2C] ${confColor}`}>{s.confidence}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <CostComparison 
        premiumCost={t.policyMetrics.shadowPremiumCost} 
        actualCost={t.policyMetrics.actualSpend} 
        policySavings={t.policyMetrics.policySavings}
      />
      
      <div className="border-t border-[#3E3E56] pt-3">
        <div className="flex items-center justify-between mb-3 text-[9px] uppercase tracking-[0.14em]">
          <span className="opacity-40 text-[#F1EFE7]">Decision Path</span>
        </div>
        
        <div className="flex flex-col gap-1 text-[9px] uppercase tracking-wider font-bold mb-4 opacity-70">
          {t.policy.decisionPath.map((step, i) => (
            <div key={i} className="flex gap-2 items-center">
              {i > 0 && <span className="opacity-40 ml-1 mr-1">↓</span>}
              <span className={i === t.policy.decisionPath.length - 1 ? tierColor : ""}>{step}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-[#F1EFE7] opacity-90 leading-relaxed bg-[#2C2C40] p-3 border border-[#3E3E56] italic mb-3">
          "{t.policy.reason}"
        </div>
      </div>

      <div className="mt-auto pt-2">
        <EvidenceCard runtime={t.runtime} />
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = "init" | "parsing" | "running" | "done" | "error";

export default function DispatchApp() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("init");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [remaining, setRemaining]     = useState(STARTING_CAPITAL);
  const [predictedTotal, setPredictedTotal] = useState<number | null>(null);
  const [ledger, setLedger]           = useState<ProcessedTicket[]>([]);
  const [processed, setProcessed]     = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Only run once
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const rawText = sessionStorage.getItem("dispatch_input");
    
    if (!rawText || rawText.trim().length === 0) {
      router.replace("/run");
      return;
    }

    sessionStorage.removeItem("dispatch_input");
    
    setPhase("parsing");
    
    const runStream = async () => {
      try {
        const res = await fetch("/api/run-batch", {
          method: "POST",
          body: JSON.stringify({ startingCapital: STARTING_CAPITAL, rawText }),
          headers: { "Content-Type": "application/json" },
        });

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
            } catch (_) {}
          }
        }
      } catch (err) {
        setErrorMsg(String(err));
        setPhase("error");
      }
    };

    runStream();
  }, [router, totalTickets]);

  const actualSpend   = ledger.reduce((s, t) => s + t.policyMetrics.actualSpend, 0);
  const totalStrong   = ledger.reduce((s, t) => s + t.policyMetrics.shadowPremiumCost, 0);
  const totalCheap    = ledger.reduce((s, t) => s + t.policyMetrics.shadowCheapCost, 0);
  const totalRandom   = ledger.reduce((s, t) => s + ((t.policyMetrics.shadowPremiumCost + t.policyMetrics.shadowCheapCost) / 2), 0);
  
  const savingsPct    = totalStrong > 0 ? ((totalStrong - actualSpend) / totalStrong) * 100 : 0;
  
  // High Risk Miss is any ticket that WAS handled by Premium/Human Review under Dispatch, but WOULD HAVE BEEN handled by Cheap under an Always-Cheap strategy.
  const mishandled = ledger.filter((t) => t.policy.decision === "precision" || t.policy.decision === "human_review");
  const humanReviews = ledger.filter((t) => t.policy.decision === "human_review").length;
  
  // Always Cheap misses ALL of these.
  const cheapMisses = mishandled.length;
  // Random misses ~50% of them.
  const randomMisses = Math.ceil(mishandled.length / 2);

  const capitalPct    = Math.max(0, (remaining / STARTING_CAPITAL) * 100);
  const dialColor     = remaining > 0.18 ? "text-[#2CE8A5]" : remaining > 0.08 ? "text-amber-400" : "text-red-400";
  const barColor      = remaining > 0.18 ? "bg-[#2CE8A5]" : remaining > 0.08 ? "bg-amber-400" : "bg-red-400";

  if (phase === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#2C2C40] min-h-screen text-center">
        <div className="max-w-md bg-[#34344A] border border-red-500/50 p-8 relative">
          <CornerMarks dark />
          <h2 className="text-xl text-red-400 mb-4 font-bold uppercase tracking-widest">Run Failed</h2>
          <p className="text-sm text-[#F1EFE7] opacity-80 mb-8">{errorMsg}</p>
          <Link href="/run" className="px-6 py-2 bg-[#3E3E56] text-[#F1EFE7] text-xs font-bold uppercase tracking-wider hover:bg-[#2CE8A5] hover:text-[#26263A] transition-colors">
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
        <Link
          href="/"
          className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          ← Back to pitch
        </Link>
        <span className="font-bold hidden sm:inline" style={{ color: "#2CE8A5" }}>Dispatch</span>
        <span className="opacity-40">
          {phase === "running" ? `${processed} / ${totalTickets} tickets` :
           `${processed} done · $${actualSpend.toFixed(3)} spent`}
        </span>
      </div>

      <div className="flex-1">
        {/* Status strip */}
        <div className="w-full text-[11px] font-bold uppercase tracking-[0.15em] py-1 text-center" style={{ backgroundColor: "#2CE8A5", color: "#26263A" }}>
          {phase === "running"
            ? `Processing · $${remaining.toFixed(3)} remaining · ${totalTickets - processed} left`
            : `Complete · $${actualSpend.toFixed(3)} spent · ${savingsPct.toFixed(0)}% saved vs always-premium`}
        </div>

        {/* Capital dial */}
        <div className="border-b px-8 py-5 flex items-center gap-8" style={{ borderColor: "#3E3E56" }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-40 text-[#F1EFE7]">
              Intelligence Budget <span className="opacity-60 ml-2 normal-case tracking-normal">({capitalPct.toFixed(1)}% remaining)</span>
            </div>
            <div className={`text-3xl ${dialColor} transition-colors duration-500`} style={{ fontFamily: "'Zodiak', serif" }}>
              ${Math.max(0, remaining).toFixed(4)}
            </div>
          </div>
          <div className="flex-1 h-1 overflow-hidden" style={{ backgroundColor: "#3E3E56" }}>
            <div className={`h-full ${barColor} transition-all duration-500 ease-out`} style={{ width: `${capitalPct}%` }} />
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
                  {phase === "done" ? `${ledger.length} Tickets Processed` : `Processing… ${processed} / ${totalTickets}`}
                </h2>
              </div>
            </div>

            {ledger.length === 0 ? (
              <div className="text-center py-24 text-[11px] uppercase tracking-[0.2em] opacity-30 text-[#F1EFE7]">
                Streaming…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ledger.map((t, i) => <TicketCard key={i} t={t} />)}
              </div>
            )}

            {phase === "done" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="text-center mt-16"
              >
                <a href="#benchmark" className="inline-block px-10 py-3 text-[12px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity active:scale-95" style={{ backgroundColor: "#FF6FCF", color: "#26263A" }}>
                  See full benchmark →
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Benchmark */}
        {phase === "done" && (
          <div id="benchmark" className="border-t px-8 py-16" style={{ borderColor: "#3E3E56" }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-[10px] uppercase tracking-[0.22em] opacity-40 text-[#F1EFE7] mb-1">Strategy comparison</div>
              <h2 className="text-4xl text-[#F1EFE7] mb-10" style={{ fontFamily: "'Zodiak', serif" }}>Dispatch vs. Alternatives</h2>

              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-1 space-y-3 w-full">
                  <div className="border border-[#3E3E56] bg-[#2C2C40] text-[10px] uppercase tracking-wider overflow-hidden">
                    <div className="grid grid-cols-5 p-3 border-b border-[#3E3E56] opacity-50 bg-[#1E1E2C]">
                      <div>Strategy</div>
                      <div className="text-right">Cost</div>
                      <div className="text-center">High-Risk Misses</div>
                      <div className="text-center">Human Reviews</div>
                      <div className="text-right">Estimated Quality</div>
                    </div>
                    {([
                      ["Dispatch", actualSpend, 0, humanReviews, "⭐⭐⭐⭐☆", "text-[#2CE8A5]"],
                      ["Always Premium", totalStrong, 0, 0, "⭐⭐⭐⭐⭐", "text-[#FF6FCF]"],
                      ["Always Cheap", totalCheap, cheapMisses, 0, "⭐⭐⭐☆☆", "text-[#D8D5C9]"],
                      ["Random", totalRandom, randomMisses, 0, "⭐⭐☆☆☆", "text-[#D8D5C9]"],
                    ] as [string, number, number, number, string, string][]).map(([label, cost, misses, hr, quality, color]) => (
                      <div key={label} className="grid grid-cols-5 p-4 items-center border-b border-[#3E3E56] last:border-0 hover:bg-[#34344A] transition-colors">
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
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 text-[#F1EFE7] mb-1">Total savings</div>
                  <div className="text-6xl text-[#2CE8A5] mb-1" style={{ fontFamily: "'Zodiak', serif" }}>{savingsPct.toFixed(0)}%</div>
                  <div className="text-[11px] opacity-50 text-[#F1EFE7] mb-5">vs Always-Premium</div>
                  <div className="border-t pt-4" style={{ borderColor: "#3E3E56" }}>
                    <div className="text-[10px] uppercase tracking-[0.14em] opacity-50 text-[#F1EFE7] mb-2">Mishandled under Always-Cheap</div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {mishandled.length === 0
                        ? <div className="text-[11px] opacity-40 text-[#F1EFE7]">None</div>
                        : mishandled.map((t) => (
                          <div key={t.ticket.id} className="border-l-2 border-[#FF6FCF] pl-2 text-[11px] text-[#F1EFE7]">
                            <span className="opacity-50">#{t.ticket.id}</span>{" "}
                            <span className="text-[#FF6FCF]">{t.policy.decision === "human_review" ? "Human" : "Premium"} required</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
