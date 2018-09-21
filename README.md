# STD-ENV

Detect running environment of the current Node.js process.

## Installation

Using yarn:

```
yarn add std-env
```

Usin npm:

```
npm i std-env
```

## Usage

```js
const env = require('std-env')

console.log(env)

/*
{
  browser: false,
  test: false,
  dev: true,
  production: false,
  debug: false,
  ci: false,
  tty: true,
  minimalCLI: false,
  windows: false,
  darwin: true,
  linux: false
}
*/
```

## License

MIT
