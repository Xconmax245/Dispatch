"use client";

import Link from "next/link";
import { CornerMarks } from "@/components/CornerMarks";

export default function LandingPage() {
  return (
    <div className="flex-1 dot-grid-bg min-h-screen flex flex-col font-mono" style={{ backgroundColor: "#F1EFE7" }}>
      
      {/* 1. Nav Bar */}
      <header className="px-8 py-4 border-b flex justify-between items-center" style={{ backgroundColor: "#EDEBE3", borderColor: "#D8D5C9" }}>
        <div className="text-sm font-bold uppercase tracking-[0.25em]" style={{ color: "#26263A" }}>Dispatch</div>
        <div className="text-[10px] uppercase tracking-[0.18em] opacity-50" style={{ color: "#26263A" }}>BTL Runtime Demo</div>
      </header>

      <main className="flex-1 flex flex-col text-[#26263A]">
        
        {/* 2. Hero */}
        <section className="px-8 py-24 flex flex-col items-center text-center border-b border-[#D8D5C9] relative overflow-hidden">
          <div data-aos="fade-down" className="inline-block px-3 py-1 mb-6 border border-[#2CE8A5] text-[#2CE8A5] text-[10px] font-bold uppercase tracking-[0.2em] bg-[#2CE8A5]/10 rounded-full">
            Powered by BTL Runtime
          </div>
          <h1 data-aos="fade-up" className="text-5xl md:text-7xl mb-6" style={{ fontFamily: "'Zodiak', serif" }}>
            Intelligence, Allocated.
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="max-w-xl text-sm leading-relaxed opacity-80 mb-10">
            Dispatch decides how much AI power a message deserves, spends only that much, and shows you exactly what it saved compared to just using the expensive model on everything.
          </p>
          <div data-aos="fade-up" data-aos-delay="150" className="mb-14">
            <Link href="/run" className="px-10 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "#26263A", color: "#F1EFE7" }}>
              Start a Run →
            </Link>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200" className="w-full max-w-sm relative border px-8 py-5 text-left bg-[#EDEBE3]" style={{ borderColor: "#D8D5C9" }}>
            <CornerMarks />
            <div className="text-[9px] uppercase tracking-[0.2em] mb-1 opacity-50">Starting capital</div>
            <div className="text-xs opacity-80 mb-3">Every run starts with a fixed budget.</div>
            <div className="text-3xl text-[#2CE8A5]" style={{ fontFamily: "'Zodiak', serif", color: "#26263A" }}>
              $0.30
            </div>
          </div>
        </section>

        {/* 3. How it works */}
        <section className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">The Process</div>
            <h2 className="text-3xl" style={{ fontFamily: "'Zodiak', serif" }}>How Dispatch Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "You paste messages", desc: "No complex integration. Just paste raw text, email threads, or WhatsApp exports. Dispatch structures it instantly." },
              { num: "02", title: "Dispatch scores each one", desc: "Every message is evaluated for risk, complexity, and business value to determine the consequence of mishandling it." },
              { num: "03", title: "It spends accordingly", desc: "Low-risk questions get the cheap model. High-risk escalations get the premium model. You see the receipt for every single decision." }
            ].map((step, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i * 150} className="border p-6 bg-[#F7F5ED] relative hover:-translate-y-1 transition-transform" style={{ borderColor: "#D8D5C9" }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#2CE8A5]/20"></div>
                <div className="text-[10px] uppercase tracking-[0.2em] mb-4 text-[#2CE8A5] font-bold border-b border-[#2CE8A5]/30 pb-1 inline-block">Step {step.num}</div>
                <h3 className="text-lg mb-2 font-bold">{step.title}</h3>
                <p className="text-xs opacity-70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Why this matters */}
        <section className="px-8 py-32 bg-[#E5E3DB] border-y border-[#D8D5C9] relative overflow-hidden">
          {/* Decorative background grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#26263A 1px, transparent 1px), linear-gradient(90deg, #26263A 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div data-aos="fade-right">
              <div className="w-12 h-1 bg-[#2CE8A5] mb-8"></div>
              <h2 className="text-4xl md:text-5xl leading-tight mb-6" style={{ fontFamily: "'Zodiak', serif" }}>
                The one-size-fits-all model is <span className="text-red-500/80 italic">broken.</span>
              </h2>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#26263A] bg-[#2CE8A5]/20 inline-block px-3 py-1 border border-[#2CE8A5]/40 mb-8">
                The Problem
              </div>
            </div>
            
            <div data-aos="fade-left" data-aos-delay="100" className="flex flex-col justify-center space-y-8 text-sm opacity-90 leading-relaxed">
              <div className="border-l-2 border-[#26263A]/20 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#E5E3DB] border-2 border-[#26263A] rounded-full"></div>
                <p>
                  Treating every message the same is a waste of money on easy questions, and a huge liability on the hard ones. You either overpay for <span className="font-mono bg-white/50 px-1">&ldquo;where is my package&rdquo;</span>, or you risk angering an escalated customer with a cheap hallucination.
                </p>
              </div>
              <div className="border-l-2 border-[#2CE8A5] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#2CE8A5] border-2 border-[#E5E3DB] rounded-full shadow-[0_0_10px_rgba(44,232,165,0.5)]"></div>
                <p>
                  Powered by <strong className="font-bold">BTL Runtime</strong>, Dispatch uses live cost headers and smart routing to decouple the decision from the provider. It&apos;s proof over claims: you see exactly why a model was chosen, and exactly what you saved by not blindly defaulting to the most expensive tier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. What gets measured */}
        <section className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">The Evidence</div>
            <h2 className="text-3xl" style={{ fontFamily: "'Zodiak', serif" }}>What gets measured</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Illustrative preview card */}
            <div data-aos="fade-up" className="relative group">
              <div className="bg-[#34344A] p-6 border-l-4 border-l-[#2CE8A5] border-y border-r border-[#3E3E56] text-[#F1EFE7] relative z-10 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                <CornerMarks dark />
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5 text-center text-[#2CE8A5] bg-[#2CE8A5]/10 py-2 border border-[#2CE8A5]/20">
                  Illustrative Output
                </div>
                
                <div className="space-y-5 grayscale-[50%] group-hover:grayscale-0 transition-all duration-500">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 mb-2">Simulated Message</div>
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
                      <div className="text-[10px] font-bold font-mono text-[#FF6FCF] uppercase tracking-widest bg-[#FF6FCF]/10 inline-block px-2 py-1 mt-1">Premium</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#3E3E56] pt-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider opacity-50 mb-1 flex justify-between">
                            <span>If Always Premium</span>
                            <span className="font-mono opacity-50">$0.1200</span>
                          </div>
                          <div className="h-2.5 bg-[#2C2C40] border border-[#3E3E56] w-full relative">
                            <div className="absolute inset-y-0 left-0 bg-[#FF6FCF]/40 w-full"></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider mb-1 flex justify-between text-[#2CE8A5]">
                            <span>What Dispatch Spent</span>
                            <span className="font-mono">$0.1200</span>
                          </div>
                          <div className="h-2.5 bg-[#2C2C40] border border-[#3E3E56] w-full relative">
                            <div className="absolute inset-y-0 left-0 bg-[#2CE8A5]/40 w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stack effect background cards */}
              <div className="absolute inset-0 bg-[#2C2C40] border border-[#3E3E56] translate-y-3 translate-x-3 -z-10 opacity-60 transition-transform duration-500 group-hover:translate-y-4 group-hover:translate-x-4"></div>
              <div className="absolute inset-0 bg-[#2C2C40] border border-[#3E3E56] translate-y-6 translate-x-6 -z-20 opacity-30 transition-transform duration-500 group-hover:translate-y-8 group-hover:translate-x-8"></div>
            </div>

            <div data-aos="fade-up" data-aos-delay="150" className="flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-3">Proof, not claims.</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                When you run Dispatch, the UI transitions into a dark-mode data ledger. Every ticket generates an evidence card containing live x-btl-* headers: cache tiers, benchmark costs, and the exact amount saved. No fabricated data. No guesswork.
              </p>
            </div>

          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="px-8 py-32 text-center bg-[#26263A] text-[#F1EFE7]">
          <h2 data-aos="zoom-in" className="text-4xl md:text-5xl mb-8" style={{ fontFamily: "'Zodiak', serif" }}>
            Paste something. Watch it think.
          </h2>
          <div data-aos="fade-up" data-aos-delay="150">
            <Link href="/run" className="inline-block px-12 py-5 text-xs font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "#2CE8A5", color: "#26263A" }}>
              Start a Run →
            </Link>
          </div>
        </section>

      </main>

      {/* 7. Footer */}
      <footer className="relative bg-[#1E1E2C] border-t border-[#3E3E56] text-[#F1EFE7] overflow-hidden pt-24 pb-8 px-8">
        
        {/* Giant Watermark */}
        <div className="absolute top-0 left-0 w-full text-center select-none pointer-events-none overflow-hidden flex justify-center -mt-10 md:-mt-16 opacity-[0.03]">
          <span className="text-[12rem] md:text-[20rem] font-bold uppercase tracking-tighter leading-none" style={{ fontFamily: "'Zodiak', serif" }}>
            DISPATCH
          </span>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">
          
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 border-2 border-[#2CE8A5] flex items-center justify-center relative group cursor-pointer">
                  <div className="w-3 h-3 bg-[#2CE8A5] group-hover:scale-150 transition-transform duration-300"></div>
                  <div className="absolute inset-0 bg-[#2CE8A5] opacity-0 group-hover:opacity-20 transition-opacity blur-md"></div>
                </div>
                <div className="text-2xl font-bold uppercase tracking-[0.25em]" style={{ color: "#F1EFE7" }}>Dispatch</div>
              </div>
              <p className="text-xs opacity-60 leading-relaxed max-w-sm mb-8 font-mono">
                An open-source demonstration of intelligence allocation.<br/><br/>Built to showcase the intelligent routing and cost-management capabilities of BTL Runtime.
              </p>
            </div>
            
            {/* Terminal Status Box */}
            <div className="bg-[#151520] border border-[#3E3E56] p-4 font-mono text-[9px] text-[#2CE8A5] uppercase tracking-widest rounded-sm max-w-xs shadow-inner">
              <div className="flex justify-between items-center mb-2 border-b border-[#3E3E56]/50 pb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2CE8A5] animate-pulse"></span>
                  System Status
                </span>
                <span className="opacity-50">OK</span>
              </div>
              <div className="opacity-70 space-y-1">
                <div>&gt; ping api.badtheorylabs.com</div>
                <div>&gt; 23ms latency detected</div>
                <div>&gt; gateway: connected</div>
              </div>
            </div>
          </div>
          
          {/* Spacer */}
          <div className="hidden md:block md:col-span-3"></div>

          <div className="md:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2CE8A5] mb-6 border-b border-[#3E3E56] pb-2 inline-block">Resources</div>
            <ul className="space-y-4 text-xs font-mono opacity-80">
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">Documentation</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">API Reference</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">GitHub Repo</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">Architecture</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2CE8A5] mb-6 border-b border-[#3E3E56] pb-2 inline-block">BTL Runtime</div>
            <ul className="space-y-4 text-xs font-mono opacity-80">
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">Dashboard</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">Playground</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">Dev Blog</Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#2CE8A5] opacity-0 group-hover:opacity-100 transition-opacity">→</span><Link href="#" className="group-hover:text-[#F1EFE7] transition-colors">X (Twitter)</Link></li>
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
