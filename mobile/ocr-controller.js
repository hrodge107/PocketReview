importScripts('/ocr/api.min.js');
self.onmessage = async ({ data }) => {
  let worker;
  try {
    worker = await Tesseract.createWorker('eng+fil', 1, {
      workerPath: `${self.location.origin}/ocr/worker.min.js`,
      corePath: `${self.location.origin}/ocr/core`,
      langPath: `${self.location.origin}/ocr/lang`, gzip: false, workerBlobURL: false,
      logger: progress => self.postMessage({ kind: 'progress', status: progress.status, progress: progress.progress }),
      errorHandler: () => self.postMessage({ kind: 'error', message: 'OCR could not load or read this image. Check local OCR assets, replace the photo or type the text.' }),
    });
    const result = await worker.recognize(data.photo);
    if (result.data.text.length > 50000) throw Error('Extracted text is too large. Use a smaller excerpt.');
    self.postMessage({ kind: 'result', text: result.data.text });
  } catch {
    self.postMessage({ kind: 'error', message: 'OCR failed. Retry once, replace the photo or type the text manually.' });
  } finally { if (worker) await worker.terminate(); }
};
