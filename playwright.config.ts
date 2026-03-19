import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ['html', {open: 'never'}],
        ['list'],
        ...(process.env.CI
            ? [['github'] as const, ['junit', {outputFile: 'test-results/junit-report.xml'}] as const]
            : []),
    ],
    use: {
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'api',
            testDir: './tests/api',
            timeout: 10_000,
            use: {
                trace: 'off',
            },
        },
    ],
});
