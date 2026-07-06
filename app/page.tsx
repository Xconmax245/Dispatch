"use client";

import Link from "next/link";
import { CornerMarks } from "@/components/CornerMarks";

export default function LandingPage() {
  return (
    <div className="flex-1 dot-grid-bg min-h-screen flex flex-col font-mono" style={{ backgroundColor: "#F1EFE7" }}>

      {/* Nav */}
      <header className="px-8 py-4 border-b flex justify-between items-center" style={{ backgroundColor: "#EDEBE3", borderColor: "#D8D5C9" }}>
        <div className="text-sm font-bold uppercase tracking-[0.25em]" style={{ color: "#26263A" }}>Dispatch</div>
        <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#26263A" }}>
          <Link href="/run" className="opacity-50 hover:opacity-100 transition-opacity">Run</Link>
          <Link href="/docs" className="opacity-50 hover:opacity-100 transition-opacity">Docs</Link>
          <span className="opacity-30">BTL Runtime Demo</span>
        </nav>
      </header>

      <main className="flex-1 flex flex-col text-[#26263A]">

        {/* 1. Hero */}
        <section className="px-8 py-24 flex flex-col items-center text-center border-b border-[#D8D5C9] relative overflow-hidden">
          <div data-aos="fade-down" className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 border border-[#26263A]/20 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#26263A]/5" style={{ borderRadius: "2px" }}>
            <span className="opacity-50">·</span> Powered by BTL Runtime
          </div>
          <h1 data-aos="fade-up" className="text-5xl md:text-7xl mb-6" style={{ fontFamily: "'Zodiak', serif" }}>
            Intelligence, Allocated.
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="max-w-xl text-sm leading-relaxed opacity-80 mb-10">
            Dispatch decides how much AI a message deserves — cheap model for routine questions, your best model for real risk — and proves what it saved with real cost data, per call.
          </p>
          <div data-aos="fade-up" data-aos-delay="150" className="mb-14">
            <Link
              href="/run"
              className="px-10 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#26263A", color: "#F1EFE7" }}
            >
              Start a Run →
            </Link>
          </div>

          <div data-aos="fade-up" data-aos-delay="200" className="w-full max-w-sm relative border px-8 py-5 text-left bg-[#EDEBE3]" style={{ borderColor: "#D8D5C9" }}>
            <CornerMarks />
            <div className="text-[9px] uppercase tracking-[0.2em] mb-1 opacity-50">Starting capital</div>
            <div className="text-xs opacity-80 mb-3">Every run starts with a fixed budget.</div>
            <div className="text-3xl" style={{ fontFamily: "'Zodiak', serif", color: "#26263A" }}>$0.30</div>
          </div>
        </section>

        {/* 2. How it works */}
        <section className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">The Process</div>
            <h2 className="text-3xl" style={{ fontFamily: "'Zodiak', serif" }}>How Dispatch Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Paste messages, or connect a bot",
                desc: "No complex integration. Paste raw text, email threads, or WhatsApp exports — or hook your own Telegram, Discord, or email bot to /api/intercept directly.",
              },
              {
                num: "02",
                title: "Dispatch scores each one for risk and value",
                desc: "Every message is evaluated across four dimensions: risk, complexity, confidence, and business value — to determine the real consequence of mishandling it.",
              },
              {
                num: "03",
                title: "It spends accordingly — and shows the receipt",
                desc: "Routine questions get the cheap model. Real escalations get your best one. You see every routing decision, every cost, every reason.",
              },
            ].map((step, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i * 150} className="border p-6 bg-[#F7F5ED] relative hover:-translate-y-1 transition-transform" style={{ borderColor: "#D8D5C9" }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#2CE8A5]/20" />
                <div className="text-[10px] uppercase tracking-[0.2em] mb-4 text-[#2CE8A5] font-bold border-b border-[#2CE8A5]/30 pb-1 inline-block">
                  Step {step.num}
                </div>
                <h3 className="text-lg mb-2 font-bold">{step.title}</h3>
                <p className="text-xs opacity-70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. The problem */}
        <section className="px-8 py-32 bg-[#E5E3DB] border-y border-[#D8D5C9] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#26263A 1px, transparent 1px), linear-gradient(90deg, #26263A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div data-aos="fade-right">
              <div className="w-12 h-1 bg-[#2CE8A5] mb-8" />
              <h2 className="text-4xl md:text-5xl leading-tight mb-6" style={{ fontFamily: "'Zodiak', serif" }}>
                The one-size-fits-all model is <span className="text-red-500/80 italic">broken.</span>
              </h2>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#26263A] bg-[#2CE8A5]/20 inline-block px-3 py-1 border border-[#2CE8A5]/40 mb-8">
                The Problem
              </div>
            </div>
            <div data-aos="fade-left" data-aos-delay="100" className="flex flex-col justify-center space-y-8 text-sm opacity-90 leading-relaxed">
              <div className="border-l-2 border-[#26263A]/20 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#E5E3DB] border-2 border-[#26263A]" />
                <p>
                  Treating every message the same is a waste of money on easy questions and a liability on hard ones. You either overpay for{" "}
                  <span className="font-mono bg-white/50 px-1">&ldquo;where is my package&rdquo;</span>, or you risk a cheap hallucination on a genuine escalation.
                </p>
              </div>
              <div className="border-l-2 border-[#2CE8A5] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#2CE8A5] border-2 border-[#E5E3DB] shadow-[0_0_10px_rgba(44,232,165,0.5)]" />
                <p>
                  Powered by <strong>BTL Runtime</strong>, Dispatch uses live cost headers and routing decisions to decouple the decision from the provider. Proof over claims: you see exactly why a model was chosen, and exactly what it cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Works with what you already have */}
        <section className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Integration</div>
            <h2 className="text-3xl" style={{ fontFamily: "'Zodiak', serif" }}>Works with what you already have</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <p className="text-sm leading-relaxed opacity-80 mb-6">
                Any bot, on any platform, that can make an HTTP request can use Dispatch as its decision layer before replying.
                You call <code className="font-mono bg-[#EDEBE3] px-1 border border-[#D8D5C9]">/api/intercept</code> with the incoming message text, get back a tier decision and a response, and send that reply to your user. No SDK. No lock-in.
              </p>
              <p className="text-sm leading-relaxed opacity-80 mb-8">
                This is exactly how our own Telegram bot works — it uses <code className="font-mono bg-[#EDEBE3] px-1 border border-[#D8D5C9]">/api/intercept</code> on every incoming message, then forwards the reply. Message it live, or read the code.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/docs"
                  className="px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-95 bg-[#26263A] text-[#F1EFE7]"
                >
                  Read the technical docs →
                </Link>
              </div>
            </div>
            <div data-aos="fade-left" className="space-y-4">
              <div className="bg-[#1E1E2C] border border-[#3E3E56] p-6 text-[#F1EFE7] relative font-mono text-[11px] shadow-2xl">
                <CornerMarks dark />
                <div className="text-[9px] uppercase tracking-[0.2em] mb-3 opacity-40 border-b border-[#3E3E56]/50 pb-2">
                  POST /api/intercept
                </div>
                <pre className="overflow-x-auto text-[#2CE8A5] leading-relaxed whitespace-pre-wrap">
{`{
  "text": "My package never arrived...",
  "mode": "execute"
}`}
                </pre>
              </div>
              <div className="bg-[#1E1E2C] border border-[#3E3E56] p-6 text-[#F1EFE7] relative font-mono text-[11px] shadow-2xl">
                <CornerMarks dark />
                <div className="text-[9px] uppercase tracking-[0.2em] mb-3 opacity-40 border-b border-[#3E3E56]/50 pb-2">
                  Response — tier: precision
                </div>
                <pre className="overflow-x-auto text-[#FF6FCF] leading-relaxed whitespace-pre-wrap">
{`{
  "tier": "precision",
  "reason": "Refund risk detected.",
  "scores": { "riskScore": 0.87 },
  "evidence": {
    "benchmarkCost": 0.000007,
    "customerCharge": 0.000085
  },
  "reply": "We sincerely apologize..."
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Honest about the numbers — standalone section */}
        <section className="px-8 py-24 bg-[#26263A] text-[#F1EFE7] border-y border-[#3E3E56]">
          <div className="max-w-4xl mx-auto">
            <div data-aos="fade-up" className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3">Pricing Reality</div>
                <div className="w-12 h-px bg-[#2CE8A5]" />
              </div>
              <div>
                <h2 className="text-3xl mb-6" style={{ fontFamily: "'Zodiak', serif" }}>
                  Honest about the numbers.
                </h2>
                <div className="space-y-4 text-sm leading-relaxed opacity-80 max-w-2xl">
                  <p>
                    Not all savings come from caching. BTL Runtime&apos;s retail pricing means a cold call can cost <em>more</em> than the raw benchmark — especially when the gateway applies a markup above wholesale provider cost. This is real behavior, visible in the <code className="font-mono bg-[#F1EFE7]/10 px-1">x-btl-customer-charge</code> and <code className="font-mono bg-[#F1EFE7]/10 px-1">x-btl-benchmark-cost</code> headers on every call.
                  </p>
                  <p>
                    Real savings come from not sending every message to your most expensive model in the first place. That is what Dispatch&apos;s routing policy does — and the numbers it shows are 100% real, pulled from Runtime&apos;s own response headers on every single call, positive or negative.
                  </p>
                </div>
                <div className="mt-8 flex gap-4">
                  <Link href="/docs#pricing" className="text-[10px] uppercase tracking-[0.2em] text-[#2CE8A5] hover:opacity-70 transition-opacity">
                    Read the full technical explanation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. What gets measured */}
        <section className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">The Evidence</div>
            <h2 className="text-3xl" style={{ fontFamily: "'Zodiak', serif" }}>What gets measured</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div data-aos="fade-up" className="relative group">
              <div className="bg-[#34344A] p-6 border-l-4 border-l-[#2CE8A5] border-y border-r border-[#3E3E56] text-[#F1EFE7] relative z-10 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                <CornerMarks dark />
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5 text-center text-[#2CE8A5] bg-[#2CE8A5]/10 py-2 border border-[#2CE8A5]/20">
                  Illustrative Output
                </div>
                <div className="space-y-5 grayscale-[50%] group-hover:grayscale-0 transition-all duration-500">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 mb-2">Message</div>
                    <div className="text-xs font-bold leading-relaxed border-l-2 border-[#3E3E56] pl-3 opacity-90 italic">
                      &ldquo;My package never arrived and your support team is ignoring me.&rdquo;
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-[#3E3E56] pt-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider opacity-50 mb-1">Risk Score</div>
                      <div className="font-bold font-mono text-lg text-amber-400">0.87</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider opacity-50 mb-1">Routed To</div>
                      <div
                        className="text-[10px] font-bold font-mono text-[#FF6FCF] uppercase tracking-widest bg-[#FF6FCF]/10 inline-block px-2 py-1 mt-1 border border-[#FF6FCF]/30"
                        style={{ borderRadius: "2px" }}
                      >
                        › Precision
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#3E3E56] pt-4 space-y-2.5">
                    {[
                      { label: "If always premium", value: "$0.1200", color: "bg-[#FF6FCF]/35", width: "100%", textColor: "text-[#F1EFE7]", num: "01" },
                      { label: "What Dispatch spent", value: "$0.1200", color: "bg-[#2CE8A5]/40", width: "100%", textColor: "text-[#2CE8A5]", num: "02" },
                    ].map((row) => (
                      <div key={row.num} className="flex items-center gap-2">
                        <span className="font-mono text-[9px] opacity-20 w-5 text-right">{row.num}</span>
                        <div className="flex-1">
                          <div className={`text-[9px] uppercase tracking-wider opacity-50 mb-1 ${row.textColor}`}>{row.label}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#2C2C40] relative overflow-hidden" style={{ borderRadius: "1px" }}>
                              <div className={`absolute inset-y-0 left-0 ${row.color}`} style={{ width: row.width, boxShadow: "inset 1px 0 0 rgba(255,255,255,0.1)" }} />
                            </div>
                            <span className={`font-mono text-[9px] w-14 text-right ${row.textColor}`}>{row.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#2C2C40] border border-[#3E3E56] translate-y-3 translate-x-3 -z-10 opacity-60 transition-transform duration-500 group-hover:translate-y-4 group-hover:translate-x-4" />
              <div className="absolute inset-0 bg-[#2C2C40] border border-[#3E3E56] translate-y-6 translate-x-6 -z-20 opacity-30 transition-transform duration-500 group-hover:translate-y-8 group-hover:translate-x-8" />
            </div>

            <div data-aos="fade-up" data-aos-delay="150" className="flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-3">Proof, not claims.</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                When you run Dispatch, the UI becomes a dark-mode decision ledger. Every ticket generates an evidence card containing live <code className="font-mono bg-[#EDEBE3] px-1 border border-[#D8D5C9]">x-btl-*</code> headers: cache tiers, benchmark costs, and the exact amount spent. No fabricated data. No guesswork.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="px-8 py-32 text-center bg-[#26263A] text-[#F1EFE7]">
          <h2 data-aos="zoom-in" className="text-4xl md:text-5xl mb-8" style={{ fontFamily: "'Zodiak', serif" }}>
            Paste something. Watch it think.
          </h2>
          <p data-aos="fade-up" className="text-sm opacity-60 mb-10 max-w-md mx-auto leading-relaxed">
            No account required. No setup. Paste a message and see the routing decision and cost receipt in real time.
          </p>
          <div data-aos="fade-up" data-aos-delay="150">
            <Link
              href="/run"
              className="inline-block px-12 py-5 text-xs font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#2CE8A5", color: "#26263A" }}
            >
              Start a Run →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-[#1E1E2C] border-t border-[#3E3E56] text-[#F1EFE7] overflow-hidden pt-24 pb-8 px-8">
        <div className="absolute top-0 left-0 w-full text-center select-none pointer-events-none overflow-hidden flex justify-center -mt-10 md:-mt-16 opacity-[0.03]">
          <span className="text-[12rem] md:text-[20rem] font-bold uppercase tracking-tighter leading-none" style={{ fontFamily: "'Zodiak', serif" }}>
            DISPATCH
          </span>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-8">
                <div className="text-2xl font-bold uppercase tracking-[0.25em]" style={{ color: "#F1EFE7" }}>Dispatch</div>
              </div>
              <p className="text-xs opacity-60 leading-relaxed max-w-sm mb-8 font-mono">
                An open-source demonstration of intelligence allocation.<br /><br />
                Built to show cost-aware AI routing via BTL Runtime — real decisions, real costs, per message.
              </p>
            </div>
            <div className="bg-[#151520] border border-[#3E3E56] p-4 font-mono text-[9px] text-[#2CE8A5] uppercase tracking-widest max-w-xs shadow-inner">
              <div className="flex justify-between items-center mb-2 border-b border-[#3E3E56]/50 pb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2CE8A5] animate-pulse" />
                  System Status
                </span>
                <span className="opacity-50">OK</span>
              </div>
              <div className="opacity-70 space-y-1">
                <div>&gt; ping api.badtheorylabs.com</div>
                <div>&gt; gateway: connected</div>
                <div>&gt; mode: live</div>
              </div>
            </div>
          </div>

          <div className="hidden md:block md:col-span-2" />

          <div className="md:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2CE8A5] mb-6 border-b border-[#3E3E56] pb-2 inline-block">Navigate</div>
            <ul className="space-y-4 text-xs font-mono opacity-80">
              <li className="flex items-center gap-2 group">
                <span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                <Link href="/run" className="group-hover:text-[#F1EFE7] transition-colors">Run Dispatch</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                <Link href="/docs" className="group-hover:text-[#F1EFE7] transition-colors">Documentation</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                <Link href="/docs#api" className="group-hover:text-[#F1EFE7] transition-colors">API Reference</Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2CE8A5] mb-6 border-b border-[#3E3E56] pb-2 inline-block">BTL Runtime</div>
            <ul className="space-y-4 text-xs font-mono opacity-80">
              <li className="flex items-center gap-2 group">
                <span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                <Link href="https://badtheorylabs.com" className="group-hover:text-[#F1EFE7] transition-colors">Dashboard</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                <Link href="https://badtheorylabs.com/docs" className="group-hover:text-[#F1EFE7] transition-colors">BTL Docs</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-24 pt-6 border-t border-[#3E3E56] flex flex-col md:flex-row justify-between items-center gap-6 font-mono relative z-10">
          <div className="text-[9px] uppercase tracking-[0.2em] opacity-30 text-center md:text-left flex items-center gap-3">
            <span>© {new Date().getFullYear()} Bad Theory Labs</span>
            <span className="hidden md:inline">{"///"}</span>
            <span className="hidden md:inline">All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.2em] opacity-40">
            <Link href="#" className="hover:text-[#2CE8A5] hover:opacity-100 transition-all">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#2CE8A5] hover:opacity-100 transition-all">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
