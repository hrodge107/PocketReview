import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ExecutionMode } from '../shared/model';
interface Settings { mode: ExecutionMode; setMode: (mode: ExecutionMode) => void; endpoint: string; setEndpoint: (endpoint: string) => void; access: string; setAccess: (access: string) => void }
const ServiceSettings = createContext<Settings | null>(null);
export function ServiceSettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExecutionMode>('mock');
  const [endpoint, setEndpoint] = useState(process.env.EXPO_PUBLIC_WORKER_URL || ''), [access, setAccess] = useState('');
  return <ServiceSettings.Provider value={{ mode, setMode, endpoint, setEndpoint, access, setAccess }}>{children}</ServiceSettings.Provider>;
}
export function useServiceSettings(): Settings { const settings = useContext(ServiceSettings); if (!settings) throw Error('Answer service settings are unavailable.'); return settings; }
