# phone-setup Specification

## Purpose

Lets a developer prepare a desktop-first reviewer application with an explicit cloud model service and distinguish demonstrated inference from planned local portability.

## Requirements

### Requirement: Honest model-service readiness
The application SHALL distinguish mock, cloud and future local execution modes. It SHALL expose progress, bounded failures and retry without losing saved work. Mock responses MUST NOT be presented as live AI evidence. Cloud generation SHALL require internet and missing configuration SHALL produce an actionable unavailable state.

#### Scenario: Endpoint unavailable
- **WHEN** configuration is missing, a request times out, or the provider rejects the request
- **THEN** setup shows the reason and recovery action while preserving completed work

#### Scenario: Development mock
- **WHEN** the developer uses a mock response
- **THEN** the interface and exported evidence identify it as simulated and no live-inference acceptance passes

### Requirement: Exportable functional desktop gate
The application SHALL support bounded supported-answer and absent-answer checks in English and Filipino. It SHALL retain actual output, duration, execution mode, provider/model identity and environment evidence across reopening and allow export. Human review SHALL assess faithful meaning and language separately from successful generation.

#### Scenario: Live cloud generation succeeds
- **WHEN** the configured endpoint returns a check answer
- **THEN** its actual output and elapsed time are recorded and quality remains pending human review

### Requirement: Credentials and source disclosure
Provider credentials MUST remain outside the distributed client. The application SHALL disclose that confirmed lesson text is sent to a remote model for cloud operations and SHALL send only the text required for the operation.

#### Scenario: Cloud request
- **WHEN** the user requests cloud generation
- **THEN** the disclosed server endpoint receives bounded lesson text without exposing provider credentials in the client or forwarding page photos

### Requirement: Truthful cloud connection states
The setup interface SHALL disclose that cloud requests require internet. Cloud execution MUST NOT be labeled local or offline inference. Saved sources, generated cards and quiz progress with cold offline reopening remain required by the approved offline-resume feature and are outside this setup capability's acceptance.

#### Scenario: Connection absent
- **WHEN** the user attempts a cloud setup check without a connection
- **THEN** the interface identifies cloud mode and its internet requirement, reports the failed request, and preserves completed setup results

### Requirement: Desktop gate and local portability evidence
The setup feature SHALL pass only after clean desktop startup, live cloud checks, human bilingual review and evidence persistence are observed. Physical-phone testing SHALL occur later. The deployment documentation SHALL identify downloadable model weights and license, a compatible local runtime, and hardware requirements; adapter design alone MUST NOT count as demonstrated local operation.

#### Scenario: Desktop acceptance
- **WHEN** the revised desktop and live cloud checks pass with recorded evidence
- **THEN** dependent implementation can proceed while phone execution and local inference remain explicitly unverified

#### Scenario: Future local deployment
- **WHEN** only a local deployment plan or compatible adapter exists
- **THEN** documentation labels local operation planned and includes the model/runtime/hardware path without claiming target-phone compatibility
