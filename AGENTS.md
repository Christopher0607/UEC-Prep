<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## This project

UEC 冲刺系统 — a single-student study tracker for the 2026 UEC (统考).

Hard constraints, do not break them:

- **Zero running cost.** No API keys, no backend, no database. `output: "export"`
  produces a static site. All state lives in `localStorage` via `lib/store.ts`.
- **The app records, Claude reasons.** Instead of calling an LLM, screens build a
  structured prompt (`lib/prompt.ts`) that the student copies into a Claude
  conversation. Keep that seam — it is what makes the app free.
- **Never invent syllabus content.** Topic lists come from the official 考纲 the
  student pastes in. Shipping guessed UEC topics would send them studying the
  wrong things.
- **`lib/english.ts` is teacher-sourced.** Every rule in it came from the
  student's own English teacher. Do not add, "correct", or complete entries from
  general exam knowledge — the unconfirmed fifth level of analysis stays marked
  unconfirmed until the teacher names it.
