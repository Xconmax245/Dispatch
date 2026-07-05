import { NextRequest, NextResponse } from "next/server";
import {
  triageTicket,
  executeTicket,
  InsufficientCreditsError,
  MissingKeyError,
} from "@/lib/runtime-client";
import { decideTier, calculateShadowCosts } from "@/lib/policy";
import {
  getPriorContext,
  appendMessage,
  computeEscalationTrend,
  getConversationLength,
  getMessageFrequency,
} from "@/lib/session-store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let channel = "dm";
  let senderId = "unknown";
  try {
    const body = await req.json().catch(() => ({}));
    channel = body.channel || "dm";
    senderId = body.senderId || "unknown";
    const {
      text,
      mode = "decide",
      remainingCapital = 0.3,
      ticketsLeft = 1,
    } = body;

    // Guard: text must be present
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Missing or invalid 'text' property in request body." }, { status: 400 });
    }

    if (mode !== "decide" && mode !== "execute") {
      return NextResponse.json({ error: "Invalid 'mode' property. Allowed values: 'decide', 'execute'." }, { status: 400 });
    }

    // ── Guard: key must exist ────────────────────────────────────────────
    if (!process.env.GATEWAY_API_KEY) {
      return NextResponse.json({ error: "GATEWAY_API_KEY is not set. Dispatch requires a live Runtime connection." }, { status: 500 });
    }

    // ── Session context (only for named senders, not anonymous pastes) ───
    const priorContext = getPriorContext(senderId);
    const frequencySignal = getMessageFrequency(senderId);

    // 1. Triage — context-aware when session exists, vanilla when senderId is "unknown"
    const { scores, headers: triageHeaders } = await triageTicket(
      text,
      priorContext.map((m) => ({ text: m.text, tier: m.tier })),
      frequencySignal
    );

    // Compute session metadata BEFORE appending this message
    const conversationLength = getConversationLength(senderId);
    const escalationTrend = computeEscalationTrend(senderId, scores.riskScore);

    // 2. Policy decision
    const policyOutput = decideTier(scores, { remaining: remainingCapital, ticketsLeft });
    const shadowCosts = calculateShadowCosts(scores);

    let actualSpend = triageHeaders.customerCharge;
    let reply: string | undefined;
    let execHeaders: typeof triageHeaders | undefined;

    // 3. Execute (if mode is 'execute' and decision is not 'human_review')
    if (mode === "execute" && policyOutput.decision !== "human_review") {
      const execResult = await executeTicket(text, policyOutput.decision);
      execHeaders = execResult.headers;
      actualSpend += execHeaders.customerCharge;
      reply = execResult.reply;
    }

    // 4. Append this message to the session AFTER scoring is complete
    appendMessage(senderId, text, policyOutput.decision, scores.riskScore);

    // Build evidence object
    const evidence = {
      requestId: execHeaders?.requestId || triageHeaders.requestId,
      cacheTier: execHeaders?.cacheTier || triageHeaders.cacheTier,
      benchmarkCost: execHeaders?.benchmarkCost || triageHeaders.benchmarkCost,
      customerCharge: execHeaders?.customerCharge || triageHeaders.customerCharge,
      saved: execHeaders?.saved || triageHeaders.saved,
      triageRequestId: triageHeaders.requestId,
      triageCustomerCharge: triageHeaders.customerCharge,
      triageBenchmarkCost: triageHeaders.benchmarkCost,
      triageSaved: triageHeaders.saved,
      execRequestId: execHeaders?.requestId,
      execCustomerCharge: execHeaders?.customerCharge,
      execBenchmarkCost: execHeaders?.benchmarkCost,
      execSaved: execHeaders?.saved,
      // Conversation-awareness metadata
      conversationLength: conversationLength + 1,
      escalationTrend,
      priorMessageCount: conversationLength,
    };

    return NextResponse.json({
      channel,
      senderId,
      tier: policyOutput.decision,
      reason: policyOutput.reason,
      scores: {
        riskScore: scores.riskScore,
        complexity: scores.complexity,
        confidence: scores.confidence,
        businessValue: scores.businessValue,
        signals: scores.signals,
        dominantFactor: scores.dominantFactor,
        classificationBadge: scores.classification
      },
      policy: {
        considered: policyOutput.considered,
        decisionPath: policyOutput.decisionPath
      },
      evidence,
      shadowCosts,
      actualSpend,
      reply
    });

  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      const shadowCosts = calculateShadowCosts({ riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, classification: "Human Review", dominantFactor: "Insufficient credits", signals: [] });
      return NextResponse.json({
        channel,
        senderId,
        tier: "human_review",
        reason: "402 — insufficient credits, downgraded to human review",
        scores: { riskScore: 0.5, complexity: 0.5, confidence: 0.5, businessValue: 0.5, signals: [], dominantFactor: "Insufficient credits", classificationBadge: "Human Review" },
        policy: {
          considered: { economy: "rejected", precision: "rejected", humanReview: "selected" },
          decisionPath: ["Insufficient Credits", "Human Review"]
        },
        evidence: {
          requestId: "",
          cacheTier: "none",
          benchmarkCost: shadowCosts.shadowCostAlwaysStrong,
          customerCharge: 0,
          saved: shadowCosts.shadowCostAlwaysStrong,
          conversationLength: 1,
          escalationTrend: false,
          priorMessageCount: 0,
        },
        shadowCosts,
        actualSpend: 0
      });
    } else if (err instanceof MissingKeyError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    } else {
      console.error("Intercept error:", err);
      return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  }
}
