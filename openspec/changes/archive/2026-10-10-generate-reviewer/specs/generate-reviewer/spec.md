## ADDED Requirements
### Requirement: Confirmed mock study items
The application SHALL create five labeled simulated items from confirmed corrected source. Demo facts SHALL have fixed English and Filipino wording; arbitrary source SHALL use exact excerpts and disclose absent translation/reasoning. No model endpoint SHALL be called.
#### Scenario: Eligible source
- **WHEN** five distinct short source excerpts are confirmed
- **THEN** five mock items retain question, answer, page quotation, source revision and mock identity
#### Scenario: Insufficient source
- **WHEN** fewer than five eligible excerpts exist
- **THEN** a visible correction instruction is shown without accepting a partial reviewer
### Requirement: Validated durable reviewer
Saved items SHALL have current source revisions, valid exact quotations and stable IDs. Failed writes SHALL not be labeled saved and SHALL offer retry. Source edits SHALL clear derived study state.
#### Scenario: Save failure and retry
- **WHEN** local storage fails
- **THEN** work stays visibly unsaved, prior stored work remains and explicit retry can persist it
