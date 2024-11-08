import { statSync } from "node:fs";
import { isDocker } from "./docker";

function hasContainerEnv() {
  try {
    statSync("/run/.containerenv");
    return true;
  } catch {
    return false;
  }
}

let isContainerCached: boolean;

function _isContainer() {
  if (isContainerCached === undefined) {
    isContainerCached = hasContainerEnv();
  }
  return isContainerCached;
}

export const isContainer = _isContainer() || isDocker;
