# Design

## Context
User chose mock-only final MVP after both 3B/8B reviewer gates failed. Latest explicit scope supersedes cloud acceptance and further endpoint experiments. Existing source/reviewer state is retained; no migration discards saved lessons. Previous cloud plans are in verification/legacy-cloud-plan.

## Decisions
- Use three top-level stages: Setup, Source, Reviewer. Reviewer contains Cards, Quiz and Chat. Keep the approved warm-paper/navy/amber notebook direction; shared 48px-minimum buttons support keyboard and narrow layouts.
- Setup offers a typed demo fixture only when the lesson is empty, preserving existing work. Its image is an honestly labeled placeholder. Demo text still requires confirmation.
- Mock reviewer takes the first five distinct short source sentences/lines. Known demo facts have handcrafted English/Filipino wording; arbitrary source uses extractive answers without pretending to translate or reason. Saved items retain exact quotation/page ID, source revision, provider identity and mock mode. Existing cloud items preserve their historical mode label.
- Quiz reuses three items with three distinct answer choices and stable item IDs. Correctness is equality against the saved correct ID; answers cannot be changed after submission. Feedback includes answer, explanation and source. Recreating a reviewer starts a fresh quiz and chat; changing source invalidates every derived field.
- Mock chat performs explicitly limited keyword lookup. Unmatched/unsupported questions return a mock not-found response in the selected language; this is not proof that information is absent. Keep at most twenty exchanges and validate their stored shape/evidence.
- IndexedDB writes remain serialized and read failure blocks mutations. Failed writes leave unsaved work in memory, preserve stored prior work and expose retry. A save label follows transaction completion.
- Build a versioned cache-first service worker containing the production shell and all local OCR files. Activation cleans only the PocketReview shell namespace; IndexedDB and separate OCR caches remain intact. Offline readiness follows successful installation; failure offers retry. Do not claim native offline acceptance from browser tests.
- No endpoint controls in the active UI. Default verification builds/tests the mock application; optional Worker code remains independently inspectable. Historical live acceptance tests are retained but are outside the current browser testMatch.

## Risks and limits
Mock data demonstrates navigation/persistence, not AI quality. Arbitrary excerpts are not translated; keyword chat can miss questions. Native OCR is unavailable until a future development-build implementation/device gate. Synthetic printed-page OCR tests do not prove camera accuracy. Offline cache requires a first successful online visit and sufficient storage; native/phone behavior remains unverified.
