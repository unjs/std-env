// Reference: https://github.com/vercel/vercel/blob/main/packages/detect-agent/src/index.ts

/**
 * Represents the name of an AI coding agent.
 */
export type AgentName =
  | (string & {})
  | "cursor"
  | "cursor_cli"
  | "claude"
  | "devin"
  | "replit"
  | "gemini"
  | "codex"
  | "augment_cli"
  | "opencode"
  | "kiro"
  | "goose";

type InternalAgent = [
  agentName: Uppercase<AgentName>,
  envName?: string,
  opts?: { match?: RegExp },
];

const agents: InternalAgent[] = [
  ["CURSOR", "CURSOR_TRACE_ID"],
  ["CURSOR", "CURSOR_AGENT"],
  // ✅ Verified by claude
  ["CLAUDE", "CLAUDECODE"],
  ["CLAUDE", "CLAUDE_CODE"],
  ["REPLIT", "REPL_ID"],
  ["GEMINI", "GEMINI_CLI"],
  // ✅ Verified by codex
  // CODEX_INTERNAL_ORIGINATOR_OVERRIDE or PATH matching .codex could be used too
  ["CODEX", "CODEX_SANDBOX"],
  ["CODEX", "CODEX_THREAD_ID"],
  ["AUGMENT_CLI", "AUGMENT_AGENT"],
  // ✅ Verified by opencode
  ["OPENCODE", "OPENCODE"],
  ["OPENCODE", "OPENCODE_CALLER"],
  ["OPENCODE", "OPENCODE_CLIENT"],
  ["GOOSE", "GOOSE_PROVIDER"],
  ["KIRO", "TERM_PROGRAM", { match: /kiro/ }],
  ["DEVIN", "EDITOR", { match: /devin/ }], // BROWSER or PATH could be used too
];

/**
 * Provides information about an AI coding agent.
 */
export type AgentInfo = {
  /**
   * The name of the AI coding agent. See {@link AgentName} for possible values.
   */
  name?: AgentName;
};

/**
 * Detects the current AI coding agent from environment variables.
 */
export function detectAgent(): AgentInfo {
  const env = globalThis.process?.env;
  if (env) {
    const aiAgent = env.AI_AGENT;
    if (aiAgent) {
      return { name: aiAgent.toLowerCase() as AgentName };
    }
    for (const agent of agents) {
      const envValue = env[agent[1]!];
      if (envValue) {
        const match = (agent[2])?.match;
        if (match && !match.test(envValue)) {
          continue;
        }
        return {
          name: agent[0].toLowerCase() as AgentName,
        };
      }
    }
  }
  return {};
}

/**
 * The detected agent information for the current execution context.
 * This value is evaluated once at module initialisation.
 */
export const agentInfo: AgentInfo = /* #__PURE__ */ detectAgent();

/**
 * A convenience reference to the name of the detected agent.
 */
export const agent: AgentName | undefined = agentInfo.name;

/**
 * A boolean flag indicating whether the current environment is running inside an AI coding agent.
 */
export const isAgent: boolean = agentInfo.name !== "";
