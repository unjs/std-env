const _envShim = Object.create(null);

export type EnvObject = Record<string, string | undefined>;

const _getEnv = (useShim?: boolean) =>
  (globalThis as unknown as { __env__: EnvObject }).__env__ ||
  globalThis.process?.env ||
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
    const env = _getEnv();
    return Object.keys(env);
  },
});

export const nodeENV =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) ||
  env.NODE_ENV ||
  "";
