import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
    // Base JS rules
    eslint.configs.recommended,

    // TypeScript rules
    ...tseslint.configs.recommended,

    // Playwright rules (test files only)
    {
        files: ['tests/**/*.ts'],
        ...playwright.configs['flat/recommended'],
    },

    // Node.js scripts — enable Node globals (console, process, etc.)
    {
        files: ['*.js'],
        languageOptions: {
            globals: {
                console: 'readonly',
                process: 'readonly',
            },
        },
    },

    // Ignored directories
    {
        ignores: ['node_modules/', 'test-results/', 'playwright-report/'],
    },
);
