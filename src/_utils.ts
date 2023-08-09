export function toBoolean(val: boolean | string | undefined) {
  return val ? val !== "false" : false;
}
