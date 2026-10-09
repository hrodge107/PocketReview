# OpenSpec setup audit

## Final setup verification - 2026-10-10

The user approved the proposed requirement reconciliation. The setup delta now requires truthful cloud connection states; full saved-study cold-offline acceptance remains in the approved offline-resume tracker item. No product requirement was discarded. A new production browser check disconnected the browser, attempted a configured cloud check, observed the internet-required error and verified prior mock results remained visible with zero accepted live checks. All six production browser checks passed after correcting a test selector that initially matched only part of a longer text element.

Task 1.5 is now complete; total 5/5. The revised five setup requirements and seven scenarios have implementation/documentation and scoped evidence: recorded clean startup/build/13 focused tests, six production browser checks, four real cloud answers, user semantic review and concrete local-serving documentation. The previous audit's three critical findings are resolved. No critical issue remains for the revised desktop setup scope. Native/phone, external deployment, actual local inference and later reviewer/offline behavior remain unverified and are not credited to this setup change. Existing antislop desktop delivery checks remain applicable because no UI was changed in this closure.

## Human-review update - 2026-10-10

The user stated “Yes, the answers are fine,” accepting all four presented live answers. `verification/live/reviewed-browser-1791574644380.json` retains the original outputs and adds faithful review values, the exact verdict and the original export's SHA-256. Original evidence remains unchanged; browser storage was not changed. Task 1.4 is now complete, so the original pending-human-review findings below are resolved. Current task count is 4/5. Task 1.5 and the misplaced offline-study requirement remain unresolved; the user has not confirmed the proposed artifact correction. No feature is passing or ready for archive yet. The audit below preserves the findings before this review.

Audited on 2026-10-10. Change: `offline-photo-reviewer-mvp`; active feature: `phone-setup`. This is a source/artifact/evidence audit, not a new test run. Existing implementation and user diagnostics were preserved.

| Dimension | Finding |
| --- | --- |
| Completeness | 3/5 tasks checked; 1.4 and 1.5 remain incomplete. |
| Correctness | Setup paths have implementation and recorded desktop/live evidence. Saved lesson/card/quiz offline behavior has no implementation in this change. |
| Coherence | Expo/cloud boundaries match the revised design. The setup delta includes a later backlog feature's offline acceptance. |

## Critical issues

1. **Task 1.4 incomplete** (`openspec/changes/offline-photo-reviewer-mvp/tasks.md:10`). Four actual cloud responses exist in `verification/live/browser-1791574644380.json`, all with `review: pending`. Model/license/runtime planning exists in `docs/local-portability.md` and `verification/model-portability.json`. Obtain and record the human assessment of meaning and language before checking this task. Successful schema and quotation validation cannot substitute for that assessment.
2. **Task 1.5 incomplete** (`tasks.md:11`). Persistence/export, failure recovery and desktop UI checks have recorded evidence, but its explicit condition that all revised desktop/live criteria pass is not satisfied while human review remains pending. Keep the task unchecked.
3. **Requirement not implemented: Saved study availability and truthful offline states** (`specs/phone-setup/spec.md:32`). The active app contains setup evidence, not saved lesson sources, generated cards or quiz progress. There is no observed cold offline saved-study or deterministic quiz acceptance. The tracker assigns this behavior to `offline-resume`, after `study-practice` and `lesson-chat`. Reconcile requirement ownership without deleting the product obligation or implementing dependent features ahead of their gates. Do not claim this requirement passed from setup-evidence reload.

## Requirement and scenario mapping

Paths below are relative to the repository root. Spec line numbers refer to `openspec/changes/offline-photo-reviewer-mvp/specs/phone-setup/spec.md`.

| Requirement / scenario | Implementation and evidence | Assessment |
| --- | --- | --- |
| Honest readiness (7); endpoint unavailable (10) | `mobile/model-service.ts`, `shared/model.ts`, `mobile/use-setup.ts`, `worker/index.ts`; focused Worker and production browser error/recovery checks recorded in `verification/expo-setup.md` | Desktop paths covered; error tests use simulated failures. |
| Development mock (14) | Explicit mode labels in `mobile/App.tsx`; mock adapter; `mobile/evidence.ts` excludes mock results from live acceptance; browser mock/export test | Covered in recorded desktop checks. |
| Exportable desktop gate (18); live generation succeeds (21) | `mobile/evidence.ts`, platform export modules and setup hook; live browser JSON contains actual outputs, latency, cloud identity/environment and pending review; script checks export and reload | Structural/live/persistence evidence exists; human semantic review remains pending. |
| Credentials/disclosure (25); cloud request (28) | Disclosure in `mobile/App.tsx`; bounded text-only contract; server AI binding and runtime-only demo code; Worker authorization tests and recorded bundle scan | Desktop path evidenced. No external Worker deployment claimed. |
| Saved study/offline (32); connection absent (35) | Approved `offline-resume` backlog item; no active lesson/card/quiz implementation | Not implemented or verified; setup reload is insufficient. |
| Desktop acceptance (39,42) | Clean install/build, focused tests, production browser checks and four real cloud calls are recorded | Partial: human review remains pending; dependent implementation cannot yet advance under this requirement. |
| Future local deployment (46) | `docs/local-portability.md`, `verification/model-portability.json`; concrete model artifact, license, runtime revision, size and hardware planning | Documentation exists; artifact download, local serving and target-device execution remain unverified. |

## Coherence warnings

- The proposal and tasks explicitly limit this change to setup while retaining later features as separate changes. The offline saved-study delta contradicts that implementation boundary. Proposed reconciliation: retain truthful mode/connection disclosure in setup and place saved lesson/cards/quiz cold-offline acceptance in the later `offline-resume` change. That obligation already exists in the approved feature tracker; it must stay there. This audit does not edit the delta.
- Planning-time statements about unverified cloud access in the proposal/design and agent instructions predate the successful live checks. Current evidence demonstrates the local Worker-to-remote-AI route, not a production deployment. Prefer the dated evidence over those earlier statements; do not erase historical failures.

## Design and pattern consistency

The active Expo entry, shared bounded contract, small model/persistence modules, server-side provider access, separate historical Vite diagnostics, source-revision/quotation validation and explicit cloud/mock labels follow the revised design. Notebook styling and desktop accessibility/mobile-width checks have a recorded antislop delivery report in `verification/expo-setup.md`. No UI was changed during this audit.

## Verification limits and disposition

- No new inference calls, deployments or application tests were run for this audit. Prior recorded results include 13 focused tests after the prompt correction, the production export/Worker dry-run and five production browser checks. The earlier antislop report records the preceding 12-test baseline; it is not a claim that every later live behavior was tested there.
- Physical phone/native OCR, full reviewer behavior, cold offline study, actual local model serving, deployed Worker behavior and account allowance were not verified here.
- Keep `phone-setup` in progress and tasks 1.4/1.5 unchecked. Do not archive or advance dependencies on the basis of this report. Resolve human review and the misplaced offline requirement first.
