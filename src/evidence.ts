import { emptyEvidence, type GateEvidence } from './gate';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pocketreview-evidence', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('gate');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other PocketReview tabs, then retry saving.'));
  });
}
export async function readEvidence(): Promise<GateEvidence> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('gate').objectStore('gate').get('current');
      request.onsuccess = () => resolve(request.result ?? emptyEvidence());
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function writeEvidence(evidence: GateEvidence): Promise<void> {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('gate', 'readwrite');
      tx.objectStore('gate').put(evidence, 'current');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error('Evidence write was interrupted.'));
    });
  } finally { db.close(); }
}
