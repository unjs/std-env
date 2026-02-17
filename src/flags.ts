import { providerInfo } from "./providers.ts";
import { env, nodeENV, process } from "./env.ts";

/** Value of process.platform */
export const platform: string = process.platform || "";

/** Detect if `CI` environment variable is set or a provider CI detected */
export const isCI: boolean = !!env.CI || providerInfo.ci !== false;

/** Detect if stdout.TTY is available */
export const hasTTY: boolean = !!process.stdout?.isTTY;

/** Detect if global `window` object is available */
// eslint-disable-next-line unicorn/prefer-global-this
export const hasWindow: boolean = typeof window !== "undefined";

/** Detect if `DEBUG` environment variable is set */
export const isDebug: boolean = !!env.DEBUG;

/** Detect if `NODE_ENV` environment variable is `test` or `TEST` environment variable is set */
export const isTest: boolean = nodeENV === "test" || !!env.TEST;

/** Detect if `NODE_ENV` or `MODE` environment variable is `production` */
export const isProduction: boolean = nodeENV === "production" || env.MODE === "production";

/** Detect if `NODE_ENV` environment variable is `dev` or `development`, or if `MODE` environment variable is `development` */
export const isDevelopment: boolean =
  nodeENV === "dev" || nodeENV === "development" || env.MODE === "development";

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal: boolean = !!env.MINIMAL || isCI || isTest || !hasTTY;

/** Detect if process.platform is Windows */
export const isWindows: boolean = /^win/i.test(platform);

/** Detect if process.platform is Linux */
export const isLinux: boolean = /^linux/i.test(platform);

/** Detect if process.platform is macOS (darwin kernel) */
export const isMacOS: boolean = /^darwin/i.test(platform);

/** Detect if terminal color output is supported based on `NO_COLOR`, `FORCE_COLOR`, TTY, and CI environment */
export const isColorSupported: boolean =
  !env.NO_COLOR && (!!env.FORCE_COLOR || ((hasTTY || isWindows) && env.TERM !== "dumb") || isCI);

/** Node.js version string (e.g. `"20.11.0"`), or `null` if not running in Node.js */
export const nodeVersion: string | null = (process.versions?.node || "").replace(/^v/, "") || null;

/** Node.js major version number (e.g. `20`), or `null` if not running in Node.js */
export const nodeMajorVersion: number | null = Number(nodeVersion?.split(".")[0]) || null;
