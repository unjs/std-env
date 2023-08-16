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

export function detectRuntime(): RuntimeInfo {
  let name: RuntimeName = "";

  if (isNetlify) {
    name = "netlify";
  }

  if (isEdgeLight) {
    name = "edge-light";
  }

  if (isWorkerd) {
    name = "workerd";
  }

  if (isDeno) {
    name = "deno";
  }

  if (isLagon) {
    name = "lagon";
  }

  if (isNode) {
    name = "node";
  }

  if (isBun) {
    name = "bun";
  }

  if (isFastly) {
    name = "fastly";
  }

  return { name };
}
