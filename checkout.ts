// UNVERIFIED: this file's shape (createServerFileRoute + .methods()) is my
// best-confidence guess at this pinned TanStack Start version's file-based
// API-route convention, same caveat as the equivalent files for the Paddle
// webhook and the cron trigger — I could not install/build here to confirm
// it against the real framework. The actual logic (createCheckout) is
// plain, framework-independent, and is what to keep if this wiring needs a
// different shape; see the final report.
import { createServerFileRoute } from "@tanstack/react-start/server";
import { createCheckout } from "@/lib/checkout.server";

export const ServerRoute = createServerFileRoute("/api/checkout").methods({
  POST: ({ request }) => createCheckout(request),
});
