const _envShim = Object.create(null);

export type EnvObject = Record<string, string | undefined>;

const _getEnv = (useShim?: boolean) =>
  globalThis.__env__ /** might be injected by nitro or custom compatibility */ ||
  globalThis.process?.env ||
  import.meta.env ||
  globalThis.Deno?.env.toObject() ||
  (useShim ? _envShim : globalThis);

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

export const nodeENV =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
