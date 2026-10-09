# demo-evidence Specification

## Purpose

Defines the verified desktop mock study journey and its truthful local processing, persistence and demonstration behavior for PocketReview.

## Requirements

### Requirement: Reproducible honest mock demonstration
README SHALL provide real install/start/build/verification commands and a complete mock demo path. Evidence SHALL distinguish fixed fixture output, actual local OCR, synthetic printed pages, desktop offline checks and unverified native/AI behavior. No API account SHALL be required for the active MVP.
#### Scenario: Judge starts demo
- **WHEN** a judge follows the README on a supported desktop
- **THEN** they can confirm the fixture, create cards, take a quiz, ask mock chat and reopen saved study without configuring AI
