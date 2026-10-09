# Cloudflare setup handoff

The Expo app starts in labeled mock mode without an account. Live acceptance waits for your Cloudflare configuration and model selection. A dashboard playground result alone does not establish that the app endpoint works.

## Local preparation

From the repository root:

```powershell
npm ci
npm run verify
npm run dev
```

Open the URL printed by Expo (normally http://localhost:8081). Run the four sample checks in mock mode to exercise the controls. The fixture results are not AI-quality evidence.

## Configure the Worker

1. Finish creating your Cloudflare account and enable Workers AI access. Cloudflare currently documents a free allocation of 10,000 Neurons per day, resetting at 00:00 UTC. Requests beyond that allowance fail on Workers Free; Workers Paid bills overage, and some models require paid billing. Check your account dashboard before inference; do not enable paid usage as part of this handoff. Model-specific Neuron use varies, so this is not a fixed number of tokens or image generations.
2. The prepared candidate is `@cf/meta/llama-3.2-3b-instruct` (Llama 3.2 3B Instruct). It is listed in the Workers AI catalog, and is not among the models Cloudflare currently identifies as requiring a paid plan. This does not verify access or free-plan eligibility for your specific account; check the dashboard/playground and stop if it asks you to upgrade or add billing. Cloudflare hosts the inference model; the configured revision `provider-managed-unpinned` is a disclosure, not a pinned release. Meta's Llama Community License applies. Review the linked license before redistribution. The original downloadable weights have a separate local runtime path to evaluate; this Cloudflare configuration alone does not establish portability or Filipino answer quality.
3. Set `ALLOWED_ORIGINS` to the exact Expo web origins you use, separated by commas. Keep localhost entries for desktop development. Add your HTTPS production origin before deploying the app. CORS alone is not authentication; the Worker also requires a separate demo access code.
4. Rate-limit namespace `1001` is an account-scoped identifier. If another Worker already uses it, choose an unused positive integer. The prepared limit is 12 requests per minute per Cloudflare location, shared by this demo. This is a soft abuse control, not a global spending cap. Review provider allowance in the dashboard.
5. Authenticate Wrangler and set a unique demo access code through its secret prompt:

```powershell
npx wrangler login
npx wrangler secret put DEMO_ACCESS_CODE --config worker/wrangler.jsonc
npm run worker:check
npm run worker:deploy
```

`worker:deploy` publishes externally. Run it only when your account/model configuration is ready. Workers AI uses the `AI` binding, so no Cloudflare account API token is embedded in the Expo app. Wrangler authentication remains on your computer. Do not paste account tokens or demo codes into chat or source files.

6. In the app, choose **Use cloud**, enter the deployed Worker base URL and the demo access code. The code remains in memory and must be entered again after reload. It is an app access credential, not your Cloudflare account token. Confirm the remote-text disclosure before running checks. Alternatively put only the public URL in an ignored `.env.local` as `EXPO_PUBLIC_WORKER_URL=https://your-worker.workers.dev` and restart Expo.

## What this Worker serves

This is the PocketReview adapter, not a generic `{prompt}` endpoint. The Expo app posts a validated question and confirmed lesson pages to `https://<worker-host>/answer`, authenticating with the separate `DEMO_ACCESS_CODE`. The Worker sends bounded lesson text to the configured model and returns structured answer/evidence plus provider and model metadata. It rejects other browser origins, unauthenticated requests and oversized input, and applies a demo rate limit. Keep these checks in place; do not expose a raw model endpoint or put a Cloudflare account token in the app.

The existing `ai: { "binding": "AI" }` configuration is the required Workers AI binding. Cloudflare's current Wrangler instructions use `npx wrangler dev` for local development; AI inference still runs remotely against the account and can consume the daily allowance. This repo's `npm run worker:dev` runs Wrangler with the Worker config. No separate `create-cloudflare` project is needed.

The request limit configured here is an application-level demo throttle, not a Neuron budget or a guarantee that account usage stays free. Workers AI requests execute remotely; do not rely on the generic Worker CPU limit as an inference-time allowance. Inspect current account usage and model availability in Cloudflare before running live checks.

The Worker classifies invalid JSON/evidence separately from an inference-provider failure. In local development, the terminal prints a generic category only; model output and lesson text are never logged. Restart `npm run worker:dev` after code changes before retrying a failed sample.

## Live evidence

After confirming the model is accessible on your account without enabling paid billing, run the four checks once. Inspect exact quotations, meaning and response language before marking a result faithful. Missing-voltage questions must abstain in both languages. If invalid output appears, inspect the model/configuration before one deliberate retry. The app makes no automatic retry or hidden fallback.

Export the results, reload the app and check their persistence. Record the actual model, provider-managed revision limitation, browser, latency and allowance observations. Exported setup JSON contains only the fixed sample prompts/results and environment metadata; it excludes the demo access code and endpoint. Live cloud results do not establish local operation or Honor X9c compatibility.

For local Worker development, create ignored `worker/.dev.vars` with `DEMO_ACCESS_CODE`, then use `npm run worker:dev`. Workers AI calls still use remote compute and may consume allowance; this is not offline inference. Live development may require Wrangler login. Local code tests use mocked bindings and consume no account quota.

The proxy limits source text to 4,500 characters (roughly 1,500 tokens at a three-character heuristic, not a measured tokenizer count), questions to 300 characters, answers to 600 characters, body streams to 20,000 bytes and model output to 384 tokens. Exact tokenization varies across English and Filipino. Client deadlines are 60 seconds and Worker model deadlines 45 seconds. Cancelling the client or reaching a deadline may not cancel an already-running provider operation; it may still consume allowance. Keep requests sequential and avoid automatic retries.

References: [Expo web workflow](https://docs.expo.dev/workflow/web/), [Workers AI setup and remote development](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/), [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/), [rate-limit binding and locality](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [current Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Worker compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).
