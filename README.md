# CronLab — cron.waweup.com

Build, explain and preview standard 5-field cron expressions with upcoming run
times in any timezone. Part of the WaweUp tool family.

- **Build mode** — compose an expression field by field with presets or custom values
- **Explain mode** — paste any 5-field expression and get a human-readable description
- **Next runs** — preview the next executions in a selectable timezone
- Standard 5-field cron only; provider-specific formats (Quartz seconds, `@yearly`, `L`/`W`/`#`) are intentionally unsupported
- Everything runs client-side — input never leaves the browser

## Stack

Next.js App Router · React · TypeScript strict · Tailwind CSS 4 · Vitest

## Development

```bash
pnpm install
pnpm dev        # local dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest
pnpm build      # production build
```

## Deployment

Deployed on Vercel as `waweup-cron` → https://cron.waweup.com
