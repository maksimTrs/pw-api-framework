import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(__dirname, '../../.env'), quiet: true});

interface EnvConfig {
    readonly BASE_URL: string;
    readonly TEST_USER_EMAIL: string;
    readonly TEST_USER_PASSWORD: string;
    readonly API_LOG: string;
}

function loadEnvConfig(): EnvConfig {
    const BASE_URL = process.env.BASE_URL ?? '';
    const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? '';
    const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? '';
    const API_LOG = process.env.API_LOG ?? '';

    const missing: string[] = [];
    if (!BASE_URL) missing.push('BASE_URL');
    if (!TEST_USER_EMAIL) missing.push('TEST_USER_EMAIL');
    if (!TEST_USER_PASSWORD) missing.push('TEST_USER_PASSWORD');

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}.\n` +
            'Copy .env.example to .env and fill in the values.',
        );
    }

    return {BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, API_LOG};
}

export const env = loadEnvConfig();
