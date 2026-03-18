import {APIRequestContext, APIResponse} from '@playwright/test';
import {ApiLogger} from '@helpers/logger';

export interface RequestOptions {
    path: string;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: object;
    baseUrl?: string;
}

export class RequestHandler {
    constructor(
        private readonly request: APIRequestContext,
        private readonly defaultBaseUrl: string,
        private readonly logger?: ApiLogger
    ) {}

    async get(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        return this.execute('GET', url, options.headers ?? {}, () =>
            this.request.get(url, {headers: options.headers})
        );
    }

    async post(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        return this.execute('POST', url, options.headers ?? {}, () =>
            this.request.post(url, {headers: options.headers, data: options.body}),
            options.body
        );
    }

    async put(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        return this.execute('PUT', url, options.headers ?? {}, () =>
            this.request.put(url, {headers: options.headers, data: options.body}),
            options.body
        );
    }

    async delete(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        return this.execute('DELETE', url, options.headers ?? {}, () =>
            this.request.delete(url, {headers: options.headers})
        );
    }

    private buildUrl(options: RequestOptions): string {
        const base = options.baseUrl ?? this.defaultBaseUrl;
        const url = new URL(`${base}${options.path}`);

        if (options.params) {
            for (const [key, value] of Object.entries(options.params)) {
                url.searchParams.append(key, String(value));
            }
        }

        return url.toString();
    }

    private async execute(
        method: string,
        url: string,
        headers: Record<string, string>,
        action: () => Promise<APIResponse>,
        body?: object
    ): Promise<APIResponse> {
        this.logger?.logRequest(method, url, headers, body);

        const start = Date.now();
        const response = await action();

        await this.logger?.logResponse(response, Date.now() - start);

        return response;
    }
}
