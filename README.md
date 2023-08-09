# std-env

[![npm](https://img.shields.io/npm/dm/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![npm](https://img.shields.io/npm/v/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![bundlephobia](https://img.shields.io/bundlephobia/min/std-env/latest.svg?style=flat-square)](https://bundlephobia.com/result?p=std-env)

> Runtime agnostic JS utils

## Installation

```sh
# Using npm
npm i std-env

# Using pnpm
pnpm i std-env

# Using yarn
yarn add std-env
```

## Usage

```js
// ESM
import { env, isDevelopment, isProduction } from "std-env";

// CommonJS
const { env, isDevelopment, isProduction } = require("std-env");
```

## Flags

- `hasTTY`
- `hasWindow`
- `isDebug`
- `isDevelopment`
- `isLinux`
- `isMacOS`
- `isMinimal`
- `isProduction`
- `isTest`
- `isWindows`
- `platform`
- `isColorSupported`

You can read more about how each flag works from [./src/flags.ts](./src/flags.ts).

## Provider Detection

`std-env` can automatically detect the current runtime provider based on environment variables.

You can use `isCI` and `platform` exports to detect it:

```ts
import { isCI, platform, platformInfo } from "std-env";

console.log({
  isCI, // true
  platform, // "github_actions"
  platformInfo, // { name: "github_actions", isCI: true }
});
```

If you want to test provider based on a custom environment variable set, you can also directly use `detectProvider`:

```ts
import { detectProvider } from "std-env";

// { name: "vercel", ci: false }
console.log(detectProvider({ VERCEL: "1" }));
```

List of well known providers can be found from [./src/providers.ts](./src/providers.ts).

## Platform agnotic env

`std-env` provides a lightweight proxy to access environment variables in a platform agnostic way.

```ts
import { env } from "std-env";
```

## Platform agnostic process

`std-env` provides a lightweight proxy to access [`process`](https://nodejs.org/api/process.html) object in a platform agnostic way.

```ts
import { process } from "std-env";
```

## License

MIT
