import type {APIRequestContext, APIResponse} from '@playwright/test';
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
        private readonly logger?: ApiLogger,
        private readonly defaultHeaders: Record<string, string> = {},
    ) {}

    withHeaders(headers: Record<string, string>): RequestHandler {
        return new RequestHandler(
            this.request,
            this.defaultBaseUrl,
            this.logger,
            {...this.defaultHeaders, ...headers},
        );
    }

    async get(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        const headers = {...this.defaultHeaders, ...options.headers};
        return this.execute('GET', url, headers, () =>
            this.request.get(url, {headers})
        );
    }

    async post(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        const headers = {...this.defaultHeaders, ...options.headers};
        return this.execute('POST', url, headers, () =>
            this.request.post(url, {headers, data: options.body}),
            options.body
        );
    }

    async put(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        const headers = {...this.defaultHeaders, ...options.headers};
        return this.execute('PUT', url, headers, () =>
            this.request.put(url, {headers, data: options.body}),
            options.body
        );
    }

    async delete(options: RequestOptions): Promise<APIResponse> {
        const url = this.buildUrl(options);
        const headers = {...this.defaultHeaders, ...options.headers};
        return this.execute('DELETE', url, headers, () =>
            this.request.delete(url, {headers})
        );
    }

    private buildUrl(options: RequestOptions): string {
        const base = (options.baseUrl ?? this.defaultBaseUrl).replace(/\/+$/, '');
        const path = options.path.startsWith('/') ? options.path : `/${options.path}`;
        const url = new URL(`${base}${path}`);

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
