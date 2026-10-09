# Local deployment path

Status: planned and unverified. The Expo setup app currently has mock and cloud adapters only. The cloud candidate is Llama 3.2 3B Instruct, and four live setup responses now validate. Local runtime deployment and phone inference remain unverified.

`mobile/model-service.ts` defines `ModelService.answer(request, signal)`. The shared version-1 contract carries one or two confirmed source pages, their revision, question and response language. Every adapter returns an execution mode, model identity, source revision and structured answer with exact source evidence. Provider-specific SDK calls stay outside the UI.

## Model selection record required before live acceptance

Record these fields for the selected Workers AI model:

- Hosted model ID and exposed revision, or an explicit provider-managed/unpinned disclosure.
- Original downloadable weights and immutable revision; model license and any redistribution restrictions.
- Compatible local serving runtime and quantized artifact, with checksums and quantization details.
- Estimated storage, runtime memory, accelerator/backend requirements and the hardware intended for that deployment.
- A local serving procedure and the four supported/absent English/Filipino prompts used for comparison.

An endpoint on a sufficiently powerful owned machine is local self-hosting. Running inference inside the Honor X9c is a separate deployment target. Do not describe a large hosted model as phone-portable based only on an interface adapter, active parameter count or another smaller model in its family.

## Later integration

For local self-hosting, place a compatible model server behind a service that accepts the same bounded request and returns the same structured response. Validate the quotations, revision and bilingual meaning again. The current cloud adapter rejects responses labeled local; implement an explicit local adapter and extend the mode contract rather than silently relabeling cloud results.

For inference inside Expo/Android, assess a native model runtime and development-build requirements against the actual device. React Native does not directly reuse the old browser WebLLM worker. Keep device tests independent from web bundle checks. Preserve `src/` as historical WebLLM diagnostics and `verification/phone-setup.md` as the failed phone gate record.

Acceptance remains split: desktop cloud demo evidence can pass the revised setup feature; a documented local path supports the portability proposal; only observed execution establishes the corresponding local or phone capability.

## Selected cloud candidate and concrete local path

Built with Llama. Cloud model: `@cf/meta/llama-3.2-3b-instruct`, revision `provider-managed-unpinned`. Cloudflare does not expose an immutable weight revision for this endpoint; exact equivalence to a downloaded artifact has not been verified. [Cloudflare model reference](https://developers.cloudflare.com/workers-ai/models/llama-3.2-3b-instruct/).

Original weights: [Meta Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct), revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`. The original repository is gated and requires agreeing to Meta's terms before downloading. Its custom Llama 3.2 Community License and acceptable-use policy apply; include the license, attribution notice and Built with Llama disclosure when redistributing weights or a derivative product. See the model card for the full terms. Filipino is not an officially supported language in that card; the observed two Filipino setup answers support only those samples, not general bilingual quality.

Local quantized candidate: community conversion [bartowski/Llama-3.2-3B-Instruct-GGUF](https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF), revision `5ab33fa94d1d04e903623ae72c95d1696f09f9e8`, file `Llama-3.2-3B-Instruct-Q4_K_M.gguf`. Provider metadata reports 2,019,377,696 bytes (about 1.88 GiB), SHA-256 `6c1a2b41161032677be168d354123594c0e6e67d2b9227c84f296ad037c728ff`. This checksum was retrieved from repository metadata; the multi-gigabyte file was not downloaded or independently hashed. Conversion quality and equivalence remain unverified.

Runtime: [llama.cpp](https://github.com/ggml-org/llama.cpp), inspected revision `79e2e74eb11022c1ba2e438df7f0ca2d4c10f8b6`. Proposed owned-machine target is a 64-bit desktop CPU with at least 8 GiB total RAM, storage for the artifact and build, and adequate free memory for weights plus runtime/KV cache. This is a planning budget, not measured minimum RAM or a latency guarantee. Start with context 2048 and one active request. The artifact alone is about 1.88 GiB; total runtime memory is higher and must be measured. Honor X9c inference remains a separate test.

After accepting the model terms, installing a C++/CMake toolchain and obtaining the pinned artifact, the proposed desktop sequence is:

```powershell
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
git checkout 79e2e74eb11022c1ba2e438df7f0ca2d4c10f8b6
cmake -B build -DGGML_NATIVE=OFF
cmake --build build --config Release -j 2
# Match the downloaded artifact against the recorded SHA-256 first.
Get-FileHash ../models/Llama-3.2-3B-Instruct-Q4_K_M.gguf -Algorithm SHA256
./build/bin/Release/llama-server.exe -m ../models/Llama-3.2-3B-Instruct-Q4_K_M.gguf -c 2048 --parallel 1 --host 127.0.0.1 --port 8090
```

These commands are a documented deployment proposal and have not been executed. Binary layout can depend on the selected CMake generator; confirm the generated executable path. The server's OpenAI-compatible route requires a future local adapter to translate the existing request/response contract and retain the same source validation. Do not point the cloud adapter directly at it or relabel results. The [official Android instructions](https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md) provide NDK/Termux paths, but neither was executed on the target phone. Avoid downloading/building on the phone until its setup handoff is authorized.
