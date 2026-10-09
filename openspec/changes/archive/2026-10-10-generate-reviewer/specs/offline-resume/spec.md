## ADDED Requirements
### Requirement: Cold offline mock study
After successful production asset caching, desktop web SHALL reopen offline with saved source, items, quiz progress and mock chat. Cached local OCR and mock review creation SHALL work on fresh printed-page images. Offline readiness SHALL follow successful cache installation; failed caching SHALL offer retry. Cache cleanup SHALL preserve lesson storage and unrelated caches.
#### Scenario: Closed page reopening
- **WHEN** the page is closed and a new page opens without network
- **THEN** the app and saved study restore from local cache/storage
#### Scenario: Fresh offline image
- **WHEN** a new printed-page image is selected after offline reopening
- **THEN** local OCR, correction, confirmation and mock reviewer creation work without a model endpoint
