import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { rollup } from "rollup";
import { beforeAll, describe, expect, it } from "vitest";

// These tests guard the tree-shaking contract of `dist/index.mjs`: a consumer
// importing only a subset of the API must not pull the agent/provider detection
// tables (or the eager singletons) into their bundle. This depends on both the
// `#__PURE__` annotations surviving minification (build.config.ts) and the
// derived exports being wrapped so they don't pin the singletons (see AGENTS.md).

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const distFile = fileURLToPath(new URL("../dist/index.mjs", import.meta.url));

// Unique substrings that only appear when a detection table is retained.
const AGENT_TABLE = "CLAUDECODE"; // from the `agents` table
const PROVIDER_TABLE = "GITHUB_ACTIONS"; // from the `providers` table

/** Tree-shake `dist/index.mjs` down to `names`, returning the emitted code. */
async function bundle(names: string[]): Promise<string> {
  const entry = "\0std-env-entry";
  const build = await rollup({
    input: entry,
    // Silence the "empty chunk"/circular warnings; failures still throw.
    onwarn: () => {},
    plugins: [
      {
        name: "virtual-entry",
        resolveId(id) {
          if (id === entry) return entry;
          if (id === "std-env") return distFile;
        },
        load(id) {
          if (id === entry) {
            // Reference each import so rollup must keep it, but nothing else.
            return `import { ${names.join(", ")} } from "std-env";\n${names
              .map((n) => `globalThis.__keep__ ??= ${n};`)
              .join("\n")}`;
          }
        },
      },
    ],
  });
  const { output } = await build.generate({ format: "es" });
  await build.close();
  return output[0].code;
}

let dist: string;

beforeAll(() => {
  // Build a fresh dist so the test always reflects current source (CI builds
  // before vitest; a local `pnpm test` may not).
  execSync("pnpm run build", { cwd: rootDir, stdio: "ignore" });
  dist = readFileSync(distFile, "utf8");
}, 120_000);

describe("dist tree-shaking", () => {
  it("keeps the #__PURE__ annotations that enable downstream DCE", () => {
    // If someone switches build.config.ts to `minify: true` or drops the terser
    // hook, these vanish and every consumer re-inlines the whole library.
    const count = dist.match(/__PURE__/g)?.length ?? 0;
    expect(count).toBeGreaterThanOrEqual(6);
  });

  it("sanity: the full dist still contains both detection tables", () => {
    expect(dist).toContain(AGENT_TABLE);
    expect(dist).toContain(PROVIDER_TABLE);
  });

  it.each([["runtime"], ["env"], ["platform"], ["nodeVersion"]])(
    "import { %s } drops BOTH detection tables",
    async (name) => {
      const code = await bundle([name]);
      expect(code, "agent table leaked").not.toContain(AGENT_TABLE);
      expect(code, "provider table leaked").not.toContain(PROVIDER_TABLE);
    },
  );

  it.each([["provider"], ["isCI"], ["isMinimal"], ["isColorSupported"]])(
    "import { %s } drops the agent table (keeps provider)",
    async (name) => {
      const code = await bundle([name]);
      expect(code, "agent table leaked").not.toContain(AGENT_TABLE);
      expect(code).toContain(PROVIDER_TABLE);
    },
  );

  it.each([["agent"], ["isAgent"]])(
    "import { %s } drops the provider table (keeps agent)",
    async (name) => {
      const code = await bundle([name]);
      expect(code, "provider table leaked").not.toContain(PROVIDER_TABLE);
      expect(code).toContain(AGENT_TABLE);
    },
  );

  it("a runtime-only bundle is a fraction of the full library", async () => {
    const code = await bundle(["runtime"]);
    const full = gzipSync(dist).length;
    const shaken = gzipSync(code).length;
    // Full dist is ~1.9 kB gzipped; a runtime-only bundle must be well under half.
    expect(shaken).toBeLessThan(full * 0.6);
  });
});
