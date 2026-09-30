import { expect, it, describe } from "vitest";
import * as stdEnv from "../src/containers";

describe("std-env containers", () => {
  it("has expected exports", () => {
    expect(Object.keys(stdEnv)).toMatchInlineSnapshot(`
      [
        "isDocker",
        "isContainer",
      ]
    `);
  });

  it("defaults", () => {
    expect(stdEnv).toMatchObject({
      isDocker: expect.any(Boolean),
      isContainer: expect.any(Boolean),
    });
  });
});
