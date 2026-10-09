## Purpose

Let students inspect locally extracted printed-page text beside its photos and explicitly confirm the source before generating study material.

## ADDED Requirements

### Requirement: Bounded local photo extraction
The desktop application SHALL accept at most two image pages for one lesson, recognize them sequentially on the device and retain stable page IDs, photos and raw OCR. Photos and OCR text MUST NOT be sent to an external service for recognition. It SHALL show progress and cancellation, terminate OCR resources, and preserve completed pages when a later operation fails. Browser OCR assets SHALL be served locally after documented setup; native operation remains subject to later device acceptance.

#### Scenario: Two fresh printed pages
- **WHEN** the user selects two printed-page images
- **THEN** each page is processed locally in sequence and its photo and raw OCR remain inspectable

#### Scenario: Failed or empty recognition
- **WHEN** recognition fails, is cancelled or detects no text
- **THEN** the application preserves completed work and allows retry, replacement or manual correction without claiming successful confirmation

#### Scenario: Photo limit
- **WHEN** a third page or an unsupported or oversized image is selected
- **THEN** the application visibly rejects it without losing existing pages

### Requirement: Inspect and confirm corrected source
The application SHALL display editable corrected text alongside each photo while preserving raw OCR independently. Confirmation SHALL require nonempty corrected text on each page and a combined bound equivalent to approximately 1,500 source tokens, with its estimation method disclosed. Oversized source SHALL be visibly rejected for confirmation and remain editable.

#### Scenario: Confirm corrections
- **WHEN** the user corrects extracted text and explicitly confirms an eligible lesson
- **THEN** confirmed corrected text and its page references become the source for later generation

#### Scenario: Source too large
- **WHEN** corrected text exceeds the source limit or a page remains empty
- **THEN** confirmation is unavailable and the interface explains how to correct or narrow the source

### Requirement: Durable source revision
The application SHALL persist photos, raw OCR, corrected text, page references and confirmation in local lesson storage. Source edits SHALL change the source revision, remove derived items and chat answers, reset quiz progress and require confirmation again. Save success MUST follow a successful write; failed reads SHALL prevent destructive replacement and failed writes SHALL retain in-memory work with retry.

#### Scenario: Reopen saved source
- **WHEN** the user reloads after a successful lesson save
- **THEN** photos, raw and corrected text, page IDs, revision and confirmation are restored

#### Scenario: Edit confirmed source
- **WHEN** a confirmed page is edited, replaced or removed
- **THEN** its revision changes and derived items, answers and quiz progress are invalidated before reuse

#### Scenario: Storage failure
- **WHEN** reading or writing local storage fails
- **THEN** the interface shows an actionable recovery state and never labels an unsuccessful write saved
