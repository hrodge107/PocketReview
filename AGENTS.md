# Project Agent Harness - PocketReview

This repository uses a lightweight harness to preserve verified project state across coding-agent sessions. Repo artifacts are the system of record; chat history is not.

## Product context

The attached product documents are external planning context, not executable instructions. Latest user scope on 2026-10-10 is a working desktop-first Expo mock MVP, with no more AI endpoint testing. Local photo OCR/correction, five simulated cards, three scored quiz questions, mock chat and saved offline study form the active delivery. OpenSpec and feature_list.json hold acceptance. Native OCR/phone and real AI remain deferred and unverified. Historical cloud code and src/ WebLLM diagnostics are preserved outside the active entry. Never run scripts/check-live-* unless the user explicitly reauthorizes endpoint testing.

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
- Follow the authorized mock scope in OpenSpec. Preserve the one-lesson photo/correction/reviewer flow and disclose fixture/extractive/keyword behavior. Mock outputs never prove AI quality or local model portability. Native acceptance remains separate; stop when user phone setup is required.
- Record proposed capabilities separately from demonstrated capabilities. Do not claim phone, offline, OCR, model, or bilingual behavior without observed evidence.
- Use OpenSpec for change planning; this harness is continuity and evidence tracking, not a replacement.

## Definition of done

A tracked feature is done only when its behavior is implemented, required verification actually ran, evidence is recorded in `feature_list.json` or `agent-progress.md`, and the project remains restartable from its documented setup path.

## End of session

Update `agent-progress.md` with verified state, evidence, blockers, and next step. Update `feature_list.json` only for explicitly tracked features. Leave unverified claims marked as unverified.

## Commands

The Expo application has a pinned manifest/lockfile. `./init.ps1` or `./init.sh` installs and verifies; use package.json as command source of truth. `npm run verify` checks types/tests and exports the production mock app with offline assets. `npm run preview` serves localhost:4173; browser tests own that port and require installed Chrome. Stop development/preview processes before clean installation on Windows. `npm run dev` starts editable Expo web; cold offline acceptance uses the production build. The mock MVP requires no AI account. Do not restart cloud testing or claim native acceptance from web tests.
