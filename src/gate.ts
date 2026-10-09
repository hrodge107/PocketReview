export const MODEL_ID = 'Qwen3-0.6B-q4f16_1-MLC';
export const MODEL_REVISION = '8c14ce481d4c692769976ad52afea453a102df19';
export const LIB_REVISION = '025bcaf3780fa8254f5e5efd3bfea0a5397248f4';
export const MODEL_URL = `https://huggingface.co/mlc-ai/${MODEL_ID}/resolve/${MODEL_REVISION}/`;
export const LIB_URL = `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/${LIB_REVISION}/web-llm-models/v0_2_84/base/Qwen3-0.6B-q4f16_1_cs1k-webgpu.wasm`;
export const RUNTIME_VERSION = '0.2.85';

export const checks = [
  { id: 'en-supported', language: 'English', lesson: 'A closed circuit lets electric current flow. Opening a switch breaks the circuit and stops the current.', question: 'What happens when the switch is opened?', expected: 'The circuit breaks and current stops.' },
  { id: 'en-absent', language: 'English', lesson: 'A closed circuit lets electric current flow. Opening a switch breaks the circuit and stops the current.', question: 'What is the battery voltage?', expected: 'The lesson does not state the voltage. Do not invent a value.' },
  { id: 'fil-supported', language: 'Filipino', lesson: 'Dumadaloy ang kuryente sa saradong sirkito. Kapag binuksan ang switch, napuputol ang sirkito at humihinto ang daloy ng kuryente.', question: 'Ano ang nangyayari kapag binuksan ang switch?', expected: 'Napupuputol ang sirkito at humihinto ang daloy ng kuryente.' },
  { id: 'fil-absent', language: 'Filipino', lesson: 'Dumadaloy ang kuryente sa saradong sirkito. Kapag binuksan ang switch, napuputol ang sirkito at humihinto ang daloy ng kuryente.', question: 'Ilang boltahe ang baterya?', expected: 'Walang nakasaad na boltahe sa aralin. Huwag magbigay ng inimbentong halaga.' },
] as const;

export type Review = 'pending' | 'faithful' | 'incorrect';
export interface GateResult {
  id: string;
  checkId: string;
  lesson: string;
  question: string;
  language: string;
  output: string;
  error: string | null;
  elapsedMs: number;
  at: string;
  sessionId: string;
  engineId: string;
  loadStartedAt: string;
  modelId: string;
  modelRevision: string;
  libraryRevision: string;
  runtimeVersion: string;
  userAgent: string;
  origin: string;
  secureContext: boolean;
  device: string;
  gpu: string;
  onlineAtLoad: boolean;
  onlineAtGeneration: boolean;
  coldOfflineAttested: boolean;
  review: Review;
}

export interface GateEvidence {
  version: 1;
  results: GateResult[];
  failures: { at: string; stage: string; message: string; userAgent: string }[];
}
export const emptyEvidence = (): GateEvidence => ({ version: 1, results: [], failures: [] });
export function usable(result: GateResult) {
  return !result.error && result.output.trim().length > 0 && result.review === 'faithful';
}
export function summary(evidence: GateEvidence) {
  const phone = (r: GateResult) => /honor\s*x9c/i.test(r.device) && usable(r);
  const bilingual = checks.every(check => evidence.results.some(r => phone(r) && r.checkId === check.id));
  const offline = evidence.results.some(r => phone(r) && r.coldOfflineAttested && !r.onlineAtLoad && !r.onlineAtGeneration);
  return { bilingual, offline };
}
export function promptFor(check: typeof checks[number]) {
  return `Answer in ${check.language}, in at most two short sentences. Use only the lesson below. If the answer is absent, say it is not in this lesson. Do not guess.\n<lesson>\n${check.lesson}\n</lesson>\nQuestion: ${check.question}`;
}
