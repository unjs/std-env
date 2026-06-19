import { env } from "cloudflare:workers";

export { env };

/**
 * Runtime-agnostic reference to the `process` global.
 *
 * Resolves to `globalThis.process` when available, otherwise a minimal shim containing only `env`.
 */
export const process: { env: {} } = { env };

/**
 * Current value of the `NODE_ENV` environment variable (or static value if replaced during build).
 *
 * If `NODE_ENV` is not set, this will be undefined.
 */
export const nodeENV: string | undefined = undefined;
