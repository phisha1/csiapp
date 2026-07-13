import { defineConfig, devices } from '@playwright/test';

const inheritedEnv: Record<string, string> = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: '.gstack/qa-reports/playwright-report', open: 'never' }],
  ],
  outputDir: '.gstack/qa-reports/playwright-artifacts',
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev --prefix server',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: inheritedEnv,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://localhost:5175',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...inheritedEnv,
        PLAYWRIGHT_TEST: '1',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/business-flow.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: '**/business-flow.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: '**/business-flow.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      testIgnore: '**/business-flow.spec.ts',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-webkit',
      testIgnore: '**/business-flow.spec.ts',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'business-setup',
      testMatch: '**/business.setup.ts',
      teardown: 'business-teardown',
    },
    {
      name: 'business-teardown',
      testMatch: '**/business.teardown.ts',
    },
    {
      name: 'business-chromium',
      testMatch: '**/business-flow.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['business-setup'],
    },
  ],
});
