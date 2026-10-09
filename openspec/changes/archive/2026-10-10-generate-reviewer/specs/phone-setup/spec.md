## REMOVED Requirements
### Requirement: Honest model-service readiness
**Reason**: User explicitly requested mock-only MVP and no more endpoint testing on 2026-10-10.
**Migration**: Active UI uses mock setup; historical adapters stay outside this delivery.
### Requirement: Exportable functional desktop gate
**Reason**: Live model checks no longer gate the mock MVP.
**Migration**: Preserve historical exports; record current mock journey in demo-evidence.
### Requirement: Credentials and source disclosure
**Reason**: No endpoint or credentials are used by the mock application.
**Migration**: Use the local-only mock requirement below.
### Requirement: Truthful cloud connection states
**Reason**: Cloud mode is removed from the active UI by user direction.
**Migration**: Disclose first online asset preparation and offline deterministic mocks.
### Requirement: Desktop gate and local portability evidence
**Reason**: User requested working mock delivery rather than more AI/portability testing.
**Migration**: Native/AI behavior remains deferred and disclosed; historical portability metadata is preserved.

## ADDED Requirements
### Requirement: Honest mock desktop setup
The active MVP SHALL expose mock-only setup, a typed bilingual demo fixture, and a source photo path without credentials or endpoint controls. Existing lessons SHALL be preserved rather than silently replaced by the demo. No actual AI or native device behavior SHALL be claimed by mock acceptance.
#### Scenario: Open setup
- **WHEN** setup opens
- **THEN** mock limitations and source/demo paths are visible without credentials
#### Scenario: Existing lesson
- **WHEN** a lesson already exists
- **THEN** demo replacement is disabled and existing study remains available
### Requirement: Local-only mock processing
The mock application SHALL keep photos, corrected text and study interactions on the device. It SHALL distinguish first online asset preparation from subsequent offline study and MUST NOT claim that deterministic mocks constitute local model inference. Historical cloud exports SHALL remain labeled historical and unchanged.
#### Scenario: Create mock study
- **WHEN** study content is created
- **THEN** local source is processed without remote transmission and output is labeled simulated
