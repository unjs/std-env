import * as stdEnv from "../src";
import * as stdWsl from "../src/wsl";
import * as stdContainers from "../src/containers";

console.log({
  ...stdEnv,
  process: "-",
});

console.log(stdWsl);

console.log(stdContainers);