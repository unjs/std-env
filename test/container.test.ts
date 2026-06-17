import { describe, it, expect, beforeEach } from "vitest";
import { isDocker, isContainer } from "../src/container.js";

describe("isDocker / isContainer", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key in process.env) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it("returns true when DOCKER_CONTAINER is true", () => {
    process.env.DOCKER_CONTAINER = "true";
    expect(isDocker()).toBe(true);
  });

  it("returns true when container env contains docker", () => {
    process.env.container = "docker";
    expect(isDocker()).toBe(true);
  });

  it("returns true when container env contains containerd", () => {
    process.env.container = "containerd";
    expect(isDocker()).toBe(true);
  });

  it("returns true when container env contains kubepods", () => {
    process.env.container = "kubepods";
    expect(isDocker()).toBe(true);
  });

  it("is case-insensitive", () => {
    process.env.container = "Docker";
    expect(isDocker()).toBe(true);
  });

  it("returns false when no docker indicators", () => {
    expect(isDocker()).toBe(false);
  });

  it("isContainer is an alias for isDocker", () => {
    process.env.DOCKER_CONTAINER = "true";
    expect(isContainer()).toBe(isDocker());
  });
});
