# pw-api-framework

Playwright API test automation framework with TypeScript, AJV schema validation, and GitHub Actions CI.


## Tech Stack

- **[Playwright Test](https://playwright.dev/)** — test runner, assertions, API client
- **TypeScript** — strict mode, path aliases
- **AJV** — JSON Schema response validation
- **Faker.js** — test data generation
- **ESLint 9** — static analysis (flat config)
- **GitHub Actions** — CI pipeline with lint, test, and report deployment

## Architecture

```
Test Layer (specs)          — business logic assertions, test scenarios
    ↓
Domain Layer (API clients)  — typed ArticleApi with dual-method approach (happy-path + raw)
    ↓
Fixture Layer               — auth management, API client injection, cleanup
    ↓
Transport Layer (helpers)   — generic HTTP handler, request/response logging
    ↓
Config & Data               — typed environment config, factories, schemas, models
```

## Project Structure

```
tests/
  api/                      — API test specs
    schema/                 — JSON Schema validation tests
  fixtures/                 — Playwright fixtures (auth, API client, cleanup)
  helpers/                  — request handler, API clients, logger, schema validator, env config
  models/                   — TypeScript interfaces (Article, User, Tag, Error)
  data/                     — test data factories and constants
  schemas/                  — AJV JSON Schema definitions
tools/                      — utility scripts (HAR filter)
playwright.config.ts        — Playwright configuration
tsconfig.json               — TypeScript strict config with path aliases
eslint.config.mjs           — ESLint 9 flat config
```

## Setup

```bash
# Clone
git clone https://github.com/maksimTrs/pw-api-framework.git
cd pw-api-framework

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run all tests |
| `npm run test:verbose` | Run with detailed request/response logging |
| `npm run test:grep -- @smoke` | Run tests by tag |
| `npm run test:schema` | Run schema validation tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix lint errors |

## HAR Converter

Utility to extract and clean API entries from HAR files recorded via Playwright codegen:

```bash
# 1. Record HAR
npx playwright codegen --save-har=networking.har https://conduit-api.bondaracademy.com

# 2. Filter — keeps only API entries, strips headers/cookies/timings
npm run har:filter
# Output: filtered-har.json

# With custom file paths
npx tsx tools/harFilter.ts my-recording.har output.json
```

## Key Design Decisions

- **Layered architecture** — transport (`RequestHandler`) knows nothing about endpoints; domain layer (`ArticleApi`) encapsulates endpoint logic with dual-method approach; fixtures handle auth and cleanup; test layer focuses on assertions
- **Domain client dual-method approach** — happy-path methods (`createArticle()`) assert expected status and return typed data; raw methods (`createArticleResponse()`) return `APIResponse` for custom assertions and schema validation
- **Custom matchers** — `toHaveStatus()` with detailed error output (URL, body), `toMatchSchema()` for AJV validation
- **Worker-scoped auth** — login once per worker, share token across tests via fixture chain: `RequestHandler` → `withHeaders()` → `authApi` → `ArticleApi`
- **Typed environment config** — single `envConfig.ts` validates all required env vars at startup, fails fast with clear error messages
- **Article cleanup fixture** — tracks created articles, deletes in parallel via `Promise.allSettled()` in teardown (resilient to individual failures)
- **Factory pattern** — `createArticlePayload(overrides?)` generates unique test data with `Partial<T>` support
- **Request/response logging** — opt-in via `API_LOG=verbose`, sensitive fields masked as `[REDACTED]` in output
- **Schema validation caching** — compiled AJV validators cached via `WeakMap` to avoid recompilation
- **`as const` schemas** — all JSON Schema definitions are deeply readonly, preventing accidental mutation
