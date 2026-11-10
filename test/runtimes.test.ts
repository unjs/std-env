import { expect, it, describe } from "vitest";
import {
  isNode,
  isBun,
  isDeno,
  isWorkerd,
  isFastly,
  isNetlify,
  isEdgeLight,
  isNub,
  runtime,
  runtimeInfo,
} from "../src/runtimes.ts";

describe("runtime detection", () => {
  it("detects Node.js in test runner environment", () => {
    expect(isNode).toBe(true);
    expect(runtime).toBe("node");
    expect(runtimeInfo).toEqual({ name: "node" });
  });

  it("reports false for other non-active runtimes", () => {
    expect(isBun).toBe(false);
    expect(isDeno).toBe(false);
    expect(isWorkerd).toBe(false);
    expect(isFastly).toBe(false);
    expect(isNetlify).toBe(false);
    expect(isEdgeLight).toBe(false);
    expect(isNub).toBe(false);
  });
});
