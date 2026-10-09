import { decodeLesson, emptyLesson, type Lesson } from '../shared/lesson';
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pocketreview-lessons', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('lesson');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error('Cannot open local lesson storage. Check browser storage permissions and retry.'));
    request.onblocked = () => reject(Error('Another tab blocks lesson storage. Close other PocketReview tabs and retry.'));
  });
}
export const lessonStore = {
  async read(): Promise<Lesson> {
    const db = await database();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('lesson', 'readonly');
        const request = tx.objectStore('lesson').get('current');
        let value: unknown;
        request.onsuccess = () => { value = request.result; };
        tx.oncomplete = () => { try { resolve(value === undefined ? emptyLesson() : decodeLesson(value)); } catch (error) { reject(error); } };
        tx.onabort = () => reject(Error('Reading the lesson failed. Retry before making changes.'));
      });
    } finally { db.close(); }
  },
  async write(lesson: Lesson): Promise<void> {
    decodeLesson(lesson);
    const db = await database();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('lesson', 'readwrite');
        tx.objectStore('lesson').put(lesson, 'current');
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(Error('The lesson was not saved. Free storage or allow site storage, then retry.'));
      });
    } finally { db.close(); }
  },
};
