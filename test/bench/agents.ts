import { bench, compact, run } from "mitata";
import { detectAgent } from "../../src/agents.ts";

compact(() => {
  bench("detectAgent()", () => {
    detectAgent();
  });
});

await run();
