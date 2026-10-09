## Purpose

Turn confirmed corrected lesson text into a small saved reviewer with short answers and inspectable source evidence in the selected response language.

## ADDED Requirements

### Requirement: Confirmed bounded reviewer generation
The application SHALL generate five short study items from the current confirmed corrected source in English or Filipino through its configured live model service. It SHALL run small batches sequentially and allow at most one bounded invalid-output retry across the operation. Unconfirmed, oversized or empty source MUST NOT start generation. Cloud source transfer and internet requirements SHALL be disclosed; photos MUST NOT be forwarded.

#### Scenario: Generate from confirmed source
- **WHEN** the user selects a response language and generates an eligible lesson
- **THEN** five distinct short question/answer items are produced with current page evidence in that language

#### Scenario: Ineligible source or missing connection
- **WHEN** source is not confirmed or cloud configuration/connection is unavailable
- **THEN** generation is unavailable or reports an actionable failure without erasing the source or existing reviewer

### Requirement: Validate and inspect source evidence
Each study item SHALL retain stable identity, source revision, question, answer, page references and verbatim supporting quotations. Malformed output, invalid page IDs, nonmatching quotations, mismatched revisions and duplicate questions SHALL be rejected before acceptance. Matching quotations alone MUST NOT be represented as proof of semantic correctness; answers SHALL remain inspectable beside their evidence.

#### Scenario: Invalid model output
- **WHEN** a batch contains malformed or unsupported evidence
- **THEN** it is rejected, at most one invalid-output retry occurs, and no partial reviewer is accepted as complete

#### Scenario: Inspect an answer
- **WHEN** the reviewer is displayed
- **THEN** the answer and page quotation can be compared with the confirmed source, with actual mode/provider/model identity available

### Requirement: Preserve and persist completed reviewer work
Only a fully validated reviewer matching the current source SHALL replace saved study items. Generation failure, cancellation, quota errors or storage failure SHALL preserve the previous completed reviewer and confirmed source. Save success SHALL follow a successful write, with retry available for unsaved results. Source edits SHALL invalidate generated items through the existing source revision boundary.

#### Scenario: Reopen a saved reviewer
- **WHEN** the application reloads after a successful reviewer save
- **THEN** the source-linked items and language/provider identity restore with the lesson

#### Scenario: Failed replacement or stale source
- **WHEN** generation fails or its source revision no longer matches the lesson
- **THEN** the incomplete or stale reviewer is not accepted and prior valid work remains available
