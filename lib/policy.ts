// lib/policy.ts
// Pure logic — no API calls, no fabricated data.

import type { FinalDecision } from "./ticket-types";
import type { TriageResult } from "./runtime-client";

export interface BudgetState {
  remaining: number;
  ticketsLeft: number;
}

export interface PolicyOutput {
  decision: FinalDecision;
  reason: string;
  considered: {
    economy: "selected" | "rejected";
    precision: "selected" | "rejected";
    humanReview: "selected" | "rejected";
  };
  decisionPath: string[];
  maxTokens: number;
}

const EXPECTED_COST_CHEAP  = 0.012;
const EXPECTED_COST_STRONG = 0.12;

export function scoreToUrgency(scores: TriageResult): number {
  const { riskScore, businessValue, confidence } = scores;
  return (riskScore * businessValue) / Math.max(confidence, 0.2);
}

export function decideTier(
  scores: TriageResult,
  budgetState: BudgetState,
  params: { highThreshold?: number; lowThreshold?: number; criticalFloor?: number } = {}
): PolicyOutput {
  const { complexity, classification, dominantFactor } = scores;
  const { remaining, ticketsLeft } = budgetState;

  const urgency = scoreToUrgency(scores);
  const capitalPerTicket = ticketsLeft > 0 ? remaining / ticketsLeft : 0;

  const isBudgetStrained = capitalPerTicket < 0.15;
  const CRITICAL_FLOOR   = params.criticalFloor ?? 0.03;
  const HIGH_THRESHOLD   = params.highThreshold ?? (isBudgetStrained ? 0.8 : 0.6);
  const LOW_THRESHOLD    = params.lowThreshold ?? 0.3;
  const CONFIDENCE_FLOOR = 0.4;
  const COMPLEXITY_FLOOR = 0.4;

  let tier: FinalDecision;
  let reason = "";
  const path: string[] = [classification];

  if (urgency > HIGH_THRESHOLD || scores.confidence < CONFIDENCE_FLOOR) {
    path.push(urgency > HIGH_THRESHOLD ? "High business risk" : "Low confidence");
    
    if (capitalPerTicket < CRITICAL_FLOOR) {
      path.push("Budget exhausted");
      path.push("Human Review");
      tier = "human_review";
      reason = "Budget exhausted — requires human judgement.";
    } else {
      path.push("Precision Tier");
      tier = "precision";
      reason = urgency > HIGH_THRESHOLD
        ? `${dominantFactor} justified precision inference.`
        : `Low confidence required precision inference.`;
    }
  } else if (urgency < LOW_THRESHOLD && complexity < COMPLEXITY_FLOOR) {
    path.push("Low business risk");
    path.push("Economy Tier");
    tier = "economy";
    reason = `${dominantFactor} — Economy Tier sufficient.`;
  } else {
    path.push("Borderline case");
    if (isBudgetStrained) {
      path.push("Budget pressure");
      path.push("Economy Tier");
      tier = "economy";
      reason = `Budget pressure forced Economy Tier routing.`;
    } else {
      path.push("Healthy budget");
      path.push("Precision Tier");
      tier = "precision";
      reason = `Healthy budget allowed Precision Tier inference.`;
    }
  }

  return {
    decision: tier,
    reason,
    considered: {
      economy: tier === "economy" ? "selected" : "rejected",
      precision: tier === "precision" ? "selected" : "rejected",
      humanReview: tier === "human_review" ? "selected" : "rejected",
    },
    decisionPath: path,
    maxTokens: tier === "precision" ? 500 : tier === "economy" ? 150 : 0
  };
}

export function calculateShadowCosts(scores: TriageResult) {
  const complexityFactor = 0.65 + scores.complexity * 0.7;
  return {
    shadowCostAlwaysStrong: +(EXPECTED_COST_STRONG * complexityFactor).toFixed(4),
    shadowCostAlwaysCheap:  +(EXPECTED_COST_CHEAP  * complexityFactor).toFixed(4),
    shadowCostRandom:       +((EXPECTED_COST_STRONG + EXPECTED_COST_CHEAP) / 2 * complexityFactor).toFixed(4),
  };
}
