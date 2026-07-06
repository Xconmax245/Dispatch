// app/api/demo-batch/route.ts
// Streams pre-recorded fixture tickets via SSE, identical format to /api/run-batch.
// No GATEWAY_API_KEY required. Used by /dispatch?demo=true.

import { DEMO_FIXTURES, DEMO_TICKET_COUNT } from "@/lib/demo-fixtures";

export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Simulate parse step
        send({ type: "PARSING" });
        await sleep(600);

        send({ type: "PARSE_COMPLETE", ticketCount: DEMO_TICKET_COUNT });
        await sleep(300);

        send({
          type: "QUOTE",
          predictedTotal: 0.0088,
          ticketCount: DEMO_TICKET_COUNT,
        });
        await sleep(400);

        // Stream each fixture with a realistic delay
        for (const ticket of DEMO_FIXTURES) {
          await sleep(900 + Math.random() * 600);
          send({ type: "TICKET_PROCESSED", ticket });
        }

        await sleep(300);
        send({ type: "COMPLETE" });
      } catch (err) {
        send({ type: "ERROR", message: String(err) });
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
