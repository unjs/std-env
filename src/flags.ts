import { detectProvider, ProviderName } from "./providers";
import { env, nodeENV } from "./env";
import { toBoolean } from "./_utils";
import { _process } from "./process";

/** Value of process.platform */
export const platform = _process.platform || "";

/** Current provider info */
export const providerInfo = detectProvider(env, _process);
export const provider: ProviderName = providerInfo.name;

/** Detect if `CI` environment variable is set or a provider CI detected */
export const isCI = toBoolean(env.CI) || providerInfo.ci !== false;

/** Detect if stdout.TTY is available */
export const hasTTY = toBoolean(_process.stdout && _process.stdout.isTTY);

/** Detect if global `window` object is available */
export const hasWindow = typeof window !== "undefined";

/** Detect if `DEBUG` environment variable is set */
export const isDebug = toBoolean(env.DEBUG);

/** Detect if `NODE_ENV` environment variable is `test` */
export const isTest = nodeENV === "test" || toBoolean(env.TEST);

/** Detect if `NODE_ENV` environment variable is `production` */
export const isProduction = nodeENV === "production";

/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
export const isDevelopment = nodeENV === "dev" || nodeENV === "development";

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal = toBoolean(env.MINIMAL) || isCI || isTest || !hasTTY;

/** Detect if process.platform is Windows */
export const isWindows = /^win/i.test(platform);

/** Detect if process.platform is Linux */
export const isLinux = /^linux/i.test(platform);

/** Detect if process.platform is macOS (darwin kernel) */
export const isMacOS = /^darwin/i.test(platform);

/** Color Support */
export const isColorSupported =
  !toBoolean(env.NO_COLOR) &&
  (toBoolean(env.FORCE_COLOR) ||
    (isWindows && !(env.TERM === "dumb")) ||
    (hasTTY && env.TERM && !(env.TERM !== "dumb")) ||
    isCI);

/** Node.js versions */
export const nodeVersion =
  (_process.versions?.node || "").replace(/^v/, "") || null;
export const nodeMajorVersion = Number(nodeVersion?.split(".")[0]) || null;
