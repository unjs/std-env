/**
 * Runtime-agnostic reference to environment variables.
 *
 * Resolves to `globalThis.process.env` when available, otherwise an empty object.
 */
export const env: Record<string, string | undefined> =
  globalThis.process?.env || Object.create(null);

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
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || undefined;
