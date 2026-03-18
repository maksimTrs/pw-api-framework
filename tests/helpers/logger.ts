import type {APIResponse} from '@playwright/test';

const SENSITIVE_FIELDS = new Set(['password', 'token', 'authorization']);

/** Recursively replaces values of sensitive keys with [REDACTED] */
export function maskSensitive(data: unknown): unknown {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => maskSensitive(item));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
            result[key] = '[REDACTED]';
            continue;
        }
        result[key] = maskSensitive(value);
    }
    return result;
}

/** Masks sensitive fields in a JSON string (parsed → masked → serialized) */
export function maskSensitiveText(text: string): string {
    try {
        const parsed: unknown = JSON.parse(text);
        return JSON.stringify(maskSensitive(parsed));
    } catch {
        return text;
    }
}

export class ApiLogger {
    private static readonly SEPARATOR = '─'.repeat(70);

    static create(logLevel: string): ApiLogger | undefined {
        return logLevel === 'verbose' ? new ApiLogger() : undefined;
    }

    logRequest(method: string, url: string, headers: Record<string, string>, body?: object): void {
        const lines: string[] = [
            '',
            ApiLogger.SEPARATOR,
            `→ ${method} ${url}`,
        ];

        const visibleHeaders = Object.entries(headers)
            .filter(([key]) => !SENSITIVE_FIELDS.has(key.toLowerCase()));

        if (visibleHeaders.length > 0) {
            lines.push('  Headers:');
            for (const [key, value] of visibleHeaders) {
                lines.push(`    ${key}: ${value}`);
            }
        }

        if (body && Object.keys(body).length > 0) {
            lines.push('  Body:');
            lines.push(this.indentJson(maskSensitive(body)));
        }

        console.log(lines.join('\n'));
    }

    async logResponse(response: APIResponse, duration: number): Promise<void> {
        const lines: string[] = [
            `← ${response.status()} (${duration}ms)`,
        ];

        const body = await this.parseBody(response);
        if (body !== null) {
            lines.push('  Body:');
            lines.push(this.indentJson(maskSensitive(body)));
        }

        lines.push(ApiLogger.SEPARATOR);

        console.log(lines.join('\n'));
    }

    private async parseBody(response: APIResponse): Promise<unknown> {
        try {
            return await response.json();
        } catch {
            const text = await response.text();
            return text || null;
        }
    }

    private indentJson(data: unknown): string {
        return JSON.stringify(data, null, 2)
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n');
    }
}
