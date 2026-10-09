# Design

## Context

The repository is greenfield with a continuity harness and no application baseline. The approved plan preserves phone-only processing and a 6-8-hour scope. See proposal.md for product motivation.

## Goals / Non-Goals

**Goals:** A restartable setup app and an exportable target-device gate. Remaining reviewer features belong to later changes.

**Non-Goals:** Provider frameworks, servers, cloud inference, multi-lesson management, and unobserved compatibility claims.

## Decisions

- React/Vite/TypeScript with pinned packages; HTTPS static delivery. The user's existing skills fit this approach better than introducing native Android before feasibility is known.
- Dedicated WebLLM worker with Qwen3-0.6B as first candidate. Pass `extra_body.enable_thinking: false`. Store actual outputs and durations; require human semantic review. No runtime API-presence check substitutes for generation.
- Runtime cache remains owned by WebLLM. App shell/dynamic chunks use a namespaced PWA cache. Cache cleanup must not enumerate and delete unrelated caches. Cache all worker OCR assets when OCR is introduced, including English/Filipino data.
- Separate runtime and evidence persistence modules; one heavy task at a time. Use bounded setup prompts and output.
- IndexedDB holds gate evidence and later lesson data. Successful writes precede saved labels. Model download status is independent of language/quality review and cold offline proof.
- Later changes will implement lesson revisions and quiz scoring; this change persists only setup evidence.
- Setup gate ships first. All later implementation stays blocked until actual Honor X9c checks are recorded. A failure triggers a user decision rather than an automatic fallback.
- User-selected study-notebook UI: warm paper, ink navy, amber accent, local fonts, fixed light theme, restrained motion. Each screen has one primary action. Use explicit progress, empty, and error states.

## Risks / Trade-offs

- Mobile GPU allocation or bilingual quality may fail: time-box phone checks and preserve raw evidence.
- Cache eviction or worker-side requests may prevent offline loading: perform cold reopening and export records, separately from online generation.
- Large setup download: show truthful progress and retry; do not invent download size or latency.
- Phone hardware is not accessible to the coding agent: provide a runnable gate, instructions, and exportable evidence before pausing dependent work.

## Migration Plan

No existing application data needs migration. Version the IndexedDB schema and application cache independently. Configure install/verify/start commands with scaffolding. Prepare an HTTPS build for phone testing and retain the active OpenSpec change until all required behaviors are verified.
