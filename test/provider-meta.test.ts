import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { detectProviderMeta } from "../src/provider-meta.ts";

// Env vars touched by provider detection or metadata extraction. Cleared before
// each test so the ambient CI environment (e.g. GitHub Actions) does not leak in.
const envKeys = [
  "CI",
  "GITHUB_ACTIONS",
  "GITHUB_EVENT_NAME",
  "GITHUB_EVENT_NUMBER",
  "GITHUB_REPOSITORY",
  "GITHUB_HEAD_REF",
  "GITHUB_REF",
  "GITHUB_SHA",
  "GITHUB_RUN_ID",
  "GITHUB_SERVER_URL",
  "GITHUB_WORKFLOW",
  "GITHUB_ACTOR",
  "GITLAB_CI",
  "CI_MERGE_REQUEST_ID",
  "CI_PROJECT_PATH",
  "CI_COMMIT_REF_NAME",
  "CI_COMMIT_SHA",
  "CI_PIPELINE_URL",
  "CI_ENVIRONMENT_URL",
  "NETLIFY",
  "CONTEXT",
  "PULL_REQUEST",
  "REPOSITORY_URL",
  "HEAD",
  "BRANCH",
  "DEPLOY_URL",
  "REVIEW_ID",
  "VERCEL",
  "NOW_BUILDER",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_GIT_REPO_OWNER",
  "VERCEL_GIT_REPO_SLUG",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_PULL_REQUEST_ID",
  "CF_PAGES",
  "CF_PAGES_BRANCH",
  "CF_PAGES_COMMIT_SHA",
  "CF_PAGES_URL",
  "WORKERS_CI",
  "WORKERS_CI_BRANCH",
  "WORKERS_CI_COMMIT_SHA",
  "WORKERS_CI_BUILD_UUID",
  "CODEBUILD",
  "CODEBUILD_BUILD_ARN",
  "CODEBUILD_WEBHOOK_EVENT",
  "CODEBUILD_WEBHOOK_TRIGGER",
  "CODEBUILD_WEBHOOK_HEAD_REF",
  "CODEBUILD_RESOLVED_SOURCE_VERSION",
  "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI",
  "BUILD_SOURCEBRANCHNAME",
  "BUILD_SOURCEVERSION",
  "BUILD_REASON",
  "SYSTEM_PULLREQUEST_PULLREQUESTNUMBER",
  "SYSTEM_PULLREQUEST_PULLREQUESTID",
  "BITBUCKET_COMMIT",
  "BITBUCKET_BRANCH",
  "BITBUCKET_WORKSPACE",
  "BITBUCKET_REPO_SLUG",
  "BITBUCKET_PR_ID",
  "BUILDKITE",
  "BUILDKITE_BRANCH",
  "BUILDKITE_COMMIT",
  "BUILDKITE_REPO",
  "BUILDKITE_PULL_REQUEST",
  "BUILDKITE_BUILD_URL",
  "BUILDKITE_BUILD_ID",
  "CIRCLECI",
  "CIRCLE_PULL_REQUEST",
  "CIRCLE_REPOSITORY_URL",
  "CIRCLE_BRANCH",
  "JENKINS_URL",
  "CHANGE_ID",
  "ghprbPullId",
  "RENDER",
  "RENDER_GIT_BRANCH",
  "RENDER_GIT_COMMIT",
  "RENDER_GIT_REPO_SLUG",
  "IS_PULL_REQUEST",
  "RENDER_EXTERNAL_URL",
  "TRAVIS",
  "TRAVIS_BRANCH",
  "TRAVIS_COMMIT",
  "TRAVIS_REPO_SLUG",
  "TRAVIS_PULL_REQUEST",
  "APPVEYOR",
  "APPVEYOR_REPO_BRANCH",
  "APPVEYOR_REPO_COMMIT",
  "APPVEYOR_REPO_NAME",
  "APPVEYOR_PULL_REQUEST_NUMBER",
  "BITRISE_IO",
  "BITRISE_GIT_BRANCH",
  "BITRISE_GIT_COMMIT",
  "BITRISEIO_GIT_REPOSITORY_OWNER",
  "BITRISEIO_GIT_REPOSITORY_SLUG",
  "BITRISE_PULL_REQUEST",
  "CIRRUS_CI",
  "CIRRUS_BRANCH",
  "CIRRUS_CHANGE_IN_REPO",
  "CIRRUS_REPO_FULL_NAME",
  "CIRRUS_PR",
  "CF_BUILD_ID",
  "CF_BRANCH",
  "CF_REVISION",
  "CF_PULL_REQUEST_ID",
  "CF_PULL_REQUEST_NUMBER",
  "DRONE",
  "DRONE_BUILD_EVENT",
  "DRONE_COMMIT_BRANCH",
  "DRONE_COMMIT_SHA",
  "DRONE_REPO_OWNER",
  "DRONE_REPO_NAME",
  "DRONE_PULL_REQUEST",
  "SEMAPHORE",
  "SEMAPHORE_GIT_PR_NUMBER",
  "SEMAPHORE_GIT_REPO_SLUG",
  "SEMAPHORE_GIT_BRANCH",
  "SEMAPHORE_GIT_SHA",
];

