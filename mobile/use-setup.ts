import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { checks } from './checks';
import { emptyEvidence, evidenceStore, type Evidence, type Result, type Review } from './evidence';
import { type ModelService } from './model-service';
const message = (error: unknown) => error instanceof Error ? error.message : 'Something failed. Retry or export the current results.';

export function useSetup() {
  const [evidence, setEvidence] = useState(emptyEvidence);
  const [readError, setReadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState('');
  const [saved, setSaved] = useState(false);
  const current = useRef<Evidence>(emptyEvidence());
  const controller = useRef<AbortController | null>(null);
  const locked = useRef(false);
  async function load() {
    if (locked.current) return;
    locked.current = true; setReady(false); setReadError('');
    try { const data = await evidenceStore.read(); current.current = data; setEvidence(data); setReady(true); setSaved(data.results.length > 0); }
    catch (error) { setReadError(message(error)); }
    finally { locked.current = false; }
  }
  useEffect(() => { void load(); return () => controller.current?.abort(); }, []);
  async function persist(data: Evidence) {
    current.current = data; setEvidence(data); setSaved(false);
    try { await evidenceStore.write(data); setSaveError(''); setSaved(true); }
    catch (error) { setSaveError(message(error)); }
  }
  async function run(service: ModelService) {
    if (locked.current || !ready || saveError) return;
    if (current.current.results.length + checks.length > 120) { setSaveError('Evidence is full. Export results before another run.'); return; }
    locked.current = true;
    controller.current = new AbortController();
    const signal = controller.current.signal;
    for (const check of checks) {
      if (signal.aborted) break;
      setBusy(check.label);
      const started = Date.now();
      const result: Result = { id: `${started}-${check.id}`, checkId: check.id, at: new Date().toISOString(), elapsedMs: 0,
        environment: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : `${Platform.OS} ${Platform.Version}`,
        mode: service.mode, response: null, error: null, review: 'pending' };
      try { result.response = await service.answer(check.request, signal); }
      catch (error) { result.error = message(error); }
      result.elapsedMs = Date.now() - started;
      const data = { version: 2 as const, results: [...current.current.results, result] };
      current.current = data; setEvidence(data); setSaved(false);
      try { await evidenceStore.write(data); setSaveError(''); setSaved(true); }
      catch (error) { setSaveError(message(error)); break; }
      if (result.error) break;
    }
    setBusy(''); controller.current = null; locked.current = false;
  }
  async function review(id: string, review: Review) {
    if (locked.current || !ready) return;
    locked.current = true;
    await persist({ version: 2, results: current.current.results.map(result => result.id === id ? { ...result, review } : result) });
    locked.current = false;
  }
  async function retrySave() {
    if (locked.current || !ready) return;
    locked.current = true; await persist(current.current); locked.current = false;
  }
  return { evidence, ready, busy, saved, readError, saveError, run, review, retrySave, load, cancel: () => controller.current?.abort() };
}
