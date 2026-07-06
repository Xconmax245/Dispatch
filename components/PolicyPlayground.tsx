'use client';

import React, { useState, useMemo } from 'react';
import { simulate, ScoredTicket, SimTier } from '@/lib/simulate';

export function PolicyPlayground({ tickets }: { tickets: ScoredTicket[] }) {
  const [budget, setBudget]             = useState(0.30);
  const [highThreshold, setHighThreshold] = useState(0.70);
  const [lowThreshold, setLowThreshold]   = useState(0.30);

  const result = useMemo(
    () =>
      simulate(tickets, {
        startingBudget: budget,
        highThreshold,
        lowThreshold,
        criticalFloor: 0.03,
      }),
    [tickets, budget, highThreshold, lowThreshold]
  );

  const changedCount = result.outcomes.filter((o) => o.changed).length;
  const deltaSign    = result.deltaVsActual >= 0 ? '+' : '-';
  const deltaColor   = result.deltaVsActual >= 0 ? 'text-[#2CE8A5]' : 'text-[#FF6FCF]';

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-[10px] uppercase tracking-[0.2em] opacity-30 text-[#F1EFE7]">
        No scored tickets available to simulate.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 text-[#F1EFE7]">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[9px] uppercase tracking-[0.22em] text-[#2CE8A5] mb-1 font-bold">
          Policy Playground
        </div>
        <div className="text-[10px] opacity-40 leading-relaxed font-mono">
          Replays your already-scored messages under different budget and threshold settings.
          No new API calls. Pure client-side re-simulation.
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-[#3E3E56]/60">
        <Slider
          label="Hypothetical Budget"
          value={budget}
          min={0.02} max={1.00} step={0.01}
          format={(v) => `$${v.toFixed(2)}`}
          onChange={setBudget}
        />
        <Slider
          label="Escalation Threshold"
          value={highThreshold}
          min={0.30} max={0.95} step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setHighThreshold}
          hint="Higher → stingier with Precision. Only extreme risk goes Premium."
        />
        <Slider
          label="Economy Floor"
          value={lowThreshold}
          min={0.10} max={0.60} step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setLowThreshold}
          hint="Lower → more generous with Economy. More queries to cheap model."
        />
      </div>

      {/* Top-line metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#3E3E56] mt-6">
        <MetricCell
          label="Economy · ·"
          value={result.counts.economy}
          color="text-[#2CE8A5]"
        />
        <MetricCell
          label="Precision › ›"
          value={result.counts.precision}
          color="text-[#FF6FCF]"
        />
        <MetricCell
          label="Human Review ▲"
          value={result.counts.human_review}
          color="text-[#FF6FCF]"
        />
        <MetricCell
          label="vs Always-Premium"
          value={`${result.savingsPercent.toFixed(0)}%`}
          color="text-[#2CE8A5]"
          rightBorder={false}
        />
      </div>

      {/* Delta vs actual */}
      <div className="flex items-center justify-between border border-t-0 border-[#3E3E56] px-5 py-3 font-mono text-[10px]">
        <span className="opacity-40 uppercase tracking-[0.14em]">
          Simulated spend
        </span>
        <span className="text-[#F1EFE7]">
          ${result.totalSpent.toFixed(4)}
        </span>
        <span className="opacity-30 mx-3">·</span>
        <span className="opacity-40 uppercase tracking-[0.14em]">
          vs actual run
        </span>
        <span className={`font-bold ${deltaColor}`}>
          {deltaSign}${Math.abs(result.deltaVsActual).toFixed(4)}
          <span className="opacity-40 ml-1 font-normal">
            ({result.deltaVsActual >= 0 ? 'cheaper' : 'more expensive'} than live run)
          </span>
        </span>
        {changedCount > 0 && (
          <>
            <span className="opacity-30 mx-3">·</span>
            <span className="text-amber-400">
              {changedCount} ticket{changedCount !== 1 ? 's' : ''} would re-route
            </span>
          </>
        )}
      </div>

      {/* Per-ticket breakdown */}
      <div className="mt-6">
        <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 text-[#F1EFE7] mb-3">
          Per-Ticket Simulation Outcomes
        </div>
        <div className="border border-[#3E3E56] overflow-hidden">
          {/* Table header */}
          <div
            className="grid font-mono text-[9px] uppercase tracking-[0.14em] opacity-40 px-4 py-2 border-b border-[#3E3E56]"
            style={{ gridTemplateColumns: '1fr 100px 100px 70px' }}
          >
            <span>Message</span>
            <span className="text-right">Actual</span>
            <span className="text-center">Simulated</span>
            <span className="text-right">Sim Cost</span>
          </div>

          {result.outcomes.map((outcome, i) => {
            const isLast = i === result.outcomes.length - 1;
            const truncated =
              outcome.text.length > 72
                ? outcome.text.slice(0, 70) + '…'
                : outcome.text;

            return (
              <div
                key={outcome.ticketId}
                className={`grid items-center px-4 py-3 ${
                  !isLast ? 'border-b border-[#3E3E56]/40' : ''
                } ${outcome.changed ? 'bg-amber-400/5' : 'hover:bg-[#2C2C40]/40'} transition-colors`}
                style={{ gridTemplateColumns: '1fr 100px 100px 70px' }}
              >
                {/* Message text */}
                <div className="pr-4">
                  <div className="font-mono text-[10px] text-[#F1EFE7] opacity-75 leading-relaxed">
                    &ldquo;{truncated}&rdquo;
                  </div>
                  {outcome.changed && (
                    <div className="text-[8px] text-amber-400 uppercase tracking-widest mt-0.5 font-bold">
                      ↻ tier changed
                    </div>
                  )}
                </div>

                {/* Actual tier */}
                <div className="text-right">
                  {outcome.originalTier ? (
                    <TierPill tier={outcome.originalTier} />
                  ) : (
                    <span className="text-[9px] opacity-20">—</span>
                  )}
                </div>

                {/* Simulated tier */}
                <div className="flex justify-center">
                  <TierPill tier={outcome.tier} highlight={outcome.changed} />
                </div>

                {/* Cost */}
                <div className="text-right font-mono text-[10px]">
                  {outcome.cost === 0 ? (
                    <span className="opacity-30">—</span>
                  ) : (
                    <span className="text-[#F1EFE7] opacity-70">
                      ${outcome.cost.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="mt-3 text-[9px] font-mono opacity-25 text-[#F1EFE7] leading-relaxed">
          · Extreme risk (riskScore ≥ 0.85) is always Human Review regardless of thresholds.<br />
          · Sim cost uses shadow cost estimates, not live BTL rates.
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span
          className="text-[9px] uppercase tracking-[0.18em] opacity-50 font-mono"
          title={hint}
          style={hint ? { cursor: 'help', borderBottom: '1px dashed rgba(241,239,231,0.2)' } : {}}
        >
          {label}
        </span>
        <span className="font-mono text-[11px] font-bold text-[#2CE8A5]">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-[2px] cursor-pointer appearance-none bg-[#3E3E56]"
        style={{ accentColor: '#2CE8A5' }}
      />
      <div className="flex justify-between text-[8px] font-mono opacity-20">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function MetricCell({
  label,
  value,
  color,
  rightBorder = true,
}: {
  label: string;
  value: string | number;
  color: string;
  rightBorder?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${rightBorder ? 'border-r border-[#3E3E56]' : ''}`}
    >
      <div className="text-[8px] uppercase tracking-[0.18em] opacity-30 font-mono mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${color}`}>
        {value}
      </div>
    </div>
  );
}

function TierPill({
  tier,
  highlight = false,
}: {
  tier: SimTier;
  highlight?: boolean;
}) {
  const config = {
    economy: {
      label: '· Economy',
      color: 'text-[#2CE8A5]',
      border: 'border-[#2CE8A5]/30',
      bg: 'bg-[#2CE8A5]/10',
    },
    precision: {
      label: '› Precision',
      color: 'text-[#FF6FCF]',
      border: 'border-[#FF6FCF]/30',
      bg: 'bg-[#FF6FCF]/10',
    },
    human_review: {
      label: '▲ Human',
      color: 'text-[#FF6FCF]',
      border: 'border-[#FF6FCF]/30',
      bg: 'bg-[#FF6FCF]/10',
    },
  }[tier];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] border font-mono ${config.color} ${config.border} ${config.bg} ${highlight ? 'ring-1 ring-amber-400/40' : ''}`}
      style={{ borderRadius: '2px' }}
    >
      {config.label}
    </span>
  );
}
