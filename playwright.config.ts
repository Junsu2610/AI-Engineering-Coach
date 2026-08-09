import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx serve . -p 3999 --no-clipboard',
    port: 3999,
    reuseExistingServer: !process.env.CI,
  },
});
