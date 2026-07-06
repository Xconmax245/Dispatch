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
}

export interface SimulationParams {
  startingBudget: number;
  highThreshold: number;    // urgency threshold to trigger 'strong' (precision)
  lowThreshold: number;     // urgency threshold below which 'cheap' (economy) applies
  criticalFloor: number;    // remaining/ticketsLeft ratio that forces human_review
}

export interface SimulationResult {
  outcomes: Array<{
    ticketId: string;
    tier: 'cheap' | 'strong' | 'human_review';
    reason: string;
  }>;
  totalSpent: number;
  remainingBudget: number;
  counts: { cheap: number; strong: number; human_review: number };
  savingsVsAlwaysStrong: number;
  savingsPercent: number;
}

export function simulate(
  tickets: ScoredTicket[],
  params: SimulationParams
): SimulationResult {
  let remaining = params.startingBudget;
  const outcomes: SimulationResult['outcomes'] = [];
  const counts = { cheap: 0, strong: 0, human_review: 0 };
  let totalSpent = 0;
  let totalAlwaysStrong = 0;

  tickets.forEach((ticket, index) => {
    const ticketsLeft = tickets.length - index;

    // Reuse decideTier with the scoring properties
    const decision = decideTier(
      {
        riskScore: ticket.riskScore,
        complexity: ticket.complexity,
        confidence: ticket.confidence,
        businessValue: ticket.businessValue,
        classification: ticket.classification || "Routine Inquiry",
        dominantFactor: ticket.dominantFactor || "Simulation inquiry",
        signals: [],
      },
      { remaining, ticketsLeft },
      {
        highThreshold: params.highThreshold,
        lowThreshold: params.lowThreshold,
        criticalFloor: params.criticalFloor,
      }
    );

    // Map tier name and cost based on decideTier output ("economy" | "precision" | "human_review")
    const cost =
      decision.decision === 'precision'
        ? ticket.shadowCostAlwaysStrong
        : decision.decision === 'economy'
        ? ticket.shadowCostAlwaysCheap
        : 0;

    remaining -= cost;
    totalSpent += cost;
    totalAlwaysStrong += ticket.shadowCostAlwaysStrong;

    const mappedTier =
      decision.decision === 'precision'
        ? 'strong'
        : decision.decision === 'economy'
        ? 'cheap'
        : 'human_review';

    counts[mappedTier] += 1;

    outcomes.push({
      ticketId: ticket.id,
      tier: mappedTier,
      reason: decision.reason,
    });
  });

  const savingsVsAlwaysStrong = totalAlwaysStrong - totalSpent;
  const savingsPercent = totalAlwaysStrong > 0 ? (savingsVsAlwaysStrong / totalAlwaysStrong) * 100 : 0;

  return {
    outcomes,
    totalSpent,
    remainingBudget: remaining,
    counts,
    savingsVsAlwaysStrong,
    savingsPercent,
  };
}
