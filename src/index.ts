import { detectProvider, ProviderName } from "./providers";

export type { ProviderName, ProviderInfo } from "./providers";

const processShim: typeof process = typeof process !== "undefined" ? process : {} as typeof process;
const envShim = processShim.env || {} as typeof process;
const providerInfo = detectProvider(envShim);
const nodeENV = envShim.NODE_ENV || "";

/** Value of process.platform */
export const platform = processShim.platform;

/** Current provider name */
export const provider: ProviderName = providerInfo.name;

/** Detect if `CI` environment variable is set or a provider CI detected */
export const isCI = toBoolean(envShim.CI) || providerInfo.ci !== false;

/** Detect if stdout.TTY is available */
export const hasTTY = toBoolean(processShim.stdout && processShim.stdout.isTTY);

/** Detect if global `window` object is available */
export const hasWindow = typeof window !== "undefined";

/** Detect if `DEBUG` environment variable is set */
export const isDebug = toBoolean(envShim.DEBUG);

/** Detect if `NODE_ENV` environment variable is `test` */
export const isTest = toBoolean(envShim.TEST);

/** Detect if `NODE_ENV` environment variable is `production` */
export const isProduction = nodeENV === "production";

/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
export const isDevelopment = nodeENV === "dev" || nodeENV === "development";

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal = toBoolean(envShim.MINIMAL) || isCI || isTest || !hasTTY;

/** Detect if process.platform is Windows */
export const isWindows = /^win/i.test(platform);

/** Detect if process.platform is Linux */
export const isLinux = /^linux/i.test(platform);

/** Detect if process.platform is macOS (darwin kernel) */
export const isMacOS = /^darwin/i.test(platform);

// -- Utils --

function toBoolean (val) {
  return val ? (val !== "false") : false;
}
