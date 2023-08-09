import * as stdEnv from "../src";

console.log({
  ...stdEnv,
  _process: "-",
  process: "-",
});
