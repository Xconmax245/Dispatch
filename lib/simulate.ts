// lib/simulate.ts
// Pure client-side what-if simulation. No API calls.
// Replays decideTier() against already-scored tickets under hypothetical settings.

import { decideTier } from './policy';

export interface ScoredTicket {
  id: string;
  text: string;
  riskScore: number;
  complexity: number;
  confidence: number;
  businessValue: number;
  shadowCostAlwaysStrong: number;
  shadowCostAlwaysCheap: number;
  classification?: string;
  dominantFactor?: string;
  // from the actual live run — for diff display
  originalDecision?: 'economy' | 'precision' | 'human_review';
  actualSpend?: number;
}

export interface SimulationParams {
  startingBudget: number;
  highThreshold: number;
  lowThreshold: number;
  criticalFloor: number;
}

export type SimTier = 'economy' | 'precision' | 'human_review';

export interface TicketOutcome {
  ticketId: string;
  text: string;
  tier: SimTier;
  originalTier?: SimTier;
  cost: number;
  reason: string;
  changed: boolean;
}

export interface SimulationResult {
  outcomes: TicketOutcome[];
  totalSpent: number;
  remainingBudget: number;
  counts: { economy: number; precision: number; human_review: number };
  savingsVsAlwaysStrong: number;
  savingsPercent: number;
  // vs what actually happened in the live run
  deltaVsActual: number;
  actualRunTotal: number;
}

export function simulate(
  tickets: ScoredTicket[],
  params: SimulationParams
): SimulationResult {
  let remaining = params.startingBudget;
  const outcomes: TicketOutcome[] = [];
  const counts = { economy: 0, precision: 0, human_review: 0 };
  let totalSpent = 0;
  let totalAlwaysStrong = 0;
  let actualRunTotal = 0;

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const ticketsLeft = tickets.length - i;

    // ── Hard floor: extreme risk is always Human Review ─────────────────────
    // The urgency formula (risk × businessValue / confidence) can under-score
    // extreme-risk tickets with low business value (e.g. legal threats from
    // unknown customers). riskScore ≥ 0.85 or "Human Review" badge are
    // unconditional — no slider changes this.
    const isExtremeRisk =
      ticket.riskScore >= 0.85 ||
      (ticket.classification || '').toLowerCase().includes('human');

    let tier: SimTier;
    let reason: string;

    if (isExtremeRisk) {
      tier = 'human_review';
      reason = `riskScore ${ticket.riskScore.toFixed(2)} — unconditional human review floor`;
    } else {
      const decision = decideTier(
        {
          riskScore: ticket.riskScore,
          complexity: ticket.complexity,
          confidence: ticket.confidence,
          businessValue: ticket.businessValue,
          classification: ticket.classification || 'Routine Inquiry',
          dominantFactor: ticket.dominantFactor || '',
          signals: [],
        },
        { remaining, ticketsLeft },
        {
          highThreshold: params.highThreshold,
          lowThreshold: params.lowThreshold,
          criticalFloor: params.criticalFloor,
        }
      );
      tier = decision.decision as SimTier;
      reason = decision.reason;
    }

    const cost =
      tier === 'precision' ? ticket.shadowCostAlwaysStrong
      : tier === 'economy'  ? ticket.shadowCostAlwaysCheap
      : 0;

    remaining    -= cost;
    totalSpent   += cost;
    totalAlwaysStrong += ticket.shadowCostAlwaysStrong;
    actualRunTotal    += ticket.actualSpend ?? 0;

    counts[tier] += 1;

    const originalTier = ticket.originalDecision as SimTier | undefined;
    outcomes.push({
      ticketId: ticket.id,
      text: ticket.text,
      tier,
      originalTier,
      cost,
      reason,
      changed: !!originalTier && originalTier !== tier,
    });
  }

  const savingsVsAlwaysStrong = totalAlwaysStrong - totalSpent;
  const savingsPercent =
    totalAlwaysStrong > 0 ? (savingsVsAlwaysStrong / totalAlwaysStrong) * 100 : 0;
  const deltaVsActual = actualRunTotal - totalSpent;

  return {
    outcomes,
    totalSpent,
    remainingBudget: remaining,
    counts,
    savingsVsAlwaysStrong,
    savingsPercent,
    deltaVsActual,
    actualRunTotal,
  };
}
