import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { transform } from "esbuild";
import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [{ type: "bundle", input: "src/index.ts" }],
  hooks: {
    rolldownOutput(cfg) {
      // Not `true`: full oxc minification strips `#__PURE__` annotations, which
      // downstream bundlers need to tree-shake the eagerly-evaluated singletons
      // (`providerMetadata`, `providerInfo`, `agentInfo`). Whitespace is instead
      // minified by the `end` hook below, which re-inserts the annotations.
      cfg.minify = "dce-only";
    },
    async end(ctx) {
      const file = join(ctx.pkgDir, "dist/index.mjs");
      const code = await readFile(file, "utf8");

      // Every minifier (oxc and esbuild alike) drops annotation comments from
      // minified output, so: remember the annotated calls, minify whitespace and
      // syntax (identifiers are kept so the call sites stay addressable), then
      // put the annotations back.
      const pureCalls = [...code.matchAll(/(\w+) = \/\* #__PURE__ \*\/ (\w+)\(\)/g)];
      const minified = await transform(code, {
        minifyWhitespace: true,
        minifySyntax: true,
        format: "esm",
        target: "esnext",
      });

      let out = minified.code;
      for (const [, binding, fn] of pureCalls) {
        const plain = `${binding}=${fn}()`;
        if (!out.includes(plain)) {
          throw new Error(`[build] cannot re-insert #__PURE__ annotation for \`${plain}\``);
        }
        out = out.replace(plain, `${binding}=/* @__PURE__ */${fn}()`);
      }

      await writeFile(file, out);
    },
  },
});
