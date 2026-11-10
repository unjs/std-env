import { expect, it, describe, vi, beforeEach } from "vitest";
import { detectProvider } from "../src/providers.ts";

describe("detectProvider", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects google_cloudrun with ci: false", () => {
    vi.stubEnv("K_SERVICE", "my-service");
    expect(detectProvider()).toEqual({
      name: "google_cloudrun",
      ci: false,
    });
  });

  it("detects google_cloudrun_job with ci: false", () => {
    vi.stubEnv("CLOUD_RUN_JOB", "my-job");
    expect(detectProvider()).toEqual({
      name: "google_cloudrun_job",
      ci: false,
    });
  });

  it("detects railway with ci: false", () => {
    vi.stubEnv("RAILWAY_PROJECT_ID", "p123");
    expect(detectProvider()).toEqual({
      name: "railway",
      ci: false,
    });
  });

  it("detects render with ci: false", () => {
    vi.stubEnv("RENDER", "true");
    expect(detectProvider()).toEqual({
      name: "render",
      ci: false,
    });
  });

  it("detects deno deploy with ci: false", () => {
    vi.stubEnv("DENO_DEPLOYMENT_ID", "abc123");
    expect(detectProvider()).toEqual({
      name: "deno-deploy",
      ci: false,
    });
  });
});
