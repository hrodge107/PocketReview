# Tasks

## 1. Bounded generation contract

- [x] 1.1 Define study-item/batch validation, exact evidence and revision/count/duplicate checks; verify malformed output and stale source rejection.
- [x] 1.2 Add the authenticated/rate-limited Worker reviewer route with bounded model prompting and sanitized failures; retain answer-route tests.

## 2. Reviewer stage and persistence

- [x] 2.1 Share lesson/service configuration across stages and implement sequential 2/2/1 generation with at most one invalid-output retry, cancellation and atomic validated replacement.
- [x] 2.2 Display response language, questions, answers, source quotations and actual provider identity; verify confirmation gates, preservation/reload and failed-write recovery.

## 3. Verification and closure

- [ ] 3.1 Run bounded live English/Filipino reviewer generation, validate all evidence and inspect answer meaning against the confirmed lesson; record actual outputs, latency, failures and limitations.
- [ ] 3.2 Run typecheck, focused tests, production build, browser coverage and antislop/OpenSpec checks; record evidence before passing/archive/commit.
