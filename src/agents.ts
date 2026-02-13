// Reference: https://github.com/vercel/vercel/blob/main/packages/detect-agent/src/index.ts

// Note to AI Agents: Check @AGENTS.md for instructions on how to self-verify.

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
  | "auggie"
  | "opencode"
  | "kiro"
  | "goose"
  | "pi";

type EnvCheck = string | ((env: Record<string, string | undefined>) => boolean);

type InternalAgent = [agentName: AgentName, envChecks: EnvCheck[]];

const agents: InternalAgent[] = [
  // ✅ Verified by claude (can be detected using CLAUDECODE, CLAUDE_CODE, CLAUDE_AGENT_SDK_VERSION)
  ["claude", ["CLAUDECODE", "CLAUDE_CODE"]],
  // ✅ Manually verified by @pi0
  ["replit", ["REPL_ID"]],
  // ✅ Verified by gemini (can be detected using GEMINI_CLI, GEMINI_CLI_NO_RELAUNCH)
  ["gemini", ["GEMINI_CLI"]],
  // ✅ Verified by codex (can be detected using CODEX_THREAD_ID)
  ["codex", ["CODEX_SANDBOX", "CODEX_THREAD_ID"]],
  // ✅ Verified by opencode (can be detected using OPENCODE, OPENCODE_CALLER or OPENCODE_CLIENT?)
  ["opencode", ["OPENCODE"]],
  // ✅ Verified by pi (can be detected using PATH containing .pi/agent/bin)
  ["pi", [envMatcher("PATH", /\.pi[\\/]agent/)]],
  // ❓ not tested
  ["auggie", ["AUGMENT_AGENT"]],
  // ❓ not tested
  ["goose", ["GOOSE_PROVIDER"]],

  // -- IDEs (checked last — agents running inside these should be detected first) --
  // ✅ Verified by devin (can be detected using EDITOR, BROWSER, PATH)
  ["devin", [envMatcher("EDITOR", /devin/)]],
  // ✅ Verified by cursor (can be detected using CURSOR_AGENT, CURSOR_TRACE_ID, CURSOR_SANDBOX)
  ["cursor", ["CURSOR_AGENT"]],
  // ✅ Verified by kiro (can be detected using TERM_PROGRAM)
  ["kiro", [envMatcher("TERM_PROGRAM", /kiro/)]],
];

function envMatcher(envKey: string, regex: RegExp) {
  return (env: Record<string, string | undefined>) => {
    const value = env[envKey];
    return value ? regex.test(value) : false;
  };
}

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
      return { name: aiAgent.toLowerCase()  };
    }
    for (const [name, checks] of agents) {
      for (const check of checks) {
        if (typeof check === "string" ? env[check] : check(env)) {
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
 * Name of the detected agent.
 */
export const agent: AgentName | undefined = agentInfo.name;

/**
 * A boolean flag indicating whether the current environment is running inside an AI coding agent.
 */
export const isAgent: boolean = !!agentInfo.name;
