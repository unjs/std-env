import { type EnvObject, env } from "./env.ts";

/**
 * An interface that partially shims the Node.js `global.process`.
 */
export interface Process extends Partial<Omit<typeof globalThis.process, "versions">> {
  env: EnvObject;
  versions: Record<string, string>;
}

const _process = (globalThis.process || Object.create(null)) as unknown as Process;

const processShims: Partial<Process> = {
  versions: {},
};

/**
 * A proxy for managing access to properties of the process with a shim fallback.
 */
export const process: Process = new Proxy<Process>(_process, {
  get(target, prop: keyof Process) {
    if (prop === "env") {
      return env;
    }
    if (prop in target) {
      return target[prop];
    }
    if (prop in processShims) {
      return processShims[prop];
    }
  },
});
