export {
  type AgentName,
  type AgentInfo,
  agent,
  isAgent,
  agentInfo,
  detectAgent,
} from "./agents.ts";

export { env, process, nodeENV } from "./env.ts";

export {
  hasTTY,
  hasWindow,
  isCI,
  isColorSupported,
  isDebug,
  isDevelopment,
  isLinux,
  isMacOS,
  isProduction,
  isTest,
  isWindows,
  isMinimal,
  nodeMajorVersion,
  nodeVersion,
  platform,
} from "./flags.ts";

export {
  type ProviderInfo,
  type ProviderName,
  provider,
  providerInfo,
  detectProvider,
} from "./providers.ts";

export {
  type RuntimeInfo,
  type RuntimeName,
  isBun,
  isDeno,
  isNode,
  runtime,
  runtimeInfo,
  isEdgeLight,
  isFastly,
  isNetlify,
  isWorkerd,
} from "./runtimes.ts";
