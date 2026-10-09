# Tasks

## 1. Local source domain and persistence

- [x] 1.1 Add the bounded one-lesson/page model, confirmation and source-revision invalidation; verify derived items, chat and quiz progress cannot survive changed source.
- [x] 1.2 Add web/native lesson storage adapters and serialized save/retry state; verify reload, failed reads/writes and truthful save status.

## 2. Local photo OCR and correction

- [x] 2.1 Pin dependencies and package local API/controller/worker/core/eng/fil assets with reproducible hashes; implement sequential, bounded and cancellable web recognition with resource release and explicit native limitations.
- [x] 2.2 Add photo selection/capture, correction beside images, retained raw OCR, page removal/retry, source bounds and explicit confirmation; preserve setup stage.

## 3. Verification and closure

- [x] 3.1 Run real browser OCR on fresh English/Filipino printed-page fixtures; verify no external recognition traffic, two-page bounds, correction, confirmation, reload and failure recovery. Record synthetic-fixture and native limitations.
- [x] 3.2 Run typecheck, focused tests, production build, applicable antislop desktop/narrow/accessibility checks and OpenSpec verification; record evidence before marking passing and archiving.
