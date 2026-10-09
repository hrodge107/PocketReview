import { useEffect, useRef, useState } from 'react';
import { changedSource, confirmSource, editSource, emptyLesson, type Lesson, type SourcePage } from '../shared/lesson';
import { lessonStore } from './lesson-store';
import { recognizePhoto } from './ocr';
import { selectPhotos } from './photos';
const message = (error: unknown) => error instanceof Error ? error.message : 'The source operation failed. Retry without replacing saved work.';
export function useLesson() {
  const [lesson, setLesson] = useState(emptyLesson);
  const current = useRef(lesson);
  const [ready, setReady] = useState(false), [busy, setBusy] = useState('');
  const [saved, setSaved] = useState(false), [saveError, setSaveError] = useState('');
  const [error, setError] = useState(''), [readError, setReadError] = useState('');
  const lock = useRef(false), controller = useRef<AbortController | null>(null);
  const writes = useRef<Promise<boolean>>(Promise.resolve(true));
  const mounted = useRef(true);
  async function load() {
    if (lock.current) return; lock.current = true; setReadError('');
    try { const data = await lessonStore.read(); current.current = data; setLesson(data); setReady(true); setSaved(data.pages.length > 0); }
    catch (cause) { setReadError(message(cause)); setReady(false); }
    finally { lock.current = false; }
  }
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  function persist(data: Lesson): Promise<boolean> {
    current.current = data; setLesson(data); setSaved(false);
    writes.current = writes.current.then(async () => {
      try {
        await lessonStore.write(data);
        if (mounted.current && current.current === data) { setSaved(true); setSaveError(''); }
        return true;
      } catch (cause) { if (mounted.current) { setSaved(false); setSaveError(message(cause)); } return false; }
    });
    return writes.current;
  }
  async function recognize(pages: SourcePage[]) {
    controller.current = new AbortController(); const signal = controller.current.signal;
    for (const page of pages) {
      if (signal.aborted) break;
      setBusy(`Reading ${page.name}`);
      let replacement: SourcePage;
      try {
        const rawText = await recognizePhoto(page.photo, signal, status => { if (mounted.current) setBusy(`${page.name}: ${status}`); });
        replacement = { ...page, rawText, correctedText: rawText, ocrState: 'complete', error: rawText.trim() ? null : 'No text detected. Type the text, retry a clearer photo or remove this page.' };
      } catch (cause) { replacement = { ...page, ocrState: 'failed', error: message(cause) }; }
      if (!mounted.current) break;
      const written = await persist(changedSource(current.current, current.current.pages.map(item => item.id === page.id ? replacement : item)));
      if (!written || replacement.ocrState === 'failed') break;
    }
    controller.current = null;
  }
  async function add(camera: boolean) {
    if (lock.current || !ready || saveError) return; lock.current = true; setError(''); setBusy('Selecting photos');
    try {
      const pages = await selectPhotos(camera, 2 - current.current.pages.length);
      if (pages.length && await persist(changedSource(current.current, [...current.current.pages, ...pages]))) await recognize(pages);
    } catch (cause) { setError(message(cause)); }
    finally { setBusy(''); lock.current = false; }
  }
  async function retry(id: string) {
    if (lock.current || !ready || saveError) return;
    const page = current.current.pages.find(item => item.id === id); if (!page) return;
    lock.current = true; setError('');
    try { await recognize([page]); } catch (cause) { setError(message(cause)); }
    finally { setBusy(''); lock.current = false; }
  }
  function edit(id: string, text: string) { if (!lock.current && ready) { setError(''); void persist(editSource(current.current, id, text)); } }
  function remove(id: string) { if (!lock.current && ready) { setError(''); void persist(changedSource(current.current, current.current.pages.filter(page => page.id !== id))); } }
  async function confirm() {
    if (lock.current || !ready || saveError) return;
    try { await persist(confirmSource(current.current)); } catch (cause) { setError(message(cause)); }
  }
  return { lesson, ready, busy, canCancel: !!controller.current, saved, error, readError, saveError, add, retry, edit, remove, confirm, load,
    retrySave: () => persist(current.current), cancel: () => controller.current?.abort() };
}
