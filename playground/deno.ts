// @ts-nocheck

import * as stdEnv from "../dist/index.mjs";
import * as stdEnvWsl from "../dist/wsl/index.mjs";
import * as stdEnvContainers from "../dist/containers/index.mjs";

Deno.env.set("FOOBAR", "baz");

console.log(stdEnv, stdEnv.process.env.FOOBAR);

console.log(stdEnvWsl);

console.log(stdEnvContainers);
