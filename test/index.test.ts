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

  it("resolves env from import.meta.env fallback", () => {
    (globalThis as any).__import_meta_env__ = {
      ASTRO_ONLY_ENV: "from_import_meta",
    };
    delete process.env.ASTRO_ONLY_ENV;
    expect(stdEnv.env.ASTRO_ONLY_ENV).toBe("from_import_meta");
    expect("ASTRO_ONLY_ENV" in stdEnv.env).toBe(true);
    delete (globalThis as any).__import_meta_env__;
  });
});
