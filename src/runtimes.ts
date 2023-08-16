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

export function detectRuntime(): RuntimeInfo {
  let name: RuntimeName = "";

  if (globalThis.Netlify) {
    name = "netlify";
  }

  if (globalThis.EdgeRuntime) {
    name = "edge-light";
  }

  // https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
  if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
    name = "workerd";
  }

  if (globalThis.Deno) {
    name = "deno";
  }

  if (globalThis.__lagon__) {
    name = "lagon";
  }

  // https://nodejs.org/api/process.html#processrelease
  if (globalThis.process?.release?.name === "node") {
    name = "node";
  }

  if (globalThis.process?.release?.name === "bun") {
    name = "bun";
  }

  if (globalThis.fastly) {
    name = "fastly";
  }

  return { name };
}
