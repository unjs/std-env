import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { detectAgent } from "../src/agents.ts";

// All env vars that agent detection may check
const agentEnvKeys = [
  "AI_AGENT",
  "CLAUDECODE",
  "CLAUDE_CODE",
  "REPL_ID",
  "GEMINI_CLI",
  "CODEX_SANDBOX",
  "CODEX_THREAD_ID",
  "AUGMENT_AGENT",
  "OPENCODE",
  "GOOSE_PROVIDER",
  "CURSOR_AGENT",
  "TERM_PROGRAM",
  "EDITOR",
  "PATH",
];

describe("detectAgent", () => {
  beforeEach(() => {
    // Clear all agent-related env vars to ensure a clean slate
    for (const key of agentEnvKeys) {
      vi.stubEnv(key, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty object when no agent env is set", () => {
    expect(detectAgent()).toEqual({});
  });

  it("AI_AGENT takes priority over specific agents", () => {
    vi.stubEnv("AI_AGENT", "custom-agent");
    vi.stubEnv("CLAUDECODE", "1");
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
        vi.stubEnv(envKey, envValue);
        expect(detectAgent()).toEqual({ name: expectedName });
      });
    }
  });

  describe("regex env var checks", () => {
    it("detects kiro via TERM_PROGRAM matching /kiro/", () => {
      vi.stubEnv("TERM_PROGRAM", "kiro-terminal");
      expect(detectAgent()).toEqual({ name: "kiro" });
    });

    it("does not detect kiro when TERM_PROGRAM does not match", () => {
      vi.stubEnv("TERM_PROGRAM", "vscode");
      expect(detectAgent()).toEqual({});
    });

    it("detects devin via EDITOR matching /devin/", () => {
      vi.stubEnv("EDITOR", "/usr/bin/devin-editor");
      expect(detectAgent()).toEqual({ name: "devin" });
    });

    it("does not detect devin when EDITOR does not match", () => {
      vi.stubEnv("EDITOR", "vim");
      expect(detectAgent()).toEqual({});
    });

    it("detects pi via PATH containing .pi/agent/bin", () => {
      vi.stubEnv("PATH", "/home/user/.pi/agent/bin:/usr/bin");
      expect(detectAgent()).toEqual({ name: "pi" });
    });

    it("does not detect pi when PATH does not contain .pi/agent/bin", () => {
      vi.stubEnv("PATH", "/usr/bin:/usr/local/bin");
      expect(detectAgent()).toEqual({});
    });
  });

  describe("priority order", () => {
    it("claude is detected before cursor", () => {
      vi.stubEnv("CURSOR_AGENT", "1");
      vi.stubEnv("CLAUDECODE", "1");
      expect(detectAgent()).toEqual({ name: "claude" });
    });

    it("claude is detected before replit", () => {
      vi.stubEnv("CLAUDECODE", "1");
      vi.stubEnv("REPL_ID", "1");
      expect(detectAgent()).toEqual({ name: "claude" });
    });
  });
});