describe("detectProviderMeta", () => {
  beforeEach(() => {
    for (const key of envKeys) {
      vi.stubEnv(key, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns an empty name when no provider is detected", () => {
    expect(detectProviderMeta()).toEqual({ name: "" });
  });

  it("extracts GitHub Actions push metadata", () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    vi.stubEnv("GITHUB_EVENT_NAME", "push");
    vi.stubEnv("GITHUB_REPOSITORY", "unjs/std-env");
    vi.stubEnv("GITHUB_REF", "refs/heads/main");
    vi.stubEnv("GITHUB_SHA", "abcdef1234567890");
    vi.stubEnv("GITHUB_RUN_ID", "42");
    vi.stubEnv("GITHUB_SERVER_URL", "https://github.com");
    vi.stubEnv("GITHUB_ACTOR", "octocat");
    vi.stubEnv("GITHUB_WORKFLOW", "CI");

    expect(detectProviderMeta()).toMatchObject({
      name: "github_actions",
      repo: { owner: "unjs", name: "std-env" },
      branch: "main",
      commitSha: "abcdef1234567890",
      isPR: false,
      runId: "42",
      buildUrl: "https://github.com/unjs/std-env/actions/runs/42",
      actor: "octocat",
      eventName: "push",
      workflowName: "CI",
    });
  });

  it("detects a GitHub Actions pull request and prefers the head ref", () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
    vi.stubEnv("GITHUB_HEAD_REF", "feat/new-thing");
    vi.stubEnv("GITHUB_REF", "refs/pull/123/merge");

    const meta = detectProviderMeta();
    expect(meta.isPR).toBe(true);
    expect(meta.prNumber).toBe(123);
    expect(meta.branch).toBe("feat/new-thing");
  });

  it("extracts GitLab CI metadata and nested project paths", () => {
    vi.stubEnv("GITLAB_CI", "true");
    vi.stubEnv("CI_PROJECT_PATH", "group/subgroup/repo");
    vi.stubEnv("CI_COMMIT_REF_NAME", "develop");
    vi.stubEnv("CI_COMMIT_SHA", "0123456789abcdef");
    vi.stubEnv("CI_PIPELINE_URL", "https://gitlab.com/group/subgroup/repo/-/pipelines/1");

    expect(detectProviderMeta()).toMatchObject({
      name: "gitlab",
      repo: { owner: "group/subgroup", name: "repo" },
      branch: "develop",
      commitSha: "0123456789abcdef",
      buildUrl: "https://gitlab.com/group/subgroup/repo/-/pipelines/1",
    });
  });

  it("falls back to a single-segment GitLab project path as both owner and name", () => {
    vi.stubEnv("GITLAB_CI", "true");
    vi.stubEnv("CI_PROJECT_PATH", "repo");

    expect(detectProviderMeta().repo).toEqual({ owner: "repo", name: "repo" });
  });

  it("captures GitLab's opt-in CI_ENVIRONMENT_URL as deployUrl alongside the pipeline buildUrl", () => {
    vi.stubEnv("GITLAB_CI", "true");
    vi.stubEnv("CI_PIPELINE_URL", "https://gitlab.com/acme/site/-/pipelines/1");
    vi.stubEnv("CI_ENVIRONMENT_URL", "https://staging.example.com");

    expect(detectProviderMeta()).toMatchObject({
      name: "gitlab",
      buildUrl: "https://gitlab.com/acme/site/-/pipelines/1",
      deployUrl: "https://staging.example.com",
    });
  });

  it("leaves GitLab's deployUrl undefined for an ordinary CI-only pipeline", () => {
    vi.stubEnv("GITLAB_CI", "true");
    vi.stubEnv("CI_PIPELINE_URL", "https://gitlab.com/acme/site/-/pipelines/1");

    const meta = detectProviderMeta();
    expect(meta.buildUrl).toBe("https://gitlab.com/acme/site/-/pipelines/1");
    expect(meta.deployUrl).toBeUndefined();
  });

  it("normalizes the Netlify deploy-preview context to preview", () => {
    vi.stubEnv("NETLIFY", "true");
    vi.stubEnv("CONTEXT", "deploy-preview");
    vi.stubEnv("PULL_REQUEST", "true");
    vi.stubEnv("HEAD", "topic-branch");
    vi.stubEnv("DEPLOY_URL", "https://deploy-preview-1--example.netlify.app");
    vi.stubEnv("REVIEW_ID", "1");

    expect(detectProviderMeta()).toMatchObject({
      name: "netlify",
      environment: "preview",
      isPR: true,
      prNumber: 1,
      branch: "topic-branch",
      deployUrl: "https://deploy-preview-1--example.netlify.app",
    });
  });

  it("falls back to Netlify's BRANCH var when HEAD is unset and normalizes CONTEXT case-insensitively", () => {
    vi.stubEnv("NETLIFY", "true");
    vi.stubEnv("BRANCH", "main");
    vi.stubEnv("CONTEXT", "PRODUCTION");

    const meta = detectProviderMeta();
    expect(meta.branch).toBe("main");
    expect(meta.environment).toBe("production");
  });

  it("extracts CodeBuild metadata and parses the PR number from the webhook trigger", () => {
    vi.stubEnv("CODEBUILD", "true");
    vi.stubEnv("CODEBUILD_BUILD_ARN", "arn:aws:codebuild:us-east-1:123:build/demo:1");
    vi.stubEnv("CODEBUILD_WEBHOOK_EVENT", "PULL_REQUEST_UPDATED");
    vi.stubEnv("CODEBUILD_WEBHOOK_TRIGGER", "pr/42");
    vi.stubEnv("CODEBUILD_WEBHOOK_HEAD_REF", "refs/heads/feat/thing");
    vi.stubEnv("CODEBUILD_RESOLVED_SOURCE_VERSION", "abcdef0123456789");
    vi.stubEnv("CODEBUILD_SOURCE_REPO_URL", "https://github.com/acme/site.git");

    expect(detectProviderMeta()).toMatchObject({
      name: "codebuild",
      isPR: true,
      prNumber: 42,
      branch: "feat/thing",
      commitSha: "abcdef0123456789",
      repo: { owner: "acme", name: "site" },
    });
  });

  it("recognizes CodeBuild PULL_REQUEST_MERGED/CLOSED as PR events too", () => {
    vi.stubEnv("CODEBUILD_BUILD_ARN", "arn:aws:codebuild:us-east-1:123:build/demo:1");
    vi.stubEnv("CODEBUILD_WEBHOOK_EVENT", "PULL_REQUEST_MERGED");

    expect(detectProviderMeta().isPR).toBe(true);
  });

  it("extracts Vercel metadata from split owner/slug vars", () => {
    vi.stubEnv("NOW_BUILDER", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_REPO_OWNER", "acme");
    vi.stubEnv("VERCEL_GIT_REPO_SLUG", "site");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");

    expect(detectProviderMeta()).toMatchObject({
      name: "vercel",
      repo: { owner: "acme", name: "site" },
      environment: "production",
      branch: "main",
    });
  });

  it("builds a Vercel deployment URL from VERCEL_URL", () => {
    vi.stubEnv("NOW_BUILDER", "1");
    vi.stubEnv("VERCEL_URL", "my-app-abc123.vercel.app");

    expect(detectProviderMeta().deployUrl).toBe("https://my-app-abc123.vercel.app");
  });

  it("extracts Azure Pipelines metadata for a PR build", () => {
    vi.stubEnv("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI", "https://dev.azure.com/acme/");
    // Azure only ever exposes the leaf segment here, never the full nested path.
    vi.stubEnv("BUILD_SOURCEBRANCHNAME", "thing");
    vi.stubEnv("BUILD_SOURCEVERSION", "abcdef1234567890");
    vi.stubEnv("BUILD_REASON", "PullRequest");
    vi.stubEnv("SYSTEM_PULLREQUEST_PULLREQUESTNUMBER", "99");
    vi.stubEnv("SYSTEM_PULLREQUEST_PULLREQUESTID", "12345");

    expect(detectProviderMeta()).toMatchObject({
      name: "azure_pipelines",
      branch: "thing",
      commitSha: "abcdef1234567890",
      isPR: true,
      prNumber: 99,
    });
  });

  it("falls back to Azure's internal PR id when there is no GitHub PR number", () => {
    vi.stubEnv("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI", "https://dev.azure.com/acme/");
    vi.stubEnv("BUILD_REASON", "PullRequest");
    vi.stubEnv("SYSTEM_PULLREQUEST_PULLREQUESTID", "12345");

    expect(detectProviderMeta().prNumber).toBe(12345);
  });

  it("extracts Bitbucket Pipelines metadata via the workspace/slug vars", () => {
    vi.stubEnv("BITBUCKET_COMMIT", "abcdef1234567890");
    vi.stubEnv("BITBUCKET_BRANCH", "feature/x");
    vi.stubEnv("BITBUCKET_WORKSPACE", "acme");
    vi.stubEnv("BITBUCKET_REPO_SLUG", "site");
    vi.stubEnv("BITBUCKET_PR_ID", "7");

    expect(detectProviderMeta()).toMatchObject({
      name: "bitbucket",
      branch: "feature/x",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      prNumber: 7,
    });
  });

  it("has no PR for Bitbucket when BITBUCKET_PR_ID is unset", () => {
    vi.stubEnv("BITBUCKET_COMMIT", "abcdef1234567890");

    expect(detectProviderMeta().isPR).toBe(false);
  });

  it("safely ignores a malformed repo URL instead of throwing", () => {
    vi.stubEnv("TRAVIS", "true");
    vi.stubEnv("TRAVIS_REPO_SLUG", "git@nowhere");

    expect(() => detectProviderMeta()).not.toThrow();
    expect(detectProviderMeta().repo).toBeUndefined();
  });

  it("drops a repo slug whose name is only a stripped .git suffix", () => {
    vi.stubEnv("TRAVIS", "true");
    vi.stubEnv("TRAVIS_REPO_SLUG", "acme/.git");

    expect(detectProviderMeta().repo).toBeUndefined();
  });

  it("parses a Buildkite git URL and treats its 'false' sentinel as no PR", () => {
    vi.stubEnv("BUILDKITE", "true");
    vi.stubEnv("BUILDKITE_BRANCH", "main");
    vi.stubEnv("BUILDKITE_COMMIT", "abcdef1234567890");
    vi.stubEnv("BUILDKITE_REPO", "git@github.com:acme/site.git");
    vi.stubEnv("BUILDKITE_PULL_REQUEST", "false");
    vi.stubEnv("BUILDKITE_BUILD_URL", "https://buildkite.com/acme/site/builds/1");
    vi.stubEnv("BUILDKITE_BUILD_ID", "build-1");

    const meta = detectProviderMeta();
    expect(meta).toMatchObject({
      name: "buildkite",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: false,
      buildUrl: "https://buildkite.com/acme/site/builds/1",
      runId: "build-1",
    });
    expect(meta.prNumber).toBeUndefined();
  });

  it("parses a CircleCI PR number from its URL", () => {
    vi.stubEnv("CIRCLECI", "true");
    vi.stubEnv("CIRCLE_PULL_REQUEST", "https://github.com/acme/site/pull/77");
    vi.stubEnv("CIRCLE_REPOSITORY_URL", "git@github.com:acme/site.git");
    vi.stubEnv("CIRCLE_BRANCH", "fix/bug");

    expect(detectProviderMeta()).toMatchObject({
      name: "circle",
      prNumber: 77,
      isPR: true,
      repo: { owner: "acme", name: "site" },
      branch: "fix/bug",
    });
  });

  it("prefers Jenkins CHANGE_ID over the deprecated ghprbPullId plugin var", () => {
    vi.stubEnv("JENKINS_URL", "https://jenkins.example.com/");
    vi.stubEnv("CHANGE_ID", "10");
    vi.stubEnv("ghprbPullId", "999");

    const meta = detectProviderMeta();
    expect(meta.name).toBe("jenkins");
    expect(meta.isPR).toBe(true);
    expect(meta.prNumber).toBe(10);
  });

  it("falls back to Jenkins's ghprbPullId when CHANGE_ID is unset", () => {
    vi.stubEnv("JENKINS_URL", "https://jenkins.example.com/");
    vi.stubEnv("ghprbPullId", "42");

    expect(detectProviderMeta().prNumber).toBe(42);
  });

  it("extracts Render metadata and treats IS_PULL_REQUEST as a boolean string", () => {
    vi.stubEnv("RENDER", "true");
    vi.stubEnv("RENDER_GIT_BRANCH", "main");
    vi.stubEnv("RENDER_GIT_COMMIT", "abcdef1234567890");
    vi.stubEnv("RENDER_GIT_REPO_SLUG", "acme/site");
    vi.stubEnv("IS_PULL_REQUEST", "true");
    vi.stubEnv("RENDER_EXTERNAL_URL", "https://myapp.onrender.com");

    expect(detectProviderMeta()).toMatchObject({
      name: "render",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      deployUrl: "https://myapp.onrender.com",
    });
  });

  it("treats Travis's 'false' sentinel as no PR", () => {
    vi.stubEnv("TRAVIS", "true");
    vi.stubEnv("TRAVIS_BRANCH", "main");
    vi.stubEnv("TRAVIS_COMMIT", "abcdef1234567890");
    vi.stubEnv("TRAVIS_REPO_SLUG", "acme/site");
    vi.stubEnv("TRAVIS_PULL_REQUEST", "false");

    expect(detectProviderMeta()).toMatchObject({
      name: "travis",
      repo: { owner: "acme", name: "site" },
      isPR: false,
    });
  });

  it("extracts a Travis PR number", () => {
    vi.stubEnv("TRAVIS", "true");
    vi.stubEnv("TRAVIS_PULL_REQUEST", "13");

    const meta = detectProviderMeta();
    expect(meta.isPR).toBe(true);
    expect(meta.prNumber).toBe(13);
  });

  it("extracts AppVeyor metadata", () => {
    vi.stubEnv("APPVEYOR", "true");
    vi.stubEnv("APPVEYOR_REPO_BRANCH", "main");
    vi.stubEnv("APPVEYOR_REPO_COMMIT", "abcdef1234567890");
    vi.stubEnv("APPVEYOR_REPO_NAME", "acme/site");
    vi.stubEnv("APPVEYOR_PULL_REQUEST_NUMBER", "21");

    expect(detectProviderMeta()).toMatchObject({
      name: "appveyor",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      prNumber: 21,
    });
  });

  it("extracts Bitrise metadata from its BITRISEIO_-prefixed repo vars", () => {
    vi.stubEnv("BITRISE_IO", "true");
    vi.stubEnv("BITRISE_GIT_BRANCH", "main");
    vi.stubEnv("BITRISE_GIT_COMMIT", "abcdef1234567890");
    vi.stubEnv("BITRISEIO_GIT_REPOSITORY_OWNER", "acme");
    vi.stubEnv("BITRISEIO_GIT_REPOSITORY_SLUG", "site");
    vi.stubEnv("BITRISE_PULL_REQUEST", "3");

    expect(detectProviderMeta()).toMatchObject({
      name: "bitrise",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      prNumber: 3,
    });
  });

  it("extracts Cirrus CI metadata", () => {
    vi.stubEnv("CIRRUS_CI", "true");
    vi.stubEnv("CIRRUS_BRANCH", "main");
    vi.stubEnv("CIRRUS_CHANGE_IN_REPO", "abcdef1234567890");
    vi.stubEnv("CIRRUS_REPO_FULL_NAME", "acme/site");
    vi.stubEnv("CIRRUS_PR", "5");

    expect(detectProviderMeta()).toMatchObject({
      name: "cirrus",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      prNumber: 5,
    });
  });

  it("has no PR for Cirrus when CIRRUS_PR is unset", () => {
    vi.stubEnv("CIRRUS_CI", "true");

    const meta = detectProviderMeta();
    expect(meta.isPR).toBe(false);
    expect(meta.prNumber).toBeUndefined();
  });

  it("extracts Codefresh metadata via CF_PULL_REQUEST_ID", () => {
    vi.stubEnv("CF_BUILD_ID", "build-1");
    vi.stubEnv("CF_BRANCH", "main");
    vi.stubEnv("CF_REVISION", "abcdef1234567890");
    vi.stubEnv("CF_PULL_REQUEST_ID", "8");

    const meta = detectProviderMeta();
    expect(meta).toMatchObject({
      name: "codefresh",
      branch: "main",
      commitSha: "abcdef1234567890",
      isPR: true,
      prNumber: 8,
    });
  });

  it("extracts Drone metadata and detects PR builds via the build event", () => {
    vi.stubEnv("DRONE", "true");
    vi.stubEnv("DRONE_BUILD_EVENT", "pull_request");
    vi.stubEnv("DRONE_COMMIT_BRANCH", "main");
    vi.stubEnv("DRONE_COMMIT_SHA", "abcdef1234567890");
    vi.stubEnv("DRONE_REPO_OWNER", "acme");
    vi.stubEnv("DRONE_REPO_NAME", "site");
    vi.stubEnv("DRONE_PULL_REQUEST", "9");

    expect(detectProviderMeta()).toMatchObject({
      name: "drone",
      branch: "main",
      commitSha: "abcdef1234567890",
      repo: { owner: "acme", name: "site" },
      isPR: true,
      prNumber: 9,
    });
  });

  it("extracts Semaphore metadata via SEMAPHORE_GIT_PR_NUMBER", () => {
    vi.stubEnv("SEMAPHORE", "true");
    vi.stubEnv("SEMAPHORE_GIT_PR_NUMBER", "55");
    vi.stubEnv("SEMAPHORE_GIT_REPO_SLUG", "acme/site");
    vi.stubEnv("SEMAPHORE_GIT_BRANCH", "main");
    vi.stubEnv("SEMAPHORE_GIT_SHA", "abcdef1234567890");

    expect(detectProviderMeta()).toMatchObject({
      name: "semaphore",
      prNumber: 55,
      isPR: true,
      repo: { owner: "acme", name: "site" },
      branch: "main",
      commitSha: "abcdef1234567890",
    });
  });

  it("extracts Cloudflare Workers build metadata", () => {
    vi.stubEnv("WORKERS_CI", "1");
    vi.stubEnv("WORKERS_CI_BRANCH", "main");
    vi.stubEnv("WORKERS_CI_COMMIT_SHA", "abcdef1234567890");
    vi.stubEnv("WORKERS_CI_BUILD_UUID", "build-1");

    expect(detectProviderMeta()).toMatchObject({
      name: "cloudflare_workers",
      branch: "main",
      commitSha: "abcdef1234567890",
      runId: "build-1",
    });
  });

  it("returns only the name for a provider without extractors", () => {
    vi.stubEnv("CF_PAGES", "1");
    vi.stubEnv("CF_PAGES_BRANCH", "main");
    vi.stubEnv("CF_PAGES_COMMIT_SHA", "deadbeefcafebabe");
    vi.stubEnv("CF_PAGES_URL", "https://abc123.example.pages.dev");

    expect(detectProviderMeta()).toMatchObject({
      name: "cloudflare_pages",
      branch: "main",
      commitSha: "deadbeefcafebabe",
      deployUrl: "https://abc123.example.pages.dev",
    });
  });
});
