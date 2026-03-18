import {faker} from '@faker-js/faker';

/**
 * Generates a unique title by combining a prefix with random faker words.
 * Useful for creating test entities that require unique names.
 */
export function uniqueTitle(prefix = 'Test'): string {
    return `${prefix} ${faker.lorem.words(2)} ${Date.now()}`;
}
