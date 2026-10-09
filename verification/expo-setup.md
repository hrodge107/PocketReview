# Expo setup verification

Closure update, 2026-10-10: all five setup tasks are complete. Four real cloud outputs have the user's accepted meaning/language verdict in verification/live/reviewed-browser-1791574644380.json. The approved setup spec correction preserves later saved-study/offline acceptance in offline-resume. Six production browser checks now pass, including an actual browser-offline cloud request that explains the connection requirement and preserves prior results. No UI was changed; the antislop desktop report below remains applicable. The earlier baseline details below are historical; later focused-test count is 13 after the prompt regression. Phone/native/local inference and external Worker deployment remain unverified.

Observed on 2026-10-10 on Windows with installed desktop Chrome. Active feature: `phone-setup`; OpenSpec tasks 1.1-1.3 complete, 1.4 and full 1.5 pending. Feature remains in progress.

## Engineering evidence

- Pre-migration Vite baseline passed before dependency replacement.
- Fresh `./init.ps1` passed `npm ci` and the configured verification sequence. An earlier clean install hit a Windows native module lock; the obsolete dependency directory was moved to ignored `.locked-node-modules/`, with both absolute paths checked inside the workspace. No unrelated processes were killed.
- Final `npm run verify`: type checking, 12 tests in three files, production Expo web export and Worker deployment dry-run passed. Final web JavaScript bundle was approximately 396 KB as reported by Expo. This is artifact size, not measured download time or model latency.
- `npm run test:browser`: five production Chrome checks passed. Covered mock labels, all review controls, JSON export contents, reload, cloud configuration failure, runtime-only access-code storage, cancellation, keyboard activation, 320px layout, failed-write recovery and failed-read blocking/recovery.
- Worker tests covered origin rejection, missing/incorrect access, missing configuration, source/body bounds, shared request limit, exact quotation validation, quota errors, timeout and independent subsequent request recovery. AI bindings were mocked; no remote inference was run.
- Production bundle scan excluded test credential/model literals and the old WebLLM runtime. Provider credentials are not build inputs. The public endpoint URL is optional; the demo access code is entered into session memory.
- Expo dependency compatibility check passed. npm audit reports 22 upstream findings (7 moderate, 15 high), rooted in build/configuration tooling dependencies braces, node-forge and uuid. Non-forced audit fixes did not resolve them; current registry releases still included affected braces/node-forge versions. See README for the limitation.
- Original diagnostic source in `src/` is preserved. Legacy configuration/manifests are saved under `verification/legacy-vite/`. New setup evidence uses a separate key and does not modify the historical WebLLM database/caches.

## Antislop delivery gate: observed desktop setup scope

Evidence includes inspected screenshots `test-results/expo-setup-desktop.png` and `test-results/expo-setup-mobile.png`, production browser tests and `DESIGN.md`. Screenshots are ignored development artifacts. The report concerns the desktop web setup, including narrow browser layout; it does not establish phone behavior or finished reviewer features.

### Hard gate

- R-02 PASS: active UI text contains no em dash.
- R-03 PASS: 320px browser check found no horizontal document overflow; narrow screenshot inspected.
- R-17 PASS: displayed durations are measured runs and live-check counts derive from evidence; simulated runs are labeled.
- R-18 PASS: no testimonials or fabricated customer identities.
- R-23 PASS: no new visual assets; source lessons and responses are explicitly labeled setup fixtures.
- R-24 PASS: setup has mode controls rather than links to unfinished screens.
- R-25 PASS: navy on paper measures 13.07:1; paper on amber measures 4.59:1. Controls share these colors; inactive controls are visibly disabled.
- R-26 PASS: each button has an implemented handler; browser tests exercised modes, run/cancel, review/reset, export and read/write retries.
- R-27 PASS: initial empty state, loading message, read/write failures and request errors have visible text and recovery controls.
- R-28 PASS: no filler FAQ.
- R-32 PASS: browser Tab/Enter activation tested; navy focus border visible in the inspected mobile-width screenshot; fields and controls have accessible labels.
- R-33 PASS: UI components and styling are authored in source, not runtime DOM or CSS patch scripts.
- R-34 PASS: fixed light theme follows approved notebook direction; no unimplemented theme toggle.
- R-35 PASS: production build and recorded click-through checks ran; desktop and narrow screenshots inspected.
- R-36 PASS: no verified phone, local AI, offline-shell or real model-quality claim appears in the active setup.
- R-37 PASS: preexisting DESIGN.md establishes notebook direction and ENERGY 1 / RHYTHM 1 / MOTION 1 before UI work.
- R-38 PASS: mock fixture mode and unfinished capabilities are disclosed; generated evidence is not fabricated.

