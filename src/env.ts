export const env: Record<string, string | undefined> =
  globalThis.process?.env || Object.create(null);

export const process: Partial<typeof globalThis.process> = globalThis.process || { env };

/**
 * Current value of the `NODE_ENV` environment variable (or static value if replaced during build).
 *
 * If `NODE_ENV` is not set, this will be an empty `""` string.
 */
export const nodeENV: string =
  (typeof process !== "undefined" && process.env && process.env.NODE_ENV) || "";
