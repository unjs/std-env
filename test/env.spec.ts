import { it, describe, expect } from "vitest";
import { env } from "../src";

const set = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete env[key];
    return;
  }

  env[key] = value;
};

describe("std-env", () => {
  it("should read many env vars", () => {
    set("foo", "bar");

    expect(Object.keys(env).length).toBeGreaterThanOrEqual(1);

    set("foo", undefined);
  });
});
