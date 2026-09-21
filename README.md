# Mohader (محاضر)

An AI study companion that turns a student's own course files (PDF, Word,
PowerPoint, Excel, plain text) into lessons, explanations, practice questions
(MCQ, true/false, fill-in-the-blank, definitions, calculations, short answer),
study plans, and narrated explainer videos — all generated **strictly from the
uploaded material**. The AI is instructed to use only the supplied source
blocks and to cite the block(s) each item came from; ungrounded items are
discarded rather than shown to the student.

Built with [TanStack Start](https://tanstack.com/start) (React 19 + TanStack
Router, server functions, SSR) and [Supabase](https://supabase.com) (Postgres,
Auth, Storage).

## Stack

- **Framework**: TanStack Start (Vite + Nitro), React 19, TypeScript (strict)
- **Package manager**: [Bun](https://bun.sh)
- **UI**: Tailwind CSS v4, shadcn/ui (Radix primitives)
- **Backend**: TanStack Start server functions (`src/lib/*.functions.ts`) and
  server-only modules (`src/lib/*.server.ts`) — no separate backend service
- **Database / Auth / Storage**: Supabase
- **AI**: a single provider-agnostic abstraction in `src/lib/ai.server.ts`
  (see below)

## Getting started

```sh
bun install
cp .env.example .env   # fill in your own values, see below
bun run dev
```

Other scripts: `bun run build`, `bun run preview`, `bun run lint`, `bun run format`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- **Supabase** — from your project's Dashboard → Project Settings → API.
  `SUPABASE_SERVICE_ROLE_KEY` is required server-side (admin operations,
  bypasses RLS) — never commit it and never expose it to client code.
- **AI provider** — `AI_GATEWAY_URL` / `AI_API_KEY` / `AI_MODEL`. Any endpoint
  that speaks the OpenAI "chat completions" format works: OpenRouter, OpenAI
  directly, or any compatible gateway. `.env.example` has ready-to-use values
  for common choices.

`.env` is git-ignored; never commit real secrets.

## Deployment

The Vite/Nitro build currently targets Cloudflare Workers/Pages (see
`vite.config.ts`) — change the `target` there if you deploy elsewhere (a plain
Node host, Vercel, Netlify, ...). The app needs: somewhere to run the built
server, a Supabase project (schema in `supabase/migrations/`), and an AI
provider configured per above.
