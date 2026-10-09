# PocketReview

This checkout implements the **phone setup gate only**. The reviewer, OCR, cards, quiz and chat remain approved backlog items. Honor X9c inference and cold offline model loading are not yet demonstrated.

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
7. Return the JSON and observations to the agent. The active OpenSpec change stays open until these records are inspected. A failed feasibility gate must be resolved before dependent implementation; no cloud/laptop inference fallback is configured.

## Runtime and storage

React, Vite, TypeScript and WebLLM versions are pinned in `package.json` and `package-lock.json`. Qwen3-0.6B-q4f16_1-MLC model revision and compiled library revision are pinned in `src/gate.ts`. The model loads and generates through a dedicated Web Worker. Thinking is disabled using `extra_body.enable_thinking`; outputs are capped at 128 tokens.

Gate evidence uses IndexedDB database `pocketreview-evidence`. Model artifacts use WebLLM's Cache API backend, independently of the namespaced `pocketreview-shell` precache. App cleanup does not delete WebLLM caches. Browser eviction or clearing site data can remove both; export evidence and test cold reopening. A failed evidence write retains the in-memory result and shows a retry/export route. A failed initial read blocks new evidence to avoid overwriting unread records.

The notebook icon is a temporary authored placeholder. PNG install icons are rasterized from `public/icon.svg` by `node scripts/generate-icons.mjs`, which requires desktop Chrome.

Primary runtime references: [WebLLM workers and caching](https://webllm.mlc.ai/docs/user/advanced_usage.html), [WebGPU troubleshooting](https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips).

## Workflow

OpenSpec owns requirements and tasks, `feature_list.json` owns feature status/evidence, and `agent-progress.md` records restart context. Work on one feature at a time: propose, apply, verify, archive, then commit/push. Archive and passing status require observed acceptance evidence. Partial checkpoints may be committed while a phone gate remains pending. Remaining features get their own changes after dependencies pass.
