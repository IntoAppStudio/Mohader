import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Vite configuration for the TanStack Start app: router/SSR integration,
// React, Tailwind, and "@/*" path-alias resolution.
export default defineConfig({
  plugins: [
    // Resolves the "@/*" -> "./src/*" alias from tsconfig.json.
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // SSR requests are handled by our own src/server.ts wrapper (adds
      // error capture around the framework's default server entry).
      server: { entry: "server" },
      // Nitro build target. Deploying to a plain Node host, Vercel,
      // Netlify, etc. instead of Cloudflare? Change this one value —
      // nothing else in the app depends on it.
      target: "cloudflare-module",
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Avoids duplicate React/TanStack instances if anything gets linked or
    // hoisted unusually by the package manager.
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});

// Not configured here, add if you want them:
//   - Router/Start devtools (dev-only). Install @tanstack/react-devtools if
//     you'd like it back.
//   - `server: { host, port }` above, if you need something specific for
//     your own dev environment. Standard Vite dev-server defaults apply
//     otherwise.
