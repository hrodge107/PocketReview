import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const revision = '87416418657359cb625c412a48b6e1d6d41c29bd';
const languages = {
  eng: '7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2',
  fil: '2b17f68014ab44b88b5e2334ebcd0ce0090d9af7c6fbef6fab22e0bbd9a934dd',
};
await mkdir('public/ocr/core', { recursive: true });
await mkdir('public/ocr/lang', { recursive: true });
await copyFile('node_modules/tesseract.js/dist/worker.min.js', 'public/ocr/worker.min.js');
await copyFile('node_modules/tesseract.js/dist/tesseract.min.js', 'public/ocr/api.min.js');
await copyFile('mobile/ocr-controller.js', 'public/ocr/controller.js');
for (const file of await readdir('node_modules/tesseract.js-core')) {
  if (file.endsWith('.wasm') || file.endsWith('.wasm.js')) await copyFile(`node_modules/tesseract.js-core/${file}`, `public/ocr/core/${file}`);
}
for (const [language, sha256] of Object.entries(languages)) {
  const path = `public/ocr/lang/${language}.traineddata`;
  let bytes;
  try { bytes = await readFile(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!bytes || createHash('sha256').update(bytes).digest('hex') !== sha256) {
    const response = await fetch(`https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/${revision}/${language}.traineddata`, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw Error(`OCR language setup failed (${response.status}); rerun npm run ocr:prepare.`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (createHash('sha256').update(bytes).digest('hex') !== sha256) throw Error(`OCR language checksum mismatch: ${language}`);
    await writeFile(path, bytes);
  }
}
await writeFile('public/ocr/manifest.json', JSON.stringify({ revision, languages, tesseract: '7.0.0' }, null, 2));
console.log('Local OCR assets prepared and language checksums verified.');
