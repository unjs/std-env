import { env } from "./env";

type StdProcess = Partial<typeof globalThis.process> & { env: typeof env };

export const process = new Proxy<StdProcess>(globalThis.process || { env }, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
  },
});
