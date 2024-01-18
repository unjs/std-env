import { expect, it, describe } from "vitest";
import * as stdEnv from "../src";

describe("std-env", () => {
  it("has expected exports", () => {
    expect(Object.keys(stdEnv)).toMatchInlineSnapshot(`
      [
        "env",
        "nodeENV",
        "platform",
        "isCI",
        "hasTTY",
        "hasWindow",
        "isDebug",
        "isTest",
        "isProduction",
        "isDevelopment",
        "isMinimal",
        "isWindows",
        "isLinux",
        "isMacOS",
        "isColorSupported",
        "nodeVersion",
        "nodeMajorVersion",
        "process",
        "providerInfo",
        "provider",
        "isDeno",
        "isNode",
        "isBun",
        "isFastly",
        "isNetlify",
        "isEdgeLight",
        "isWorkerd",
        "isLagon",
        "runtimeInfo",
        "runtime",
      ]
    `);
  });

  it("defaults", () => {
    expect(stdEnv).toMatchObject({
      platform: expect.any(String),
      provider: expect.any(String),
      isCI: expect.any(Boolean),
      hasTTY: false,
      hasWindow: false,
      isDebug: false,
      isTest: true,
      isProduction: false,
      isDevelopment: false,
      isMinimal: true,
      isWindows: expect.any(Boolean),
      isLinux: expect.any(Boolean),
      isMacOS: expect.any(Boolean),
      isColorSupported: expect.any(Boolean),
    });
  });
});
