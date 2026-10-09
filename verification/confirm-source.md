# Confirm-source verification

Observed on 2026-10-10, Windows/desktop Chrome. OpenSpec change `confirm-source`; verification scope is desktop web. Actual OCR outputs/environment and measured 3,406 ms selection-to-two-results flow are retained in `verification/source-ocr-evidence.json`. This duration includes browser selection and recognition; it is not a phone latency claim.

## Engineering evidence

- `npm run verify` passed: typecheck, 16 focused tests, production Expo export (approximately 429 KB main JS plus separately served OCR assets), Worker dry-run. Final typecheck passed after explicit native-unavailable copy was added.
- `npm run test:browser` passed all 13 checks: six retained setup checks and seven source checks. Source checks use actual Tesseract OCR, not mocked strings. Fresh English and Filipino printed-page fixtures were rasterized immediately before selection. They are synthetic pages, not camera photographs.
- Actual extracted English/Filipino fixture passages matched their printed content; no HTTP requests outside the app origin were observed during recognition. All worker/core/language URLs are fixed to that origin. No model call or cloud OCR was used.
- Verified correction preserves original OCR, explicit confirmation, source reload including photos, two-page capacity and third-photo rejection, empty-page/oversized-source rejection, image pixel/format rejection, OCR asset failure/manual recovery, cancellation, failed source reads, failed writes/retry and truthful save labels.
- Domain tests verified source edits increment revision and invalidate items, chat answers and quiz progress; unchanged edits are a no-op. Tests also reject duplicate page references and inconsistent saved confirmation. Later features must use this same mutation boundary.
- Language assets are English/Filipino fast models from tessdata_fast revision `87416418657359cb625c412a48b6e1d6d41c29bd`; SHA-256 checks are enforced by `scripts/prepare-ocr.mjs`. Local API/controller/worker and installed core variants are copied during preparation. Runtime is pinned Tesseract.js 7.0.0; image picker 57.0.20.
- Setup remains mounted separately; navigation is disabled during heavy tasks. Web lesson storage uses IndexedDB, separate from setup storage and OCR language caches. Writes are serialized and failed startup reads block mutation.

## Antislop delivery checks

Design read: inherited study-notebook direction in DESIGN.md; ENERGY 1 / RHYTHM 1 / MOTION 1. Source screen prioritizes comparing photo and corrected text, with raw OCR and confirmation below. Amber marks the primary selection/confirmation action. Navy rules, serif raw source and system controls preserve notebook identity; no decorative cards, icons, patterns, shadows or animations.

Hard gates: R-02 PASS (no em dash in active copy); R-03 PASS (320px no document overflow, stacked source columns, inspected correction/confirmation screenshots); R-17/R-18/R-23/R-36/R-38 PASS (actual counts/progress, user photos only, test images explicitly synthetic, native limits disclosed); R-24/R-26 PASS (real stage destinations and working handlers; cancellation appears only during OCR); R-25 PASS (navy/paper 13.07:1, paper/amber 4.59:1, no text overlay on photos); R-27 PASS (empty/read/loading/OCR/save failures have text and recovery); R-28 PASS (no filler FAQ); R-32 PASS (keyboard stage/model controls and labeled editable source controls, native/browser focus outlines); R-33 PASS (authored components, no runtime product DOM/CSS patches); R-34 PASS (approved light theme); R-35 PASS (build, browser flow and screenshots inspected); R-37 PASS (approved direction and dials before generation).

Purpose gates: R-01/04/06/07/08/09/10/12/13/14/19/22 PASS. Palette/type/rules have written notebook purpose; no gradient, decorative icon, badge, glow, glass, floating surface, uniform marketing cards, perpetually moving effect or generic illustration is used.

Liveliness: dials and design read explicit; one source-inspection focal point; whitespace separates real page tasks; deliberate amber action; repeated notebook rules/source typography. Craftsmanship C-1 through C-5 and R-05/11/15/16/20/21/29/30/31 PASS for observed desktop scope: authored product-specific composition, working controls, source-driven sections, clear failure/recovery, restrained radii, concrete action text, approved palette/theme, no invented metrics or imitation landing-page sections.

UI/human/layout supplements: source columns stack below 900px; 48px shared buttons and wrapping action rows; text/boundary/focus contrast retained; labeled multiline inputs, selection and keyboard activation; textual status/error signals; simulated 200% browser CSS zoom produced no horizontal overflow. No hover-only flow or fixed overlay on source content. Inspection initially exposed a removal-button overlap caused by mobile flex sizing; fixed by applying flex columns only to the desktop row and verified via screenshot plus bounding-box assertion.

Inspected development screenshots: `test-results/source-desktop.png`, `source-mobile.png`, `source-mobile-correction.png`, `source-mobile-confirm.png`. They are ignored generated artifacts, not claims of phone testing. Actual virtual-keyboard, safe-area and native camera behavior remain later device checks.

## OpenSpec verification

| Dimension | Finding |
| --- | --- |
| Completeness | Six tasks implemented and required desktop evidence recorded. |
| Correctness | Three added requirements/eight scenarios mapped below; no critical issue found in desktop scope. |
| Coherence | Small domain/storage/OCR/picker modules and notebook screen follow the design; native unavailable adapter is explicit. |

Requirement mapping: Bounded local extraction -> `mobile/photos.ts`, `mobile/ocr.web.ts`, `mobile/ocr-controller.js`, `mobile/use-lesson.ts`; fresh/failed/empty/limit scenarios exercised in source browser tests. Inspect/confirm -> `shared/lesson.ts`, `mobile/SourceScreen.tsx`; correction/nonempty/source-size scenarios exercised. Durable revision -> `shared/lesson.ts`, platform stores and save hook; source invalidation unit tests and reload/read/write browser failures cover its three scenarios. Main setup behavior remains covered by the retained six browser checks.

Architecture review: no new Medium/High violation found in touched code. Domain mutation and validation are outside UI; platform assets/storage are behind small modules; no provider/OCR infrastructure is imported into the source component. Derived arrays are provisional storage fields for the next features, not claims of implemented reviewer behavior.

## Limits

Real camera photos, mixed layouts, handwriting/diagrams and general OCR accuracy were not verified. Camera/native OCR/storage require later device work; native OCR currently returns a truthful unavailable error. Cold offline app-shell reopening belongs to offline-resume; first OCR asset preparation requires network. Desktop fixture success does not satisfy those separate acceptances. No requirement within this change's revised desktop scope was skipped. Ready for desktop-source archive with these explicit device/accuracy limits.
