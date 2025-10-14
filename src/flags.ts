import { providerInfo } from "./providers.ts";
import { env, nodeENV } from "./env.ts";
import { toBoolean } from "./_utils.ts";

/** Value of process.platform */
export const platform: string = globalThis.process?.platform || "";

/** Detect if `CI` environment variable is set or a provider CI detected */
export const isCI: boolean = toBoolean(env.CI) || providerInfo.ci !== false;

/** Detect if stdout.TTY is available */
export const hasTTY: boolean = toBoolean(
  globalThis.process?.stdout && globalThis.process?.stdout.isTTY,
);

/** Detect if global `window` object is available */
// eslint-disable-next-line unicorn/prefer-global-this
export const hasWindow: boolean = typeof window !== "undefined";

/** Detect if `DEBUG` environment variable is set */
export const isDebug: boolean = toBoolean(env.DEBUG);

/** Detect if `NODE_ENV` environment variable is `test` */
export const isTest: boolean = nodeENV === "test" || toBoolean(env.TEST);

/** Detect if `NODE_ENV` environment variable is `production` */
export const isProduction: boolean = nodeENV === "production";

/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
export const isDevelopment: boolean =
  nodeENV === "dev" || nodeENV === "development";

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal: boolean =
  toBoolean(env.MINIMAL) || isCI || isTest || !hasTTY;

/** Detect if process.platform is Windows */
export const isWindows: boolean = /^win/i.test(platform);

/** Detect if process.platform is Linux */
export const isLinux: boolean = /^linux/i.test(platform);

/** Detect if process.platform is macOS (darwin kernel) */
export const isMacOS: boolean = /^darwin/i.test(platform);

/** Color Support */
export const isColorSupported: boolean =
  !toBoolean(env.NO_COLOR) &&
  (toBoolean(env.FORCE_COLOR) ||
    ((hasTTY || isWindows) && env.TERM !== "dumb") ||
    isCI);

/** Node.js versions */
export const nodeVersion: string | null =
  (globalThis.process?.versions?.node || "").replace(/^v/, "") || null;

export const nodeMajorVersion: number | null =
  Number(nodeVersion?.split(".")[0]) || null;