### Purpose gate

- R-01 PASS: warm paper, navy and amber derive from the approved study-notebook palette; no gradients.
- R-04 PASS: no decorative icons.
- R-06 PASS: system sans separates controls; Georgia on web distinguishes source/answers as notebook text. Native font remains the system font.
- R-07 PASS: no background patterns; solid rules separate source, setup and results.
- R-08 PASS: no decorative button arrows.
- R-09 PASS: mode labels identify actual state without capsule badges.
- R-10 PASS: no glassmorphism.
- R-12 PASS: no elevated shadow surfaces.
- R-13 PASS: no glow or decorative status lights.
- R-14 PASS: result rows represent actual checks; consistent rules support comparison without decorative cards.
- R-19 PASS: calm static layout with focus/pressed feedback and no perpetual animation.
- R-22 PASS: no generic illustration.

### Liveliness

- Dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 recorded in DESIGN.md.
- Consistency PASS: quiet source-first composition matches the declared notebook direction.
- Focal point PASS: amber marks the sample-check action; other actions remain navy outlines.
- Whitespace PASS: section spacing separates source, service setup and evidence inspection.
- Accent PASS: amber is limited to the primary action.
- Motif PASS: serif source passages and solid notebook rules repeat across actual study evidence.
- Design read PASS: inherited user-approved notebook direction was read before generation.

### Craftsmanship and quality locks

- C-1 PASS: palette, typography, spacing and rules follow written notebook reasons.
- C-2 PASS: controls have working handlers and recorded browser interaction.
- C-3 PASS: sections support setup, source inspection, actual evidence or the deferred local-path disclosure.
- C-4 PASS: tested empty/loading/cancel/failure/recovery states and keyboard/narrow layouts work within desktop scope.
- C-5 PASS: actual evidence is separate from simulations and pending compatibility.
- R-05 PASS: setup/evidence spread follows this inspection task; no marketing template sections.
- R-11 PASS: small control radius; result/source sections remain flat ruled content.
- R-15 PASS: actions name checks, export, review and recovery directly.
- R-16 PASS: no marketing claims or AI buzzwords in product copy.
- R-20 PASS: notebook source typography and evidence spread express the approved study identity.
- R-21 PASS: paper light theme is an explicit user choice.
- R-29 PASS: paper/navy palette with one amber accent.
- R-30 PASS: composition follows PocketReview's task rather than a cloned product.
- R-31 PASS: major visual choices have reasons in DESIGN.md and this report.

## Remaining acceptance

Cloudflare account/configuration, model availability/license/weights/local hardware path, real bilingual meaning review and live evidence persistence must be completed before passing. Task 1.5 already has implementation and desktop evidence, but its final live acceptance remains unchecked. No archive or dependency advancement.

Native keyboard/safe-area/device behavior, actual Android OCR/storage and on-phone model execution remain unverified. The Expo setup export currently has no offline app-shell cache. Saved-content cold reopening belongs to the later offline-resume feature. No Worker was deployed, and no Cloudflare allowance was consumed by the tests.

## Live continuation evidence (2026-10-10)

The account/local Worker is now available. The single diagnostic retry identified JSON parsing as the absent-answer failure. A prompt-only correction (concrete abstention JSON example; no prose-only refusal/Markdown) retained strict quotation and schema checks. Four actual cloud outputs passed structural validation in verification/live/checks-1791574472201.json. A second required browser integration run passed four live checks, export and reload in verification/live/browser-1791574644380.json. Calls consumed real provider allowance; no automatic retry occurred.

Human semantic review is still pending and explicitly requested. Local serving/phone behavior remains unverified. The deployment/portability record is now concrete in docs/local-portability.md and verification/model-portability.json. Latest focused tests: 13 passed. The prompt change's production export and Worker dry-run passed; the previously observed desktop antislop report remains applicable because no UI layout or control changed. No setup archive or passing status yet.
