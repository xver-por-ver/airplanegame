# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the TypeScript game code. The app entry point is `src/App.ts`, with game flow in `src/Game.ts`. Domain areas are split into `Enemy/`, `Player/`, `Hit/`, and `IO/`, each with `Domain/` interfaces and `Infrastructure/Dom/` implementations. Tests live under `test/unit/` and mirror the `src/` layout. Static assets and generated bundles are written to `public/`, while HTML templates live in `templates/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run dev:watch` rebuilds on change for local development.
- `npm run dev:build` creates a one-off development bundle in `public/js/app.js`.
- `npm run pro:build` creates the production bundle and HTML output in `public/`.
- `npm test` runs the Jest suite in `jsdom`.
- `npm run test:coverage` collects coverage for `src/**`, excluding `*Interface.ts`.
- `npm run lint` checks `src/**` with ESLint.
- `npm run format` rewrites `src/**/*.ts` with Prettier.
- `npm run format:check` checks formatting for `src/**/*.ts` without rewriting files.

## Preferred Local Tools
Prefer `fd` for file discovery, `batcat` for readable file output, `eza --tree` for directory views, and `jq` for JSON inspection. Use `python3` for small, safe scripts when shell substitution would be brittle or hard to review.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation, semicolons, trailing commas, single quotes, and an 80-character print width; these rules come from `.prettierrc.json`. Follow the existing naming pattern: interfaces end with `Interface`, DOM adapters end with `Dom`, and tests use the same basename as the source file. Keep domain contracts in `Domain/` and browser-specific behavior in `Infrastructure/Dom/`.

## Testing Guidelines
Jest with `ts-jest` is the test runner. Place tests under `test/unit/` using `*.test.ts` names, mirroring the source path, for example `src/Enemy/Infrastructure/Dom/EnemyDom.ts` -> `test/unit/Enemy/Infrastructure/Dom/EnemyDom.test.ts`. DOM-related tests rely on `test/DomDocumentInit.ts`; keep browser assumptions isolated there when possible.

## AI Contribution Notes
Use AI for bounded tasks such as unit tests, localized `Infrastructure/Dom/` changes, interface refactors within one domain, and documentation updates. Avoid broad cross-domain rewrites in one pass. When AI changes an interface, update the affected adapters and matching tests in the same change. Validate AI-generated source edits with `npm run lint`, `npm test`, and `npm run format:check`; use `npm run test:coverage` for larger gameplay or architecture changes.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects such as `Revise README.md for clarity and completeness` and `Change env var name that hold app release`. Keep subjects concise and descriptive; group related code, test, and docs changes together. Pull requests should include a clear summary, test results (`npm test`, `npm run lint`), linked issues when applicable, and screenshots only when UI output or templates change.

## Configuration Tips
Webpack reads `RELEASE_APP` when generating `public/index.html` and `public/error.html`. Set that variable explicitly for release builds if version stamping matters.

## Agent skills

### Issue tracker

Issues live in GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout. See `docs/agents/domain.md`.
