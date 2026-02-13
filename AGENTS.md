# Agents

## Project Overview

`std-env` — runtime-agnostic JS utility library for detecting environments, runtimes, CI providers, and AI coding agents. Published as `std-env` on npm under `unjs/std-env`.

## Maintenance

- **`AGENTS.md`** — Keep updated with technical details, architecture, and conventions for AI agents working on this project
- **`README.md`** — Keep updated with user-facing documentation (usage, installation, exported APIs, examples)

When adding new features or changing behavior, update both files accordingly.

**After finishing any code updates, always run `pnpm lint:fix` then `pnpm test` to auto-fix lint/formatting issues and verify everything passes.**

- ESM-only (`"type": "module"`, single `.mjs` output)
- Linted with `oxlint` + `oxfmt`, typechecked with `tsgo`
- Tested with `vitest`
- Built with `obuild`

## Scripts

| Script               | Description                                     |
| -------------------- | ----------------------------------------------- |
| `pnpm run build`     | Build with obuild (`dist/index.mjs`, `dist/index.d.mts`) |
| `pnpm run dev`       | Start vitest in watch mode                      |
| `pnpm run test`      | Lint + typecheck + vitest with coverage         |
| `pnpm run lint`      | Run oxlint and oxfmt                            |
| `pnpm run lint:fix`  | Auto-fix lint/format issues                     |
| `pnpm run typecheck` | Run tsgo --noEmit                               |

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

## Benchmarks

Micro-benchmarks live in `test/bench/` and use [mitata](https://github.com/evanwashere/mitata). Run with:

```bash
node test/bench/agents.ts
```

## Detection Patterns

All detection modules follow the same pattern:

1. Define a `Name` type union of known values (extensible via `string & {}`)
2. Define an internal tuple array mapping names to env vars (with optional metadata)
3. Implement a `detect*()` function that iterates tuples checking env
4. Export a lazy-evaluated singleton (`*Info`) and convenience accessors

### Agent Detection (`src/agents.ts`)

- **Priority**: `AI_AGENT` env var (generic override) → ordered tuple scan
- Internal types:
  - `EnvCheck = string | ((env: Record<string, string | undefined>) => boolean)`
  - `InternalAgent = [agentName: AgentName, envChecks: EnvCheck[]]`
- Each agent maps to an array of `EnvCheck` items; the first matching check wins
- When `EnvCheck` is a string, the env var must be truthy; when it's a function, it receives the full env object and returns a boolean
- `envMatcher(envKey, regex)` helper creates regex-based env var matchers (e.g., `envMatcher("TERM_PROGRAM", /kiro/)`)
- IDEs (cursor, devin, kiro) are checked last so agents running inside them are detected first
- Exports: `detectAgent()`, `agentInfo` (singleton), `agent` (name shorthand), `isAgent` (boolean)

### Provider Detection (`src/providers.ts`)

- 50+ CI/CD providers detected via env vars
- Some providers have `{ ci: false }` metadata (e.g., Vercel, CodeSandbox — deployment platforms, not CI)
- Some providers have `{ ci: true }` explicitly (e.g., AWS Amplify, Cloudflare Pages/Workers)
- Special case: StackBlitz/WebContainer detected via `SHELL === "/bin/jsh"` + `process.versions.webcontainer`

### Runtime Detection (`src/runtimes.ts`)

- Priority order: netlify → edge-light → workerd → fastly → deno → bun → node
- Uses global objects (e.g., `globalThis.Bun`, `globalThis.Deno`, `navigator.userAgent`)
- `isNode` is true for Node-compatible runtimes (Bun, Deno with compat); use `runtime === "node"` for strict check

### Flags (`src/flags.ts`)

- `toBoolean()` helper is defined locally (not extracted to a util)
- `process` is resolved once via `globalThis.process || {}`
- `versions` is exported (used by `runtimes.ts`) but not re-exported from `index.ts`
- `isCI` combines the `CI` env var with `providerInfo.ci !== false`

### Environment (`src/env.ts`)

- `env`: proxy to `globalThis.process?.env` or empty object
- `nodeENV`: current `NODE_ENV` value (empty string if unset)

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

### Keeping Agent Lists in Sync

When adding or removing an agent from the `agents` array in `src/agents.ts`, you **must** update all of the following locations to keep them in sync:

1. **`src/agents.ts`** — `AgentName` type union and JSDoc comments on `AgentName` and `detectAgent()`
2. **`README.md`** — Supported agents list in the "Agent Detection" section (inside `<!-- automd:agents -->` markers)
3. **`AGENTS.md`** — If the detection pattern or conventions change, update this file accordingly
