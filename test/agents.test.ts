import { expect, it, describe, beforeEach, afterEach } from "vitest";
import { detectAgent } from "../src/agents.ts";

// All env vars that can trigger agent detection
const agentEnvKeys = [
  "AI_AGENT",
  "CURSOR_TRACE_ID",
  "CURSOR_AGENT",
  "CLAUDECODE",
  "CLAUDE_CODE",
  "REPL_ID",
  "GEMINI_CLI",
  "CODEX_SANDBOX",
  "CODEX_THREAD_ID",
  "AUGMENT_AGENT",
  "OPENCODE",
  "OPENCODE_CALLER",
  "OPENCODE_CLIENT",
  "GOOSE_PROVIDER",
  "TERM_PROGRAM",
  "EDITOR",
];

describe("detectAgent", () => {
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const key of agentEnvKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of agentEnvKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  it("returns empty object when no agent env is set", () => {
    expect(detectAgent()).toEqual({});
  });

  it("AI_AGENT takes priority over specific agents", () => {
    process.env.AI_AGENT = "custom-agent";
    process.env.CLAUDECODE = "1";
    expect(detectAgent()).toEqual({ name: "custom-agent" });
  });

  describe("simple env var checks", () => {
    const cases: [string, string, string][] = [
      ["cursor", "CURSOR_TRACE_ID", "trace-123"],
      ["cursor", "CURSOR_AGENT", "1"],
      ["claude", "CLAUDECODE", "1"],
      ["claude", "CLAUDE_CODE", "1"],
      ["replit", "REPL_ID", "abc"],
      ["gemini", "GEMINI_CLI", "1"],
      ["codex", "CODEX_SANDBOX", "1"],
      ["codex", "CODEX_THREAD_ID", "thread-1"],
      ["augment_cli", "AUGMENT_AGENT", "1"],
      ["opencode", "OPENCODE", "1"],
      ["opencode", "OPENCODE_CALLER", "cli"],
      ["opencode", "OPENCODE_CLIENT", "vscode"],
      ["goose", "GOOSE_PROVIDER", "openai"],
    ];

    for (const [expectedName, envKey, envValue] of cases) {
      it(`detects ${expectedName} via ${envKey}`, () => {
        process.env[envKey] = envValue;
        expect(detectAgent()).toEqual({ name: expectedName });
      });
    }
  });

  describe("regex env var checks", () => {
    it("detects kiro via TERM_PROGRAM matching /kiro/", () => {
      process.env.TERM_PROGRAM = "kiro-terminal";
      expect(detectAgent()).toEqual({ name: "kiro" });
    });

    it("does not detect kiro when TERM_PROGRAM does not match", () => {
      process.env.TERM_PROGRAM = "vscode";
      expect(detectAgent()).toEqual({});
    });

    it("detects devin via EDITOR matching /devin/", () => {
      process.env.EDITOR = "/usr/bin/devin-editor";
      expect(detectAgent()).toEqual({ name: "devin" });
    });

    it("does not detect devin when EDITOR does not match", () => {
      process.env.EDITOR = "vim";
      expect(detectAgent()).toEqual({});
    });
  });

  describe("priority order", () => {
    it("agents are detected before IDE-level entries", () => {
      process.env.CURSOR_TRACE_ID = "1";
      process.env.CLAUDECODE = "1";
      expect(detectAgent()).toEqual({ name: "claude" });
    });

    it("claude is detected before replit", () => {
      process.env.CLAUDECODE = "1";
      process.env.REPL_ID = "1";
      expect(detectAgent()).toEqual({ name: "claude" });
    });
  });
});
