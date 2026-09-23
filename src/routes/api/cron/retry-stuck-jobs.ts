// UNVERIFIED route wiring — see src/routes/api/checkout.ts's comment.
import { createServerFileRoute } from "@tanstack/react-start/server";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { retryStuckJobs } from "@/lib/jobs.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ServerRoute = createServerFileRoute("/api/cron/retry-stuck-jobs").methods({
  POST: async ({ request }) => {
    const denied = await authenticateCronRequest(request);
    if (denied) return denied;
    const result = await retryStuckJobs(supabaseAdmin);
    return new Response(JSON.stringify(result), { status: 200 });
  },
});
