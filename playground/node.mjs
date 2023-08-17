import * as stdEnv from "../dist/index.mjs";

console.log({
  ...stdEnv,
  process: "-",
});
