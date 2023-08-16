/* eslint-disable no-var */
declare global {
  var EdgeRuntime: any;
  var Netlify: any;
  var Deno: any;
  var __lagon__: any;
  var fastly: any;
}

// https://runtime-keys.proposal.wintercg.org/
export type RuntimeName =
  | "workerd"
  | "deno"
  | "lagon"
  | "netlify"
  | "node"
  | "bun"
  | "edge-light"
  | "fastly"
  | "";

export type RuntimeInfo = { name: RuntimeName };

export const isNetlify = !!globalThis.Netlify;
export const isEdgeLight = !!globalThis.EdgeRuntime;
// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
export const isWorkerd =
  globalThis.navigator?.userAgent === "Cloudflare-Workers";
export const isDeno = !!globalThis.Deno;
// https://nodejs.org/api/process.html#processrelease
export const isLagon = !!globalThis.__lagon__;
export const isNode = globalThis.process?.release?.name === "node";
export const isBun = globalThis.process?.release?.name === "bun";
export const isFastly = !!globalThis.fastly;

const runtimeChecks: [boolean, RuntimeName][] = [
  [isNetlify, "netlify"],
  [isEdgeLight, "edge-light"],
  [isWorkerd, "workerd"],
  [isDeno, "deno"],
  [isLagon, "lagon"],
  [isNode, "node"],
  [isBun, "bun"],
  [isFastly, "fastly"],
];

function _detectRuntime(): RuntimeInfo | undefined {
  const detectedRuntime = runtimeChecks.find((check) => check[0]);
  if (detectedRuntime) {
    const name = detectedRuntime[1];
    return { name };
  }
}

export const runtimeInfo = _detectRuntime();

export const runtime = runtimeInfo?.name || "";
