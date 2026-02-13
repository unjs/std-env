import { expect, it, describe, beforeEach, afterEach } from "vitest";
import { detectAgent } from "../src/agents.ts";

describe("detectAgent", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
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
      ["claude", "CLAUDECODE", "1"],
      ["claude", "CLAUDE_CODE", "1"],
      ["replit", "REPL_ID", "abc"],
      ["gemini", "GEMINI_CLI", "1"],
      ["codex", "CODEX_SANDBOX", "1"],
      ["codex", "CODEX_THREAD_ID", "thread-1"],
      ["auggie", "AUGMENT_AGENT", "1"],
      ["opencode", "OPENCODE", "1"],
      ["goose", "GOOSE_PROVIDER", "openai"],
      ["cursor", "CURSOR_AGENT", "1"],
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

    it("detects pi via PATH containing .pi/agent/bin", () => {
      process.env.PATH = "/home/user/.pi/agent/bin:/usr/bin";
      expect(detectAgent()).toEqual({ name: "pi" });
    });

    it("does not detect pi when PATH does not contain .pi/agent/bin", () => {
      process.env.PATH = "/usr/bin:/usr/local/bin";
      expect(detectAgent()).toEqual({});
    });
  });

  describe("priority order", () => {
    it("claude is detected before cursor", () => {
      process.env.CURSOR_AGENT = "1";
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
