import { expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: storage }));
import { decodeEvidence, emptyEvidence, evidenceStore, liveReviewed, serializeEvidence, type Evidence } from './evidence';
import { mockService } from './model-service';
import { checks } from './checks';

it('round-trips simulated evidence without granting live acceptance', async () => {
  const response = await mockService.answer(checks[0].request);
  const data: Evidence = { version: 2, results: [{ id: 'result-1', checkId: checks[0].id, at: new Date().toISOString(), elapsedMs: 250,
    mode: 'mock', environment: 'test', response, error: null, review: 'faithful' }] };
  expect(decodeEvidence(JSON.stringify(data))).toEqual(data);
  expect(liveReviewed(data)).toBe(0);
  expect(JSON.parse(serializeEvidence(data))).toMatchObject({ localInference: 'unverified', samples: checks });
  expect(() => decodeEvidence('{"version":1}')).toThrow();
  expect(() => decodeEvidence(JSON.stringify({ ...data, results: [{ ...data.results[0], response: { ...response, sourceRevision: 'old' } }] }))).toThrow();
});
it('propagates failed writes and corrupt reads instead of claiming saved', async () => {
  storage.setItem.mockRejectedValueOnce(new Error('Storage full'));
  await expect(evidenceStore.write(emptyEvidence())).rejects.toThrow('Storage full');
  storage.getItem.mockResolvedValueOnce('broken');
  await expect(evidenceStore.read()).rejects.toThrow();
});
