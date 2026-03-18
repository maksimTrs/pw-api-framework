// JSON Schema definition for Tags API response.
// Validated at runtime by AJV — matches interface in @models/tag.

export const tagsResponseSchema = {
    type: 'object',
    properties: {
        tags: {
            type: 'array',
            items: {type: 'string'},
        },
    },
    required: ['tags'],
    additionalProperties: false,
};
