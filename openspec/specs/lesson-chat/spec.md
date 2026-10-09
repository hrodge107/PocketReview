# lesson-chat Specification

## Purpose

Defines the verified desktop mock study journey and its truthful local processing, persistence and demonstration behavior for PocketReview.

## Requirements

### Requirement: Honest mock lesson chat
The application SHALL offer labeled local keyword-based chat with English/Filipino demo answers, exact source evidence for matched answers and a clear selected-language not-found response for unsupported matches. It SHALL disclose that matching is simulated and cannot establish semantic support or absence. At most twenty exchanges SHALL be retained.
#### Scenario: Fixture lookup
- **WHEN** a supported demo question is asked
- **THEN** the fixed selected-language answer and source quotation appear and persist
#### Scenario: Unmatched question
- **WHEN** the mock cannot match a question
- **THEN** it returns a labeled not-found response without fabricated evidence
