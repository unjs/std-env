// oxlint-disable no-sparse-arrays -- extractor tuples use `,,` holes for fields
// a provider cannot supply; see the `ProviderExtractors` comment.

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

// A positional tuple rather than a keyed object: property keys are never
// minified, so with ~18 providers the repeated field names would add up in the
// bundle. Fields a provider cannot supply are elided (`,` holes mid-tuple,
// nothing at the tail). The labels below are the single source for the order —
// `detectProviderMetadata()` destructures in the same order.
// `isPR` is an env var name (truthy and not `"false"` = PR) or a function;
// when omitted it is inferred from `prNumber`.
type ProviderExtractors = [
  branch?: Extractor<string>,
  commitSha?: Extractor<string>,
  repo?: Extractor<RepoInfo>,
  isPR?: string | ((env: Env) => boolean),
  prNumber?: Extractor<number>,
  buildUrl?: Extractor<string>,
  runId?: Extractor<string>,
  environment?: Extractor<DeploymentEnvironment> | EnvironmentMap,
  actor?: Extractor<string>,
  eventName?: Extractor<string>,
  workflowName?: Extractor<string>,
];

// Keyed by the same lowercase provider names used in `providers.ts`, so
// `detectProvider()` selects the entry. Providers without git/build metadata are
// simply omitted.
// Tuple order: [branch, commitSha, repo, isPR, prNumber, buildUrl, runId, environment, actor, eventName, workflowName]
const extractors: Partial<Record<ProviderName, ProviderExtractors>> = {
  cloudflare_pages: ["CF_PAGES_BRANCH", "CF_PAGES_COMMIT_SHA", , , , "CF_PAGES_URL"],
  cloudflare_workers: [
    "WORKERS_CI_BRANCH",
    "WORKERS_CI_COMMIT_SHA",
    ,
    ,
    ,
    ,
    "WORKERS_CI_BUILD_UUID",
  ],
  github_actions: [
    // On PRs GITHUB_HEAD_REF is the short source branch; otherwise GITHUB_REF_NAME
    // is already the short branch/tag name. Fall back to parsing the raw ref.
    (env) => env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || refToBranch(env.GITHUB_REF),
    "GITHUB_SHA",
    "GITHUB_REPOSITORY",
    (env) => env.GITHUB_EVENT_NAME === "pull_request",
    // GitHub Actions has no dedicated PR-number env var; it lives in the
    // `refs/pull/<n>/merge` ref. Only parse it from an actual pull ref so branch
    // names ending in digits are not mistaken for PR numbers.
    (env) => (env.GITHUB_REF?.startsWith("refs/pull/") ? parsePrNumber(env.GITHUB_REF) : undefined),
    (env) => {
      const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_RUN_ID: runId } = env;
      return server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined;
    },
    "GITHUB_RUN_ID",
    ,
    "GITHUB_ACTOR",
    "GITHUB_EVENT_NAME",
    "GITHUB_WORKFLOW",
  ],
  gitlab: [
    "CI_COMMIT_REF_NAME",
    "CI_COMMIT_SHA",
    (env) => {
      const parts = (env.CI_PROJECT_PATH || "").split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts.slice(0, -1).join("/"), name: parts[parts.length - 1]! };
      }
      return parts.length === 1 ? { owner: parts[0]!, name: parts[0]! } : undefined;
    },
    "CI_MERGE_REQUEST_ID",
    // IID is the project-scoped, user-facing MR number (the `!123` in the UI);
    // CI_MERGE_REQUEST_ID is an instance-wide internal id.
    "CI_MERGE_REQUEST_IID",
    "CI_PIPELINE_URL",
    "CI_PIPELINE_ID",
  ],
  netlify: [
    (env) => env.HEAD || env.BRANCH,
    "COMMIT_REF",
    "REPOSITORY_URL",
    "PULL_REQUEST",
    ,
    // DEPLOY_URL is already a fully-qualified `https://` URL — use it verbatim.
    "DEPLOY_URL",
    "BUILD_ID",
    {
      var: "CONTEXT",
      map: {
        production: "production",
        "deploy-preview": "preview",
        "branch-deploy": "preview",
        dev: "development",
      },
    },
  ],
  vercel: [
    "VERCEL_GIT_COMMIT_REF",
    "VERCEL_GIT_COMMIT_SHA",
    (env) => {
      const owner = env.VERCEL_GIT_REPO_OWNER;
      const name = env.VERCEL_GIT_REPO_SLUG;
      return owner && name ? { owner, name } : parseRepoSlug(env.VERCEL_GIT_REPO_SLUG);
    },
    "VERCEL_GIT_PULL_REQUEST_ID",
    "VERCEL_GIT_PULL_REQUEST_ID",
    (env) => (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined),
    "VERCEL_DEPLOYMENT_ID",
    "VERCEL_ENV",
  ],
  codebuild: [
    "CODEBUILD_WEBHOOK_HEAD_REF",
    "CODEBUILD_RESOLVED_SOURCE_VERSION",
    "CODEBUILD_SOURCE_REPO_URL",
    (env) =>
      ["PULL_REQUEST_CREATED", "PULL_REQUEST_UPDATED", "PULL_REQUEST_REOPENED"].includes(
        env.CODEBUILD_WEBHOOK_EVENT || "",
      ),
  ],
  azure_pipelines: [
    "BUILD_SOURCEBRANCHNAME",
    "BUILD_SOURCEVERSION",
    ,
    (env) => env.BUILD_REASON === "PullRequest",
    // For GitHub-based PRs, PULLREQUESTID is Azure's internal id; PULLREQUESTNUMBER
    // is the user-facing number. They coincide for Azure Repos, so fall back to id.
    (env) =>
      parsePrNumber(env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER) ??
      parsePrNumber(env.SYSTEM_PULLREQUEST_PULLREQUESTID),
  ],
  bitbucket: [
    "BITBUCKET_BRANCH",
    "BITBUCKET_COMMIT",
    (env) => {
      // BITBUCKET_REPO_OWNER is deprecated in favor of BITBUCKET_WORKSPACE.
      const owner = env.BITBUCKET_WORKSPACE || env.BITBUCKET_REPO_FULL_NAME?.split("/")[0];
      const name = env.BITBUCKET_REPO_FULL_NAME?.split("/").pop() || env.BITBUCKET_REPO_SLUG;
      return owner && name ? { owner, name } : parseRepoSlug(env.BITBUCKET_REPO_FULL_NAME);
    },
    "BITBUCKET_PR_ID",
    "BITBUCKET_PR_ID",
  ],
  buildkite: [
    "BUILDKITE_BRANCH",
    "BUILDKITE_COMMIT",
    "BUILDKITE_REPO",
    "BUILDKITE_PULL_REQUEST",
    "BUILDKITE_PULL_REQUEST",
    "BUILDKITE_BUILD_URL",
    "BUILDKITE_BUILD_ID",
  ],
  circle: [
    "CIRCLE_BRANCH",
    "CIRCLE_SHA1",
    "CIRCLE_REPOSITORY_URL",
    "CIRCLE_PULL_REQUEST",
    "CIRCLE_PULL_REQUEST",
    "CIRCLE_BUILD_URL",
    "CIRCLE_BUILD_NUM",
  ],
  jenkins: [
    ,
    ,
    ,
    (env) => !!(env.ghprbPullId || env.CHANGE_ID),
    (env) => parsePrNumber(env.ghprbPullId || env.CHANGE_ID),
  ],
  render: ["RENDER_GIT_BRANCH", "RENDER_GIT_COMMIT", "RENDER_GIT_REPO_SLUG", "IS_PULL_REQUEST"],
  travis: [
    // On PR builds this is the target branch the PR is merging into.
    "TRAVIS_BRANCH",
    "TRAVIS_COMMIT",
    "TRAVIS_REPO_SLUG",
    "TRAVIS_PULL_REQUEST",
    "TRAVIS_PULL_REQUEST",
  ],
  appveyor: [
    // On PR builds this is the base branch the PR is merging into.
    "APPVEYOR_REPO_BRANCH",
    "APPVEYOR_REPO_COMMIT",
    "APPVEYOR_REPO_NAME",
    "APPVEYOR_PULL_REQUEST_NUMBER",
    "APPVEYOR_PULL_REQUEST_NUMBER",
  ],
  bitrise: [
    "BITRISE_GIT_BRANCH",
    "BITRISE_GIT_COMMIT",
    (env) => {
      const owner = env.BITRISEIO_GIT_REPOSITORY_OWNER;
      const name = env.BITRISEIO_GIT_REPOSITORY_SLUG;
      return owner && name ? { owner, name } : undefined;
    },
    "BITRISE_PULL_REQUEST",
    "BITRISE_PULL_REQUEST",
  ],
  cirrus: [
    "CIRRUS_BRANCH",
    "CIRRUS_CHANGE_IN_REPO",
    "CIRRUS_REPO_FULL_NAME",
    "CIRRUS_PR",
    "CIRRUS_PR",
  ],
  codefresh: [
    "CF_BRANCH",
    "CF_REVISION",
    ,
    (env) => !!(env.CF_PULL_REQUEST_NUMBER || env.CF_PULL_REQUEST_ID),
    (env) => parsePrNumber(env.CF_PULL_REQUEST_NUMBER || env.CF_PULL_REQUEST_ID),
  ],
  drone: [
    "DRONE_COMMIT_BRANCH",
    "DRONE_COMMIT_SHA",
    (env) => {
      if (env.DRONE_REPO) return parseRepoSlug(env.DRONE_REPO);
      const owner = env.DRONE_REPO_OWNER;
      const name = env.DRONE_REPO_NAME;
      return owner && name ? { owner, name } : undefined;
    },
    (env) => env.DRONE_BUILD_EVENT === "pull_request",
    "DRONE_PULL_REQUEST",
  ],
  semaphore: [
    // On PR builds this is the target branch; SEMAPHORE_GIT_PR_BRANCH is the source.
    "SEMAPHORE_GIT_BRANCH",
    "SEMAPHORE_GIT_SHA",
    "SEMAPHORE_GIT_REPO_SLUG",
    "SEMAPHORE_GIT_PR_NUMBER",
    "SEMAPHORE_GIT_PR_NUMBER",
  ],
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

  const [branch, commitSha, repo, isPR, prNumber, buildUrl, runId, environment, ...rest] = ext;

  const repoInfo = runExtractor(repo, parseRepoSlug);
  if (repoInfo) {
    meta.repo = repoInfo;
    meta.repoSlug = `${repoInfo.owner}/${repoInfo.name}`;
  }

  const branchName = runExtractor(branch, (raw) => refToBranch(raw) ?? raw);
  if (branchName) meta.branch = branchName;

  const sha = runExtractor(commitSha);
  if (sha) {
    meta.commitSha = sha;
    meta.commitShaShort = shortSha(sha);
  }

  const pr = runExtractor(prNumber, parsePrNumber);
  if (pr !== undefined) meta.prNumber = pr;

  if (isPR === undefined) {
    if (pr !== undefined) meta.isPR = true;
  } else if (typeof isPR === "string") {
    const raw = env[isPR];
    // Providers like Travis/Buildkite set the var to the literal string "false"
    // on non-PR builds.
    meta.isPR = !!raw && raw !== "false";
  } else {
    meta.isPR = isPR(env);
  }

  const environmentName = runEnvironment(environment);
  if (environmentName) meta.environment = environmentName;

  const [actor, eventName, workflowName] = rest;
  const plainFields = { buildUrl, runId, actor, eventName, workflowName };
  for (const field of Object.keys(plainFields) as (keyof typeof plainFields)[]) {
    const value = runExtractor(plainFields[field]);
    if (value) meta[field] = value;
  }

  return meta;
}

/**
 * Normalized git / build metadata for the current execution context.
 * This value is evaluated once at module initialisation.
 */
export const providerMetadata: ProviderMetadata = /* #__PURE__ */ detectProviderMetadata();

// --- internals ---

function runExtractor<T = string>(
  ext: Extractor<T> | undefined,
  parse?: (raw: string) => T | undefined,
): T | undefined {
  if (ext === undefined) return undefined;
  if (typeof ext === "function") return ext(env);
  const raw = env[ext];
  if (raw === undefined || raw === "") return undefined;
  return parse ? parse(raw) : (raw as T);
}

function runEnvironment(
  ext: Extractor<DeploymentEnvironment> | EnvironmentMap | undefined,
): DeploymentEnvironment | undefined {
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
