import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests-expo', testMatch: ['source.spec.ts', 'mock-mvp.spec.ts'], use: { baseURL: 'http://localhost:4173', channel: 'chrome' }, webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: false } });
