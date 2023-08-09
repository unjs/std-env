import { env } from "./env";

export interface Process
  extends Partial<Omit<typeof globalThis.process, "versions">> {
  env: Record<string, string | undefined>;
  versions: Record<string, string>;
}

const _process = (globalThis.process ||
  Object.create(null)) as unknown as Process;

const processShims = {
  versions: {},
};

export const process = new Proxy<Process>(_process, {
  get(target, prop) {
    if (prop === "env") {
      return env;
    }
    if (prop in target) {
      return target[prop];
    }
    if (prop in processShims) {
      return processShims[prop as keyof typeof processShims];
    }
  },
});
