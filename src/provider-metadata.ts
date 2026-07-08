// Adapted from https://github.com/dmno-dev/varlock (@varlock/ci-env-info) — the
// per-provider env var mappings and normalization logic originate there.
//
// This module intentionally lives separately from `providers.ts`: provider
// *detection* (`provider`, `isCI`, `providerInfo`) stays lean and free of
// per-provider extractor closures, so consumers that only need to know "am I in
// CI" do not pull in the metadata engine below. Detection is reused via
// `detectProvider()` as the single source of truth for the provider name.

import { env } from "./env.ts";
import { detectProvider, type ProviderName } from "./providers.ts";

type Env = Record<string, string | undefined>;

/**
 * A repository reference split into its owner and name.
 */
export type RepoInfo = {
  owner: string;
  name: string;
};

/**
 * A normalized deployment environment.
 *
 * Platform-specific values (e.g. Netlify's `CONTEXT`, Vercel's `VERCEL_ENV`) are
 * mapped onto this small set of well-known names.
 */
export type DeploymentEnvironment =
  | (string & {})
  | "development"
  | "preview"
  | "staging"
  | "production"
  | "test";

/**
 * Normalized git / build metadata extracted from the current CI/CD or deployment
 * provider's environment variables.
 *
 * Every field except `name` is optional — availability depends on the provider
 * and the current event (e.g. `prNumber` is only set for pull request builds).
 */
export type ProviderMetadata = {
  /**
   * The name of the detected provider. See {@link ProviderName}. Empty string if
   * no provider was detected.
   */
  name: ProviderName;

  /** Repository owner/name, when derivable from the environment. */
  repo?: RepoInfo;

  /** Convenience `owner/name` slug, when {@link ProviderMetadata.repo} is set. */
  repoSlug?: string;

  /** Branch name (refs like `refs/heads/foo` are normalized to `foo`). */
  branch?: string;

  /** Full commit SHA. */
  commitSha?: string;

  /** Commit SHA shortened to 7 characters. */
  commitShaShort?: string;

  /** Whether the current build is for a pull/merge request. */
  isPR?: boolean;

  /** Pull/merge request number, when the build is for one. */
  prNumber?: number;

  /** Normalized deployment environment. */
  environment?: DeploymentEnvironment;

  /** URL to the build/run/deploy in the provider's UI. */
  buildUrl?: string;

  /** Unique run/build id (e.g. `GITHUB_RUN_ID`). */
  runId?: string;

  /** User or app that triggered the run (e.g. `GITHUB_ACTOR`). */
  actor?: string;

  /** Event type that triggered the run (e.g. `push`, `pull_request`). */
  eventName?: string;

  /** Workflow or pipeline name. */
  workflowName?: string;
};

/** String = env var name (value passed to the field's default parser); function = custom extractor. */
type Extractor<T> = string | ((env: Env) => T | undefined);

/** Inline env var + value map used to normalize a deployment environment. */
type EnvironmentMap = { var: string; map: Record<string, DeploymentEnvironment> };

type ProviderExtractors = {
  repo?: Extractor<RepoInfo>;
  branch?: Extractor<string>;
  commitSha?: Extractor<string>;
  prNumber?: Extractor<number>;
  /** Env var name (truthy = PR) or function; falls back to inferring from `prNumber`. */
  isPR?: string | ((env: Env) => boolean);
  environment?: Extractor<DeploymentEnvironment> | EnvironmentMap;
  buildUrl?: Extractor<string>;
  runId?: Extractor<string>;
  actor?: Extractor<string>;
  eventName?: Extractor<string>;
  workflowName?: Extractor<string>;
};

