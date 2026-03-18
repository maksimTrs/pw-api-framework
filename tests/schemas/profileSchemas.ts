// JSON Schema for Profile API responses.
// Validated at runtime by AJV — matches interfaces in @models/profile.

export const profileSchema = {
    type: 'object',
    properties: {
        username: {type: 'string'},
        bio: {type: 'string', nullable: true},
        image: {type: 'string'},
        following: {type: 'boolean'},
    },
    required: ['username', 'bio', 'image', 'following'],
    additionalProperties: false,
} as const;

export const profileResponseSchema = {
    type: 'object',
    properties: {
        profile: profileSchema,
    },
    required: ['profile'],
    additionalProperties: false,
} as const;
