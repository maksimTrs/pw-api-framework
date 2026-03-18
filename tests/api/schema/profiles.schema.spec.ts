import {expect, test} from '@fixtures/api';
import {profileResponseSchema} from '@schemas/profileSchemas';

test.describe('Profiles API — Schema Validation', {tag: '@profiles'}, () => {

    test('GET /profiles/:username response matches schema',
        {tag: '@schema'},
        async ({profileApi, testUsername}) => {
            const response = await profileApi.getProfileResponse(testUsername);

            await expect(response).toHaveStatus(200);

            const body: unknown = await response.json();
            expect(body).toMatchSchema(profileResponseSchema);
        },
    );
});
