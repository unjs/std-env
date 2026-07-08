import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { detectProvider } from "../src/providers.ts";

// All env vars that provider detection may check
const providerEnvKeys = [
  "APPVEYOR",
  "AWS_APP_ID",
  "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI",
  "INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN",
  "AC_APPCIRCLE",
  "bamboo_planKey",
  "BITBUCKET_COMMIT",
  "BITRISE_IO",
  "BUDDY_WORKSPACE_ID",
  "BUILDKITE",
  "CIRCLECI",
  "CIRRUS_CI",
  "CF_PAGES",
  "WORKERS_CI",
  "K_SERVICE",
  "CLOUD_RUN_JOB",
  "CODEBUILD_BUILD_ARN",
  "CF_BUILD_ID",
  "DRONE",
  "DRONE_BUILD_EVENT",
  "DSARI",
  "GITHUB_ACTIONS",
  "GITLAB_CI",
  "CI_MERGE_REQUEST_ID",
  "GO_PIPELINE_LABEL",
  "LAYERCI",
  "JENKINS_URL",
  "HUDSON_URL",
  "MAGNUM",
  "NETLIFY",
  "NETLIFY_LOCAL",
  "NEVERCODE",
  "RENDER",
  "SAILCI",
  "SEMAPHORE",
  "SCREWDRIVER",
  "SHIPPABLE",
  "TDDIUM",
  "STRIDER",
  "TEAMCITY_VERSION",
  "TRAVIS",
  "NOW_BUILDER",
  "VERCEL",
  "VERCEL_ENV",
  "APPCENTER_BUILD_ID",
  "CODESANDBOX_SSE",
  "CODESANDBOX_HOST",
  "STACKBLITZ",
  "STORMKIT",
  "CLEAVR",
  "ZEABUR",
  "CODESPHERE_APP_ID",
  "RAILWAY_PROJECT_ID",
  "RAILWAY_SERVICE_ID",
  "DENO_DEPLOY",
  "DENO_DEPLOYMENT_ID",
  "FIREBASE_APP_HOSTING",
  "SHELL",
];

describe("detectProvider", () => {
  beforeEach(() => {
    for (const key of providerEnvKeys) {
      vi.stubEnv(key, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty name with ci: false when no provider is detected", () => {
    expect(detectProvider()).toEqual({ name: "", ci: false });
  });

  describe("env var detection", () => {
    // [expectedName, envKey, envValue, optionalMeta]
    const cases: [string, string, string, Record<string, any>?][] = [
      ["appveyor", "APPVEYOR", "true"],
      ["aws_amplify", "AWS_APP_ID", "d1234", { ci: true }],
      ["azure_pipelines", "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI", "https://dev.azure.com/org"],
      ["azure_static", "INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN", "token-123"],
      ["appcircle", "AC_APPCIRCLE", "true"],
      ["bamboo", "bamboo_planKey", "PROJ-PLAN"],
      ["bitbucket", "BITBUCKET_COMMIT", "abc123"],
      ["bitrise", "BITRISE_IO", "true"],
      ["buddy", "BUDDY_WORKSPACE_ID", "123"],
      ["buildkite", "BUILDKITE", "true"],
      ["circle", "CIRCLECI", "true"],
      ["cirrus", "CIRRUS_CI", "true"],
      ["cloudflare_pages", "CF_PAGES", "1", { ci: true }],
      ["cloudflare_workers", "WORKERS_CI", "true", { ci: true }],
      ["google_cloudrun", "K_SERVICE", "my-service"],
      ["google_cloudrun_job", "CLOUD_RUN_JOB", "my-job"],
      ["codebuild", "CODEBUILD_BUILD_ARN", "arn:aws:codebuild:us-east-1:123:build/proj"],
      ["codefresh", "CF_BUILD_ID", "build-123"],
      ["drone", "DRONE", "true"],
      ["drone", "DRONE_BUILD_EVENT", "push"],
      ["dsari", "DSARI", "true"],
      ["github_actions", "GITHUB_ACTIONS", "true"],
      ["gitlab", "GITLAB_CI", "true"],
      ["gitlab", "CI_MERGE_REQUEST_ID", "42"],
      ["gocd", "GO_PIPELINE_LABEL", "pipeline-123"],
      ["layerci", "LAYERCI", "true"],
      ["jenkins", "JENKINS_URL", "https://ci.example.com/"],
      ["hudson", "HUDSON_URL", "https://ci.example.com/"],
      ["magnum", "MAGNUM", "true"],
      ["netlify", "NETLIFY", "true"],
      ["netlify", "NETLIFY_LOCAL", "true", { ci: false }],
      ["nevercode", "NEVERCODE", "true"],
      ["render", "RENDER", "true"],
      ["sail", "SAILCI", "true"],
      ["semaphore", "SEMAPHORE", "true"],
      ["screwdriver", "SCREWDRIVER", "true"],
      ["shippable", "SHIPPABLE", "true"],
      ["solano", "TDDIUM", "true"],
      ["strider", "STRIDER", "true"],
      ["teamcity", "TEAMCITY_VERSION", "2023.1"],
      ["travis", "TRAVIS", "true"],
      ["vercel", "NOW_BUILDER", "1"],
      ["vercel", "VERCEL", "1", { ci: false }],
      ["vercel", "VERCEL_ENV", "production", { ci: false }],
      ["appcenter", "APPCENTER_BUILD_ID", "42"],
      ["codesandbox", "CODESANDBOX_SSE", "1", { ci: false }],
      ["codesandbox", "CODESANDBOX_HOST", "abc.csb.app", { ci: false }],
      ["stackblitz", "STACKBLITZ", "true"],
      ["stormkit", "STORMKIT", "true"],
      ["cleavr", "CLEAVR", "true"],
      ["zeabur", "ZEABUR", "true"],
      ["codesphere", "CODESPHERE_APP_ID", "123", { ci: true }],
      ["railway", "RAILWAY_PROJECT_ID", "proj-123"],
      ["railway", "RAILWAY_SERVICE_ID", "svc-123"],
      ["deno-deploy", "DENO_DEPLOY", "true"],
      ["deno-deploy", "DENO_DEPLOYMENT_ID", "dep-123"],
      ["firebase_app_hosting", "FIREBASE_APP_HOSTING", "true", { ci: true }],
    ];

    for (const [expectedName, envKey, envValue, meta] of cases) {
      it(`detects ${expectedName} via ${envKey}`, () => {
        vi.stubEnv(envKey, envValue);
        expect(detectProvider()).toEqual({ name: expectedName, ...meta });
      });
    }
  });

  describe("priority order", () => {
    it("detects jenkins before hudson", () => {
      vi.stubEnv("JENKINS_URL", "https://jenkins.example.com/");
      vi.stubEnv("HUDSON_URL", "https://hudson.example.com/");
      expect(detectProvider()).toEqual({ name: "jenkins" });
    });

    it("NETLIFY takes priority over NETLIFY_LOCAL", () => {
      vi.stubEnv("NETLIFY", "true");
      vi.stubEnv("NETLIFY_LOCAL", "true");
      const result = detectProvider();
      expect(result.name).toBe("netlify");
      expect(result.ci).toBeUndefined();
    });
  });
});
