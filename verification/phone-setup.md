# Phone setup verification, 2026-10-10

## OpenSpec verification

Change `offline-photo-reviewer-mvp` is scoped to phone-setup. Tasks 1.1–1.3 are complete; task 1.4 is incomplete. **Critical acceptance gap:** no actual Honor X9c generation, bilingual quality review, or cold offline model reopening has been observed. Keep this change active and the feature in progress. Do not archive or implement dependent features yet.

| Requirement / scenario | Implementation | Observed verification |
| --- | --- | --- |
| Honest preparation and retry | `src/runtime.ts`, `src/App.tsx` | Browser checks exercised unavailable GPU, progress, stop and retry. Worker success responses were simulated and labeled as such. |
| Exportable functional gate | `src/gate.ts`, `src/evidence.ts`, `src/App.tsx` | Four bounded prompts, human review, metadata, output/duration, persistence and export controls exercised. Exported failure JSON was parsed and inspected by a browser test. Actual model generation remains unverified. |
| Cold offline check | PWA config, fresh worker per load, recorded page/engine identity and attestation | Production desktop shell reopened offline, evidence restored and a WebLLM-cache sentinel survived. Actual model/tokenizer/config/wasm offline availability on phone remains unverified. |
| Gate before dependent work | `feature_list.json`, tasks, `src/gate.ts` | Only phone-setup is active; desktop/simulated/unreviewed/failed results cannot satisfy phone summaries. Other six features remain not started. |

## Commands and evidence

- `npm ci`: succeeded from lockfile, 370 packages installed; audit reported zero vulnerabilities. Initial `init.ps1` attempt failed because the running preview locked a Windows native dependency; after stopping it, clean installation succeeded. Bootstrap now documents this constraint.
- `npm run verify`: passed type checking, **5 unit tests**, and production build. The build warns about large WebLLM bundles (main approximately 6.19 MB, worker approximately 6.03 MB uncompressed); no phone performance claim is made.
- `npm run test:browser`: **4 passed** in installed desktop Chrome. Tested missing WebGPU, load progress/stop, four simulated answers, generation cancellation, faithful/incorrect review, reload, failed read recovery, failed write reporting, retry saving, export JSON, keyboard focus, desktop offline shell, model-cache sentinel preservation and widths 320/360/768/1280.
- `openspec validate offline-photo-reviewer-mvp --strict`: passed.
- Pinned model configuration and library URL HEAD checks returned HTTP 200. These establish artifact availability, not device compatibility.
- Screenshots visually inspected: ignored `test-results/setup-mobile.png`, `setup-desktop.png`, `setup-simulated-results.png`. Simulated results are not real inference evidence.
- Contrast computed using WCAG relative luminance: navy/paper 13.07:1, white/amber 4.95:1, placeholder/input 5.30:1, navy/input 13.87:1. Disabled controls are inactive and visually differentiated.
- Architecture review: runtime, evidence persistence and gate rules remain separate from the screen. No medium/high violation found in the setup scope. No speculative reviewer modules added.

## Antislop delivery gate for the setup UI

Each PASS applies to the implemented setup interface and desktop checks. Phone acceptance remains pending separately.

- R-02 PASS: product copy contains no em dash.
- R-03 PASS: browser layout checks at 320, 360, 768 and 1280 pixels found no horizontal overflow; screenshots inspected.
- R-17 PASS: no invented statistics; observed times belong to individual exported results.
- R-18 PASS: no testimonials.
- R-23 PASS: notebook icon is explicitly identified as a temporary authored placeholder.
- R-24 PASS: no navigation links to missing sections.
- R-25 PASS: computed active text pairings exceed 4.5:1; focus and control borders remain visible.
- R-26 PASS: setup, stop, retry, export, reading recovery, device input, cold attestation, review selection and failure details have implemented behavior exercised in browser checks.
- R-27 PASS: empty, loading, success, failed read/write and runtime error states exercised.
- R-28 PASS: no filler FAQ.
- R-32 PASS: native inputs/buttons/select/details and visible keyboard focus checked.
- R-33 PASS: UI and styles authored as source patches; no external source/CSS injection.
- R-34 PASS: fixed approved light theme; no theme toggle.
- R-35 PASS: production build ran and all setup control types were exercised; simulated inference is disclosed.
- R-36 PASS: no fabricated performance, security, compatibility or compliance claims.
- R-37 PASS: approved notebook direction and ENERGY 1 / RHYTHM 1 / MOTION 1 recorded before implementation.
- R-38 PASS: test results are labeled simulated; product status remains pending.
- R-01 PASS: no gradients or glows.
- R-04 PASS: notebook icon relevance and placeholder status recorded in DESIGN.md/README.
- R-06 PASS: serif reading text and system controls have written reasons.
- R-07 PASS: no decorative background grid.
- R-08 PASS: no decorative button arrows.
- R-09 PASS: no capsule badges.
- R-10 PASS: no glassmorphism.
- R-12 PASS: no elevated shadow system.
- R-13 PASS: no glow.
- R-14 PASS: results use source-driven ruled articles, not template feature cards.
- R-19 PASS: native progress and hover/focus only; reduced-motion rule present.
- R-22 PASS: no generic illustrations.
- Liveliness dials PASS: explicit 1/1/1 in DESIGN.md and calm screenshots.
- Focal point PASS: model preparation is the amber primary action; evidence remains secondary.
- Structural whitespace PASS: setup/evidence separation and readable measures shown in screenshots.
- Deliberate accent PASS: amber reserved for preparation/progress and notebook icon detail.
- Identity motif PASS: warm paper, serif study copy and navy ruled source blocks.
- Design Read PASS: recorded in DESIGN.md before source UI creation.
- C-1 PASS: major decisions have written product reasons in DESIGN.md.
- C-2 PASS: implemented control types exercised in four browser tests.
- C-3 PASS: sections follow setup and inspect evidence, with no filler landing page.
- C-4 PASS: inspected empty/error/result layouts, tested four widths, keyboard focus and offline shell.
- C-5 PASS: no fabricated claims; physical acceptance explicitly pending.
- R-05 PASS: composition follows setup/evidence content and approved uniform rhythm.
- R-11 PASS: small consistent rectangular control radii; no pills.
- R-15 PASS: action labels name loading, checking, stopping, saving and export.
- R-16 PASS: no marketing buzzwords in product copy.
- R-20 PASS: notebook direction expressed through reading typography, paper and ruled evidence.
- R-21 PASS: fixed light theme is explicitly user-selected.
- R-29 PASS: paper/navy with one amber accent and neutral control borders.
- R-30 PASS: no cloned product composition.
- R-31 PASS: typography, palette, layout, spacing, separators and icon reasons recorded.

## Next action

Follow README's HTTPS phone handoff, inspect exported actual results and the cold-reopen recording. Resolve any failed gate before archiving. After phone-setup passes, propose `confirm-source` as its own change, then continue the one-feature loop.
