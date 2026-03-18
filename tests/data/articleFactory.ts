import {faker} from '@faker-js/faker';
import {uniqueTitle} from '@helpers/utils';
import type {ArticleFields, ArticlePayload} from '@models/article';

export function createArticlePayload(overrides?: Partial<ArticleFields>): ArticlePayload {
    return {
        article: {
            title: uniqueTitle(),
            description: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            tagList: ['Test'],
            ...overrides,
        },
    };
}
