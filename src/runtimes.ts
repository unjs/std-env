// https://runtime-keys.proposal.wintercg.org/

/**
 * Enumerates the names of supported runtimes.
 */
export type RuntimeName =
  | "workerd"
  | "deno"
  | "netlify"
  | "node"
  | "bun"
  | "edge-light"
  | "fastly"
  | "";

/**
 * Returns the detected runtime information.
 */
export type RuntimeInfo = {
  /**
   * The name of the detected runtime. See {@link RuntimeName}.
   */
  name: RuntimeName
 };

/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
export const isNode = globalThis.process?.release?.name === "node";

/**
 * Indicates if running in Bun runtime.
 */
export const isBun = !!globalThis.Bun || !!globalThis.process?.versions?.bun;

/**
 * Indicates if running in Deno runtime.
 */
export const isDeno = !!globalThis.Deno;

/**
 * Indicates if running in Fastly runtime.
 */
export const isFastly = !!globalThis.fastly;

/**
 * Indicates if running in Netlify runtime.
 */
export const isNetlify = !!globalThis.Netlify;

/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
export const isEdgeLight = !!globalThis.EdgeRuntime;
// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent

/**
 * Indicates if running in Cloudflare Workers runtime.
 */
export const isWorkerd =
  globalThis.navigator?.userAgent === "Cloudflare-Workers";

/**
 * An array of tuples used to determine the current runtime. Each tuple contains a boolean indicating
 * the presence of a runtime and the corresponding {@link RuntimeName}.
 */
const runtimeChecks: [boolean, RuntimeName][] = [
  [isNetlify, "netlify"],
  [isEdgeLight, "edge-light"],
  [isWorkerd, "workerd"],
  [isFastly, "fastly"],
  [isDeno, "deno"],
  [isBun, "bun"],
  [isNode, "node"],
];

function _detectRuntime(): RuntimeInfo | undefined {
  const detectedRuntime = runtimeChecks.find((check) => check[0]);
  if (detectedRuntime) {
    const name = detectedRuntime[1];
    return { name };
  }
}

/**
 * Contains information about the detected runtime, if any.
 */
export const runtimeInfo = _detectRuntime();

/**
 * A convenience constant that returns the name of the detected runtime,
 * defaults to an empty string if no runtime is detected.
 */
export const runtime: RuntimeName = runtimeInfo?.name || "";
