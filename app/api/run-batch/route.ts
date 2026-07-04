import { NextRequest } from "next/server";
import { parseRawMessages } from "@/lib/parse-tickets";
import {
  getQuote,
  MissingKeyError,
} from "@/lib/runtime-client";
import { calculateShadowCosts } from "@/lib/policy";
import type { ProcessedTicket } from "@/lib/ticket-types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const startingCapital = parseFloat(body.startingCapital) || 0.3;
  const rawText: string = body.rawText ?? "";

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.nextUrl.protocol || "http:";
  const interceptUrl = `${protocol}//${host}/api/intercept`;

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
            // Call intercept API internally
            const interceptRes = await fetch(interceptUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: ticket.text,
                channel: ticket.channel,
                mode: "execute",
                remainingCapital: remaining,
                ticketsLeft
              })
            });

            if (!interceptRes.ok) {
              const errBody = await interceptRes.json().catch(() => ({}));
              const errMsg = errBody.error || `HTTP ${interceptRes.status}`;
              if (interceptRes.status === 401 || errMsg.includes("GATEWAY_API_KEY")) {
                throw new MissingKeyError();
              }
              throw new Error(errMsg);
            }

            const resData = await interceptRes.json();

            // Set forcedHumanReview to true if credits are exhausted / 402 happened
            if (resData.reason && resData.reason.includes("402")) {
              forcedHumanReview = true;
            }

            const pt: ProcessedTicket = {
              ticket,
              classification: resData.scores,
              policy: {
                decision: resData.tier,
                reason: resData.reason,
                considered: resData.policy.considered,
                decisionPath: resData.policy.decisionPath
              },
              runtime: resData.tier === "human_review" ? undefined : {
                model: "BTL Router",
                provider: "BTL-2",
                gatewayMode: "marketplace",
                cacheTier: resData.evidence.cacheTier,
                benchmarkCost: resData.evidence.benchmarkCost,
                customerCharge: resData.evidence.customerCharge,
                runtimeSaved: resData.evidence.saved,
                requestId: resData.evidence.requestId
              },
              reply: resData.reply,
              policyMetrics: {
                shadowPremiumCost: resData.shadowCosts.shadowCostAlwaysStrong,
                shadowCheapCost: resData.shadowCosts.shadowCostAlwaysCheap,
                actualSpend: resData.actualSpend,
                policySavings: Math.max(0, resData.shadowCosts.shadowCostAlwaysStrong - resData.actualSpend),
                runningCapitalRemaining: Math.max(0, remaining - resData.actualSpend)
              }
            };

            remaining = Math.max(0, remaining - resData.actualSpend);
            send({ type: "TICKET_PROCESSED", ticket: pt });

          } catch (err) {
            if (err instanceof MissingKeyError) {
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
