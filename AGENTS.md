# Agents

## Project Overview

`std-env` — runtime-agnostic JS utility library for detecting environments, runtimes, CI providers, and AI coding agents. Published as `std-env` on npm under `unjs/std-env`.

## Maintenance

- **`AGENTS.md`** — Keep updated with technical details, architecture, and conventions for AI agents working on this project
- **`README.md`** — Keep updated with user-facing documentation (usage, installation, exported APIs, examples)

When adding new features or changing behavior, update both files accordingly.

**After finishing any code updates, always run `pnpm lint:fix` then `pnpm test` to auto-fix lint/formatting issues and verify everything passes.**

- ESM-first (`"type": "module"`), dual CJS/ESM output
- Linted with `oxlint` + `oxfmt`, typechecked with `tsgo`
- Tested with `vitest`

## Scripts

| Script               | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `pnpm run build`     | Build with unbuild (`dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts`) |
| `pnpm run dev`       | Start vitest in watch mode                                                 |
| `pnpm run test`      | Lint + typecheck + vitest with coverage                                    |
| `pnpm run lint`      | Run oxlint and oxfmt                                                       |
| `pnpm run lint:fix`  | Auto-fix lint/format issues                                                |
| `pnpm run typecheck` | Run tsgo --noEmit                                                          |
| `pnpm play:node`     | Build then run `playground/node.mjs`                                       |
| `pnpm play:bun`      | Run `playground/bun.ts` directly with bun                                  |
| `pnpm play:deno`     | Build then run `playground/deno.ts` with deno                              |

## Source Structure

All source lives in `src/`, single entry point at `src/index.ts` which re-exports everything.

| File               | Purpose                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`     | Barrel re-export of all modules                                                                                 |
| `src/agents.ts`    | AI coding agent detection (`detectAgent`, `agentInfo`, `agent`, `isAgent`)                                      |
| `src/providers.ts` | CI/CD provider detection (`detectProvider`, `providerInfo`, `provider`)                                         |
| `src/runtimes.ts`  | JS runtime detection (`runtime`, `runtimeInfo`, `isNode`, `isBun`, `isDeno`, etc.)                              |
| `src/flags.ts`     | Environment flags (`isCI`, `isDebug`, `isTest`, `isProduction`, `isDevelopment`, `isMinimal`, `platform`, etc.) |
| `src/env.ts`       | Universal `env` proxy + `nodeENV` constant                                                                      |
| `src/process.ts`   | Universal `process` proxy shim                                                                                  |
| `src/_utils.ts`    | Internal helper (`toBoolean`)                                                                                   |
| `src/_types.d.ts`  | Global type augmentations (`EdgeRuntime`, `Netlify`, `Deno`, etc.)                                              |

## Benchmarks

Micro-benchmarks live in `test/bench/` and use [mitata](https://github.com/evanwashere/mitata). Run with:

```bash
node test/bench/agents.ts
```

## Detection Patterns

All detection modules follow the same pattern:

1. Define a `Name` type union of known values
2. Define an internal tuple array mapping names to env vars (with optional metadata)
3. Implement a `detect*()` function that iterates tuples checking `process.env`
4. Export a lazy-evaluated singleton (`*Info`) and convenience accessors

### Agent Detection (`src/agents.ts`)

- **Priority**: `AI_AGENT` env var (generic override) → ordered tuple scan
- Internal types:
  - `EnvCheck = string | [envName: string, match: RegExp]`
  - `InternalAgent = [agentName: AgentName, envChecks: EnvCheck[]]`
- Each agent maps to an array of `EnvCheck` items; the first matching env var wins
- When `EnvCheck` is a `[envName, RegExp]` tuple, the env var value must also match the regex (e.g., `["TERM_PROGRAM", /kiro/]`)
- Exports: `detectAgent()`, `agentInfo` (singleton), `agent` (name shorthand), `isAgent` (boolean)

### Provider Detection (`src/providers.ts`)

- 50+ CI/CD providers detected via env vars
- Some providers have `{ ci: false }` metadata (e.g., Vercel, CodeSandbox — deployment platforms, not CI)
- Special case: StackBlitz/WebContainer detected via `process.versions.webcontainer`

### Runtime Detection (`src/runtimes.ts`)

- Priority order: netlify → edge-light → workerd → fastly → deno → bun → node
- Uses global objects (e.g., `globalThis.Bun`, `globalThis.Deno`, `navigator.userAgent`)

## Agent Detection

### Self-Test (Required)

**Every agent that modifies this file MUST run the self-test and update the verification comment.**

```bash
pnpm run build
node -e "console.log(require('./dist/index.cjs').agentInfo)"
```

If output is like `{ name: "..." }`, it works. If output is `{}`, agent is NOT DETECTED.

Debug current env variables:

```bash
node -e "console.log(process.env)"
```

**After running the self-test:**

- If agent **was detected**: add/update a comment above the agent's entry in the `agents` record in `src/agents.ts`:
  `// ✅ Verified by {agentName} (can be detected using ENV1, ENV2, ...)`
  listing the env vars that were found in the environment. When updating an existing comment, **append** newly discovered env vars to the list — do not remove previously listed ones.

- If agent **was not detected**: search `process.env` output for environment variables that match the agent name or contain a recognizable value, then add the appropriate detection entry.
