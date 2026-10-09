# Design

## Context

The previous implementation was a Vite/WebLLM setup gate; its source is preserved while the active entry is now Expo. Honor X9c generation failed; diagnostic source changes remain uncommitted. The user now permits a cloud demo and wants Expo with desktop testing before phone handoff. See proposal.md for scope.

## Goals / Non-Goals

Goals: a shared Expo web/Android interface, a small provider-independent inference boundary, honest desktop evidence, and a documented future local runtime path.

Non-goals: implementing a native model runtime in this phase, claiming offline AI from cloud results, accounts/cloud lesson sync, multiple lessons, PDF/handwriting/speech, or a decorative landing page.

## Decisions

- Use React Native, Expo and TypeScript with pinned dependencies. Use Expo web for desktop browser testing. A web pass does not establish Android behavior; native-module behavior needs a later development build and physical-device check.
- Keep the existing `phone-setup` ID and OpenSpec delta path as continuity identifiers. Revised unchecked tasks replace obsolete acceptance criteria; previous Vite work remains recorded in agent-progress.md and verification/phone-setup.md.
- Give UI code a bounded generation/chat interface. The cloud adapter calls our Worker; a labeled deterministic mock exercises screens without credentials. A future local adapter supplies the same request/response contract. Avoid a general provider framework.
- The Worker holds provider access, fixed model configuration, input/output limits, request throttling and access controls suitable for the demo. The Expo bundle contains neither Cloudflare account tokens nor service secrets. Accept only confirmed lesson text required for the operation; explain that this text leaves the device. Do not forward photos or log lesson text by default.
- Select an open-weight model supported by Workers AI only after checking its license, downloadable artifact, compatible local runtime, and target hardware needs. Free-tier availability alone is insufficient. A large cloud model does not prove phone portability, and a smaller replacement model requires its own quality checks. Pin available model identity/version and disclose any provider revision that cannot be pinned.
- Model selection is a bounded integration task using four supported/absent English/Filipino checks and a structured-output sample. A failure preserves source/work, with at most one bounded retry. Rate limits, timeout, unavailable endpoint and exhausted allowance produce actionable errors. Mock results remain visibly distinct from live results.
- Keep OCR local. Browser Tesseract assets and a native OCR option need platform-specific evaluation; do not assume Tesseract.js runs directly in React Native. Release OCR resources before model generation. One heavy task at a time; about 1,500 source tokens and short output batches. Document the actual token estimate method.
- Keep local lesson persistence behind a small platform adapter. Native persistence and web persistence require their own implementation/verification. Save success only follows a successful write. Photos retain raw OCR, corrected text and page IDs; derived content records source revision. Source edits invalidate items, chat answers and quiz progress. Stable choice IDs support deterministic scoring.
- Offline acceptance covers cold reopening of saved content and deterministic study/quiz use. New cloud-generated content and chat are unavailable offline. Web cold reopening requires an explicit production app-shell cache; native installation bundles the shell. Offline fresh-photo OCR is deferred until platform assets are proven; do not claim it from saved-content checks.
- Preserve the notebook direction: warm paper, ink navy, amber accent, local fonts, light theme and restrained motion. Setup, capture/correction and reviewer stages; reviewer has Source, Cards, Quiz and Chat. Apply antislop-ui/human/layoutmobile during UI work and copywriting for text, adapting web-specific checks to native controls.

## Risks / Trade-offs

- Free-tier availability and quota may interrupt the demo: measure actual usage and show failure/retry; fixtures are development evidence only.
- Cloud text transfer changes the privacy/offline promise: disclose the mode and preserve offline saved study.
- Open weights and an adapter do not establish phone feasibility: document memory/runtime requirements and keep target-device execution unverified.
- Expo web may hide Android OCR/storage defects: retain explicit phone acceptance in demo-evidence and stop for human setup when needed.

## Migration Plan

Preserve historical verification and uncommitted diagnostics. The active application stack and documented install/verify/start commands now use Expo; clean startup was verified. Keep old evidence database/export semantics recoverable and separate from new lesson storage. Expo web export and Worker dry-run are verified. No external Worker deployment has occurred.

## Provider Handoff

The user is configuring Cloudflare Workers AI. Before live integration, confirm account access, permitted model, available allowance and Worker endpoint configuration. Supply secrets through local environment or Worker secret bindings, never through chat or committed files. Implementation may proceed with the labeled mock while account setup is pending; setup cannot pass until live checks succeed.
