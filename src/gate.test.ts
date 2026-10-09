import { describe, it, expect } from 'vitest';
import { checks, emptyEvidence, summary, type GateResult } from './gate';

function result(checkId: string, overrides: Partial<GateResult> = {}): GateResult {
  return { id: checkId, checkId, lesson: '', question: '', language: '', output: 'answer', error: null, elapsedMs: 1, at: '', sessionId: 'session', engineId: 'engine', loadStartedAt: '', modelId: '', modelRevision: '', libraryRevision: '', runtimeVersion: '', userAgent: '', origin: 'https://example.test', secureContext: true, device: 'Honor X9c', gpu: '', onlineAtLoad: true, onlineAtGeneration: true, coldOfflineAttested: false, review: 'faithful', ...overrides };
}
describe('phone evidence gate', () => {
  it('does not substitute desktop, blank, failed or unreviewed output for phone evidence', () => {
    for (const overrides of [{ device: 'Desktop Chrome' }, { review: 'pending' as const }, { output: '' }, { error: 'GPU lost' }]) {
      expect(summary({ ...emptyEvidence(), results: checks.map(c => result(c.id, overrides)) }).bilingual).toBe(false);
    }
  });
  it('requires all supported and absent-answer checks in both languages', () => {
    const results = checks.map(c => result(c.id));
    expect(summary({ ...emptyEvidence(), results }).bilingual).toBe(true);
    expect(summary({ ...emptyEvidence(), results: results.slice(1) }).bilingual).toBe(false);
  });
  it('requires offline loading, offline generation and a cold-reopen attestation', () => {
    const valid = result(checks[0].id, { onlineAtLoad: false, onlineAtGeneration: false, coldOfflineAttested: true });
    expect(summary({ ...emptyEvidence(), results: [valid] }).offline).toBe(true);
    for (const overrides of [{ onlineAtLoad: true }, { onlineAtGeneration: true }, { coldOfflineAttested: false }]) {
      expect(summary({ ...emptyEvidence(), results: [{ ...valid, ...overrides }] }).offline).toBe(false);
    }
  });
});
