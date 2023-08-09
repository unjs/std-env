export const _process: typeof process =
  typeof process === "undefined" ? ({} as typeof process) : process;
