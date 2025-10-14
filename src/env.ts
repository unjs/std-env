const _envShim = Object.create(null);

/**
 * Represents an environment variable object, where each key is the name of the variable
 * and its value is a string or undefined.
 */
export type EnvObject = Record<string, string | undefined>;

const _getEnv = (useShim?: boolean) =>
  globalThis.process?.env ||
  // @ts-ignore
  import.meta.env ||
  globalThis.Deno?.env.toObject() ||
  globalThis.__env__ ||
  (useShim ? _envShim : globalThis);

/**
 * A proxy handler for environment variables that supports reading, writing and deleting properties as well as listing all environment variable keys with a shim fallback.
 */
export const env: EnvObject = new Proxy<EnvObject>(_envShim, {
  get(_, prop) {
    const env = _getEnv();
    return env[prop as any] ?? _envShim[prop];
  },
  has(_, prop) {
    const env = _getEnv();
    return prop in env || prop in _envShim;
  },
  set(_, prop, value) {
    const env = _getEnv(true);
    env[prop as any] = value;
    return true;
  },
  deleteProperty(_, prop) {
    if (!prop) {
      return false;
    }
    const env = _getEnv(true);
    delete env[prop as any];
    return true;
  },
  ownKeys() {
    const env = _getEnv(true);
    return Object.keys(env);
  },
});

/**
 * Current value of the `NODE_ENV` environment variable (or static value if replaced during build).
 *
 * If `NODE_ENV` is not set, this will be an empty `""` string.
 */
export const nodeENV: string =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
