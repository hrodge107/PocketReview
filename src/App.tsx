import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { checks, emptyEvidence, summary, MODEL_ID, MODEL_REVISION, LIB_REVISION, RUNTIME_VERSION, type GateEvidence, type GateResult, type Review } from './gate';
import { readEvidence, writeEvidence } from './evidence';
import { PhoneRuntime, modelCachePresent } from './runtime';

export default function App() {
  const [evidence, setEvidence] = useState<GateEvidence>(emptyEvidence);
  const [hydrated, setHydrated] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState('Reading saved evidence…');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'running' | 'error'>('idle');
  const [message, setMessage] = useState('The model has not been loaded in this session.');
  const [progress, setProgress] = useState(0);
  const [cache, setCache] = useState('Checking model cache…');
  const [device, setDevice] = useState('');
  const [cold, setCold] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [shellCached, setShellCached] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const runtime = useRef<PhoneRuntime | null>(null);
  const running = useRef(false);
  const cancel = useRef(false);
  const latest = useRef(evidence);
  const { offlineReady: [shellReady] } = useRegisterSW();
  const busy = status === 'loading' || status === 'running';
  const gate = summary(evidence);

  async function refreshCache() {
    try { setCache(await modelCachePresent() ? 'Model tensors found. Cold offline operation still needs a check.' : 'Model tensors not found. Connect to download the model.'); }
    catch { setCache('Cache could not be inspected. Try loading the model to check availability.'); }
  }
  useEffect(() => {
    let mounted = true;
    readEvidence().then(data => { if (mounted) { latest.current = data; setEvidence(data); setSaveState('Saved evidence restored.'); setHydrated(true); } }).catch(() => { if (mounted) { setReadFailed(true); setSaveState('Saved evidence could not be read. Retry reading before creating new evidence.'); } });
    void refreshCache();
    if ('serviceWorker' in navigator && 'caches' in window) {
      void navigator.serviceWorker.ready.then(async () => {
        const names = await caches.keys();
        const appCache = names.find(name => name.startsWith('pocketreview-shell-precache'));
        if (appCache) {
          const store = await caches.open(appCache);
          const cached = await store.match(new URL('/index.html', location.origin).href, { ignoreSearch: true });
          if (mounted) setShellCached(!!cached);
        }
      }).catch(() => { /* The status remains unverified if cache inspection fails. */ });
    }
    const network = () => setOnline(navigator.onLine);
    window.addEventListener('online', network); window.addEventListener('offline', network);
    return () => { mounted = false; runtime.current?.stop(); window.removeEventListener('online', network); window.removeEventListener('offline', network); };
  }, []);

  async function persist(next: GateEvidence) {
    latest.current = next; setEvidence(next); setSaving(true); setSaveState('Saving evidence…');
    try { await writeEvidence(next); setSaveState('Evidence saved on this device.'); }
    catch { setSaveState('Evidence was not saved. Retry saving or export before closing.'); }
    finally { setSaving(false); }
  }
  async function failure(stage: string, error: unknown) {
    const text = error instanceof Error ? error.message : String(error);
    setMessage(text); setStatus('error');
    await persist({ ...latest.current, failures: [...latest.current.failures, { at: new Date().toISOString(), stage, message: text, userAgent: navigator.userAgent }] });
  }
  async function load() {
    if (running.current) return;
    running.current = true; cancel.current = false;
    runtime.current?.stop();
    const next = new PhoneRuntime(); runtime.current = next;
    setStatus('loading'); setProgress(0); setMessage('Preparing local model. Keep this page open.');
    try {
      await next.load(report => { if (!cancel.current) { setProgress(Math.max(0, Math.min(1, report.progress))); setMessage(report.text); } });
      if (!cancel.current) { setStatus('ready'); setMessage('Model loaded. Run the four checks and inspect the answers.'); }
    } catch (error) { if (!cancel.current) { next.stop(); await failure('load', error); } }
    finally { running.current = false; void refreshCache(); }
  }
  async function run() {
    if (running.current || !runtime.current) return;
    running.current = true; cancel.current = false; setStatus('running');
    const engine = runtime.current;
    const deviceName = device.trim();
    const coldAttestation = cold;
    try {
      for (const check of checks) {
        if (cancel.current) break;
        setMessage(`Answering ${check.id.replace('-', ' ')}…`);
        const start = performance.now(); let output = ''; let error: string | null = null;
        try {
          output = await engine.generate(check);
          if (!output.trim()) error = 'The model returned no text.';
        } catch (err) { error = err instanceof Error ? err.message : String(err); }
        const result: GateResult = {
          id: crypto.randomUUID(), checkId: check.id, lesson: check.lesson, question: check.question, language: check.language,
          output, error, elapsedMs: Math.round(performance.now() - start), at: new Date().toISOString(), sessionId: sessionId.current,
          engineId: engine.id, loadStartedAt: engine.loadStartedAt, modelId: MODEL_ID, modelRevision: MODEL_REVISION, libraryRevision: LIB_REVISION,
          runtimeVersion: RUNTIME_VERSION, userAgent: navigator.userAgent, origin: location.origin, secureContext: window.isSecureContext, device: deviceName, gpu: engine.gpu,
          onlineAtLoad: engine.onlineAtLoad, onlineAtGeneration: navigator.onLine, coldOfflineAttested: coldAttestation, review: 'pending',
        };
        await persist({ ...latest.current, results: [...latest.current.results, result] });
        if (error) { engine.stop(); setStatus('error'); setMessage(error); return; }
      }
      if (!cancel.current) { setStatus('ready'); setMessage('Checks finished. Compare every answer with its lesson before marking it faithful.'); }
    } finally { running.current = false; }
  }
  function stop() {
    cancel.current = true; runtime.current?.stop(); setStatus('idle'); setMessage('Stopped. Previous evidence remains available. Reload the model to continue.');
  }
  function exportEvidence() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(latest.current, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'pocketreview-phone-gate.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function review(id: string, value: Review) {
    await persist({ ...latest.current, results: latest.current.results.map(result => result.id === id ? { ...result, review: value } : result) });
  }

  return <main>
    <header><p className="brand">PocketReview <span>Setup notebook</span></p><p>Check your phone for offline study.</p></header>
    <div className="spread">
      <section className="setup" aria-labelledby="setup-title">
        <p className="chapter">01 / Prepare your phone</p><h1 id="setup-title">Check local study<br />before adding a lesson.</h1>
        <p className="intro">Download the model once, then check how it answers in English and Filipino. Your phone does the processing.</p>
        <dl className="readiness"><div><dt>App shell</dt><dd>{shellReady || shellCached ? 'Cached for offline reopening.' : 'Waiting for the production service worker.'}</dd></div><div><dt>Model assets</dt><dd>{cache}</dd></div><div><dt>Connection</dt><dd>{online ? 'Browser reports online.' : 'Browser reports offline.'} This indicator alone is not proof.</dd></div></dl>
        <label htmlFor="device">Device being tested</label><input id="device" placeholder="e.g. Honor X9c, Chrome version" value={device} onChange={e => setDevice(e.target.value)} disabled={busy} />
        <label className="attestation"><input type="checkbox" checked={cold} disabled={busy || runtime.current !== null} onChange={e => setCold(e.target.checked)} /><span>I disconnected internet and reopened this page before loading the model. Keep the laptop off for the phone check.</span></label>
        <div className="actions"><button className="primary" onClick={() => void load()} disabled={busy || saving || !hydrated}>{status === 'error' ? 'Retry model loading' : status === 'ready' ? 'Reload local model' : 'Load local model'}</button>{busy && <button onClick={stop}>Stop current task</button>}</div>
        {status === 'loading' && <progress max="1" value={progress} aria-label="Model loading progress" />}
        <p role={status === 'error' ? 'alert' : 'status'} className="status">{message}</p>
        <button onClick={() => void run()} disabled={status !== 'ready' || !device.trim() || saving || !hydrated}>Run four language checks</button>
        <p className="note">Qwen3 0.6B · WebLLM {RUNTIME_VERSION}. Initial loading needs internet and substantial storage. Download size and phone latency have not been measured.</p>
      </section>
      <section className="evidence" aria-labelledby="evidence-title">
        <p className="chapter">02 / Inspect your evidence</p><h2 id="evidence-title">What actually happened</h2>
        <p className="note">Phone language checks: {gate.bilingual ? 'reviewed as faithful' : 'pending'}. Cold offline check: {gate.offline ? 'recorded with your attestation' : 'pending'}. These records still need inspection before the feature passes.</p>
        <p role="status">{saveState}</p>{readFailed && <button onClick={() => location.reload()}>Retry reading evidence</button>}<div className="actions"><button onClick={exportEvidence} disabled={!hydrated}>Export evidence</button><button onClick={() => void persist(latest.current)} disabled={!hydrated || busy || saving}>Retry saving</button></div>
        {!evidence.results.length && <div className="empty"><h3>No answers recorded yet</h3><p>Load the model and run the checks. Each answer will appear here with its source and elapsed time.</p></div>}
        {[...evidence.results].reverse().map(result => <article key={result.id}>
          <p className="result-meta">{result.checkId} · {(result.elapsedMs / 1000).toFixed(1)} s · {result.device}</p><h3>{result.question}</h3>
          <blockquote>{result.lesson}</blockquote><p className="answer">{result.output || 'No answer produced.'}</p>{result.error && <p role="alert">{result.error}</p>}
          <p className="note">Review target: {checks.find(check => check.id === result.checkId)?.expected}</p>
          <label htmlFor={`review-${result.id}`}>Does the answer match the lesson and requested language?</label><select id={`review-${result.id}`} value={result.review} disabled={busy || saving || !!result.error} onChange={e => void review(result.id, e.target.value as Review)}><option value="pending">Not reviewed</option><option value="faithful">Faithful and usable</option><option value="incorrect">Incorrect or unusable</option></select>
        </article>)}
        {!!evidence.failures.length && <details><summary>Recorded setup failures ({evidence.failures.length})</summary>{evidence.failures.map((item, i) => <p key={`${item.at}-${i}`}>{item.stage}: {item.message}</p>)}</details>}
      </section>
    </div>
  </main>;
}