// Keyed by the same lowercase provider names used in `providers.ts`, so
// `detectProvider()` selects the entry. Providers without git/build metadata are
// simply omitted.
const extractors: Partial<Record<ProviderName, ProviderExtractors>> = {
  cloudflare_pages: {
    branch: "CF_PAGES_BRANCH",
    commitSha: "CF_PAGES_COMMIT_SHA",
    buildUrl: "CF_PAGES_URL",
  },
  cloudflare_workers: {
    branch: "WORKERS_CI_BRANCH",
    commitSha: "WORKERS_CI_COMMIT_SHA",
    runId: "WORKERS_CI_BUILD_UUID",
  },
  github_actions: {
    isPR: (env) => env.GITHUB_EVENT_NAME === "pull_request",
    // GitHub Actions has no dedicated PR-number env var; it lives in the
    // `refs/pull/<n>/merge` ref. Only parse it from an actual pull ref so branch
    // names ending in digits are not mistaken for PR numbers.
    prNumber: (env) =>
      env.GITHUB_REF?.startsWith("refs/pull/") ? parsePrNumber(env.GITHUB_REF) : undefined,
    repo: (env) => parseRepoSlug(env.GITHUB_REPOSITORY),
    // On PRs GITHUB_HEAD_REF is the short source branch; otherwise GITHUB_REF_NAME
    // is already the short branch/tag name. Fall back to parsing the raw ref.
    branch: (env) => env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || refToBranch(env.GITHUB_REF),
    commitSha: "GITHUB_SHA",
    runId: "GITHUB_RUN_ID",
    buildUrl: (env) => {
      const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_RUN_ID: runId } = env;
      return server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined;
    },
    workflowName: "GITHUB_WORKFLOW",
    actor: "GITHUB_ACTOR",
    eventName: "GITHUB_EVENT_NAME",
  },
  gitlab: {
    isPR: "CI_MERGE_REQUEST_ID",
    // IID is the project-scoped, user-facing MR number (the `!123` in the UI);
    // CI_MERGE_REQUEST_ID is an instance-wide internal id.
    prNumber: "CI_MERGE_REQUEST_IID",
    repo: (env) => {
      const parts = (env.CI_PROJECT_PATH || "").split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts.slice(0, -1).join("/"), name: parts[parts.length - 1]! };
      }
      return parts.length === 1 ? { owner: parts[0]!, name: parts[0]! } : undefined;
    },
    branch: "CI_COMMIT_REF_NAME",
    commitSha: "CI_COMMIT_SHA",
    runId: "CI_PIPELINE_ID",
    buildUrl: "CI_PIPELINE_URL",
  },
  netlify: {
    isPR: (env) => env.PULL_REQUEST !== undefined && env.PULL_REQUEST !== "false",
    repo: (env) => parseRepoSlug(env.REPOSITORY_URL),
    branch: (env) => env.HEAD || env.BRANCH,
    commitSha: "COMMIT_REF",
    runId: "BUILD_ID",
    // DEPLOY_URL is already a fully-qualified `https://` URL — use it verbatim.
    buildUrl: "DEPLOY_URL",
    environment: {
      var: "CONTEXT",
      map: {
        production: "production",
        "deploy-preview": "preview",
        "branch-deploy": "preview",
        dev: "development",
      },
    },
  },
  vercel: {
    isPR: "VERCEL_GIT_PULL_REQUEST_ID",
    prNumber: "VERCEL_GIT_PULL_REQUEST_ID",
    repo: (env) => {
      const owner = env.VERCEL_GIT_REPO_OWNER;
      const name = env.VERCEL_GIT_REPO_SLUG;
      return owner && name ? { owner, name } : parseRepoSlug(env.VERCEL_GIT_REPO_SLUG);
    },
    branch: "VERCEL_GIT_COMMIT_REF",
    commitSha: "VERCEL_GIT_COMMIT_SHA",
    buildUrl: (env) => (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined),
    environment: "VERCEL_ENV",
    runId: "VERCEL_DEPLOYMENT_ID",
  },
  codebuild: {
    isPR: (env) =>
      ["PULL_REQUEST_CREATED", "PULL_REQUEST_UPDATED", "PULL_REQUEST_REOPENED"].includes(
        env.CODEBUILD_WEBHOOK_EVENT || "",
      ),
    repo: (env) => parseRepoSlug(env.CODEBUILD_SOURCE_REPO_URL),
    branch: (env) => refToBranch(env.CODEBUILD_WEBHOOK_HEAD_REF),
    commitSha: "CODEBUILD_RESOLVED_SOURCE_VERSION",
  },
  azure_pipelines: {
    isPR: (env) => env.BUILD_REASON === "PullRequest",
    // For GitHub-based PRs, PULLREQUESTID is Azure's internal id; PULLREQUESTNUMBER
    // is the user-facing number. They coincide for Azure Repos, so fall back to id.
    prNumber: (env) =>
      parsePrNumber(env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER) ??
      parsePrNumber(env.SYSTEM_PULLREQUEST_PULLREQUESTID),
    branch: "BUILD_SOURCEBRANCHNAME",
    commitSha: "BUILD_SOURCEVERSION",
  },
  bitbucket: {
    isPR: "BITBUCKET_PR_ID",
    prNumber: "BITBUCKET_PR_ID",
    repo: (env) => {
      // BITBUCKET_REPO_OWNER is deprecated in favor of BITBUCKET_WORKSPACE.
      const owner = env.BITBUCKET_WORKSPACE || env.BITBUCKET_REPO_FULL_NAME?.split("/")[0];
      const name = env.BITBUCKET_REPO_FULL_NAME?.split("/").pop() || env.BITBUCKET_REPO_SLUG;
      return owner && name ? { owner, name } : parseRepoSlug(env.BITBUCKET_REPO_FULL_NAME);
    },
    branch: "BITBUCKET_BRANCH",
    commitSha: "BITBUCKET_COMMIT",
  },
  buildkite: {
    isPR: (env) =>
      env.BUILDKITE_PULL_REQUEST !== undefined && env.BUILDKITE_PULL_REQUEST !== "false",
    prNumber: "BUILDKITE_PULL_REQUEST",
    repo: (env) => parseRepoSlug(env.BUILDKITE_REPO),
    branch: "BUILDKITE_BRANCH",
    commitSha: "BUILDKITE_COMMIT",
    runId: "BUILDKITE_BUILD_ID",
    buildUrl: "BUILDKITE_BUILD_URL",
  },
  circle: {
    isPR: "CIRCLE_PULL_REQUEST",
    prNumber: "CIRCLE_PULL_REQUEST",
    repo: (env) => parseRepoSlug(env.CIRCLE_REPOSITORY_URL),
    branch: "CIRCLE_BRANCH",
    commitSha: "CIRCLE_SHA1",
    runId: "CIRCLE_BUILD_NUM",
    buildUrl: "CIRCLE_BUILD_URL",
  },
  jenkins: {
    isPR: (env) => !!(env.ghprbPullId || env.CHANGE_ID),
    prNumber: (env) => parsePrNumber(env.ghprbPullId || env.CHANGE_ID),
  },
  render: {
    isPR: (env) => env.IS_PULL_REQUEST === "true",
    repo: (env) => parseRepoSlug(env.RENDER_GIT_REPO_SLUG),
    branch: "RENDER_GIT_BRANCH",
    commitSha: "RENDER_GIT_COMMIT",
  },
  travis: {
    isPR: (env) => env.TRAVIS_PULL_REQUEST !== undefined && env.TRAVIS_PULL_REQUEST !== "false",
    prNumber: "TRAVIS_PULL_REQUEST",
    repo: (env) => parseRepoSlug(env.TRAVIS_REPO_SLUG),
    // On PR builds this is the target branch the PR is merging into.
    branch: "TRAVIS_BRANCH",
    commitSha: "TRAVIS_COMMIT",
  },
  appveyor: {
    isPR: "APPVEYOR_PULL_REQUEST_NUMBER",
    prNumber: "APPVEYOR_PULL_REQUEST_NUMBER",
    repo: (env) => parseRepoSlug(env.APPVEYOR_REPO_NAME),
    // On PR builds this is the base branch the PR is merging into.
    branch: "APPVEYOR_REPO_BRANCH",
    commitSha: "APPVEYOR_REPO_COMMIT",
  },
  bitrise: {
    isPR: "BITRISE_PULL_REQUEST",
    prNumber: "BITRISE_PULL_REQUEST",
    repo: (env) => {
      const owner = env.BITRISEIO_GIT_REPOSITORY_OWNER;
      const name = env.BITRISEIO_GIT_REPOSITORY_SLUG;
      return owner && name ? { owner, name } : undefined;
    },
    branch: "BITRISE_GIT_BRANCH",
    commitSha: "BITRISE_GIT_COMMIT",
  },
  cirrus: {
    isPR: "CIRRUS_PR",
    prNumber: "CIRRUS_PR",
    repo: (env) => parseRepoSlug(env.CIRRUS_REPO_FULL_NAME),
    branch: "CIRRUS_BRANCH",
    commitSha: "CIRRUS_CHANGE_IN_REPO",
  },
  codefresh: {
    isPR: (env) => !!(env.CF_PULL_REQUEST_NUMBER || env.CF_PULL_REQUEST_ID),
    prNumber: (env) => parsePrNumber(env.CF_PULL_REQUEST_NUMBER || env.CF_PULL_REQUEST_ID),
    branch: "CF_BRANCH",
    commitSha: "CF_REVISION",
  },
  drone: {
    isPR: (env) => env.DRONE_BUILD_EVENT === "pull_request",
    prNumber: "DRONE_PULL_REQUEST",
    repo: (env) => {
      if (env.DRONE_REPO) return parseRepoSlug(env.DRONE_REPO);
      const owner = env.DRONE_REPO_OWNER;
      const name = env.DRONE_REPO_NAME;
      return owner && name ? { owner, name } : undefined;
    },
    branch: "DRONE_COMMIT_BRANCH",
    commitSha: "DRONE_COMMIT_SHA",
  },
  semaphore: {
    isPR: "SEMAPHORE_GIT_PR_NUMBER",
    prNumber: "SEMAPHORE_GIT_PR_NUMBER",
    repo: (env) => parseRepoSlug(env.SEMAPHORE_GIT_REPO_SLUG),
    // On PR builds this is the target branch; SEMAPHORE_GIT_PR_BRANCH is the source.
    branch: "SEMAPHORE_GIT_BRANCH",
    commitSha: "SEMAPHORE_GIT_SHA",
  },
};

