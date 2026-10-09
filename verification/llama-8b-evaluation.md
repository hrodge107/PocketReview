# Llama 3.1 8B FP8 evaluation

Observed 2026-10-10 (Asia/Manila). Decision: do not adopt this candidate yet. The required bilingual reviewer gate failed. Existing 3B configuration is restored; that does not make 3B reviewer quality accepted.

## Evidence and call accounting

| Run | Forwarded endpoint requests | Observed result |
| --- | --- | --- |
| `verification/live/checks-1791586945994.json` | 4 | All four setup samples returned valid structured responses identifying the 8B FP8 model. |
| `verification/live/reviewer-1791586963349.json` | 1 | Initial reviewer request failed with a generic provider rejection before a valid answer; no partial reviewer saved. |
| `verification/live/reviewer-1791587078759.json` | 7 | English reviewer saved; Filipino operation failed within its single invalid-output retry. |
| Total | 12 | Approved request limit reached; no further candidate calls performed. |

The final script records forwardedCalls=7 and enforces its seven-call cap. Its response list contains six response records, so one response event was not retained by the collector; do not fabricate that missing response or treat the trace as exhaustive. The observed UI error, failed Filipino completion and intermediate content independently establish failure. The request cap counts forwarded endpoint requests, including provider rejection, rather than claiming all produced generated tokens. Original evidence remains untouched.

## Setup meaning assessment by the coding agent

Four endpoint checks used the existing circuit fixtures; this is not a new live setup-browser export or human review.

- English supported (2,792 ms): "The current stops." The source states opening the switch stops current; exact quotation retained. Faithful.
- English absent (1,176 ms): "This is not in this lesson." No voltage is supplied; empty evidence. Faithful abstention.
- Filipino supported (3,413 ms): "Napuputol ang sirkito at humihinto ang daloy ng kuryente." Faithful to the Filipino circuit passage; quotation retained.
- Filipino absent (1,276 ms): "Wala ito sa araling ito." No battery voltage appears; empty evidence. Faithful abstention.

These narrow samples improve confidence in setup responses. They do not establish general Filipino quality, satisfy the separate human-review gate or imply local execution.

## Reviewer meaning assessment by the coding agent

The same confirmed synthetic English biology fixture was used as in the 3B evaluation. No fixture was simplified to pass. Actual production desktop Chrome 154 called the local Worker connected to remote Workers AI. Photos remained local.

English operation completed five distinct items in 12,046 ms. Answers identify chlorophyll absorbing light, roots taking water from soil, plants making food, carbon dioxide entering via stomata and sunlight providing photosynthesis energy. Quotations and source revision validate. "What makes food in plants?" answered "Plants" is awkward and weak as a study question, though its factual answer follows the source. Persistence restored after page reload.

Filipino operation failed after 33,260 ms. Intermediate items had better language than the 3B sample but still failed source meaning:

- "Sa anong bahagi ng halaman ang nagpapalabas ng oksiheno?" / "Ang mga dahon ang nagpapalabas ng oksiheno." Its quotation only says photosynthesis releases oxygen; the lesson does not identify a releasing plant part. A matching quotation cannot support this additional answer claim.
- "Paano nangyayari ang pagpapalaki ng mga halaman?" / sunlight giving energy for plant growth. Its quotation is about photosynthesis. The question and answer change the stated process into a broader plant-growth explanation.
- The final batch was rejected for a repeated question. No complete Filipino replacement was saved; the successful English reviewer remained stored.

Filipino claim grounding and reliable five-item completion are explicit requirements, so this is a failed candidate evaluation rather than a conditional pass. No human approval is inferred.

## Request compatibility and engineering

The first reviewer attempt included a JSON-schema hint and two system messages; the provider returned a sanitized failure. The evidence does not identify which request detail caused it. Combining system instructions and removing the schema hint allowed subsequent batches to run. Exact output count, source revision, duplicate detection, bounds and quotation checks stayed in place on server and client.

The [Cloudflare JSON-mode support list](https://developers.cloudflare.com/workers-ai/features/json-mode/) does not name the FP8 variant despite its [model page](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/) exposing response_format. Do not claim schema-constrained decoding is guaranteed for this variant.

Type checking, all 25 unit tests and Worker dry-run passed after the request adaptation. No mobile UI or production bundle changed; prior 17 browser checks and production export remain the baseline. OpenSpec strict validation passed for the approved planning update. Full reviewer delivery/verification remains incomplete.

## Portability and next action

Original/GGUF immutable revisions and checksum/size remain in docs/model-evaluation-proposal.md as evaluated-candidate metadata, not the selected model record. No weights downloaded, no self-hosted runtime executed, no phone setup and no external deployment performed.

Increasing model size alone did not resolve the complete task. The next engineering option is a source-fact-targeted generation plan: supply a designated unused source excerpt for each item rather than let the model choose from the whole remaining passage, retaining the same five-item, bilingual and exact-evidence requirements. This is a proposed next experiment, not demonstrated behavior. Further live evaluation requires an explicit new call budget; do not silently extend the exhausted twelve-request evaluation or reduce language/scope requirements.
