# PocketReview

Built with Llama (Cloudflare Llama 3.2 3B candidate).

PocketReview is migrating to React Native with Expo. This checkout implements the setup feature: labeled sample responses, an optional Cloudflare Worker service, bounded source-evidence checks and saved/exportable results. Photo OCR, cards, quiz and lesson chat are tracked later features.

Live inference through the local Worker is now verified for four setup samples using Llama 3.2 3B, and the user accepted their meaning and language. External Worker deployment, Android operation and local inference remain unverified. A mock result never counts as live AI evidence.

## Start on desktop

Use Node 24.11 or newer. From this repository:

```powershell
./init.ps1
npm run dev
```

The bootstrap runs `npm ci` and `npm run verify`. Git Bash/Linux can use `./init.sh`. Expo web runs at http://localhost:8081, in mock mode by default. Run four sample checks, compare the answers with the visible source, mark meaning/language and export JSON. The sample circuit lessons are fixtures, not student-uploaded content.

```powershell
npm run build
npm run preview
npm run test:browser
```

The production web export is `dist/`; preview binds only to http://localhost:4173. Close a preview server before running browser tests because those tests start their own server on that port. The current setup export has no offline app-shell cache; cold offline study belongs to the later offline-resume feature.

`npm run verify` runs type checking, focused contract/proxy/storage tests, the production Expo web export and a Worker deployment dry-run. The dry-run bundles code and validates bindings without deploying or running a model. Browser tests use installed Chrome and simulated setup responses. Native testing remains separate.

## Connect Cloudflare

Follow [the account and Worker handoff](docs/cloudflare-setup.md). The Worker candidate is Llama 3.2 3B; its hosted revision is provider-managed/unpinned. Its documented local path remains untested. Cloudflare account/service tokens must never enter the Expo bundle. Only the public Worker URL may use an Expo public environment variable; the separate demo access code is entered at runtime and stays in memory.

Cloud operations send bounded confirmed text and questions to Cloudflare; they require internet. Saved study offline is planned, while cloud generation/chat offline is unavailable. Neither cloud success nor adapter design establishes phone inference.

## Future phone and local deployment

See [local portability requirements](docs/local-portability.md). Expo web verification does not establish native OCR/storage or model-runtime compatibility. When physical testing is authorized, use a matching Expo Go version for the current pure-JS setup or a development build for native OCR/model modules. Provide a runnable build before requesting human phone setup.

`npm start` launches Expo; `npm run android` asks Expo to open Android and requires the user's device/emulator setup. These have not been tested on the Honor X9c. Stop for human setup at that stage.

## Preserved prototype

The original WebLLM diagnostics remain untouched in `src/`, with old Vite configuration and browser tests retained for historical reference. They are excluded from the active Expo entry, TypeScript and test paths. `verification/legacy-vite/` preserves the previous manifest, lockfile, TypeScript/browser configuration and README. Recreate that prototype in a separate checkout/workspace if needed; do not mix its dependencies into the active Expo install. Its evidence database remains untouched and separate from the new `pocketreview-setup-evidence-v2` key.

If reusing an old deployment origin, export historical evidence first and explicitly retire its Vite service worker before serving the new Expo build. An old worker can continue showing the cached prototype. Do not clear unrelated model caches or evidence without preserving needed data.

## Dependency limitations

The initial Expo SDK 57 tree reports 22 npm audit findings inherited from build/configuration tooling, rooted in braces, node-forge and an older uuid dependency. At verification time, the registry exposed no patched braces or node-forge release; npm's forced fix proposed incompatible Expo/React Native downgrades. No forced downgrade was applied. Keep development servers local, monitor upstream fixes, and reevaluate before public development-server exposure or native signing work. The Worker dry-run bundles only the small inference proxy and shared validation code.

## Workflow

OpenSpec owns requirements and tasks, `feature_list.json` owns feature status/evidence and `agent-progress.md` records restart context. Keep one active feature. For each feature: propose, apply, verify, archive, then commit/push. The revised setup feature remains in progress until real bilingual cloud results and complete evidence review exist. Later features get separate changes after dependencies pass.
