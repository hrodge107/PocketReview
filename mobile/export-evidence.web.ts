import { serializeEvidence, type Evidence } from './evidence';
export async function exportEvidence(data: Evidence): Promise<void> {
  const url = URL.createObjectURL(new Blob([serializeEvidence(data)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'pocketreview-setup-evidence.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
