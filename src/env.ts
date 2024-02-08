export type EnvObject = Record<string, string | undefined>;

const _getEnv = (): Record<string, any> | undefined =>
  globalThis.process?.env ||
  import.meta.env ||
  globalThis.Deno?.env.toObject() ||
  globalThis.__env__;

export const env = new Proxy<EnvObject>(
  {},
  {
    get(target, prop) {
      const env = _getEnv();
      if (env && Reflect.has(env, prop)) {
        return env[prop as any];
      }

      return target[prop as any];
    },
    has(target, prop) {
      const env = _getEnv();
      if (env && Reflect.has(env, prop)) {
        return Reflect.has(env, prop);
      }

      return Reflect.has(target, prop);
    },
    set(target, prop, value) {
      const env = _getEnv();
      if (env) {
        env[prop as any] = value;
      } else {
        target[prop as any] = value;
      }

      return true;
    },
    deleteProperty(target, prop) {
      if (!prop) {
        return false;
      }

      const env = _getEnv();
      if (env && Reflect.has(env, prop)) {
        delete env[prop as any];
      }

      delete target[prop as any];
      return true;
    },
    ownKeys(target) {
      const env = _getEnv();
      return [
        ...new Set([
          ...Reflect.ownKeys(target),
          ...(env ? Reflect.ownKeys(env) : []),
        ]),
      ];
    },
    getOwnPropertyDescriptor(
      target: EnvObject,
      p: string | symbol,
    ): PropertyDescriptor | undefined {
      if (Reflect.has(target, p)) {
        return Reflect.getOwnPropertyDescriptor(target, p);
      }

      const env = _getEnv();
      if (env && Reflect.has(env, p)) {
        return {
          ...Reflect.getOwnPropertyDescriptor(env, p),
          enumerable: true,
        };
      }

      return undefined;
    },
  },
);

export const nodeENV =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
