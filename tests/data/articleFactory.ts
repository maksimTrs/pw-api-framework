import {faker} from '@faker-js/faker';
import {uniqueTitle} from '@helpers/utils';

interface ArticleFields {
    title: string;
    description: string;
    body: string;
    tagList: string[];
}

export interface ArticlePayload {
    article: ArticleFields;
}

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
