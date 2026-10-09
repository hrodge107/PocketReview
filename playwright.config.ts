import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4173', channel: 'chrome' },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://localhost:4173', reuseExistingServer: true },
});
