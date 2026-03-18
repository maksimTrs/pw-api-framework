import {expect, test} from '@fixtures/api';
import {articlesResponseSchema, articleResponseSchema} from '@schemas/articleSchemas';
import {createArticlePayload} from '@data/articleFactory';
import type {ArticleResponse} from '@models/article';

test.describe('Articles API — Schema Validation', () => {

    test('GET /articles response matches schema', {tag: ['@schema', '@articles']}, async ({api}) => {
        const response = await api.get({
            path: '/articles',
            params: {limit: 10, offset: 0},
        });

        await expect(response).toHaveStatus(200);

        const body: unknown = await response.json();
        expect(body).toMatchSchema(articlesResponseSchema);
    });

    test('POST /articles response matches schema', {tag: ['@schema', '@articles']}, async ({authApi, articleCleanup}) => {
        const payload = createArticlePayload();

        const response = await authApi.post({
            path: '/articles/',
            body: payload,
        });

        await expect(response).toHaveStatus(201);

        const body: unknown = await response.json();
        expect(body).toMatchSchema(articleResponseSchema);

        const {article} = body as ArticleResponse;
        articleCleanup.track(article.slug);
    });
});
