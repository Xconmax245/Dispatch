"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CornerMarks } from "@/components/CornerMarks";
import Link from "next/link";

const STARTING_CAPITAL = 0.3;

export default function RunPage() {
  const [rawText, setRawText] = useState("");
  const router = useRouter();

  const hasContent = rawText.trim().length > 10;

  const handleRun = () => {
    if (!hasContent) return;
    sessionStorage.setItem("dispatch_input", rawText);
    router.push("/dispatch");
  };

  return (
    <div className="flex-1 dot-grid-bg min-h-screen flex flex-col" style={{ backgroundColor: "#F1EFE7" }}>
      {/* Nav */}
      <header className="px-8 py-4 border-b flex justify-between items-center" style={{ backgroundColor: "#EDEBE3", borderColor: "#D8D5C9" }}>
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] hover:opacity-70 transition-opacity" style={{ color: "#26263A" }}>
          Dispatch
        </Link>
        <div className="text-[10px] uppercase tracking-[0.18em] opacity-50" style={{ color: "#26263A" }}>BTL Runtime demo</div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        
        <h1 className="text-2xl mb-10 text-center" style={{ fontFamily: "'Zodiak', serif", color: "#26263A" }}>
          What do you want Dispatch to triage?
        </h1>

        <div className="w-full max-w-2xl">
          {/* Capital Reference */}
          <div className="relative border px-12 py-6 mb-8 text-center flex justify-between items-center bg-[#EDEBE3]" style={{ borderColor: "#D8D5C9" }}>
            <CornerMarks />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#26263A", opacity: 0.5 }}>Starting capital</div>
              <div className="text-sm" style={{ color: "#26263A", opacity: 0.8 }}>Every run starts with a fixed budget.</div>
            </div>
            <div className="text-4xl text-[#2CE8A5]" style={{ fontFamily: "'Zodiak', serif" }}>
              ${STARTING_CAPITAL.toFixed(2)}
            </div>
          </div>

          <div className="relative group">
            <CornerMarks />
            
            <div 
              className="absolute top-0 left-0 right-0 h-10 border-b flex items-center px-5 justify-between pointer-events-none transition-colors duration-300" 
              style={{ 
                backgroundColor: hasContent ? "#E6E4D9" : "#EDEBE3",
                borderColor: hasContent ? "#26263A" : "#D8D5C9" 
              }}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`w-2 h-2 rounded-full ${hasContent ? "animate-pulse" : ""}`} 
                  style={{ backgroundColor: hasContent ? "#2CE8A5" : "#FF6FCF" }}
                />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: "#26263A", opacity: 0.6 }}>
                  Input Stream
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono hidden sm:inline" style={{ color: "#26263A", opacity: 0.3 }}>
                {hasContent ? `${rawText.length} bytes ready` : "Waiting for payload"}
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              placeholder={"Paste customer messages here...\n\nWhatsApp exports, raw DM transcripts, support emails. Dispatch will automatically extract and parse the individual tickets."}
              className="w-full border px-6 pt-14 pb-6 text-sm resize-none outline-none transition-all shadow-sm focus:shadow-lg focus:-translate-y-0.5"
              style={{
                borderColor: hasContent ? "#26263A" : "#D8D5C9",
                backgroundColor: "#F7F5ED",
                color: "#26263A",
                lineHeight: 1.7,
              }}
            />
          </div>

          <button
            onClick={handleRun}
            disabled={!hasContent}
            className="w-full mt-6 py-4 text-[12px] font-bold uppercase tracking-[0.16em] disabled:opacity-30 hover:opacity-90 transition-all active:scale-95"
            style={{ backgroundColor: hasContent ? "#26263A" : "#D8D5C9", color: "#F1EFE7" }}
          >
            Run Dispatch →
          </button>
          
          <div className="text-center mt-6">
            <Link href="/" className="text-[10px] uppercase tracking-[0.18em] opacity-40 hover:opacity-80 transition-opacity" style={{ color: "#26263A" }}>
              ← Back to landing page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
