import type {APIResponse} from '@playwright/test';
import {RequestHandler} from '@helpers/request-handler';
import type {Article, ArticlePayload, ArticleResponse, ArticlesResponse} from '@models/article';

interface GetArticlesParams {
    limit?: number;
    offset?: number;
    tag?: string;
    author?: string;
    favorited?: string;
}

export class ArticleApi {
    constructor(private readonly api: RequestHandler) {}

    /** GET /articles — returns typed response, asserts 200 */
    async getArticles(params?: GetArticlesParams): Promise<ArticlesResponse> {
        const response = await this.getArticlesResponse(params);
        if (response.status() !== 200) {
            throw new Error(`GET /articles expected 200, got ${response.status()}: ${await response.text()}`);
        }
        return await response.json() as ArticlesResponse;
    }

    /** GET /articles — raw response, no assertions */
    async getArticlesResponse(params?: GetArticlesParams): Promise<APIResponse> {
        const filtered = params
            ? Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v !== undefined),
              ) as Record<string, string | number | boolean>
            : undefined;
        return this.api.get({path: '/articles', params: filtered});
    }

    /** POST /articles — returns created Article, asserts 201 */
    async createArticle(payload: ArticlePayload): Promise<Article> {
        const response = await this.createArticleResponse(payload);
        if (response.status() !== 201) {
            throw new Error(`POST /articles expected 201, got ${response.status()}: ${await response.text()}`);
        }
        const body = await response.json() as ArticleResponse;
        return body.article;
    }

    /** POST /articles — raw response, no assertions */
    async createArticleResponse(payload: ArticlePayload): Promise<APIResponse> {
        return this.api.post({path: '/articles', body: payload});
    }

    /** PUT /articles/:slug — returns updated Article, asserts 200 */
    async updateArticle(slug: string, payload: ArticlePayload): Promise<Article> {
        const response = await this.updateArticleResponse(slug, payload);
        if (response.status() !== 200) {
            throw new Error(`PUT /articles/${slug} expected 200, got ${response.status()}: ${await response.text()}`);
        }
        const body = await response.json() as ArticleResponse;
        return body.article;
    }

    /** PUT /articles/:slug — raw response, no assertions */
    async updateArticleResponse(slug: string, payload: ArticlePayload): Promise<APIResponse> {
        return this.api.put({path: `/articles/${slug}`, body: payload});
    }

    /** DELETE /articles/:slug — raw response (204 has no body) */
    async deleteArticleResponse(slug: string): Promise<APIResponse> {
        return this.api.delete({path: `/articles/${slug}`});
    }

    /** GET /articles/:slug — raw response */
    async getArticleResponse(slug: string): Promise<APIResponse> {
        return this.api.get({path: `/articles/${slug}`});
    }
}
