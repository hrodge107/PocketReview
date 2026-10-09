# PocketReview: mock study MVP

An Expo/React Native study notebook you can try on desktop now. One lesson, up to two photos, local OCR/correction, five cards, three quiz questions, mock lesson chat and saved progress.

**No AI account or endpoint is needed.** The active application runs only deterministic mocks. The demo lesson has handcrafted English/Filipino answers. Your own source uses copied excerpts without translation or AI reasoning; mock chat uses limited keyword matching.

## Run it

Use Node 24.11 or newer and installed Chrome for browser tests. In this repository:

```powershell
npm ci
npm run verify
npm run preview
```

Open http://localhost:4173. `verify` runs type checking, unit tests and the production web export, including local OCR and offline assets. It does not call an AI endpoint. `./init.ps1` or `./init.sh` installs/verifies from the pinned lockfile. Stop preview/dev processes before a clean reinstall on Windows.

For editable development, run `npm run dev` (Expo web on localhost:8081). Offline caching is verified against the production build, not Metro development. Native development starts with `npm start`; native OCR is not implemented or device-verified and is outside this desktop mock delivery.

Stop preview before running `npm run test:browser`; the test runner owns port 4173. Cloud-era browser files remain historical but the active suite selects local source and mock MVP checks only.

## Two-minute demo

1. In Setup, wait for **Offline ready**, then choose **Try the demo lesson**. It contains typed fixture text and an explicitly labeled image placeholder, not a camera/OCR demonstration. Existing lessons are preserved; this button is disabled when a lesson already exists.
2. Inspect/edit Source and choose **Confirm corrected text**.
3. Open Reviewer and choose **Create mock reviewer**. Reveal/hide the five card answers and compare their quotations.
4. Open Quiz. Answer three questions; a wrong answer shows the correct answer and source. Answers lock after submission and scoring uses stable choice IDs.
5. Open Chat. Try `Where do roots get water?`, then select Filipino and try `Saan kumukuha ng tubig ang mga ugat?`. Ask `Ilang boltahe ang baterya?` to see the mock not-found behavior.
6. Close the page, disconnect networking and reopen the same origin. Source, study items, quiz and chat remain. Creating a new mock reviewer resets quiz/chat; changing source invalidates all derived study work.

To try actual local OCR, select one or two PNG/JPEG/WebP printed-page photos in Source instead. OCR runs sequentially in local Tesseract workers. Correct errors manually. Mock review creation needs five distinct short sentences or lines; long passages should be narrowed. Combined confirmed source is bounded to 4,500 characters, approximately 1,500 tokens by the existing heuristic. Photo payloads are bounded to 2 MiB encoded and 12 million pixels.

## Offline and storage

The first online production visit caches the app and OCR worker/core/English/Filipino files. Only a successful installation reports Offline ready. Failed downloading offers retry; browser storage policy/quota can prevent caching or saving. Never treat an unsaved label as persistence. The lesson lives in IndexedDB; failed reads block changes, and failed writes preserve unsaved work with retry. Clear site data only if you intend to delete your lesson.

## Verified scope and limits

See [mock delivery evidence](verification/mock-mvp.md) and OpenSpec specs for actual checks. Browser OCR fixtures are freshly rendered printed pages, not camera photographs. Honor X9c/native camera, native OCR, app-store installation and real AI quality remain unverified. Chat may miss questions; its not-found response is not proof of absence. Arbitrary source excerpts are not translated.

The failed cloud/model experiments, optional Worker code and old WebLLM diagnostics are retained as historical work. Do not run scripts/check-live-* for this mock delivery. No external Worker deployment or model download is needed. Future real AI is separate work, not hidden behind the mock UI.

Pinned Expo tooling previously reported 22 upstream audit findings (7 moderate, 15 high); no forced incompatible upgrade was performed. Local development/preview servers bind localhost. This prototype stores one lesson per browser origin and has no accounts, synchronization or multiple-lesson manager.
