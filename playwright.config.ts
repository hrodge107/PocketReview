import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests-expo', use: { baseURL: 'http://localhost:4173', channel: 'chrome' }, webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: false } });