/**
 * Detects the current provider (via {@link detectProvider}) and extracts
 * normalized git / build metadata from its environment variables.
 */
export function detectProviderMetadata(): ProviderMetadata {
  const name = detectProvider().name;
  const meta: ProviderMetadata = { name };

  const ext = extractors[name];
  if (!ext) return meta;

  const repo = runExtractor<RepoInfo>(ext.repo, "repo");
  if (repo) {
    meta.repo = repo;
    meta.repoSlug = `${repo.owner}/${repo.name}`;
  }

  const branch = runExtractor<string>(ext.branch, "branch");
  if (branch) meta.branch = branch;

  const commitSha = runExtractor<string>(ext.commitSha, "commitSha");
  if (commitSha) {
    meta.commitSha = commitSha;
    meta.commitShaShort = shortSha(commitSha);
  }

  const prNumber = runExtractor<number>(ext.prNumber, "prNumber");
  if (prNumber !== undefined) meta.prNumber = prNumber;

  if (ext.isPR !== undefined) {
    meta.isPR = typeof ext.isPR === "string" ? !!env[ext.isPR] : ext.isPR(env);
  } else if (prNumber !== undefined) {
    meta.isPR = true;
  }

  const environment = runEnvironment(ext.environment);
  if (environment) meta.environment = environment;

  const buildUrl = runExtractor<string>(ext.buildUrl, "buildUrl");
  if (buildUrl) meta.buildUrl = buildUrl;

  const runId = runExtractor<string>(ext.runId, "runId");
  if (runId) meta.runId = runId;

  const actor = runExtractor<string>(ext.actor, "actor");
  if (actor) meta.actor = actor;

  const eventName = runExtractor<string>(ext.eventName, "eventName");
  if (eventName) meta.eventName = eventName;

  const workflowName = runExtractor<string>(ext.workflowName, "workflowName");
  if (workflowName) meta.workflowName = workflowName;

  return meta;
}

