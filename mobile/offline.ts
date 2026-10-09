export async function prepareOffline(): Promise<string> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return 'Offline app installation is available in the desktop production web build. Native device acceptance is pending.';
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  if (registration.active && !registration.installing) return 'Offline ready: application and local OCR files are cached.';
  const worker = registration.installing ?? registration.waiting;
  if (!worker) throw Error('Offline files are not ready. Retry after opening the production build.');
  await new Promise<void>((resolve, reject) => {
    const changed = () => {
      if (worker.state === 'activated') { worker.removeEventListener('statechange', changed); resolve(); }
      if (worker.state === 'redundant') { worker.removeEventListener('statechange', changed); reject(Error('Offline download failed. Check available storage and connection, then retry.')); }
    };
    worker.addEventListener('statechange', changed); changed();
  });
  return 'Offline ready: application and local OCR files are cached.';
}
