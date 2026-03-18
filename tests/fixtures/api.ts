import {test as base, expect as baseExpect, type APIResponse} from '@playwright/test';
import {RequestHandler} from '@helpers/request-handler';
import {ArticleApi} from '@helpers/articleApi';
import {ProfileApi} from '@helpers/profileApi';
import {ApiLogger, maskSensitiveText} from '@helpers/logger';
import {validateSchema} from '@helpers/schemaValidator';
import {env} from '@helpers/envConfig';
import type {User, UserResponse} from '@models/user';
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
                const masked = maskSensitiveText(text);
                const maxLength = 1000;
                responseBody = masked.length > maxLength
                    ? masked.substring(0, maxLength) + '...(truncated)'
                    : masked;
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

interface ArticleCleanup {
    track(slug: string): void;
}

interface TestFixtures {
    api: RequestHandler;
    authApi: RequestHandler;
    articleApi: ArticleApi;
    articleCleanup: ArticleCleanup;
    profileApi: ProfileApi;
}

interface WorkerFixtures {
    loginUser: User;
    authToken: string;
    testUsername: string;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
    loginUser: [async ({playwright}, use) => {
        const context = await playwright.request.newContext({baseURL: env.BASE_URL});
        const api = new RequestHandler(context, env.BASE_URL, ApiLogger.create(env.API_LOG));

        const response = await api.post({
            path: '/users/login',
            body: {user: {email: testUser.email, password: testUser.password}},
        });

        if (!response.ok()) {
            const text = maskSensitiveText(await response.text());
            throw new Error(
                `Login failed (status ${response.status()}): ${text}\n` +
                `Check TEST_USER_EMAIL / TEST_USER_PASSWORD environment variables.`,
            );
        }

        const body = await response.json() as UserResponse;
        await context.dispose();
        await use(body.user);
    }, {scope: 'worker'}],

    authToken: [async ({loginUser}, use) => {
        await use(loginUser.token);
    }, {scope: 'worker'}],

    testUsername: [async ({loginUser}, use) => {
        await use(loginUser.username);
    }, {scope: 'worker'}],

    api: async ({request}, use) => {
        const requestHandler = new RequestHandler(request, env.BASE_URL, ApiLogger.create(env.API_LOG));
        await use(requestHandler);
    },

    authApi: async ({api, authToken}, use) => {
        await use(api.withHeaders({Authorization: `Token ${authToken}`}));
    },

    articleApi: async ({authApi}, use) => {
        await use(new ArticleApi(authApi));
    },

    profileApi: async ({authApi}, use) => {
        await use(new ProfileApi(authApi));
    },

    articleCleanup: async ({articleApi}, use) => {
        const slugs: string[] = [];

        await use({
            track(slug: string) {
                slugs.push(slug);
            }
        });

        // Teardown: parallel cleanup, Playwright guarantees this runs even if the test fails
        const results = await Promise.allSettled(
            slugs.map(slug => articleApi.deleteArticleResponse(slug)),
        );

        for (let i = 0; i < results.length; i++) {
            const result = results[i]!;
            if (result.status === 'rejected') {
                console.warn(`Failed to delete article "${slugs[i]!}":`, result.reason);
            }
        }
    },
});

