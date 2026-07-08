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
  "NETLIFY",
  "CONTEXT",
  "PULL_REQUEST",
  "REPOSITORY_URL",
  "HEAD",
  "DEPLOY_URL",
  "VERCEL",
  "NOW_BUILDER",
  "VERCEL_ENV",
  "VERCEL_GIT_REPO_OWNER",
  "VERCEL_GIT_REPO_SLUG",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_PULL_REQUEST_ID",
  "CF_PAGES",
  "CF_PAGES_BRANCH",
  "CF_PAGES_COMMIT_SHA",
  "CIRCLECI",
  "CIRCLE_PULL_REQUEST",
  "CIRCLE_REPOSITORY_URL",
  "CIRCLE_BRANCH",
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

  it("normalizes the Netlify deploy-preview context to preview", () => {
    vi.stubEnv("NETLIFY", "true");
    vi.stubEnv("CONTEXT", "deploy-preview");
    vi.stubEnv("PULL_REQUEST", "true");
    vi.stubEnv("HEAD", "topic-branch");
    vi.stubEnv("DEPLOY_URL", "https://deploy-preview-1--example.netlify.app");

    expect(detectProviderMeta()).toMatchObject({
      name: "netlify",
      environment: "preview",
      isPR: true,
      branch: "topic-branch",
      buildUrl: "https://deploy-preview-1--example.netlify.app",
    });
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

  it("returns only the name for a provider without extractors", () => {
    vi.stubEnv("CF_PAGES", "1");
    vi.stubEnv("CF_PAGES_BRANCH", "main");
    vi.stubEnv("CF_PAGES_COMMIT_SHA", "deadbeefcafebabe");

    expect(detectProviderMeta()).toMatchObject({
      name: "cloudflare_pages",
      branch: "main",
      commitSha: "deadbeefcafebabe",
    });
  });
});
