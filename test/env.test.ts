import { expect, it, describe } from "vitest";
import { env, process as envProcess, nodeENV } from "../src/env.ts";

describe("env and process exports", () => {
  it("env exposes process.env properties", () => {
    expect(typeof env).toBe("object");
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBe(globalThis.process?.env?.NODE_ENV);
  });

  it("process exposes env and standard process properties", () => {
    expect(envProcess).toBeDefined();
    expect(envProcess.env).toBeDefined();
    expect(envProcess.env).toBe(env);
  });

  it("nodeENV reflects the current NODE_ENV setting", () => {
    expect(nodeENV).toBe(globalThis.process?.env?.NODE_ENV || undefined);
  });
});
