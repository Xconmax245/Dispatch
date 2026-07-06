'use client';

import React, { useState, useMemo } from 'react';
import { simulate, ScoredTicket } from '@/lib/simulate';
import { CornerMarks } from './CornerMarks';

export function PolicyPlayground({ tickets }: { tickets: ScoredTicket[] }) {
  const [budget, setBudget] = useState(0.30);
  const [highThreshold, setHighThreshold] = useState(0.7);
  const [lowThreshold, setLowThreshold] = useState(0.3);

  const result = useMemo(
    () =>
      simulate(tickets, {
        startingBudget: budget,
        highThreshold,
        lowThreshold,
        criticalFloor: 0.15,
      }),
    [tickets, budget, highThreshold, lowThreshold]
  );

  return (
    <div className="bg-[#34344A] border border-[#3E3E56] p-6 relative flex flex-col gap-6 text-[#F1EFE7] max-w-4xl mx-auto mt-10">
      <CornerMarks dark />

      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#2CE8A5] mb-1 font-mono font-bold">
          Policy Playground
        </div>
        <h3 className="text-xl text-[#F1EFE7] mb-2" style={{ fontFamily: "'Zodiak', serif" }}>
          Interactive Scenario Simulator
        </h3>
        <p className="text-xs opacity-60 leading-relaxed font-mono">
          This replays your already-scored messages under different hypothetical budget and threshold settings. No new AI calls, no new cost — pure client-side what-if simulation.
        </p>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <SliderRow
          label="Hypothetical Budget"
          value={budget}
          min={0.02}
          max={1.0}
          step={0.01}
          format={(v: number) => `$${v.toFixed(2)}`}
          onChange={setBudget}
        />
        <SliderRow
          label="Escalation Threshold"
          value={highThreshold}
          min={0.3}
          max={0.95}
          step={0.05}
          format={(v: number) => v.toFixed(2)}
          onChange={setHighThreshold}
          tooltip="Higher = stingier with Precision Tier. Only extreme risks route to Premium."
        />
        <SliderRow
          label="Economy-Tier Threshold"
          value={lowThreshold}
          min={0.1}
          max={0.6}
          step={0.05}
          format={(v: number) => v.toFixed(2)}
          onChange={setLowThreshold}
          tooltip="Lower = more generous with Economy. More queries get sent to Cheap model."
        />
      </div>

      {/* Live outcomes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-[#2C2C40]/50 border border-[#3E3E56] relative">
        <CornerMarks dark />
        <Stat label="Economy Tier" value={result.counts.cheap} icon="·" color="text-[#2CE8A5]" />
        <Stat label="Precision Tier" value={result.counts.strong} icon="›" color="text-[#FF6FCF]" />
        <Stat label="Human Review" value={result.counts.human_review} icon="▲" color="text-[#FF6FCF]" />
        <Stat label="Simulated Savings" value={`${result.savingsPercent.toFixed(0)}%`} color="text-[#2CE8A5]" highlight />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] uppercase tracking-wider opacity-50 font-mono gap-2 border-t border-[#3E3E56]/40 pt-4">
        <div>
          Total Spent: <span className="font-bold text-[#F1EFE7]">${result.totalSpent.toFixed(4)}</span>
        </div>
        <div>
          Remaining Budget: <span className="font-bold text-[#F1EFE7]">${Math.max(0, result.remainingBudget).toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  tooltip?: string;
}

function SliderRow({ label, value, min, max, step, format, onChange, tooltip }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[9px] uppercase tracking-widest font-mono opacity-70">
        <span title={tooltip} className={tooltip ? "cursor-help border-b border-dashed border-[#F1EFE7]/30" : ""}>
          {label}
        </span>
        <span className="font-bold text-[#2CE8A5]">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#2CE8A5] bg-[#2C2C40] h-1 rounded cursor-pointer"
        style={{
          outline: 'none',
        }}
      />
    </div>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  highlight?: boolean;
}

function Stat({ label, value, icon, color = "text-[#F1EFE7]", highlight }: StatProps) {
  return (
    <div className="flex flex-col">
      <div className="text-[9px] uppercase tracking-[0.16em] opacity-40 font-mono mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        {icon && <span className={`text-[10px] font-bold ${color} opacity-70`}>{icon}</span>}
        <div className={`text-2xl font-bold font-mono tracking-tight ${highlight ? 'text-[#2CE8A5]' : 'text-[#F1EFE7]'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
