# Tasks

Previous Vite setup tasks were completed for the superseded phone-only plan. Historical evidence remains in agent-progress.md and verification/phone-setup.md. The revised tasks below are unverified. This change covers only the first tracked feature; later features get separate changes.

## 1. phone-setup: Expo and model-service setup

- [x] 1.1 Migrate the setup shell to pinned Expo/React Native/TypeScript with desktop web support; configure real install, start and verification commands and verify a clean setup and production web build.
- [x] 1.2 Define the bounded provider-independent contract and labeled mock adapter; verify malformed output, mode labels, cancellation/timeouts and preservation of completed work; document the future local adapter boundary.
- [x] 1.3 Prepare the Cloudflare Worker proxy with secret bindings, bounded input/output, demo access controls and rate limits; verify secret-free client bundles and useful unauthorized, quota and timeout responses; document local configuration/deployment.
- [x] 1.4 After the user finishes account setup, select an eligible open-weight model, record weights/license/version and local runtime/hardware needs, and run a live structured-output sample and four English/Filipino supported/absent checks; record outputs, meaning review, model identity, latency and failures. Mock outputs cannot satisfy this task.
- [x] 1.5 Persist/export setup evidence, verify reload and failed-write recovery, and run applicable desktop UI/accessibility checks; document the later phone handoff and mark passing only after all revised desktop/live criteria pass. Local phone inference remains unverified.
