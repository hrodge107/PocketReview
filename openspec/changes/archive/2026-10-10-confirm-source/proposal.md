# Proposal

## Why

Setup is verified, but students cannot yet turn their printed notes into inspectable source text. Local OCR plus explicit correction is the next required step before generating a reviewer.

## What Changes

- Select or capture at most two photos for one lesson; recognize them sequentially on the desktop browser without sending photos or OCR text to a service.
- Keep each image, original OCR and editable corrected text together with a stable page ID. Require confirmation of bounded nonempty text before downstream generation.
- Save the lesson locally with truthful write failures and recovery. Source changes invalidate derived items, chat answers and quiz progress by revision.
- Package browser OCR worker/core and English/Tagalog language assets locally. Native OCR and camera behavior remain explicitly pending later phone acceptance.
- Preserve the verified setup screen as a separate stage. Follow the approved notebook design and antislop checks.

## Capabilities

### New Capabilities

- `confirm-source`: Local photo OCR, correction, explicit confirmation and source revision persistence.

### Modified Capabilities

None. Setup requirements remain unchanged.

## Impact

Expo navigation and a source screen; small domain, OCR, photo selection and platform persistence modules; pinned Tesseract.js and Expo image picker; reproducible local OCR assets and desktop browser acceptance. No reviewer, model calls or cloud OCR in this change.
