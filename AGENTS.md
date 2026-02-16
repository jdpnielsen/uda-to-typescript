# AGENTS.md

Guidance for coding agents working in `@jdpnielsen/uda-to-typescript`.

## Scope and Purpose

- This repository is a TypeScript CLI that converts Umbraco `.uda` artifacts into generated TypeScript types.
- Primary entrypoints are `src/cli.ts` (CLI wiring) and `src/lib/main.ts` (conversion pipeline).
- Generated output is emitted to `lib/` for package distribution and to user-defined output paths at runtime.
- Keep changes focused, minimal, and aligned with existing architecture and naming.

## Current Branch Strategy

- The active compatibility target is Umbraco v17+ only.
- Pre-v17 compatibility work is considered obsolete and should not be reintroduced.
- Current v17 work lives on `feat/v17-support`.
- Prefer targeting v17-related changes on this feature branch until migration is merged.
- If branch names change later, update this section to keep agent context current.

## Environment and Toolchain

- Node.js: `>=18` (see `package.json` engines).
- Recommended local Node version: `18.18.0` (see `.nvmrc`).
- Package manager: npm (lockfile expected via `npm ci` in CI).
- Compiler: TypeScript (`tsc`).
- Test runner: Jest with `ts-jest` preset.
- Linting: ESLint with `@typescript-eslint` type-aware rules.

## Install and Setup Commands

- Install dependencies: `npm ci`
- Prepare git hooks (after install): `npm run prepare`
- Clean build output: `npm run clean`

## Build, Typecheck, Lint, Test Commands

- Build: `npm run build`
- Typecheck only: `npm run typecheck`
- Lint (auto-fix enabled by script): `npm run lint`
- Run all tests once: `npm test`
- Run tests in watch mode: `npm run test:watch`

## Running a Single Test (Important)

- By exact file path (preferred):
  - `npm test -- --runTestsByPath src/lib/helpers/parse-udi.spec.ts`
- By filename pattern:
  - `npm test -- parse-udi.spec.ts`
- By test name:
  - `npm test -- -t "Should handle a well-formed UDI"`
- For faster single-test runs, disable coverage explicitly:
  - `npm test -- --runTestsByPath src/lib/helpers/parse-udi.spec.ts --coverage=false`

## Test and CI Notes

- Jest config uses `testMatch: ["**/*.spec.ts"]`; create tests as `*.spec.ts`.
- CI runs on Node 18 and Node 20 (`.github/workflows/pr.yml`).
- CI sequence is effectively: `npm ci`, `npm run build`, `npm test`.
- Coverage collection is enabled in Jest config by default.

## Project Layout

- `src/cli.ts`: CLI options, config loading (Cosmiconfig), argument validation, process exit handling.
- `src/lib/main.ts`: orchestrates artifact collection, AST generation, template copy, and final file write.
- `src/lib/build-types.ts`: central AST builder assembling imports, aliases, unions, and generated types.
- `src/lib/datatypes/*.ts`: handlers per Umbraco editor alias.
- `src/lib/documenttypes/` and `src/lib/media-types/`: artifact-specific type builders.
- `src/lib/helpers/`: parsing, AST helpers, grouping/filtering utilities.
- `src/__tests__/integration/`: CLI integration tests using `execa`.

## Formatting and Whitespace

- Use tabs for indentation in TypeScript files (enforced by ESLint + `.editorconfig`).
- Use UTF-8 and ensure final newline at EOF.
- Trim trailing whitespace except where markdown rules permit otherwise.
- Use single quotes for strings unless escaping would be awkward.
- Keep formatting close to existing style; do not introduce a separate formatter style.

## Imports and Module Conventions

- Use ES module import syntax in TypeScript source.
- Existing code generally groups imports as:
  - external packages / Node built-ins,
  - then local project imports.
- Preserve nearby ordering conventions when editing a file rather than mass-reordering.
- Prefer `import type` only where it improves clarity and matches surrounding file style.
- Export public API from `src/index.ts`; keep internal helpers in `src/lib/**`.

## TypeScript and Types

- `strict` mode is enabled; maintain strict typings.
- Prefer explicit domain types (`DataType`, `DocumentType`, `MediaType`, `ArtifactContainer`) over `any`.
- Use narrow literal/template-literal types where already established (e.g., UDI/GUID helpers).
- Prefer `unknown` to `any` when decoding untrusted values before narrowing.
- Keep function signatures explicit for exported functions.
- Preserve use of `satisfies` for map/config validation when extending handler registries.

## Naming Conventions

- Use `camelCase` for variables/functions and `PascalCase` for types/interfaces/type aliases.
- Keep file names lowercase with hyphens for helpers/tests (e.g., `parse-udi.ts`, `parse-udi.spec.ts`).
- Data type handler files intentionally mirror Umbraco aliases (e.g., `Umbraco.BlockGrid.ts`); follow existing pattern.
- Name test suites after the unit under test (`describe('parseUdi', ...)`).

## Error Handling and Logging

- Throw `Error` with specific, actionable messages when required data is missing.
- Fail fast on invalid user input in CLI (`input` and `output` are required).
- In CLI entrypoint, surface errors with `console.error` and exit non-zero.
- Use `console.warn` for non-fatal recoverable issues (e.g., missing optional handlers/artifacts).
- Avoid swallowing errors unless there is deliberate best-effort behavior (e.g., cleanup/setup).

## Testing Conventions

- Unit tests live next to code as `*.spec.ts`.
- Integration tests are under `src/__tests__/integration/`.
- Keep tests deterministic and file-system safe; use fixtures under `src/__tests__/__fixtures__/`.
- Prefer readable assertions with focused `describe`/`it` blocks.
- Maintain existing sentence style in test names when editing nearby tests.
- Recommended verification order: targeted tests first, then `npm run typecheck`, then broader/full test runs for substantial changes.
- Some v17 fixture-driven tests intentionally exercise partial artifact sets and may log `console.warn`; treat these as expected unless assertions indicate behavior changed.

## Lint Rules to Respect

- ESLint config is type-aware via `tsconfig.lint.json`.
- Key enforced style choices include tabs and single quotes.
- Some strict unsafe rules are relaxed only in `*.spec.ts`; do not copy those relaxations into source code.
- If you must suppress a lint rule, use the narrowest possible scope and include a short reason.

## Config and Runtime Behavior

- CLI accepts flags `--config`, `--input`, `--output`, and `--debug`.
- Cosmiconfig namespace is `udaconvert`; config can be loaded automatically or via `--config`.
- Resolve paths relative to discovered config file directory when a config file is used.
- Default data type handlers come from `dataTypeMap`; custom handlers can extend/override via config.

## Release and Commit Workflow Notes

- Release automation uses `semantic-release` on `main`.
- Conventional commit style is expected (`commitizen` configured).
- `lint-staged` runs ESLint autofix on staged `*.ts` files.
- Do not change release config unless task explicitly requires it.

## Cursor/Copilot Rule Files

- Checked for `.cursor/rules/`, `.cursorrules`, and `.github/copilot-instructions.md`.
- No Cursor or Copilot instruction files are present in this repository currently.
- If such files are added later, treat them as higher-priority instructions and update this document.

## Agent Working Agreement

- Prefer minimal diffs and avoid drive-by refactors.
- Update or add tests when behavior changes.
- Run targeted tests first, then broader checks before finishing.
- Before handing off substantial changes, run: `npm run build`, `npm test`, and `npm run lint`.
- If command runtime is a concern, at least run the most relevant single test(s) plus `npm run typecheck`.
