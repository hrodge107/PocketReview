# PocketReview

## Current scope (updated 2026-10-10)

The authorized plan is React Native with Expo, desktop web testing first, and Cloudflare Workers AI through a server-side Worker for demo generation/chat. The user is setting up Cloudflare; no live endpoint or model is verified. A future local adapter must use a concrete downloadable model/runtime/hardware path. Honor X9c local inference remains unverified.

The MVP keeps one lesson, up to two photos, local OCR with editable confirmation, about five cards, three quiz questions and English/Filipino lesson chat. Saved source/cards/quiz progress must reopen offline; new cloud generation/chat requires internet. Offline fresh-photo processing is deferred. Cloud operations must disclose remote text transfer; provider credentials stay outside the client bundle.

The scope update is planning only. This checkout still runs the Vite/WebLLM phone-gate prototype described below; Expo migration has not started. See `openspec/changes/offline-photo-reviewer-mvp/` and `feature_list.json` for revised acceptance. Existing phone diagnostics are historical evidence, not the next implementation gate.

## Legacy prototype instructions

The following commands and phone procedure describe the existing prototype. They do not establish Expo or cloud readiness; replace them with verified Expo/Worker instructions during migration.

## Run locally

Use Node 24.11 or newer. From the repository root:

```powershell
./init.ps1
npm run dev
```

`init.ps1` runs `npm ci` followed by type checking, focused tests and a production build. Git Bash/Linux can use `./init.sh`. The production build is `dist/`; preview it with `npm run preview`. App-shell caching is enabled in the production build, not the development server.

Browser checks use installed desktop Chrome:

```powershell
npm run test:browser
```

These checks include simulated worker responses solely for exercising controls. They do not establish model quality, phone compatibility or offline inference. Test screenshots and temporary evidence downloads belong in ignored `test-results/`.

## Phone handoff

1. Serve the contents of `dist/` from a static **HTTPS** host. Keep the same origin for all checks: caches and IndexedDB are origin-specific. An HTTP laptop LAN URL will not provide the required secure context. A tunnel to a laptop cannot prove reopening with that laptop off. Do not claim the gate passed from desktop checks.
2. On the Honor X9c, open that HTTPS URL in current Chrome. Enter `Honor X9c` and the Chrome version in the device field. Record the exact phone variant and Android version separately with the exported evidence.
3. With internet connected, tap **Load local model**. Keep the page foregrounded. Initialization is bounded to ten minutes; individual checks to 90 seconds. Stop/retry is available and failures are retained. Record real loading time and storage/download observations; no measured phone latency or download size is claimed here.
4. Tap **Run four language checks**. Compare every output with the visible lesson and review target. Mark faithful only if the answer is accurate, short and in the requested language. Absent-answer checks must abstain rather than invent battery voltage. Export evidence before leaving.
5. Wait for the app shell to show cached, then close the app/tab completely. Disconnect Wi-Fi and mobile data and switch off the laptop. Reopen the same HTTPS app from its installed shortcut or saved URL. Check the cold-reopen attestation **before** loading. Load a new engine and run the checks again. Offline tensor availability alone does not prove the tokenizer, config, runtime library and app chunks survived reopening.
6. Review the offline outputs and export again. The JSON includes page-session/engine identities, load and generation connection indicators, manually reported device, browser agent, GPU identity if exposed, origin, pinned artifacts, actual output/time, human review, and cold-reopen attestation. Connection indicators and attestations are evidence to inspect, not automatic proof. Include a short recording of internet/laptop off and reopening.
7. Return the JSON and observations to the agent. The active OpenSpec change stays open until these records are inspected. This historical phone gate failed and has been superseded as the implementation prerequisite; the existing prototype has no cloud adapter.

## Runtime and storage

React, Vite, TypeScript and WebLLM versions are pinned in `package.json` and `package-lock.json`. Qwen3-0.6B-q4f16_1-MLC model revision and compiled library revision are pinned in `src/gate.ts`. The model loads and generates through a dedicated Web Worker. Thinking is disabled using `extra_body.enable_thinking`; outputs are capped at 128 tokens.

Gate evidence uses IndexedDB database `pocketreview-evidence`. Model artifacts use WebLLM's Cache API backend, independently of the namespaced `pocketreview-shell` precache. App cleanup does not delete WebLLM caches. Browser eviction or clearing site data can remove both; export evidence and test cold reopening. A failed evidence write retains the in-memory result and shows a retry/export route. A failed initial read blocks new evidence to avoid overwriting unread records.

The notebook icon is a temporary authored placeholder. PNG install icons are rasterized from `public/icon.svg` by `node scripts/generate-icons.mjs`, which requires desktop Chrome.

## Temporary GPU diagnostic build

The diagnostic build labeled **Diagnostic build 3** adds diagnostics to recorded results and load failures. It records worker startup checkpoints, adapter features and selected limits, device creation/loss, uncaptured GPU errors, worker error events, unhandled promise rejections, and the original stack from failed WebLLM tasks. It does not record prompt text in diagnostics or change model/prompt settings. Export the JSON after a failure and return it with the Android version from **Settings → About phone**. Remove this temporary instrumentation after resolving the phone feasibility issue.

Primary runtime references: [WebLLM workers and caching](https://webllm.mlc.ai/docs/user/advanced_usage.html), [WebGPU troubleshooting](https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips).

## Workflow

OpenSpec owns requirements and tasks, `feature_list.json` owns feature status/evidence, and `agent-progress.md` records restart context. Work on one feature at a time: propose, apply, verify, archive, then commit/push. Archive and passing status require observed acceptance evidence. Partial checkpoints may be committed while a phone gate remains pending. Remaining features get their own changes after revised dependencies pass. The first setup feature now requires desktop/live cloud evidence; physical-phone setup occurs later and local inference remains deferred.
