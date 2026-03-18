import {env} from '@helpers/envConfig';

export const testUser = {
    email: env.TEST_USER_EMAIL,
    password: env.TEST_USER_PASSWORD,
} as const;
