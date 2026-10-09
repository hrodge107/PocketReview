# Proposal

## Why

Students can now inspect and confirm locally recognized text, but cannot yet study from it. The next complete step is a small reviewer whose answers can be checked against the confirmed pages.

## What Changes

- Generate five short question/answer study items in English or Filipino from confirmed corrected text using the configured live cloud service.
- Validate page references, exact quotations, source revision, output shape and bounds before saving or displaying generated items.
- Generate sequential small batches with at most one bounded invalid-output retry for the complete operation. Preserve existing saved work on failure, cancellation or lost connection.
- Show item answers and source quotations for inspection, and persist the successful reviewer with the lesson. Source edits continue to invalidate it.
- Keep photos local; disclose that corrected source text is sent to the cloud. Mock setup fixtures cannot pass live reviewer acceptance.

## Capabilities

### New Capabilities

- `generate-reviewer`: Bounded, source-linked bilingual study-item generation and persistence.

### Modified Capabilities

None. This adds the next stage without changing source confirmation or setup acceptance.

## Impact

Shared reviewer validation, a Worker reviewer route, cloud transport reuse, shared lesson state and a reviewer screen. No card flipping, scored quiz or lesson chat in this change; those remain the next separate features.