/**
 * Normalized git / build metadata for the current execution context.
 * This value is evaluated once at module initialisation.
 */
export const providerMetadata: ProviderMetadata = /* #__PURE__ */ detectProviderMetadata();

// --- internals ---

function runExtractor<T>(
  ext: Extractor<T> | undefined,
  field: "repo" | "branch" | "prNumber" | "commitSha" | (string & {}),
): T | undefined {
  if (ext === undefined) return undefined;
  if (typeof ext === "function") return ext(env);
  const raw = env[ext];
  if (raw === undefined || raw === "") return undefined;
  switch (field) {
    case "repo":
      return parseRepoSlug(raw) as T | undefined;
    case "branch":
      return (refToBranch(raw) ?? raw) as T;
    case "prNumber":
      return parsePrNumber(raw) as T | undefined;
    default:
      return raw as T;
  }
}

function runEnvironment(ext: ProviderExtractors["environment"]): DeploymentEnvironment | undefined {
  if (ext === undefined) return undefined;
  if (typeof ext === "function") return ext(env);
  if (typeof ext === "string") return env[ext] || undefined;
  return mapEnvironment(env[ext.var], ext.map);
}

/**
 * Parse a git ref into a short branch name.
 * - `refs/heads/feat/foo` → `feat/foo`
 * - `refs/pull/123/merge` → undefined (PR merge ref; not a branch name)
 */
