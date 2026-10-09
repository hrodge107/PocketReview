# Proposal

## Why

PocketReview helps students turn up to two printed-page photos into one inspectable, saved reviewer. The phone inference prototype failed on the target device; the user authorized Expo desktop-first development and cloud inference for the demo, with a credible future local deployment path.

## What Changes

- Replace the early phone-only gate with Expo web/Android setup and a replaceable model-service contract. Preserve the existing capability path and harness ID `phone-setup` for continuity.
- Use Cloudflare Workers AI through a server-side Worker during the demo. The user is configuring the account; endpoint access and the model remain unverified.
- Permit labeled mock responses during development. Live cloud generation is required to pass the setup feature; mocks cannot establish AI quality.
- Record supported and absent-answer outputs in English and Filipino, provider/model identity, latency, and failures on desktop first.
- Keep saved sources, cards and quiz progress usable offline. Cloud generation and new chat answers require internet.
- Defer physical-phone acceptance and local inference. Document model weights, license, runtime and hardware requirements before claiming portability; record actual device compatibility separately.
- Keep one lesson, two photos, about five cards, three quiz questions and lesson chat. Later features retain separate OpenSpec changes and evidence gates.

## Capabilities

### New Capabilities

- `phone-setup`: Establish a restartable desktop-first app and model-service setup with truthful deployment-mode and portability evidence. This is the existing unarchived delta path with revised requirements.

### Modified Capabilities

None. There are no archived main capability specs.

## Impact

Migration from the existing React/Vite/WebLLM feasibility prototype to React Native, Expo and TypeScript, plus a Cloudflare Worker proxy. Browser and native OCR/storage need separate adapters. Existing phone failure evidence remains historical. Expo migration and local Worker preparation are now implemented; live cloud deployment and acceptance remain pending.
