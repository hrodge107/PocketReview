# Design

## Context

Setup and desktop source are verified/archived. One versioned lesson persists pages, confirmation and revision, with empty derived-state fields; source edits already clear them. The Worker currently accepts bounded `/answer` requests. See proposal.md for motivation.

## Goals / Non-Goals

Goals: five inspectable items, bounded live generation and atomic replacement, one shared lesson state across source/reviewer stages.

Non-goals: card flipping, quiz choices/scoring, chat, phone inference or native OCR.

## Decisions

- Add `/reviewer` alongside `/answer` under the same origin, authentication, size and rate-limit controls. Reuse the confirmed-source request envelope and transport; keep answer and reviewer validation/output separate. User approved a bounded evaluation of Llama 3.1 8B FP8 after 3B failed bilingual meaning review. Retain the candidate only if the same setup and reviewer gates pass; provider revision remains disclosed as unpinned. Future local target is an owned desktop endpoint with provisional 16 GiB RAM, not demonstrated Honor X9c inference. Evaluation plan and artifact metadata: docs/model-evaluation-proposal.md.
- Request batches of 2, 2 and 1 items. Prior questions travel in the validation envelope but are excluded from model messages after live runs showed the model copying them. Omit source sentences covered by accepted quotations from subsequent batch inputs; keep the original confirmed source unchanged. Check each response against both its reduced input and the original source. Worker output is exactly JSON containing items with question/answer/evidence. Use bounded tokens and a 45-second provider timeout. Client allows only one extra request for invalid/unverifiable output across the operation; connection/quota/storage errors do not auto-retry.
- Validate output structure, count, question/answer/evidence bounds, page IDs and exact quotes on server and client. Reject duplicate normalized questions across batches. Assign item IDs from source revision and ordinal after validation, rather than trusting model-generated identifiers.
- Save all five items atomically only after the complete operation validates and the current lesson revision still matches. Keep prior reviewer visible during generation/failure. Retain validated replacement in memory if saving fails and expose retry; never label it saved before the write succeeds.
- Lift lesson state to the app shell so source/reviewer share the same revision and serialized storage queue. Share runtime-only service configuration through a small context; do not persist demo codes. No general provider framework.
- Keep corrected source and quotations inspectable; model-meaning review remains separate from string checks. Use actual English/Filipino live acceptance evidence and inspect generated meaning against a lesson with enough distinct facts for five items. Insufficient source is a visible generation failure rather than fabricated facts.
- Add reviewer stage and response-language controls using the same notebook controls. Plain question/answer/evidence rows serve inspection; flipping and quiz/chat navigation arrive only in their owning features.

## Risks / Trade-offs

- Structured JSON and semantic grounding may fail on the small model: reject invalid output, retain previous work and inspect real live samples; do not weaken quotation validation.
- Three batches plus one possible retry consume allowance: only bounded acceptance calls, no retry on quota errors. Configured shared rate limiter remains in effect.
- Exact quotations do not prove answers: keep evidence visible and document observed semantic assessment without claiming general model quality.
- Native photo/OCR remains a later implementation/device task; web reviewer evidence does not establish phone acceptance.
- The approved twelve-request 8B evaluation failed Filipino grounding and final-batch completion; the Worker candidate was restored to 3B. Actual evidence: verification/llama-8b-evaluation.md. No model is accepted for the reviewer yet. The model prompt now uses one system message and no JSON-schema hint; strict application validators remain required. Additional live experiments need a fresh bounded evaluation decision.
