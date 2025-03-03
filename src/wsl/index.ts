import { readFileSync } from "node:fs";
import { release } from "node:os";
import { isDocker } from "../containers";

let isWSLCached: boolean;

function _isWsl() {
  if (isWSLCached === undefined) {
    isWSLCached = hasUnameOrProcVersion();
  }
  return isWSLCached;
}

function hasUnameOrProcVersion() {
  if (globalThis.process?.platform !== "linux") {
    return false;
  }
  if (release().toLowerCase().includes("microsoft")) {
    if (isDocker) {
      return false;
    }
    return true;
  }
  try {
    return readFileSync("/proc/version", "utf8")
      .toLowerCase()
      .includes("microsoft")
      ? !isDocker
      : false;
  } catch {
    return false;
  }
}

export const isWsl = _isWsl();
