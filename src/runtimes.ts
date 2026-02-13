// https://runtime-keys.proposal.wintercg.org/

export type RuntimeName =
  | "workerd"
  | "deno"
  | "netlify"
  | "node"
  | "bun"
  | "edge-light"
  | "fastly"
  | "";

export type RuntimeInfo = {
  /**
   * The name of the detected runtime.
   */
  name: RuntimeName;
};

/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
export const isNode: boolean = globalThis.process?.release?.name === "node";

/**
 * Indicates if running in Bun runtime.
 */
export const isBun: boolean = !!globalThis.Bun || !!globalThis.process?.versions?.bun;

/**
 * Indicates if running in Deno runtime.
 */
export const isDeno: boolean = !!globalThis.Deno;

/**
 * Indicates if running in Fastly runtime.
 */
export const isFastly: boolean = !!globalThis.fastly;

/**
 * Indicates if running in Netlify runtime.
 */
export const isNetlify: boolean = !!globalThis.Netlify;

/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
export const isEdgeLight: boolean = !!globalThis.EdgeRuntime;
// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent

/**
 * Indicates if running in Cloudflare Workers runtime.
 */
export const isWorkerd: boolean = globalThis.navigator?.userAgent === "Cloudflare-Workers";

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
export const runtimeInfo: RuntimeInfo | undefined = _detectRuntime();

/**
 * A convenience constant that returns the name of the detected runtime,
 * defaults to an empty string if no runtime is detected.
 */
export const runtime: RuntimeName = runtimeInfo?.name || "";
