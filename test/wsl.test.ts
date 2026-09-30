import { expect, it, describe } from "vitest";
import * as stdEnv from "../src/wsl";

describe("std-env wsl", () => {
  it("has expected exports", () => {
    expect(Object.keys(stdEnv)).toMatchInlineSnapshot(`
      [
        "isWsl",
      ]
    `);
  });

  it("defaults", () => {
    expect(stdEnv).toMatchObject({
      isWsl: expect.any(Boolean),
    });
  });
});
