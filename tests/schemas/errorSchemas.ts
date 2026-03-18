// JSON Schema definition for Conduit API error responses.
// Validated at runtime by AJV — matches interface in @models/error.

export const errorResponseSchema = {
    type: 'object',
    properties: {
        errors: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: { type: 'string' },
            },
        },
    },
    required: ['errors'],
    additionalProperties: false,
} as const;
