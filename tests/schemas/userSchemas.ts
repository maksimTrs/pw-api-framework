// JSON Schema definitions for User API responses.
// Validated at runtime by AJV — matches interfaces in @models/user.

const userSchema = {
    type: 'object',
    properties: {
        email: {type: 'string'},
        username: {type: 'string'},
        bio: {type: 'string', nullable: true},
        image: {type: 'string'},
        token: {type: 'string'},
    },
    required: ['email', 'username', 'bio', 'image', 'token'],
    additionalProperties: false,
};

export const userResponseSchema = {
    type: 'object',
    properties: {
        user: userSchema,
    },
    required: ['user'],
    additionalProperties: false,
};
