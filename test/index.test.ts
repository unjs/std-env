import { expect, it, describe } from "vitest";
import * as stdEnv from "../src/index.ts";

describe("std-env", () => {
  it("defaults", () => {
    expect(stdEnv).toMatchObject({
      platform: expect.any(String),
      provider: expect.any(String),
      isCI: expect.any(Boolean),
      hasTTY: expect.any(Boolean),
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
