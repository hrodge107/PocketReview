import AsyncStorage from '@react-native-async-storage/async-storage';
import { object, validateResponse, type ExecutionMode, type ModelResponse } from '../shared/model';
import { checks } from './checks';
export type Review = 'pending' | 'faithful' | 'incorrect';
export interface Result {
  id: string; checkId: string; at: string; elapsedMs: number; environment: string;
  mode: ExecutionMode; response: ModelResponse | null; error: string | null; review: Review;
}
export interface Evidence { version: 2; results: Result[] }
export const emptyEvidence = (): Evidence => ({ version: 2, results: [] });
export const KEY = 'pocketreview-setup-evidence-v2';
export function serializeEvidence(data: Evidence): string {
  return JSON.stringify({ ...data, appVersion: '0.2.0', localInference: 'unverified', samples: checks }, null, 2);
}
export function decodeEvidence(text: string): Evidence {
  const data: unknown = JSON.parse(text);
  if (!object(data) || data.version !== 2 || !Array.isArray(data.results) || data.results.length > 120) throw new Error('Saved setup evidence has an unsupported format. Export existing data before resetting storage.');
  const results = data.results.map((value: unknown): Result => {
    if (!object(value) || typeof value.id !== 'string' || typeof value.checkId !== 'string' || typeof value.at !== 'string' ||
      typeof value.elapsedMs !== 'number' || !Number.isFinite(value.elapsedMs) || value.elapsedMs < 0 ||
      typeof value.environment !== 'string' || !['mock','cloud'].includes(String(value.mode)) ||
      !['pending','faithful','incorrect'].includes(String(value.review)) ||
      !(value.error === null || typeof value.error === 'string')) throw new Error('Saved setup evidence is invalid. Retry reading it before running checks.');
    const check = checks.find(entry => entry.id === value.checkId);
    if (!check || (value.response === null && value.error === null)) throw new Error('Saved evidence does not identify a setup result.');
    return { id: value.id, checkId: value.checkId, at: value.at, elapsedMs: value.elapsedMs, environment: value.environment,
      mode: value.mode as ExecutionMode, review: value.review as Review, error: value.error,
      response: value.response === null ? null : validateResponse(value.response, check.request, value.mode as ExecutionMode) };
  });
  return { version: 2, results };
}
export interface EvidenceStore { read(): Promise<Evidence>; write(data: Evidence): Promise<void> }
export const evidenceStore: EvidenceStore = {
  async read() { const text = await AsyncStorage.getItem(KEY); return text ? decodeEvidence(text) : emptyEvidence(); },
  async write(data) { if (data.results.length > 120) throw new Error('Setup evidence is full. Export it before making room for new checks.'); await AsyncStorage.setItem(KEY, JSON.stringify(data)); },
};
export function liveReviewed(data: Evidence): number {
  return checks.filter(check => data.results.some(result => result.checkId === check.id && result.mode === 'cloud' && result.response && !result.error && result.review === 'faithful')).length;
}
