import {faker} from '@faker-js/faker';
import {expect, test} from '@fixtures/api';
import {ErrorResponse} from '@models/error';
import {testUser} from '@data/testUser';

const invalidLogins = [
    {
        name: 'wrong email',
        credentials: {email: faker.internet.email(), password: 'password123'},
        expectedStatus: 403,
        expectedField: 'email or password',
        expectedError: 'is invalid',
    },
    {
        name: 'wrong password',
        credentials: {email: testUser.email, password: faker.internet.password()},
        expectedStatus: 403,
        expectedField: 'email or password',
        expectedError: 'is invalid',
    },
    {
        name: 'empty email',
        credentials: {email: '', password: 'password123'},
        expectedStatus: 422,
        expectedField: 'email',
        expectedError: "can't be blank",
    },
    {
        name: 'empty password',
        credentials: {email: testUser.email, password: ''},
        expectedStatus: 422,
        expectedField: 'password',
        expectedError: "can't be blank",
    },
    {
        name: 'invalid email format',
        credentials: {email: 'not-an-email', password: 'password123'},
        expectedStatus: 403,
        expectedField: 'email or password',
        expectedError: 'is invalid',
    },
];

test.describe('Login validation',  {tag: ['@regression', '@login']}, () => {

    for (const {name, credentials, expectedStatus, expectedField, expectedError} of invalidLogins) {
        test(`POST /users/login with ${name} returns ${expectedStatus}`, {tag: '@auth'}, async ({api}) => {
            const response = await api.post({
                path: '/users/login',
                body: {user: credentials},
            });

            await expect(response).toHaveStatus(expectedStatus);

            const body = await response.json() as ErrorResponse;

            expect(body.errors[expectedField]).toBeDefined();
            expect(body.errors[expectedField]).toContain(expectedError);
        });
    }
});
