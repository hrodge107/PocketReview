import type { ModelRequest } from '../shared/model';

const english = 'A closed circuit lets electric current flow. Opening a switch breaks the circuit and stops the current.';
const filipino = 'Dumadaloy ang kuryente sa saradong sirkito. Kapag binuksan ang switch, napuputol ang sirkito at humihinto ang daloy ng kuryente.';
export const checks: { id: string; label: string; expected: string; request: ModelRequest }[] = [
  { id: 'en-supported', label: 'English / supported', expected: 'The circuit breaks and current stops.', request: { version: 1, sourceRevision: 'setup-en-1', language: 'English', pages: [{ id: 'page-1', text: english }], question: 'What happens when the switch is opened?' } },
  { id: 'en-absent', label: 'English / absent', expected: 'State that the voltage is not in this lesson.', request: { version: 1, sourceRevision: 'setup-en-1', language: 'English', pages: [{ id: 'page-1', text: english }], question: 'What is the battery voltage?' } },
  { id: 'fil-supported', label: 'Filipino / supported', expected: 'Napupuputol ang sirkito at humihinto ang daloy ng kuryente.', request: { version: 1, sourceRevision: 'setup-fil-1', language: 'Filipino', pages: [{ id: 'page-1', text: filipino }], question: 'Ano ang nangyayari kapag binuksan ang switch?' } },
  { id: 'fil-absent', label: 'Filipino / absent', expected: 'State in Filipino that the voltage is not in this lesson.', request: { version: 1, sourceRevision: 'setup-fil-1', language: 'Filipino', pages: [{ id: 'page-1', text: filipino }], question: 'Ilang boltahe ang baterya?' } },
];
