// JSON Schema definitions for Article API responses.
// Validated at runtime by AJV — matches interfaces in @models/article.
// JSONSchemaType<T> is intentionally NOT used: it has a known limitation
// with nullable fields (string | null) — see https://github.com/ajv-validator/ajv/issues/2132

import {profileSchema} from '@schemas/profileSchemas';

export const articleSchema = {
    type: 'object',
    properties: {
        slug: {type: 'string'},
        title: {type: 'string'},
        description: {type: 'string'},
        body: {type: 'string'},
        tagList: {
            type: 'array',
            items: {type: 'string'},
        },
        createdAt: {type: 'string', format: 'date-time'},
        updatedAt: {type: 'string', format: 'date-time'},
        favorited: {type: 'boolean'},
        favoritesCount: {type: 'integer', minimum: 0},
        author: profileSchema,
    },
    required: [
        'slug', 'title', 'description', 'body', 'tagList',
        'createdAt', 'updatedAt', 'favorited', 'favoritesCount', 'author',
    ],
    additionalProperties: false,
} as const;

export const articlesResponseSchema = {
    type: 'object',
    properties: {
        articles: {
            type: 'array',
            items: articleSchema,
        },
        articlesCount: {type: 'integer', minimum: 0},
    },
    required: ['articles', 'articlesCount'],
    additionalProperties: false,
} as const;

export const articleResponseSchema = {
    type: 'object',
    properties: {
        article: articleSchema,
    },
    required: ['article'],
    additionalProperties: false,
} as const;
