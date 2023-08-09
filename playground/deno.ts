// @ts-nocheck

import * as stdEnv from "../dist/index.mjs";

Deno.env.set("FOOBAR", "baz");

console.log(stdEnv, stdEnv.process.env.FOOBAR);
