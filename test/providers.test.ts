import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { detectProvider } from "../src/providers.ts";

const AMBIENT_CI_VARS = [
  "GITHUB_ACTIONS",
  "CI",
  "GITLAB_CI",
  "CIRCLECI",
  "TRAVIS",
  "BITBUCKET_COMMIT",
  "BUILDKITE",
  "APPVEYOR",
  "DRONE",
  "NETLIFY",
];

describe("detectProvider", () => {
  beforeEach(() => {
    for (const v of AMBIENT_CI_VARS) {
      vi.stubEnv(v, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects Google Cloud Run as runtime provider with ci: false", () => {
    vi.stubEnv("K_SERVICE", "my-service");
    expect(detectProvider()).toEqual({
      name: "google_cloudrun",
      ci: false,
    });
  });

  it("detects Google Cloud Run Job as runtime provider with ci: false", () => {
    vi.stubEnv("CLOUD_RUN_JOB", "my-job");
    expect(detectProvider()).toEqual({
      name: "google_cloudrun_job",
      ci: false,
    });
  });

  it("detects Render as runtime provider with ci: false", () => {
    vi.stubEnv("RENDER", "true");
    expect(detectProvider()).toEqual({
      name: "render",
      ci: false,
    });
  });

  it("detects Railway as runtime provider with ci: false", () => {
    vi.stubEnv("RAILWAY_PROJECT_ID", "proj-123");
    expect(detectProvider()).toEqual({
      name: "railway",
      ci: false,
    });

    vi.stubEnv("RAILWAY_PROJECT_ID", "");
    vi.stubEnv("RAILWAY_SERVICE_ID", "srv-123");
    expect(detectProvider()).toEqual({
      name: "railway",
      ci: false,
    });
  });

  it("detects Deno Deploy as runtime provider with ci: false", () => {
    vi.stubEnv("DENO_DEPLOY", "1");
    expect(detectProvider()).toEqual({
      name: "deno-deploy",
      ci: false,
    });

    vi.stubEnv("DENO_DEPLOY", "");
    vi.stubEnv("DENO_DEPLOYMENT_ID", "dep-123");
    expect(detectProvider()).toEqual({
      name: "deno-deploy",
      ci: false,
    });
  });

  it("detects CI providers with ci !== false", () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    const info = detectProvider();
    expect(info.name).toBe("github_actions");
    expect(info.ci).not.toBe(false);
  });
});
