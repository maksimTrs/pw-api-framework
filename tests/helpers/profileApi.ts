import type {APIResponse} from '@playwright/test';
import {RequestHandler} from '@helpers/requestHandler';
import {maskSensitiveText} from '@helpers/logger';
import type {Profile, ProfileResponse} from '@models/profile';

export class ProfileApi {
    constructor(private readonly api: RequestHandler) {}

    /** GET /profiles/:username — returns typed Profile, asserts 200 */
    async getProfile(username: string): Promise<Profile> {
        const response = await this.getProfileResponse(username);
        if (response.status() !== 200) {
            throw new Error(
                `GET /profiles/${username} expected 200, got ${response.status()}: ${maskSensitiveText(await response.text())}`,
            );
        }
        const body = await response.json() as ProfileResponse;
        return body.profile;
    }

    /** GET /profiles/:username — raw response, no assertions */
    async getProfileResponse(username: string): Promise<APIResponse> {
        return this.api.get({path: `/profiles/${username}`});
    }
}
