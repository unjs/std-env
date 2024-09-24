export type EnvObject = Record<string, string | undefined>;

const _envShim = Object.create(null) as EnvObject;

export const env = new Proxy<EnvObject>(_envShim, {
  get(_, prop) {
    return getEnvValue(prop as string);
  },
  has(_, prop) {
    return getEnvValue(prop as string) !== undefined;
  },
  set(_, prop, value) {
    return Reflect.set(getEnvObj(), prop as string, `${value}`);
  },
  deleteProperty(_, prop) {
    return Reflect.deleteProperty(getEnvObj(), prop as string);
  },
  ownKeys() {
    return Reflect.ownKeys(getEnvObj());
  },
  defineProperty(_, prop, descriptor) {
    const value = descriptor.get?.() ?? descriptor.value;
    return Reflect.set(getEnvObj(), prop as string, `${value}`);
  },
});

function getEnvObj(fallbackToGlobal?: boolean): EnvObject {
  if (globalThis.__env__) {
    return globalThis.__env__;
  }
  if (globalThis.process?.env) {
    return globalThis.process.env;
  }
  if (import.meta.env) {
    return import.meta.env;
  }
  return fallbackToGlobal ? (globalThis as unknown as EnvObject) : _envShim;
}

function getEnvValue(key: string): string | undefined {
  if (globalThis.__env__ && key in globalThis.__env__) {
    return globalThis.__env__[key];
  }
  if (globalThis.process?.env && key in globalThis.process.env) {
    return globalThis.process.env[key];
  }
  if (import.meta?.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  if (globalThis.Deno?.env) {
    return (globalThis.Deno.env as any).get(key);
  }
  if (key in _envShim) {
    return _envShim[key];
  }
}

export const nodeENV =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
