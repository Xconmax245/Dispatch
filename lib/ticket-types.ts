// lib/ticket-types.ts
// Unified Canonical Decision Model. No fragmented state.

export interface Ticket {
  id: string;
  channel: "dm" | "email" | "public_comment";
  customerType: "first_time" | "repeat" | "unknown";
  text: string;
}

export type FinalDecision = "economy" | "precision" | "human_review";

export interface Signal {
  name: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export interface ProcessedTicket {
  ticket: Ticket;

  classification: {
    riskScore: number;
    complexity: number;
    confidence: number;
    businessValue: number;
    signals: Signal[];
    dominantFactor: string;
    classificationBadge: string;
  };

  policy: {
    decision: FinalDecision;
    reason: string;
    considered: {
      economy: "selected" | "rejected";
      precision: "selected" | "rejected";
      humanReview: "selected" | "rejected";
    };
    decisionPath: string[];
  };

  runtime?: {
    model: string;
    provider: string;
    gatewayMode: string;
    cacheTier: string;
    benchmarkCost: number;
    customerCharge: number;
    runtimeSaved: number;
    requestId: string;
  };

  policyMetrics: {
    shadowPremiumCost: number;
    shadowCheapCost: number;
    actualSpend: number;
    policySavings: number;
    runningCapitalRemaining: number;
  };
}
