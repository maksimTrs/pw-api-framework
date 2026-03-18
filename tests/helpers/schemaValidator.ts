import Ajv from 'ajv';
import type {ValidateFunction} from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({allErrors: true});
addFormats(ajv);

// Cache compiled validators by schema reference to avoid recompilation
const compiled = new WeakMap<object, ValidateFunction>();

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateSchema(data: unknown, schema: object): ValidationResult {
    let validate = compiled.get(schema);
    if (!validate) {
        validate = ajv.compile(schema);
        compiled.set(schema, validate);
    }

    const valid = validate(data);
    const errors = validate.errors?.map(err => {
        const path = err.instancePath || '/';
        return `${path} ${err.message ?? 'unknown error'}`;
    }) ?? [];

    return {valid: !!valid, errors};
}
