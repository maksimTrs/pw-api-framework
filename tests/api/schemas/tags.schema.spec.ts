import {expect, test} from '@fixtures/api';
import {tagsResponseSchema} from '@schemas/tagSchemas';

test.describe('Tags API — Schema Validation', () => {

    test('GET /tags response matches schema', {tag: ['@schema', '@tags']}, async ({api}) => {
        const response = await api.get({
            path: '/tags',
        });

        await expect(response).toHaveStatus(200);

        const body: unknown = await response.json();
        expect(body).toMatchSchema(tagsResponseSchema);
    });
});
