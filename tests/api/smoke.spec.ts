import {expect, test} from '@fixtures/api';
import type {ArticleResponse, ArticlesResponse} from '@models/article';
import type {TagsResponse} from '@models/tag';
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

    test('POST /articles', {tag: '@smoke'}, async ({articleApi, articleCleanup}) => {
        const payload = createArticlePayload();

        const response = await articleApi.createArticleResponse(payload);

        await expect(response).toHaveStatus(201);

        const body = await response.json() as ArticleResponse;
        articleCleanup.track(body.article.slug);

        expect.soft(body.article.title).toBe(payload.article.title);
        expect.soft(body.article.author.username).toBeTruthy();
    });

    test('PUT /articles', {tag: '@smoke'}, async ({trackedArticleApi}) => {
        const created = await test.step('Setup: create article', async () => {
            return trackedArticleApi.createArticle(createArticlePayload());
        });

        const updatePayload = createArticlePayload({
            title: uniqueTitle('Updated'),
            description: 'updated',
            body: 'updated',
            tagList: [],
        });

        const updated = await test.step('Update article', async () => {
            return trackedArticleApi.updateArticle(created.slug, updatePayload);
        });

        await test.step('Verify updated article', async () => {
            expect.soft(updated.title).toBe(updatePayload.article.title);
            expect.soft(updated.slug).not.toBe(created.slug);
            expect.soft(updated.description).toBe('updated');
            expect.soft(updated.body).toBe('updated');
        });
    });

    test('DELETE /articles', {tag: '@smoke'}, async ({articleApi}) => {
        const created = await test.step('Setup: create article', async () => {
            return articleApi.createArticle(createArticlePayload());
        });

        await test.step('Delete article', async () => {
            await articleApi.deleteArticle(created.slug);
        });

        await test.step('Verify article no longer exists', async () => {
            const getResponse = await articleApi.getArticleResponse(created.slug);
            await expect(getResponse).toHaveStatus(404);
        });
    });
});

test.describe('Unauthorized access', () => {

    test('POST /articles without auth token returns 401', {tag: ['@security', '@articles']}, async ({api}) => {
        const payload = createArticlePayload();

        const response = await api.post({
            path: '/articles',
            body: payload,
        });

        await expect(response).toHaveStatus(401);
    });

    test('DELETE /articles/:slug without auth token returns 401', {tag: ['@security', '@articles']}, async ({api, trackedArticleApi}) => {
        const article = await test.step('Setup: create article as authenticated user', async () => {
            return trackedArticleApi.createArticle(createArticlePayload());
        });

        const response = await test.step('Attempt delete without auth', async () => {
            return api.delete({path: `/articles/${article.slug}`});
        });

        await expect(response).toHaveStatus(401);
    });
});