function refToBranch(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  const s = ref.trim();
  if (s.startsWith("refs/heads/")) return s.slice("refs/heads/".length);
  if (s.startsWith("refs/head/")) return s.slice("refs/head/".length);
  if (s.startsWith("refs/pull/")) return undefined;
  return s;
}

/**
 * Parse an `owner/repo` string (or a git/https URL ending in one) into {@link RepoInfo}.
 */
function parseRepoSlug(input: string | undefined): RepoInfo | undefined {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;
  let slug = trimmed;
  try {
    if (trimmed.includes("://") || trimmed.startsWith("git@")) {
      const url = new URL(trimmed.replace(/^git@([^:]+):/, "https://$1/"));
      const path = url.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
      const parts = path.split("/");
      if (parts.length >= 2) slug = `${parts[0]}/${parts[1]}`;
    }
  } catch {
    // not a URL, use as-is
  }
  const idx = slug.indexOf("/");
  if (idx <= 0 || idx === slug.length - 1) return undefined;
  const owner = slug.slice(0, idx);
  const name = slug.slice(idx + 1).replace(/\.git$/, "");
  return owner && name ? { owner, name } : undefined;
}

/**
 * Parse a PR number from a string or a URL ending in `/pull/<n>`.
 */
function parsePrNumber(value: string | undefined): number | undefined {
  const s = value?.trim();
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  if (!Number.isNaN(n) && n > 0) return n;
  const match = s.match(/\/pull\/(\d+)(?:\/|$)/) || s.match(/(\d+)$/);
  if (match) {
    const num = Number.parseInt(match[1]!, 10);
    if (!Number.isNaN(num) && num > 0) return num;
  }
  return undefined;
}

/** Shorten a commit SHA to 7 characters. */
function shortSha(sha: string | undefined): string | undefined {
  const s = sha?.trim();
  if (!s) return undefined;
  return s.length >= 7 ? s.slice(0, 7) : s;
}

/** Map a platform-specific value onto a normalized deployment environment (case-insensitive). */
function mapEnvironment(
  value: string | undefined,
  map: Record<string, DeploymentEnvironment>,
): DeploymentEnvironment | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return map[trimmed.toLowerCase()] ?? map[trimmed];
}
