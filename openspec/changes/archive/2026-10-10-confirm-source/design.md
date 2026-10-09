# Design

## Context

The active Expo app has a verified setup screen and bounded cloud answer contract. There is no lesson model or OCR. The old Vite diagnostics remain untouched. See proposal.md for motivation.

## Goals / Non-Goals

Goals: isolate OCR and persistence from UI; process one page at a time; preserve original OCR and evidence; make source changes invalidate derived state.

Non-goals: reviewer generation, cloud OCR, native OCR claims or cold offline shell caching (owned by offline-resume).

## Decisions

- Use Tesseract.js 7.0.0 in a dedicated browser controller worker with eng/fil fast traineddata from pinned tessdata_fast revision 87416418657359cb625c412a48b6e1d6d41c29bd. Repository inspection confirmed fil, correcting the initial tgl assumption. Copy API, controller, worker and all installed core variants into public/ocr; fetch/check pinned language files during setup and record SHA-256. Remote OCR would violate local recognition; browser assets cannot directly establish native compatibility.
- Use Expo image picker 57.0.20 for library/camera selection; browser and native picker differences stay outside screen state. Accept image data URLs only for persistence, at most 2 MiB of encoded text per image and 12 million pixels; visibly reject larger images instead of silently degrading source quality. Camera availability is platform dependent; desktop selection is the acceptance route.
- Define one versioned lesson with pages, confirmation, numeric source revision and explicit derived-state fields. Any source mutation clears items/chat/progress and requires confirmation. Raw OCR is immutable unless recognition is explicitly retried. A source edit with unchanged text is a no-op.
- Use IndexedDB for web lesson storage so photos do not compete with setup localStorage. Native AsyncStorage remains a separate adapter, pending phone evidence. Serial writes prevent older snapshots overwriting newer edits. Block mutations after failed startup reads. Failed writes retain current state and expose retry.
- Set corrected text bound to 4,500 characters, using ceil(characters/3) as a conservative token estimate matching the existing model-service bound; disclose that this is a heuristic, not a model tokenizer. Do not trim silently.
- Keep a reusable notebook control module and small source screen, with image and correction columns above 900px and stacked sections below. Raw OCR is available for comparison, not an additional editable source. Show actual OCR progress, not fabricated confidence or speed.
- Keep setup and source screens mounted when switching stages so active work is retained. Disable stage changes during OCR; cancel/terminate on unmount. Native OCR adapter explicitly reports unavailable until a native runtime is assessed, rather than importing browser workers.

## Risks / Trade-offs

- Printed Filipino recognition uses Filipino traineddata; mixed language and camera noise can produce errors. Explicit correction remains mandatory; do not claim general OCR accuracy from fixtures.
- Large images/text are bounded; users may need a smaller crop or narrower excerpt. Preserve drafts and expose exact limits.
- First asset preparation needs network access; recognition itself remains local. Cold offline launch belongs to the later feature.
- Native adapter and photo permissions need later phone setup; desktop verification does not satisfy that acceptance.
