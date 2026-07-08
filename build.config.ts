import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { minify } from "terser";
import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [{ type: "bundle", input: ["src/index", "src/containers/index", "src/wsl/index"] }],
  hooks: {
    rolldownOutput(cfg) {
      // Not `true`: full oxc minification strips the `#__PURE__` annotations that
      // downstream bundlers need to tree-shake the eagerly-evaluated singletons
      // (`providerInfo`, `agentInfo`). We re-minify with terser in the `end` hook
      // below, which can keep the annotations while still mangling.
      cfg.minify = "dce-only";
    },
    async end(ctx) {
      const file = join(ctx.pkgDir, "dist/index.mjs");
      const code = await readFile(file, "utf8");

      // oxc and esbuild both drop annotation comments when minifying; terser
      // instead recognizes `#__PURE__` and re-emits it via `preserve_annotations`,
      // so we get a fully mangled bundle that still tree-shakes downstream.
      const { code: out } = await minify(code, {
        module: true,
        compress: true,
        mangle: true,
        format: { preserve_annotations: true },
      });
      if (!out) {
        throw new Error("[build] terser returned empty output");
      }

      await writeFile(file, out);
    },
  },
});
