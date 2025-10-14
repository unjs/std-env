import { type EnvObject, env } from "./env.ts";

/**
 * An interface that partially replicates the Node.js `process` object.
 * It includes all the properties of `globalThis.process` except `versions`,
 * and defines `env` as a {@link EnvObject} and `versions` as a set of version strings.
 */
export interface Process
  extends Partial<Omit<typeof globalThis.process, "versions">> {
  /**
   * Represents the environment variables accessible within the process. See {@link EnvObject}.
   */
  env: EnvObject;

  /**
   * A record of versions.
   */
  versions: Record<string, string>;
}

const _process = (globalThis.process ||
  Object.create(null)) as unknown as Process;

const processShims: Partial<Process> = {
  versions: {},
};

/**
 * A proxy for managing access to properties of the process object.
 * It prioritises direct properties of `process`, then shims, and finally managed access to environment variables.
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
