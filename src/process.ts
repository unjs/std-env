import { env } from "./env";

export const process = new Proxy(globalThis.process || Object.create(null), {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    if (prop === "env") {
      return env;
    }
  },
});
