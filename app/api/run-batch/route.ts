import { NextRequest } from "next/server";
import { parseRawMessages } from "@/lib/parse-tickets";
import {
  triageTicket,
  executeTicket,
  getQuote,
  InsufficientCreditsError,
  MissingKeyError,
} from "@/lib/runtime-client";
import { decideTier, calculateShadowCosts } from "@/lib/policy";
import type { ProcessedTicket } from "@/lib/ticket-types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const startingCapital = parseFloat(body.startingCapital) || 0.3;
  const rawText: string = body.rawText ?? "";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let remaining = startingCapital;
      let forcedHumanReview = false;

      try {
        // ── Guard: key must exist ────────────────────────────────────────────
        if (!process.env.GATEWAY_API_KEY) {
          send({ type: "ERROR", message: "GATEWAY_API_KEY is not set. Dispatch requires a live Runtime connection." });
          controller.close();
          return;
        }

        // ── Guard: input must exist ──────────────────────────────────────────
        if (!rawText.trim()) {
          send({ type: "ERROR", message: "No input provided. Paste customer messages to begin." });
          controller.close();
          return;
        }

        // ── Step 0: Parse raw input → structured tickets ─────────────────────
        send({ type: "PARSING" });

        let tickets;
        let parseHeaders;
        try {
          const result = await parseRawMessages(rawText);
          tickets = result.tickets;
          parseHeaders = result.headers;
        } catch (err) {
          send({ type: "PARSE_ERROR", message: err instanceof Error ? err.message : String(err) });
          controller.close();
          return;
        }

        if (tickets.length === 0) {
          send({ type: "PARSE_ERROR", message: "No distinct messages found. Try separating messages with blank lines." });
          controller.close();
          return;
        }

        send({ type: "PARSE_COMPLETE", ticketCount: tickets.length, headers: parseHeaders });

        // ── Quote (best-effort, does not block run) ──────────────────────────
        const { predictedTotal } = await getQuote(tickets.length);
        send({ type: "QUOTE", predictedTotal, ticketCount: tickets.length });

        let ticketsLeft = tickets.length;

        // ── Main loop ─────────────────────────────────────────────────────────
        for (const ticket of tickets) {
          if (forcedHumanReview) {
            const shadowCosts = calculateShadowCosts({ riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, classification: "Human Review", dominantFactor: "Budget exhausted", signals: [] });
            const pt: ProcessedTicket = {
              ticket,
              classification: { riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, signals: [], dominantFactor: "Budget exhausted", classificationBadge: "Human Review" },
              policy: {
                decision: "human_review",
                reason: "Budget exhausted — queued for human review",
                considered: { economy: "rejected", precision: "rejected", humanReview: "selected" },
                decisionPath: ["Budget Exhausted", "Human Review"]
              },
              policyMetrics: {
                shadowPremiumCost: shadowCosts.shadowCostAlwaysStrong,
                shadowCheapCost: shadowCosts.shadowCostAlwaysCheap,
                actualSpend: 0,
                policySavings: shadowCosts.shadowCostAlwaysStrong,
                runningCapitalRemaining: remaining
              }
            };
            send({ type: "TICKET_PROCESSED", ticket: pt });
            ticketsLeft -= 1;
            continue;
          }

          try {
            // a. Triage
            const { scores, headers: triageHeaders } = await triageTicket(ticket.text);
            remaining = Math.max(0, remaining - triageHeaders.customerCharge);
            let actualSpend = triageHeaders.customerCharge;

            // b. Policy
            const policyOutput = decideTier(scores, { remaining, ticketsLeft });
            const shadowCosts = calculateShadowCosts(scores);

            // c. Execute
            let runtime: ProcessedTicket["runtime"];
            if (policyOutput.decision !== "human_review") {
              const { headers: execHeaders } = await executeTicket(ticket.text, policyOutput.decision);
              remaining = Math.max(0, remaining - execHeaders.customerCharge);
              actualSpend += execHeaders.customerCharge;
              
              runtime = {
                model: "BTL Router", 
                provider: "BTL-2", 
                gatewayMode: "marketplace",
                cacheTier: execHeaders.cacheTier,
                benchmarkCost: execHeaders.benchmarkCost,
                customerCharge: execHeaders.customerCharge,
                runtimeSaved: execHeaders.saved,
                requestId: execHeaders.requestId
              };
            }

            const pt: ProcessedTicket = {
              ticket,
              classification: {
                riskScore: scores.riskScore,
                complexity: scores.complexity,
                confidence: scores.confidence,
                businessValue: scores.businessValue,
                signals: scores.signals,
                dominantFactor: scores.dominantFactor,
                classificationBadge: scores.classification
              },
              policy: {
                decision: policyOutput.decision,
                reason: policyOutput.reason,
                considered: policyOutput.considered,
                decisionPath: policyOutput.decisionPath
              },
              runtime,
              policyMetrics: {
                shadowPremiumCost: shadowCosts.shadowCostAlwaysStrong,
                shadowCheapCost: shadowCosts.shadowCostAlwaysCheap,
                actualSpend,
                policySavings: Math.max(0, shadowCosts.shadowCostAlwaysStrong - actualSpend),
                runningCapitalRemaining: remaining
              }
            };

            send({ type: "TICKET_PROCESSED", ticket: pt });

          } catch (err) {
            if (err instanceof InsufficientCreditsError) {
              forcedHumanReview = true;
              const shadowCosts = calculateShadowCosts({ riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, classification: "Human Review", dominantFactor: "Insufficient credits", signals: [] });
              const pt: ProcessedTicket = {
                ticket,
                classification: { riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, signals: [], dominantFactor: "Insufficient credits", classificationBadge: "Human Review" },
                policy: {
                  decision: "human_review",
                  reason: "402 — insufficient credits, downgraded to human review",
                  considered: { economy: "rejected", precision: "rejected", humanReview: "selected" },
                  decisionPath: ["Insufficient Credits", "Human Review"]
                },
                policyMetrics: {
                  shadowPremiumCost: shadowCosts.shadowCostAlwaysStrong,
                  shadowCheapCost: shadowCosts.shadowCostAlwaysCheap,
                  actualSpend: 0,
                  policySavings: shadowCosts.shadowCostAlwaysStrong,
                  runningCapitalRemaining: remaining
                }
              };
              send({ type: "TICKET_PROCESSED", ticket: pt });
            } else if (err instanceof MissingKeyError) {
              send({ type: "ERROR", message: err.message });
              controller.close();
              return;
            } else {
              console.error("Ticket error:", err);
            }
          }

          ticketsLeft -= 1;
        }

        send({ type: "COMPLETE" });

      } catch (err) {
        send({ type: "ERROR", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
