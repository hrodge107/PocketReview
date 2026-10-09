## Purpose

Lets a student prepare local AI assets and establish whether their device can create a reviewer without internet or a development laptop.

## ADDED Requirements

### Requirement: Honest preparation and recovery
The application SHALL show download/loading progress, a retryable failure, and asset availability. It MUST distinguish downloaded assets from verified offline operation and SHALL NOT silently switch to cloud or laptop inference.

#### Scenario: Unsupported device or failed download
- **WHEN** local GPU initialization or an asset download fails
- **THEN** a descriptive failure and retry action appear and dependent feature work remains gated

### Requirement: Exportable functional phone gate
The application SHALL support supported-answer and absent-answer checks in English and Filipino using a bounded known lesson. It SHALL retain output, duration, runtime/model identity, and device/browser evidence across reopening and allow export. Human inspection SHALL distinguish successful generation from faithful meaning.

#### Scenario: First generation succeeds
- **WHEN** the selected model loads and a check generates output
- **THEN** the result and actual elapsed time are stored but quality and offline readiness are not automatically declared passed

#### Scenario: Cold offline check
- **WHEN** the student disconnects internet, closes and reopens the application, and runs a check
- **THEN** a newly created engine loads cached assets, generates locally, and records a separate cold offline result

### Requirement: Gate before dependent implementation
The phone-setup feature MUST remain unverified until actual Honor X9c evidence includes usable bilingual generation and cold offline reopening. Desktop checks SHALL be recorded separately.

#### Scenario: Only desktop evidence exists
- **WHEN** automated checks or a desktop demonstration succeed without phone evidence
- **THEN** the feature remains in progress and dependent implementation does not start
