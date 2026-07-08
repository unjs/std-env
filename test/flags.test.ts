import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";

const flagEnvKeys = [
  "CI",
  "NODE_ENV",
  "MODE",
  "TEST",
  "DEBUG",
  "MINIMAL",
  "NO_COLOR",
  "FORCE_COLOR",
  "TERM",
  "GITHUB_ACTIONS",
  "VERCEL",
  "VERCEL_ENV",
  "NOW_BUILDER",
  "GITLAB_CI",
  "TRAVIS",
  "CIRCLECI",
  "BUILDKITE",
  "APPVEYOR",
  "CODESANDBOX_SSE",
  "CODESANDBOX_HOST",
];

async function importFlags() {
  vi.resetModules();
  return import("../src/flags.ts");
}

describe("flags", () => {
  beforeEach(() => {
    for (const key of flagEnvKeys) {
      vi.stubEnv(key, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isCI", () => {
    it("is true when CI env var is set", async () => {
      vi.stubEnv("CI", "true");
      const { isCI } = await importFlags();
      expect(isCI).toBe(true);
    });

    it("is true when a CI provider is detected", async () => {
      vi.stubEnv("GITHUB_ACTIONS", "true");
      const { isCI } = await importFlags();
      expect(isCI).toBe(true);
    });

    it("is false when only a non-CI provider is detected", async () => {
      vi.stubEnv("VERCEL", "1");
      const { isCI } = await importFlags();
      expect(isCI).toBe(false);
    });

    it("is false when no CI env or provider is set", async () => {
      const { isCI } = await importFlags();
      expect(isCI).toBe(false);
    });
  });

  describe("isTest", () => {
    it("is true when NODE_ENV is test", async () => {
      vi.stubEnv("NODE_ENV", "test");
      const { isTest } = await importFlags();
      expect(isTest).toBe(true);
    });

    it("is true when TEST env var is set", async () => {
      vi.stubEnv("TEST", "1");
      const { isTest } = await importFlags();
      expect(isTest).toBe(true);
    });

    it("is false when neither NODE_ENV=test nor TEST is set", async () => {
      const { isTest } = await importFlags();
      expect(isTest).toBe(false);
    });
  });

  describe("isDevelopment", () => {
    it("is true when NODE_ENV is development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { isDevelopment } = await importFlags();
      expect(isDevelopment).toBe(true);
    });

    it("is true when NODE_ENV is dev", async () => {
      vi.stubEnv("NODE_ENV", "dev");
      const { isDevelopment } = await importFlags();
      expect(isDevelopment).toBe(true);
    });

    it("is true when MODE is development", async () => {
      vi.stubEnv("MODE", "development");
      const { isDevelopment } = await importFlags();
      expect(isDevelopment).toBe(true);
    });

    it("is false when no development env is set", async () => {
      const { isDevelopment } = await importFlags();
      expect(isDevelopment).toBe(false);
    });
  });

  describe("isProduction", () => {
    it("is true when NODE_ENV is production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { isProduction } = await importFlags();
      expect(isProduction).toBe(true);
    });

    it("is true when MODE is production", async () => {
      vi.stubEnv("MODE", "production");
      const { isProduction } = await importFlags();
      expect(isProduction).toBe(true);
    });

    it("is false when no production env is set", async () => {
      const { isProduction } = await importFlags();
      expect(isProduction).toBe(false);
    });
  });

  describe("isDebug", () => {
    it("is true when DEBUG is set", async () => {
      vi.stubEnv("DEBUG", "true");
      const { isDebug } = await importFlags();
      expect(isDebug).toBe(true);
    });

    it("is true for any truthy DEBUG value", async () => {
      vi.stubEnv("DEBUG", "*");
      const { isDebug } = await importFlags();
      expect(isDebug).toBe(true);
    });

    it("is false when DEBUG is not set", async () => {
      const { isDebug } = await importFlags();
      expect(isDebug).toBe(false);
    });
  });

  describe("isMinimal", () => {
    it("is true when MINIMAL env is set", async () => {
      vi.stubEnv("MINIMAL", "1");
      const { isMinimal } = await importFlags();
      expect(isMinimal).toBe(true);
    });

    it("is true when running in CI", async () => {
      vi.stubEnv("CI", "true");
      const { isMinimal } = await importFlags();
      expect(isMinimal).toBe(true);
    });

    it("is true when NODE_ENV is test", async () => {
      vi.stubEnv("NODE_ENV", "test");
      const { isMinimal } = await importFlags();
      expect(isMinimal).toBe(true);
    });
  });

  describe("isColorSupported", () => {
    it("is false when NO_COLOR is set", async () => {
      vi.stubEnv("NO_COLOR", "1");
      vi.stubEnv("FORCE_COLOR", "1");
      const { isColorSupported } = await importFlags();
      expect(isColorSupported).toBe(false);
    });

    it("is true when FORCE_COLOR is set", async () => {
      vi.stubEnv("FORCE_COLOR", "1");
      const { isColorSupported } = await importFlags();
      expect(isColorSupported).toBe(true);
    });

    it("is true in CI", async () => {
      vi.stubEnv("CI", "true");
      const { isColorSupported } = await importFlags();
      expect(isColorSupported).toBe(true);
    });
  });

  describe("nodeVersion", () => {
    it("returns a semver string", async () => {
      const { nodeVersion } = await importFlags();
      expect(nodeVersion).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("strips the v prefix", async () => {
      const { nodeVersion } = await importFlags();
      expect(nodeVersion).not.toMatch(/^v/);
    });
  });

  describe("nodeMajorVersion", () => {
    it("returns a number", async () => {
      const { nodeMajorVersion } = await importFlags();
      expect(nodeMajorVersion).toBeTypeOf("number");
    });

    it("matches the major part of nodeVersion", async () => {
      const { nodeVersion, nodeMajorVersion } = await importFlags();
      expect(nodeMajorVersion).toBe(Number(nodeVersion!.split(".")[0]));
    });
  });

  describe("platform flags", () => {
    it("platform is a non-empty string", async () => {
      const { platform } = await importFlags();
      expect(platform).toBeTypeOf("string");
      expect(platform.length).toBeGreaterThan(0);
    });

    it("at most one OS flag is true", async () => {
      const { isWindows, isLinux, isMacOS } = await importFlags();
      const trueCount = [isWindows, isLinux, isMacOS].filter(Boolean).length;
      expect(trueCount).toBeLessThanOrEqual(1);
    });
  });
});
