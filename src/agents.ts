// Reference: https://github.com/vercel/vercel/blob/main/packages/detect-agent/src/index.ts

/**
 * Represents the name of an AI coding agent.
 */
export type AgentName =
  | ""
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
  meta?: Record<string, any>,
];

const agents: InternalAgent[] = [
  ["CURSOR", "CURSOR_TRACE_ID"],
  ["CURSOR_CLI", "CURSOR_AGENT"],
  ["CLAUDE", "CLAUDECODE"],
  ["CLAUDE", "CLAUDE_CODE"],
  ["REPLIT", "REPL_ID"],
  ["GEMINI", "GEMINI_CLI"],
  ["CODEX", "CODEX_SANDBOX"],
  ["AUGMENT_CLI", "AUGMENT_AGENT"],
  ["OPENCODE", "OPENCODE_CLIENT"],
  ["KIRO", "TERM_PROGRAM", { match: "kiro" }],
  ["GOOSE", "GOOSE_PROVIDER"],
  ["DEVIN", "EDITOR", { match: "devin" }], // BROWSER or PATH could be used too
];

/**
 * Provides information about an AI coding agent.
 */
export type AgentInfo = {
  /**
   * The name of the AI coding agent. See {@link AgentName} for possible values.
   */
  name: AgentName;

  /**
   * Arbitrary metadata associated with the agent.
   */
  [meta: string]: any;
};

/**
 * Detects the current AI coding agent from environment variables.
 */
export function detectAgent(): AgentInfo {
  if (globalThis.process?.env) {
    // Check for explicit AI_AGENT env
    const aiAgent = globalThis.process.env.AI_AGENT;
    if (aiAgent) {
      return {
        name: aiAgent.toLowerCase() as AgentName,
      };
    }

    for (const agent of agents) {
      const envName = agent[1] || agent[0];
      const envValue = globalThis.process.env[envName];
      if (envValue) {
        const match = (agent[2] as any)?.match;
        if (match && !envValue.toLowerCase().includes(match)) {
          continue;
        }
        return {
          name: agent[0].toLowerCase() as AgentName,
        };
      }
    }
  }

  return {
    name: "",
  };
}

/**
 * The detected agent information for the current execution context.
 * This value is evaluated once at module initialisation.
 */
export const agentInfo: AgentInfo = /* #__PURE__ */ detectAgent();

/**
 * A convenience reference to the name of the detected agent.
 */
export const agent: AgentName = agentInfo.name;

/**
 * A boolean flag indicating whether the current environment is running inside an AI coding agent.
 */
export const isAgent: boolean = agentInfo.name !== "";
