import {env} from '@helpers/envConfig';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

async function globalSetup(): Promise<void> {
    const healthUrl = `${env.BASE_URL}/tags`;

    try {
        const response = await fetch(healthUrl, {
            signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);

        throw new Error(
            `API health check failed: ${healthUrl} — ${reason}\n` +
            'Ensure the API is running and BASE_URL is correct.', { cause: error },
        );
    }
}

export default globalSetup;
