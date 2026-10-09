# study-practice Specification

## Purpose

Defines the verified desktop mock study journey and its truthful local processing, persistence and demonstration behavior for PocketReview.

## Requirements

### Requirement: Cards and deterministic quiz
The reviewer SHALL reveal/hide card answers and show three questions reusing saved items. Choices SHALL have stable IDs, distinct answer text and deterministic scoring. Submitted answers SHALL be locked and feedback SHALL show correct answer, explanation and source evidence.
#### Scenario: Wrong answer
- **WHEN** a wrong choice is selected
- **THEN** score follows stable ID comparison and feedback includes the saved correct answer and quotation
#### Scenario: Resume practice
- **WHEN** saved study is reopened
- **THEN** quiz selections and score restore without generation or an endpoint request
