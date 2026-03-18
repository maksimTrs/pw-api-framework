import {expect, test} from '@fixtures/api';
import {ArticlesResponse, ArticleResponse} from '@models/article';
import {TagsResponse} from '@models/tag';
import {createArticlePayload} from '@data/articleFactory';
import {uniqueTitle} from '@helpers/utils';

test.describe('Smoke tests', () => {

    test('GET /articles', {tag: ['@smoke', '@articles']}, async ({api}) => {
        const response = await api.get({
            path: '/articles',
            params: {limit: 10, offset: 0},
        });

        await expect(response).toHaveStatus(200);

        const body = await response.json() as ArticlesResponse;

        expect.soft(body.articles.length).toBeLessThanOrEqual(10);
        expect.soft(body.articlesCount).toBeGreaterThanOrEqual(0);
        for (const article of body.articles) {
            expect.soft(article.slug).toBeTruthy();
        }
    });

    test('GET /tags', {tag: '@smoke'}, async ({api}) => {
        const response = await api.get({
            path: '/tags',
        });

        await expect(response).toHaveStatus(200);

        const body = await response.json() as TagsResponse;

        expect.soft(body.tags.length).toBeGreaterThan(0);
    });

    test('POST /articles', {tag: '@smoke'}, async ({authApi, articleCleanup}) => {
        const payload = createArticlePayload();

        const response = await authApi.post({
            path: '/articles/',
            body: payload,
        });

        await expect(response).toHaveStatus(201);

        const body = await response.json() as ArticleResponse;
        articleCleanup.track(body.article.slug);

        expect.soft(body.article.title).toBe(payload.article.title);
        expect.soft(body.article.author.username).toBeTruthy();
    });

    test('PUT /articles', {tag: '@smoke'}, async ({authApi, articleCleanup}) => {
        // Setup: create article to update
        const createPayload = createArticlePayload();

        const createResponse = await authApi.post({
            path: '/articles/',
            body: createPayload,
        });

        await expect(createResponse).toHaveStatus(201);

        const created = await createResponse.json() as ArticleResponse;
        const slug = created.article.slug;

        // Update article
        const updatePayload = createArticlePayload({
            title: uniqueTitle('Updated'),
            description: 'updated',
            body: 'updated',
            tagList: [],
        });

        const response = await authApi.put({
            path: `/articles/${slug}`,
            body: updatePayload,
        });

        await expect(response).toHaveStatus(200);

        const body = await response.json() as ArticleResponse;
        articleCleanup.track(body.article.slug);

        expect.soft(body.article.title).toBe(updatePayload.article.title);
        expect.soft(body.article.slug).not.toBe(slug);
        expect.soft(body.article.description).toBe('updated');
        expect.soft(body.article.body).toBe('updated');
    });

    test('DELETE /articles', {tag: '@smoke'}, async ({authApi}) => {
        // Setup: create article to delete
        const createPayload = createArticlePayload();

        const createResponse = await authApi.post({
            path: '/articles/',
            body: createPayload,
        });

        await expect(createResponse).toHaveStatus(201);

        const created = await createResponse.json() as ArticleResponse;
        const slug = created.article.slug;

        // Delete article
        const deleteResponse = await authApi.delete({
            path: `/articles/${slug}`,
        });

        await expect(deleteResponse).toHaveStatus(204);

        // Verify article no longer exists
        const getResponse = await authApi.get({
            path: `/articles/${slug}`,
        });

        await expect(getResponse).toHaveStatus(404);
    });
});
