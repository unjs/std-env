import { env } from "./env.js";

export function isDocker(): boolean {
  return env.DOCKER_CONTAINER === "true" || /docker|containerd|kubepods/i.test(env.container || "");
}

export function isContainer(): boolean {
  return isDocker();
}
