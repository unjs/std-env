const _envShim = Object.create(null);

/**
 * Represents an environment variable object, where each key is the name of the variable
 * and its value is a string or undefined.
 */
export type EnvObject = Record<string, string | undefined>;

const _getEnv = (useShim?: boolean) =>
  globalThis.process?.env ||
  import.meta.env ||
  globalThis.Deno?.env.toObject() ||
  globalThis.__env__ ||
  (useShim ? _envShim : globalThis);

/**
 * A proxy handler for environment variables that supports reading, writing and deleting properties,
 * and deleting properties, as well as listing all environment variable keys.
 * It uses `_getEnv` to determine the correct environment source or uses the `_envShim` if specified.
 */
export const env = new Proxy<EnvObject>(_envShim, {
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
 * Retrieves the current value of the `NODE_ENV` environment variable from the Node.js context.
 *
 * @default ""
 */
export const nodeENV =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
