# std-env

[![npm](https://img.shields.io/npm/dm/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![npm](https://img.shields.io/npm/v/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![bundlephobia](https://img.shields.io/bundlephobia/min/std-env/latest.svg?style=flat-square)](https://bundlephobia.com/result?p=std-env)

> Runtime agnostic JS utils

## Usage

```js
import { env, isDevelopment, isProduction } from "std-env";
```

## Environment

- `env` — Universal `process.env` object (works across all runtimes)
- `nodeENV` — Current value of `NODE_ENV` (empty string if not set)

## Flags

- `hasTTY` — Detect if stdout TTY is available
- `hasWindow` — Detect if global `window` object is available
- `isCI` — Detect if running in a CI environment
- `isColorSupported` — Detect if terminal color output is supported
- `isDebug` — Detect if `DEBUG` environment variable is set
- `isDevelopment` — Detect if `NODE_ENV` is `dev` or `development`
- `isLinux` — Detect if platform is Linux
- `isMacOS` — Detect if platform is macOS (darwin)
- `isMinimal` — Detect if running in a minimal environment (CI, test, or no TTY)
- `isProduction` — Detect if `NODE_ENV` is `production`
- `isTest` — Detect if `NODE_ENV` is `test`
- `isWindows` — Detect if platform is Windows
- `platform` — Value of `process.platform`
- `nodeVersion` — Node.js version string (e.g. `"22.0.0"`)
- `nodeMajorVersion` — Node.js major version number (e.g. `22`)

You can read more about how each flag works from [./src/flags.ts](./src/flags.ts).

## Provider Detection

`std-env` can automatically detect the current runtime provider based on environment variables.

You can use `isCI` and `provider` exports to detect it:

```ts
import { isCI, provider, providerInfo } from "std-env";

console.log({
  isCI, // true
  provider, // "github_actions"
  providerInfo, // { name: "github_actions", isCI: true }
});
```

You can also use `detectProvider()` to re-run detection at any time.

List of well known providers can be found from [./src/providers.ts](./src/providers.ts).

## Agent Detection

`std-env` can automatically detect if the current environment is running inside an AI coding agent.

```ts
import { isAgent, agent, agentInfo } from "std-env";

console.log({
  isAgent, // true
  agent, // "claude"
  agentInfo, // { name: "claude" }
});
```

You can also set the `AI_AGENT` environment variable to explicitly specify the agent name.

You can also use `detectAgent()` to re-run detection at any time.

Supported agents: `cursor`, `claude`, `devin`, `replit`, `gemini`, `codex`, `auggie`, `opencode`, `kiro`, `goose`, `pi`

## Runtime Detection

`std-env` can automatically detect the current JavaScript runtime based on global variables, following the [WinterCG Runtime Keys proposal](https://runtime-keys.proposal.wintercg.org/):

```ts
import { runtime, runtimeInfo } from "std-env";

// "" | "node" | "deno" | "bun" | "workerd" ...
console.log(runtime);

// { name: "node" }
console.log(runtimeInfo);
```

You can also use individual named exports for each runtime detection:

> [!NOTE]
> When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
>
> Use `runtime === "node"` if you need strict check for Node.js runtime.

- `isNode`
- `isBun`
- `isDeno`
- `isNetlify`
- `isEdgeLight`
- `isWorkerd`
- `isFastly`

List of well known runtimes can be found from [./src/runtimes.ts](./src/runtimes.ts).

## License

MIT
