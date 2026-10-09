# Proposed bounded model evaluation

Status: user approved evaluation on 2026-10-10 with "Evaluate Llama 3.1 8B FP8". The bounded evaluation is complete and the candidate is rejected for current bilingual reviewer acceptance. Twelve endpoint requests were forwarded across setup and reviewer attempts. Configuration is restored to 3B; neither model has passed reviewer acceptance. Findings: verification/llama-8b-evaluation.md. No weight download or external deployment occurred.

## Candidate and local target

- Hosted candidate: `@cf/meta/llama-3.1-8b-instruct-fp8`, listed in the [current Cloudflare reference](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/). Hosted weights are FP8; a future local Q4 conversion is a different precision and requires separate acceptance. Do not claim equivalence.
- Original [Meta Llama 3.1 8B Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct), immutable repository revision `0e9e39f249a16976918f6564b8830bc894c89659`; metadata reports manually gated access and the Llama 3.1 license. Accept the model terms and retain required attribution/license disclosures before obtaining or redistributing weights.
- Community [bartowski GGUF conversion](https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF), repository revision `bf5b95e96dac0462e2a09145ec66cae9a3f12067`, artifact `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`. Repository metadata reports 4,920,739,232 bytes (approximately 4.58 GiB), SHA-256 `7b064f5842bf9532c91456deda288a1b672397a54fa729aa665952863033557c`. Metadata was retrieved on 2026-10-10; no independent artifact download/hash or conversion-quality check was performed.
- Proposed runtime: the existing pinned llama.cpp candidate in docs/local-portability.md, an owned 64-bit desktop endpoint, provisional 16 GiB total RAM, context 4096 and one active request. Reserve storage for model plus runtime/build and free memory beyond weights for KV cache and runtime. Memory use, latency and runtime compatibility must be measured later; these are not minimum-hardware claims.
- Honor X9c inference is not established or proposed as accepted by this change. This increases the current model/hardware target, which is why the user's decision is required.
- Greater parameter count does not establish Filipino quality. Filipino is outside Meta's advertised eight supported languages; only inspected live outputs can establish the narrow demo samples.

Gemma 3 12B was withdrawn: its current Cloudflare reference redirects to an unavailable-model catalog entry. Do not select it based on older search snippets.

## Evaluation after approval

1. Record the approved candidate and owned-desktop deployment target in the active OpenSpec design and portability record. Change the local Worker candidate only; do not deploy externally or switch models silently in the UI.
2. Run the four existing setup questions once (English/Filipino supported and absent-answer cases), retaining actual outputs, metadata and latency. Review meaning and abstention.
3. Run one full reviewer operation per language against the existing confirmed synthetic biology fixture. Six base calls plus at most one invalid-output retry per operation. Combined evaluation budget: at most twelve calls, including four setup calls. Do not retry quota/network failures or begin another model sweep automatically.
4. Inspect every question/answer against its source. Require understandable selected-language text, no fabricated mechanisms or material facts, correctly targeted questions, exact quotations, five distinct short items and restored persistence. JSON/evidence matching alone cannot pass this evaluation.
5. If evaluation fails, retain the original evidence and keep the feature incomplete. Restore the prior model configuration if the candidate is rejected. If it passes and is selected, update truthful model identity and portability disclosures; setup evidence from 3B does not establish 8B behavior.
6. Continue OpenSpec verify/archive/commit/push only after actual acceptance and delivery checks pass. A subsequent self-hosted Q4 endpoint still requires its own verification; hosted FP8 success is not local execution evidence.

The account's current allowance and plan remain unverified. No paid-plan activation or paid-capacity provisioning is part of this proposal.
