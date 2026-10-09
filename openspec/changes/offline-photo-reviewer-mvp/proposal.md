# Proposal

## Why

Students with printed lessons and intermittent internet need a reviewer they can create and use on their phone. This MVP proves one complete offline study flow rather than a large unfinished product.

## What Changes

- Add a phone setup and local-inference feasibility gate before dependent feature work.
- Persist and export actual setup evidence with human review and cold offline checks.
- Supply reproducible setup instructions. The six later features remain approved in feature_list.json and will receive separate changes after this gate passes.

## Capabilities

### New Capabilities

- `phone-setup`: Download, test, and reload local AI assets with exportable device evidence.

### Modified Capabilities

None; there is no application or existing capability specification.

## Impact

Creates a React/Vite/TypeScript setup application, worker runtime, IndexedDB evidence persistence, PWA shell cache, verification commands, and harness evidence. WebLLM/Qwen3 is conditional on the actual Honor X9c gate. No cloud or laptop inference fallback is authorized. OCR and reviewer implementation are outside this change.
