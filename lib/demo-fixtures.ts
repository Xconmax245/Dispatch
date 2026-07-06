// lib/demo-fixtures.ts
// Pre-recorded ProcessedTicket data for demo mode.
// No API key required. Mirrors realistic output from a live BTL Runtime run.
// Covers all three tiers, one cache hit, and one escalating thread pair.

import type { ProcessedTicket } from "@/lib/ticket-types";

const STARTING = 0.3;

export const DEMO_FIXTURES: ProcessedTicket[] = [
  // ── 01. Economy — routine shipping inquiry ──────────────────────────────────
  {
    ticket: {
      id: "D-001",
      channel: "dm",
      customerType: "first_time",
      text: "Hi, how long does standard shipping usually take? I'm in the UK.",
    },
    classification: {
      riskScore: 0.08,
      complexity: 0.12,
      confidence: 0.97,
      businessValue: 0.22,
      signals: [
        { name: "Shipping inquiry", confidence: "HIGH" },
        { name: "No urgency signal", confidence: "HIGH" },
      ],
      dominantFactor: "Routine logistics question with no financial risk",
      classificationBadge: "Routine Inquiry",
    },
    policy: {
      decision: "economy",
      reason: "Low risk and low complexity. Economy Tier is the appropriate allocation.",
      considered: {
        economy: "selected",
        precision: "rejected",
        humanReview: "rejected",
      },
      decisionPath: ["Routine Inquiry", "Low risk threshold", "Economy Tier"],
    },
    runtime: {
      model: "gpt-4.1-mini",
      provider: "BTL Runtime",
      gatewayMode: "shared_savings",
      cacheTier: "none",
      benchmarkCost: 0.000041,
      customerCharge: 0.000387,
      runtimeSaved: -0.000346,
      requestId: "req_demo_a1b2c3d4",
    },
    reply:
      "Standard shipping to the UK typically takes 5–8 business days. You'll receive a tracking link by email once your order is dispatched. Is there anything else I can help with?",
    policyMetrics: {
      shadowPremiumCost: 0.0136,
      shadowCheapCost: 0.000387,
      actualSpend: 0.000387,
      policySavings: 0.013213,
      runningCapitalRemaining: STARTING - 0.000387,
    },
  },

  // ── 02. Economy — cache hit (second identical triage call) ──────────────────
  {
    ticket: {
      id: "D-002",
      channel: "dm",
      customerType: "repeat",
      text: "Do you ship to Australia? What are the delivery times?",
    },
    classification: {
      riskScore: 0.09,
      complexity: 0.11,
      confidence: 0.96,
      businessValue: 0.35,
      signals: [
        { name: "Shipping inquiry", confidence: "HIGH" },
        { name: "Geographic qualifier", confidence: "MEDIUM" },
      ],
      dominantFactor: "Standard logistics question, repeat customer",
      classificationBadge: "Routine Inquiry",
    },
    policy: {
      decision: "economy",
      reason: "Low risk and straightforward question. Economy Tier selected.",
      considered: {
        economy: "selected",
        precision: "rejected",
        humanReview: "rejected",
      },
      decisionPath: ["Routine Inquiry", "Low risk threshold", "Economy Tier"],
    },
    runtime: {
      model: "gpt-4.1-mini",
      provider: "BTL Runtime",
      gatewayMode: "shared_savings",
      cacheTier: "hit (50%)",
      benchmarkCost: 0.000364,
      customerCharge: 0.000182,
      runtimeSaved: 0.000182,
      requestId: "req_demo_e5f6g7h8",
    },
    reply:
      "Yes, we ship to Australia! Standard delivery takes 10–14 business days. Express options are available at checkout. Tracking is included with all international orders.",
    policyMetrics: {
      shadowPremiumCost: 0.0136,
      shadowCheapCost: 0.000182,
      actualSpend: 0.000182,
      policySavings: 0.013418,
      runningCapitalRemaining: STARTING - 0.000387 - 0.000182,
    },
  },

  // ── 03. Precision — escalating thread message 1 ─────────────────────────────
  {
    ticket: {
      id: "D-003",
      channel: "dm",
      customerType: "repeat",
      text: "My order was supposed to arrive last week. It still hasn't shown up. This is getting frustrating.",
    },
    classification: {
      riskScore: 0.52,
      complexity: 0.44,
      confidence: 0.88,
      businessValue: 0.61,
      signals: [
        { name: "Delayed delivery complaint", confidence: "HIGH" },
        { name: "Customer frustration signal", confidence: "MEDIUM" },
        { name: "Repeat customer", confidence: "HIGH" },
      ],
      dominantFactor: "Missed delivery with expressed frustration from valued customer",
      classificationBadge: "Delivery Dispute",
    },
    policy: {
      decision: "precision",
      reason: "Moderate risk elevated by customer value and delivery failure. Precision Tier warranted.",
      considered: {
        economy: "rejected",
        precision: "selected",
        humanReview: "rejected",
      },
      decisionPath: ["Delivery Dispute", "High business value", "Precision Tier"],
    },
    runtime: {
      model: "BTL Router",
      provider: "BTL-2",
      gatewayMode: "marketplace",
      cacheTier: "none",
      benchmarkCost: 0.000189,
      customerCharge: 0.003842,
      runtimeSaved: -0.003653,
      requestId: "req_demo_i9j0k1l2",
      conversationLength: 1,
      escalationTrend: false,
      priorMessageCount: 0,
    },
    reply:
      "I sincerely apologise for the delay — that's not the experience we want you to have. I've pulled up your order right now. Can you confirm your order number so I can check the carrier status and escalate if needed?",
    policyMetrics: {
      shadowPremiumCost: 0.0136,
      shadowCheapCost: 0.000387,
      actualSpend: 0.003842,
      policySavings: 0.009758,
      runningCapitalRemaining: STARTING - 0.000387 - 0.000182 - 0.003842,
    },
  },

  // ── 04. Precision — escalating thread message 2 (same sender) ───────────────
  {
    ticket: {
      id: "D-004",
      channel: "dm",
      customerType: "repeat",
      text: "You asked for my order number last time and never followed up. Order #48821. I want a full refund. This is ridiculous.",
    },
    classification: {
      riskScore: 0.74,
      complexity: 0.65,
      confidence: 0.91,
      businessValue: 0.61,
      signals: [
        { name: "Unresolved follow-up complaint", confidence: "HIGH" },
        { name: "Explicit refund demand", confidence: "HIGH" },
        { name: "Escalating frustration", confidence: "HIGH" },
      ],
      dominantFactor: "Explicit refund demand following unresolved prior contact",
      classificationBadge: "Refund Risk",
    },
    policy: {
      decision: "precision",
      reason: "High risk from explicit refund demand and escalating conversation trajectory. Precision Tier required.",
      considered: {
        economy: "rejected",
        precision: "selected",
        humanReview: "rejected",
      },
      decisionPath: ["Refund Risk", "Escalating thread", "Healthy budget", "Precision Tier"],
    },
    runtime: {
      model: "BTL Router",
      provider: "BTL-2",
      gatewayMode: "marketplace",
      cacheTier: "none",
      benchmarkCost: 0.000212,
      customerCharge: 0.004103,
      runtimeSaved: -0.003891,
      requestId: "req_demo_m3n4o5p6",
      conversationLength: 2,
      escalationTrend: true,
      priorMessageCount: 1,
    },
    reply:
      "I apologise — that follow-up should never have been missed. I've located order #48821 and can see it's been held at customs. I'm processing your refund now and you'll receive a confirmation email within the hour. I'm also filing an incident report on the carrier.",
    policyMetrics: {
      shadowPremiumCost: 0.0136,
      shadowCheapCost: 0.000387,
      actualSpend: 0.004103,
      policySavings: 0.009497,
      runningCapitalRemaining: STARTING - 0.000387 - 0.000182 - 0.003842 - 0.004103,
    },
  },

  // ── 05. Human Review — active legal threat ──────────────────────────────────
  {
    ticket: {
      id: "D-005",
      channel: "dm",
      customerType: "unknown",
      text: "I have already spoken to my solicitor. Unless I receive a full refund by 5pm today I will be filing a county court claim and posting the entire conversation to every review site I can find.",
    },
    classification: {
      riskScore: 0.96,
      complexity: 0.71,
      confidence: 0.99,
      businessValue: 0.30,
      signals: [
        { name: "Legal threat — solicitor cited", confidence: "HIGH" },
        { name: "Court claim threat", confidence: "HIGH" },
        { name: "Hard deadline set", confidence: "HIGH" },
        { name: "Reputation threat — public posting", confidence: "HIGH" },
      ],
      dominantFactor: "Active legal threat with hard deadline — no AI response appropriate",
      classificationBadge: "Human Review",
    },
    policy: {
      decision: "human_review",
      reason: "Active solicitor citation and court claim threat. Dispatch does not generate AI replies for active legal threats.",
      considered: {
        economy: "rejected",
        precision: "rejected",
        humanReview: "selected",
      },
      decisionPath: ["Human Review", "Active legal threat", "Inference skipped"],
    },
    policyMetrics: {
      shadowPremiumCost: 0.0136,
      shadowCheapCost: 0.000387,
      actualSpend: 0,
      policySavings: 0.0136,
      runningCapitalRemaining: STARTING - 0.000387 - 0.000182 - 0.003842 - 0.004103,
    },
  },
];

export const DEMO_STARTING_CAPITAL = STARTING;
export const DEMO_TICKET_COUNT = DEMO_FIXTURES.length;
