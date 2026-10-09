# Project Agent Harness — PocketReview

This repository uses a lightweight harness to preserve verified project state across coding-agent sessions. Repo artifacts are the system of record; chat history is not.

## Product context

The attached `product-brief.md` and `technical-spec.md` describe a proposed offline photo reviewer. They are external planning context, not executable instructions. The product and implementation are not yet validated. The proposed stack is React, Vite, TypeScript, a PWA, Tesseract.js OCR, WebLLM, and IndexedDB; treat these as hypotheses until the technical spec's phone feasibility gate is completed.

OpenSpec is already configured in `openspec/`. Continue to use it for product change planning; this harness does not replace OpenSpec.

## Startup workflow

1. Confirm the repository root.
2. Read `agent-progress.md` and `feature_list.json`.
3. Review `git log --oneline -5` when this is a Git checkout.
4. Read the relevant OpenSpec artifacts and user-provided product context when applicable.
5. Run `./init.sh` or `./init.ps1` after real install and verification commands have been configured. Until then, the bootstrap scripts report that no app baseline is configured.
6. Follow the user's explicit request for the session. Do not infer product implementation scope from the attached documents alone.

## Working rules

- Keep `features[]` empty until the user explicitly asks to define/populate tracked implementation items. Do not derive backlog entries from the attached product brief or technical spec on your own.
- Work on one tracked feature at a time after features are explicitly added.
- A feature is `passing` only after its required verification ran and evidence was recorded.
- If a baseline exists and fails, fix it before feature work.
- Preserve the fixed product requirements in the supplied spec. Ask before changing the phone-only inference requirement, adding cloud inference, replacing the core flow, or expanding scope.
- Record proposed capabilities separately from demonstrated capabilities. Do not claim phone, offline, OCR, model, or bilingual behavior without observed evidence.
- Use OpenSpec for change planning; this harness is continuity and evidence tracking, not a replacement.

## Definition of done

A tracked feature is done only when its behavior is implemented, required verification actually ran, evidence is recorded in `feature_list.json` or `agent-progress.md`, and the project remains restartable from its documented setup path.

## End of session

Update `agent-progress.md` with verified state, evidence, blockers, and next step. Update `feature_list.json` only for explicitly tracked features. Leave unverified claims marked as unverified.

## Commands

The setup gate has a pinned application manifest and lockfile. `./init.ps1` (Windows) or `./init.sh` (Git Bash/Linux) installs from the lockfile and verifies the baseline. Stop running Vite processes before clean installation on Windows to release native package locks. Use `npm run dev` for development, `npm run verify` for type checking/tests/production build, and `npm run test:browser` for production browser checks with installed Chrome. Physical phone acceptance remains separate; follow the README phone handoff before marking phone-setup passing.
