import {defineConfig} from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(__dirname, '.env'), quiet: true});

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
        baseURL: process.env.BASE_URL,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'api',
        },
    ],
});
