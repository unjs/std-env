const _rawEnv: Record<string, string | undefined> = globalThis.process?.env || Object.create(null);

function _getEnv(key: string): string | undefined {
  if (key in _rawEnv) {
    return _rawEnv[key];
  }
  if (
    typeof import.meta !== "undefined" &&
    (import.meta as any)?.env &&
    key in (import.meta as any).env
  ) {
    return (import.meta as any).env[key];
  }
  const fallback = (globalThis as any).__import_meta_env__;
  if (fallback && key in fallback) {
    return fallback[key];
  }
  return undefined;
}

/**
 * Runtime-agnostic reference to environment variables.
 *
 * Resolves to `globalThis.process.env` when available, falling back to `import.meta.env`.
 */
export const env: Record<string, string | undefined> = new Proxy(_rawEnv, {
  get(target, prop: string | symbol) {
    if (typeof prop !== "string") {
      return (target as any)[prop];
    }
    return _getEnv(prop);
  },
  has(target, prop: string | symbol) {
    if (typeof prop === "string") {
      if (prop in target) {
        return true;
      }
      if (
        typeof import.meta !== "undefined" &&
        (import.meta as any)?.env &&
        prop in (import.meta as any).env
      ) {
        return true;
      }
      const fallback = (globalThis as any).__import_meta_env__;
      if (fallback && prop in fallback) {
        return true;
      }
      return false;
    }
    return prop in target;
  },
  set(target, prop: string | symbol, value: any) {
    (target as any)[prop] = value;
    return true;
  },
  deleteProperty(target, prop: string | symbol) {
    return delete (target as any)[prop];
  },
});

/**
 * Runtime-agnostic reference to the `process` global.
 *
 * Resolves to `globalThis.process` when available, otherwise a minimal shim containing only `env`.
 */
export const process: Partial<typeof globalThis.process> = globalThis.process || { env };

/**
 * Current value of the `NODE_ENV` environment variable (or static value if replaced during build).
 *
 * If `NODE_ENV` is not set, this will be undefined.
 */
export const nodeENV: string | undefined =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) ||
  env.NODE_ENV ||
  undefined;
