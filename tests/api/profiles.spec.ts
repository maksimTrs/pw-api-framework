import {expect, test} from '@fixtures/api';

test.describe('Profiles API', {tag: '@profiles'}, () => {

    test('GET /profiles/:username returns profile of authenticated user',
        {tag: '@smoke'},
        async ({profileApi, testUsername}) => {
            const profile = await profileApi.getProfile(testUsername);

            expect.soft(profile.username).toBe(testUsername);
            expect.soft(profile.image).toContain('http');
            expect.soft(profile.following).toBe(false);
        },
    );

    test('GET /profiles/:username for non-existent user returns 404',
        {tag: '@smoke'},
        async ({profileApi}) => {
            const response = await profileApi.getProfileResponse(`nonexistent_${Date.now()}`);

            await expect(response).toHaveStatus(404);
        },
    );
});
