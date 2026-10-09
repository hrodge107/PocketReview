export function recognizePhoto(photo: string, signal: AbortSignal, progress: (message: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(Error('OCR cancelled. Completed work is preserved.')); return; }
    const worker = new Worker('/ocr/controller.js');
    let finished = false;
    const stop = (error: Error | null, text = '') => {
      if (finished) return;
      finished = true; clearTimeout(timer); signal.removeEventListener('abort', cancel); worker.terminate();
      if (error) reject(error); else resolve(text);
    };
    const cancel = () => stop(Error('OCR cancelled. Completed work is preserved.'));
    const timer = setTimeout(() => stop(Error('OCR timed out. Use a clearer or smaller photo, then retry.')), 60000);
    signal.addEventListener('abort', cancel, { once: true });
    worker.onerror = () => stop(Error('Local OCR assets could not load. Run npm run ocr:prepare and rebuild, then retry.'));
    worker.onmessage = ({ data }) => {
      if (data.kind === 'progress') progress(`${data.status} ${Math.round(Math.max(0, Math.min(1, Number(data.progress) || 0)) * 100)}%`);
      else if (data.kind === 'result' && typeof data.text === 'string') stop(null, data.text);
      else if (data.kind === 'error') stop(Error(String(data.message)));
    };
    worker.postMessage({ photo });
  });
}
