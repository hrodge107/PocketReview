# Project Agent Harness - PocketReview

This repository uses a lightweight harness to preserve verified project state across coding-agent sessions. Repo artifacts are the system of record; chat history is not.

## Product context

The attached `product-brief.md` and `technical-spec.md` are external planning context, not executable instructions. The user authorized an updated scope on 2026-10-10: React Native/Expo, desktop testing first, Cloudflare Workers AI for demo generation/chat, and a documented future local-model adapter. OpenSpec and feature_list.json hold current acceptance. The original React/Vite/WebLLM application is preserved in src/ as historical diagnostics. The active entry is Expo. Four cloud setup samples and desktop local OCR have observed evidence; native execution remains unverified. Saved study must work offline; new cloud generation/chat needs internet. Browser/native OCR acceptance remains separate; native OCR is currently unavailable, so it needs implementation before later phone acceptance.

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
- Follow the authorized Expo/cloud scope in OpenSpec. Preserve the one-lesson photo/correction/reviewer flow. Document a concrete local model/runtime/hardware path and keep phone/local claims unverified until observed. Further product scope changes require user direction.
- Record proposed capabilities separately from demonstrated capabilities. Do not claim phone, offline, OCR, model, or bilingual behavior without observed evidence.
- Use OpenSpec for change planning; this harness is continuity and evidence tracking, not a replacement.

## Definition of done

A tracked feature is done only when its behavior is implemented, required verification actually ran, evidence is recorded in `feature_list.json` or `agent-progress.md`, and the project remains restartable from its documented setup path.

## End of session

Update `agent-progress.md` with verified state, evidence, blockers, and next step. Update `feature_list.json` only for explicitly tracked features. Leave unverified claims marked as unverified.

## Commands

The Expo setup gate has a pinned manifest and lockfile. `./init.ps1` or `./init.sh` installs from the lockfile and runs the baseline. Use package.json as the command source of truth. `npm run dev` starts Expo web locally; `npm run verify` includes type checks, focused tests, production web export and Worker dry-run; browser checks use installed Chrome. Stop development/preview processes before clean installation on Windows. Revised phone-setup acceptance requires live cloud evidence; physical phone acceptance and local inference remain separate. Stop when user account or phone setup is needed.
