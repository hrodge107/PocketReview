import 'fake-indexeddb/auto';
import { describe, it, expect, vi } from 'vitest';
import { readEvidence, writeEvidence } from './evidence';
import { emptyEvidence } from './gate';

describe('durable gate evidence', () => {
  it('restores saved failures in a new database connection', async () => {
    const data = { ...emptyEvidence(), failures: [{ at: '2026-10-09', stage: 'load', message: 'GPU unavailable', userAgent: 'browser' }] };
    await writeEvidence(data);
    expect(await readEvidence()).toEqual(data);
  });
  it('rejects unavailable storage instead of reporting a successful save', async () => {
    const spy = vi.spyOn(indexedDB, 'open').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    await expect(writeEvidence(emptyEvidence())).rejects.toThrow('Quota exceeded');
    spy.mockRestore();
  });
});
