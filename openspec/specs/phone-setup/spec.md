# phone-setup Specification

## Purpose

Defines the verified desktop mock study journey and its truthful local processing, persistence and demonstration behavior for PocketReview.

## Requirements

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
