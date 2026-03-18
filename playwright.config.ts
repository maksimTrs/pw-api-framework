import {defineConfig} from '@playwright/test';
import {env} from '@helpers/envConfig';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', {open: 'never'}],
        ['list'],
        ...(process.env.CI
            ? [['github'] as const, ['junit', {outputFile: 'test-results/junit-report.xml'}] as const]
            : []),
    ],
    use: {
        baseURL: env.BASE_URL,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'api',
            testDir: './tests/api',
            use: {
                trace: 'off',
            },
        },
    ],
});
