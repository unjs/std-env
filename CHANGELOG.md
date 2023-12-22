# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v3.7.0

[compare changes](https://github.com/unjs/std-env/compare/v3.6.0...v3.7.0)

### 🚀 Enhancements

- **provider:** Add railway support ([#106](https://github.com/unjs/std-env/pull/106))

### 🩹 Fixes

- Check bun runtime before node ([#107](https://github.com/unjs/std-env/pull/107))

### 💅 Refactors

- Clarify runtimes and `isNode` behavior ([#108](https://github.com/unjs/std-env/pull/108))

### 🏡 Chore

- **release:** V3.6.0 ([33d70be](https://github.com/unjs/std-env/commit/33d70be))
- Update dev dependencies ([d865b1b](https://github.com/unjs/std-env/commit/d865b1b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Omar <omaraziz.dev@proton.me>

## v3.6.0

[compare changes](https://github.com/unjs/std-env/compare/v3.5.0...v3.6.0)

### 🚀 Enhancements

- Add zeabur provider ([#93](https://github.com/unjs/std-env/pull/93))
- **providers:** Add codesphere detection ([#95](https://github.com/unjs/std-env/pull/95))

### 🩹 Fixes

- **isColorSupported:** Inverted condition for `TERM=dumb` ([#97](https://github.com/unjs/std-env/pull/97))

### 🌊 Types

- Type `runtime` export ([#92](https://github.com/unjs/std-env/pull/92))

### 🏡 Chore

- **release:** V3.5.0 ([e1bfb39](https://github.com/unjs/std-env/commit/e1bfb39))
- Update lockfile ([2685bb6](https://github.com/unjs/std-env/commit/2685bb6))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Trung Dang ([@NamesMT](http://github.com/NamesMT))
- Conner Bachmann ([@Intevel](http://github.com/Intevel))
- Yuanlin Lin ([@yuaanlin](http://github.com/yuaanlin))

## v3.5.0

[compare changes](https://github.com/unjs/std-env/compare/v3.4.3...v3.5.0)

### 🚀 Enhancements

- Add `aws_amplify` provider ([#91](https://github.com/unjs/std-env/pull/91))

### 🏡 Chore

- Update dependencies ([9addee3](https://github.com/unjs/std-env/commit/9addee3))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Kaushik Gnanaskandan <kaushik.subman@gmail.com>

## v3.4.3

[compare changes](https://github.com/unjs/std-env/compare/v3.4.2...v3.4.3)

### 🩹 Fixes

- Conditional check for `process.versions?.bun` ([#75](https://github.com/unjs/std-env/pull/75))

### 🏡 Chore

- Update build dependencies ([cd6cbf7](https://github.com/unjs/std-env/commit/cd6cbf7))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.4.2

[compare changes](https://undefined/undefined/compare/v3.4.1...v3.4.2)

### 📦 Build

- `es6` compatibiliy for commonjs bundle (#74)

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.4.1

[compare changes](https://undefined/undefined/compare/v3.4.0...v3.4.1)

### 🩹 Fixes

- Access `process` from `globalThis` (#73)

### ❤️  Contributors

- Patrick Pircher

## v3.4.0

[compare changes](https://undefined/undefined/compare/v3.3.3...v3.4.0)

### 🚀 Enhancements

- Universal `env` shim (#61)
- **providers:** Detect `VERCEL` and `VERCEL_ENV` (#58)
- `isColorSupported` flag (b80677b)
- Expose providerInfo (3c547d8)
- Platform agnostic process (48b4fc0)
- **process:** Support `process.versions` (1ad71f6)
- **env:** Support `import.meta.env` and `Deno.env` (ceb04d5)
- Export `nodeVersion` and `nodeMajorVersion` (#60)
- Detect stackblitz using `process.versions.webcontainer` (#63)
- Detect the underlying runtime (#66)

### 🔥 Performance

- Reduce dependency on `process` proxy for flags (0d7b84f)
- Decouple `nodeENV` from env proxy (89c0411)

### 🩹 Fixes

- Add default fallback for platform flag (d71ce85)
- Update bun runtime detection (#67)
- Use `globalThis.Bun` for check (ca852ac)

### 💅 Refactors

- Split flags (584e9f4)
- Improve process and env types (581c674)
- Cleanup provider detection (3091a5b)
- **provider:** Remove dependency from `process` shim (c1c5a68)
- Decouple flags from process shim (6b087e2)
- Remove `_process` export (ce21499)

### 📦 Build

- Minify dist by default (4e67307)

### 🏡 Chore

- Update dev dependencies (c98a7ab)
- Add autofix ci (d817123)
- Fix prettierrc (b720e2b)
- Improve docs (1d4ef96)
- Add typecheck script (0694e19)
- Fix internal types and expose `EnvObject` (058abc6)
- Update title (25ebcfb)
- Create playground (6d92124)
- Add bun playground (0a576f2)
- Update docs (19a7651)
- Fix ci (4b0ae64)
- Update unbuild to v2 (23cb666)
- Update node playground to jiti (12efa68)
- Split global types (ec4c8f7)

### 🎨 Styles

- Format with prettier v3 (d198921)

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Tom Lienard ([@QuiiBz](http://github.com/QuiiBz))
- Nozomu Ikuta

## v3.3.3

[compare changes](https://undefined/undefined/compare/v3.3.2...v3.3.3)

### 🩹 Fixes

- **pkg:** Add `types` field to the `exports` (#51)
- Support static `process.env.NODE_ENV` (#45)

### 🏡 Chore

- Fix coverage test (92152a1)
- Git ignore `coverage` dir (cd52a9e)
- Lint (3832bcd)
- Update dev dependencies (acd471d)

### ✅ Tests

- Add defaults test (17009d9)
- Expect any provider (a7d8c43)

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Ntnyq ([@ntnyq](http://github.com/ntnyq))

## v3.3.2

### 🩹 Fixes

- Detect `isTest` from `NODE_ENV` as well (#39)

### 🏡 Chore

- Update dev dependencies (cdb65ab)
- Use changelogen for release (62b8d85)

### 🎨 Styles

- Format with prettier (0469d74)

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel Roe <daniel@roe.dev>

### [3.3.1](https://github.com/unjs/std-env/compare/v3.3.0...v3.3.1) (2022-11-14)

## [3.3.0](https://github.com/unjs/std-env/compare/v3.2.1...v3.3.0) (2022-10-15)

### Features

- detect cleavr provider ([#36](https://github.com/unjs/std-env/issues/36)) ([c24c8ed](https://github.com/unjs/std-env/commit/c24c8edf61d52b371f379f3d44b89a8eb1028091))

### [3.2.1](https://github.com/unjs/std-env/compare/v3.2.0...v3.2.1) (2022-08-12)

## [3.2.0](https://github.com/unjs/std-env/compare/v3.1.1...v3.2.0) (2022-08-12)

### Features

- detect `cloudflare_pages` provider ([#31](https://github.com/unjs/std-env/issues/31)) ([411b3c0](https://github.com/unjs/std-env/commit/411b3c0ec641721a00ae62c9911587444de6ed48))

### [3.1.1](https://github.com/unjs/std-env/compare/v3.1.0...v3.1.1) (2022-04-15)

### Bug Fixes

- **pkg:** emit cjs dist ([a64d409](https://github.com/unjs/std-env/commit/a64d40955046efbb5a39f92b64c43d6417812a33))

## [3.1.0](https://github.com/unjs/std-env/compare/v3.0.1...v3.1.0) (2022-04-15)

### Features

- detect stormkit environment ([#21](https://github.com/unjs/std-env/issues/21)) ([88874af](https://github.com/unjs/std-env/commit/88874afa01d7385fe7769733a5747d028c5bb018))

### [3.0.1](https://github.com/unjs/std-env/compare/v3.0.0...v3.0.1) (2021-11-05)

### Bug Fixes

- set `ci: false` for unkown envs ([2d5a646](https://github.com/unjs/std-env/commit/2d5a6467e2c503e60a11a7e64f98c15d84350d27))

## [3.0.0](https://github.com/unjs/std-env/compare/v3.0.0-0...v3.0.0) (2021-11-03)

### Bug Fixes

- provider name type ([5681ed4](https://github.com/unjs/std-env/commit/5681ed4cfdc8a7ed459db3abf32869c681db0350))
- type fix ([4bac82a](https://github.com/unjs/std-env/commit/4bac82a0a666ad02edab2e9e535e66f74e2b42be))

## [3.0.0-0](https://github.com/unjs/std-env/compare/v2.3.1...v3.0.0-0) (2021-11-02)

### ⚠ BREAKING CHANGES

- v3 rewrite (#15)

### Features

- v3 rewrite ([#15](https://github.com/unjs/std-env/issues/15)) ([7a3d4fb](https://github.com/unjs/std-env/commit/7a3d4fb1116f4a445e9ec751ac6e08e99b1c7f86))

### [2.3.1](https://github.com/unjs/std-env/compare/v2.3.0...v2.3.1) (2021-09-29)
