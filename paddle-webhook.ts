// UNVERIFIED route wiring — see src/routes/api/checkout.ts's comment.
import { createServerFileRoute } from "@tanstack/react-start/server";
import { handlePaddleWebhook, WebhookAuthError } from "@/lib/paddle-webhook.server";

export const ServerRoute = createServerFileRoute("/api/paddle-webhook").methods({
  POST: async ({ request }) => {
    const rawBody = await request.text();
    try {
      const result = await handlePaddleWebhook(rawBody, request.headers.get("Paddle-Signature"));
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      if (error instanceof WebhookAuthError) {
        return new Response(JSON.stringify({ error: "INVALID_SIGNATURE" }), { status: 401 });
      }
      console.error("[paddle-webhook] processing failed", error);
      return new Response(JSON.stringify({ error: "PROCESSING_FAILED" }), { status: 500 });
    }
  },
});
