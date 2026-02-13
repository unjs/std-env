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
  ["cursor", ["CURSOR_TRACE_ID", "CURSOR_AGENT"]],
  // ✅ Verified by claude (can be detected using CLAUDECODE, CLAUDE_CODE, CLAUDE_AGENT_SDK_VERSION)
  ["claude", ["CLAUDECODE", "CLAUDE_CODE"]],
  ["replit", ["REPL_ID"]],
  ["gemini", ["GEMINI_CLI"]],
  // ✅ Verified by codex (can be detected using CODEX_THREAD_ID)
  ["codex", ["CODEX_SANDBOX", "CODEX_THREAD_ID"]],
  ["augment_cli", ["AUGMENT_AGENT"]],
  ["opencode", ["OPENCODE", "OPENCODE_CALLER", "OPENCODE_CLIENT"]],
  ["goose", ["GOOSE_PROVIDER"]],
  ["kiro", [["TERM_PROGRAM", /kiro/]]],
  ["devin", [["EDITOR", /devin/]]], // BROWSER or PATH could be used too
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
        const envName = typeof check === "string" ? check : check[0];
        const envValue = env[envName];
        if (envValue) {
          const match = typeof check === "string" ? undefined : check[1];
          if (match && !match.test(envValue)) {
            continue;
          }
          return { name };
        }
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
