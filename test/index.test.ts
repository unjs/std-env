import { expect, it, describe } from "vitest";
import * as stdEnv from "../src";

describe("std-env", () => {
  it("has expected exports", () => {
    expect(Object.keys(stdEnv)).toMatchInlineSnapshot(`
      [
        "platform",
        "provider",
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
      ]
    `);
  });

  it("defaults", () => {
    expect(stdEnv).toMatchObject({
      platform: expect.any(String),
      provider: "",
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
    });
  });
});
