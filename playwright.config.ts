import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://localhost:4173/iris-web/', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://localhost:4173/iris-web/', reuseExistingServer: !process.env.CI },
});
