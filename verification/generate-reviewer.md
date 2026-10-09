> Historical cloud acceptance report. The user subsequently approved mock-only delivery. Current implementation and acceptance: [mock-mvp.md](mock-mvp.md). The failed AI observations below remain unchanged.

# Reviewer verification checkpoint

Observed 2026-10-10 on Windows, desktop Chrome 154. Feature remains in progress; do not archive or advance dependent features.

## Engineering checks

- `npm run verify` passed: type checking, 24 unit tests, Expo production export (approximately 440 KB main JavaScript), Worker dry-run.
- `npm run test:browser` passed 17 production checks: six setup, seven source and four reviewer checks. Reviewer provider fixtures are explicitly simulated; these tests do not establish model quality.
- Reviewer tests exercise sequential 2/2/1 batches, a single invalid-output retry across the operation, quota failure without retry, cancellation, source edit invalidation, save/reload, and replacement-write failure. A failed replacement leaves the prior English reviewer in IndexedDB; the Filipino replacement remains unsaved in memory until explicit retry succeeds, without another provider call.
- Server and client validate exact quotations, page IDs, count, duplicate questions, bounds and source revision. Later batches omit already-covered source sentences, without changing the saved confirmed source. Client validation checks both the reduced batch input and original source.
- Worker route shares authentication, origin restrictions, input bounds and rate limiting with setup. No photos or access code appear in retained live evidence. JSON rejection diagnostics redact source words; raw model output is not logged.
- Follow-up regression: a later batch quoting a previously covered fact is rejected even when that fact remains in the original lesson. Exactly one invalid-output retry runs; the lesson remains unchanged. Type checking and all 25 unit tests passed after this test-only addition; no production code changed since the recorded build/browser checks.

## Actual model evidence and meaning review

All live runs used `@cf/meta/llama-3.2-3b-instruct`, Cloudflare Workers AI, provider-managed/unpinned revision, local Worker bridge and the production desktop app. The lesson is a confirmed synthetic biology fixture, not fresh camera/OCR evidence.

- `verification/live/reviewer-1791577529506.json`, `1791577603235`, `1791577663779`: malformed JSON rejected; no complete reviewer accepted.
- `reviewer-1791577748035.json`: first batch accepted, subsequent duplicate questions rejected.
- `reviewer-1791577904539.json`: four English items accepted before final duplicate rejection; no complete replacement saved.
- `reviewer-1791578115605.json`: five structurally valid items saved in each language, 3,467 ms English and 3,450 ms Filipino. Meaning review by the coding agent failed Filipino: several questions are unintelligible, some answers remain English, and the final item includes claims beyond its quotation. English includes an overbroad "How" question answered only by a fact. Structural success is not feature acceptance.
- `reviewer-1791578181709.json`: after language guidance, English structurally succeeded in 3,016 ms; Filipino failed within the bounded retry in 2,989 ms. A structurally accepted intermediate Filipino answer says soil supplies carbon dioxide, while its quotation only says carbon dioxide enters through stomata. This is a factual grounding failure, not just wording. No successful bilingual meaning gate exists.

Original evidence files are preserved without relabeling them as human-approved. The agent's assessment above is not human review. Production source quotations remain visible because exact matching cannot establish semantic correctness.

## OpenSpec review

Four of six tasks are complete. Three requirements map to shared/reviewer.ts, mobile/reviewer-service.ts, mobile/ReviewerScreen.tsx, mobile/use-lesson.ts and worker/reviewer.ts. Ineligible source, malformed batches, stale revisions, cancellation, quota failure, reload and failed writes are covered. Bilingual meaningful generation remains a critical unresolved requirement. Tasks 3.1 and 3.2 stay unchecked; overall verification is incomplete.

Implementation follows the small module boundaries and shared validation pattern. No new Medium/High architecture violation identified. Model quality is a feature correctness blocker, recorded here rather than mislabeled an architecture issue.

## UI inspection checkpoint

Inherited DESIGN.md: ENERGY 1 / RHYTHM 1 / MOTION 1. Notebook rules organize real question/answer/evidence rows; amber marks generation. No decorative assets, marketing claims or filler sections added. Navy/paper contrast remains 13.07:1, paper/amber 4.59:1. The 320px production screenshot was inspected and the browser overflow assertion passed. Language, generation, cancellation, recovery and navigation controls have real handlers exercised in browser checks. Full delivery remains withheld because model meaning acceptance failed; this is not a completed delivery-gate report.

## Next decision

Current model stays unchanged pending the user's model/hardware decision. Gemma 3 12B was withdrawn after the current Cloudflare catalog marked it unavailable. A bounded evaluation of the available Llama 3.1 8B FP8 candidate is proposed, targeting a future owned desktop endpoint with a provisional 16 GB RAM budget. Availability does not establish Filipino quality or measured local resource requirements. If selected, rerun setup and reviewer acceptance and refresh immutable weight/license/quantization metadata before claiming portability. Phone inference remains unverified.

Sources checked: [Cloudflare catalog](https://developers.cloudflare.com/workers-ai/models/), [available 8B model](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/), [original Meta model card](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct).

The user subsequently approved and completed the bounded candidate evaluation. It failed Filipino reviewer acceptance and the 3B configuration was restored. Current findings supersede the pending-decision note above: verification/llama-8b-evaluation.md. No candidate was selected as passing.
