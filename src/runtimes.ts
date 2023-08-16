/* eslint-disable no-var */
declare global {
  var EdgeRuntime: any;
  var Netlify: any;
  var Bun: any;
  var Deno: any;
  var __lagon__: any;
  var fastly: any;
}

// https://runtime-keys.proposal.wintercg.org/
export type Runtime =
  | "workerd"
  | "deno"
  | "lagon"
  | "netlify"
  | "node"
  | "bun"
  | "edge-light"
  | "fastly"
  | "";

// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
const CLOUDFLARE_WORKERS_NAVIGATOR = "Cloudflare-Workers";

// https://nodejs.org/api/process.html#processrelease
const NODE_PROCESS_RELEASE_NAME = "node";

export function detectRuntime(): Runtime {
  if (typeof Netlify === "object") {
    return "netlify";
  }

  if (typeof EdgeRuntime === "string") {
    return "edge-light";
  }

  if (globalThis.navigator?.userAgent === CLOUDFLARE_WORKERS_NAVIGATOR) {
    return "workerd";
  }

  if (globalThis.Deno) {
    return "deno";
  }

  if (globalThis.__lagon__) {
    return "lagon";
  }

  if (globalThis.process?.release?.name === NODE_PROCESS_RELEASE_NAME) {
    return "node";
  }

  if (globalThis.Bun) {
    return "bun";
  }

  if (globalThis.fastly) {
    return "fastly";
  }

  return "";
}
