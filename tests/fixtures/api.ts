import {test as base, expect as baseExpect} from '@playwright/test';
import type {APIResponse} from '@playwright/test';
import {RequestHandler, RequestOptions} from '@helpers/request-handler';
import {ApiLogger} from '@helpers/logger';
import {validateSchema} from '@helpers/schemaValidator';
import type {UserResponse} from '@models/user';
import {testUser} from '@data/testUser';

export const expect = baseExpect.extend({
    async toHaveStatus(response: APIResponse, expected: number) {
        const assertionName = 'toHaveStatus';
        const actual = response.status();
        const pass = actual === expected;

        let responseBody = '';
        if (!pass) {
            try {
                const text = await response.text();
                const maxLength = 1000;
                responseBody = text.length > maxLength
                    ? text.substring(0, maxLength) + '...(truncated)'
                    : text;
            } catch {
                responseBody = '<unable to read body>';
            }
        }

        const message = pass
            ? () =>
                  this.utils.matcherHint(assertionName, undefined, undefined, {isNot: this.isNot}) +
                  '\n\n' +
                  `URL: ${response.url()}\n` +
                  `Expected: not ${this.utils.printExpected(expected)}\n` +
                  `Received: ${this.utils.printReceived(actual)}`
            : () =>
                  this.utils.matcherHint(assertionName, undefined, undefined, {isNot: this.isNot}) +
                  '\n\n' +
                  `URL: ${response.url()}\n` +
                  `Expected status: ${this.utils.printExpected(expected)}\n` +
                  `Received status: ${this.utils.printReceived(actual)}\n` +
                  `Response body: ${responseBody}`;

        return {
            message,
            pass,
            name: assertionName,
            expected,
            actual,
        };
    },

    toMatchSchema(received: unknown, schema: object) {
        const assertionName = 'toMatchSchema';
        const result = validateSchema(received, schema);

        const message = result.valid
            ? () =>
                  this.utils.matcherHint(assertionName, undefined, undefined, {isNot: this.isNot}) +
                  '\n\n' +
                  'Expected: response should NOT match the schema\n' +
                  'Received: response matches the schema'
            : () =>
                  this.utils.matcherHint(assertionName, undefined, undefined, {isNot: this.isNot}) +
                  '\n\n' +
                  'Schema validation errors:\n' +
                  result.errors.map(e => `  - ${e}`).join('\n');

        return {
            message,
            pass: result.valid,
            name: assertionName,
        };
    },
});

interface AuthorizedApi {
    get(options: RequestOptions): Promise<APIResponse>;
    post(options: RequestOptions): Promise<APIResponse>;
    put(options: RequestOptions): Promise<APIResponse>;
    delete(options: RequestOptions): Promise<APIResponse>;
}

interface ArticleCleanup {
    track(slug: string): void;
}

interface TestFixtures {
    api: RequestHandler;
    authApi: AuthorizedApi;
    articleCleanup: ArticleCleanup;
}

interface WorkerFixtures {
    authToken: string;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
    authToken: [async ({playwright}, use) => {
        if (!process.env.BASE_URL) {
            throw new Error('>>> BASE_URL environment variable is not set <<<');
        }
        const baseURL = process.env.BASE_URL;
        const context = await playwright.request.newContext({baseURL});
        const api = new RequestHandler(context, baseURL, ApiLogger.create());

        const response = await api.post({
            path: '/users/login',
            body: {user: {email: testUser.email, password: testUser.password}},
        });

        if (!response.ok()) {
            const text = await response.text();
            throw new Error(
                `Login failed (status ${response.status()}): ${text}\n` +
                `Check TEST_USER_EMAIL / TEST_USER_PASSWORD environment variables.`,
            );
        }

        const body = await response.json() as UserResponse;
        await context.dispose();
        await use(body.user.token);
    }, {scope: 'worker'}],

    api: async ({request, baseURL}, use) => {
        const requestHandler = new RequestHandler(request, baseURL!, ApiLogger.create());
        await use(requestHandler);
    },

    authApi: async ({api, authToken}, use) => {
        const authHeaders = {Authorization: `Token ${authToken}`};

        await use({
            get: (options) =>
                api.get({...options, headers: {...options.headers, ...authHeaders}}),
            post: (options) =>
                api.post({...options, headers: {...options.headers, ...authHeaders}}),
            put: (options) =>
                api.put({...options, headers: {...options.headers, ...authHeaders}}),
            delete: (options) =>
                api.delete({...options, headers: {...options.headers, ...authHeaders}}),
        });
    },

    articleCleanup: async ({authApi}, use) => {
        const slugs: string[] = [];

        await use({
            track(slug: string) {
                slugs.push(slug);
            }
        });

        // Teardown: Playwright guarantees this code runs even if the test fails
        for (const slug of slugs) {
            try {
                await authApi.delete({
                    path: `/articles/${slug}`,
                });
            } catch (error) {
                console.warn(`Failed to delete article "${slug}":`, error);
            }
        }
    },
});

