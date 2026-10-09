import { CreateWebWorkerMLCEngine, hasModelInCache, type AppConfig, type WebWorkerMLCEngine, type InitProgressReport } from '@mlc-ai/web-llm';
import { MODEL_ID, MODEL_URL, LIB_URL, promptFor, type checks } from './gate';

export const appConfig: AppConfig = {
  cacheBackend: 'cache',
  model_list: [{ model_id: MODEL_ID, model: MODEL_URL, model_lib: LIB_URL, overrides: { context_window_size: 4096 } }],
};
export class PhoneRuntime {
  private worker?: Worker;
  private engine?: WebWorkerMLCEngine;
  private stopped = false;
  private rejectTask?: (error: Error) => void;
  readonly id = crypto.randomUUID();
  readonly loadStartedAt = new Date().toISOString();
  readonly onlineAtLoad = navigator.onLine;
  gpu = 'Not observed';

  async load(progress: (report: InitProgressReport) => void) {
    if (!window.isSecureContext) throw new Error('Open the HTTPS build. A phone LAN HTTP address cannot enable WebGPU.');
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ info?: { vendor?: string; architecture?: string; device?: string }; features: Set<string> } | null> } }).gpu;
    if (!gpu) throw new Error('WebGPU is unavailable in this browser. Try current Chrome over HTTPS.');
    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error('The browser could not create a GPU adapter. Check browser support and retry.');
    if (!adapter.features.has('shader-f16')) throw new Error('This GPU does not expose shader-f16 required by the selected model. Record the failure before changing the runtime.');
    this.gpu = [adapter.info?.vendor, adapter.info?.architecture, adapter.info?.device].filter(Boolean).join(' / ') || 'Adapter available; identity not exposed';
    if (this.stopped) throw new Error('Model loading cancelled.');
    const worker = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    const engine = await this.bound(CreateWebWorkerMLCEngine(worker, MODEL_ID, { appConfig, initProgressCallback: progress }), 10 * 60_000);
    if (this.stopped) { worker.terminate(); throw new Error('Model loading cancelled.'); }
    this.engine = engine;
  }
  async generate(check: typeof checks[number]) {
    if (!this.engine) throw new Error('Load the model first.');
    const response = await this.bound(this.engine.chat.completions.create({
      messages: [{ role: 'user', content: promptFor(check) }],
      max_tokens: 128, temperature: 0, extra_body: { enable_thinking: false },
    }), 90_000);
    return response.choices[0]?.message.content ?? '';
  }
  stop() {
    this.stopped = true;
    this.rejectTask?.(new Error('Task cancelled. Reload the model to continue.'));
    this.worker?.terminate();
    this.engine = undefined;
  }
  private bound<T>(request: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const finish = () => { window.clearTimeout(timer); this.rejectTask = undefined; };
      this.rejectTask = error => { finish(); reject(error); };
      const timer = window.setTimeout(() => { finish(); this.stop(); reject(new Error('Local processing timed out. Reload the model to retry.')); }, timeoutMs);
      if (this.worker) this.worker.onerror = event => { finish(); this.stop(); reject(new Error(event.message || 'The model worker stopped unexpectedly.')); };
      request.then(value => { finish(); resolve(value); }, error => { finish(); reject(error); });
    });
  }
}
export const modelCachePresent = () => hasModelInCache(MODEL_ID, appConfig);
