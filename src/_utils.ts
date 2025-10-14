export function toBoolean(val: boolean | string | undefined): boolean {
  return val ? val !== "false" : false;
}
