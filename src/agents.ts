// Reference: https://github.com/vercel/vercel/blob/main/packages/detect-agent/src/index.ts

/**
 * Represents the name of an AI coding agent.
 */
export type AgentName =
  | (string & {})
  | "cursor"
  | "claude"
  | "devin"
  | "replit"
  | "gemini"
  | "codex"
  | "augment_cli"
  | "opencode"
  | "kiro"
  | "goose";

type EnvCheck = string | [envName: string, match: RegExp];

type InternalAgent = [agentName: AgentName, envChecks: EnvCheck[]];

const agents: InternalAgent[] = [
  // Agents (checked first — an agent can run within an agentic IDE)
  // ✅ Verified by claude (can be detected using CLAUDECODE, CLAUDE_CODE, CLAUDE_AGENT_SDK_VERSION)
  ["claude", ["CLAUDECODE", "CLAUDE_CODE"]],
  ["replit", ["REPL_ID"]],
  ["gemini", ["GEMINI_CLI"]],
  // ✅ Verified by codex (can be detected using CODEX_THREAD_ID)
  ["codex", ["CODEX_SANDBOX", "CODEX_THREAD_ID"]],
  ["augment_cli", ["AUGMENT_AGENT"]],
  // ✅ Verified by opencode (can be detected using OPENCODE, OPENCODE_CALLER)
  ["opencode", ["OPENCODE", "OPENCODE_CALLER", "OPENCODE_CLIENT"]],
  ["goose", ["GOOSE_PROVIDER"]],
  // BROWSER or PATH could be used too
  ["devin", [["EDITOR", /devin/]]],
  ["kiro", [["TERM_PROGRAM", /kiro/]]],
  // IDEs (checked last — agents running inside these should be detected first)
  ["cursor", ["CURSOR_TRACE_ID", "CURSOR_AGENT"]],
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
      return { name: aiAgent };
    }
    for (const [name, checks] of agents) {
      for (const check of checks) {
        let envName: string;
        let match: RegExp | undefined;
        if (typeof check === "string") {
          envName = check;
        } else {
          [envName, match] = check;
        }
        const envValue = env[envName];
        if (!envValue) {
          continue;
        }
        if (match && !match.test(envValue)) {
          continue;
        }
        return { name };
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
