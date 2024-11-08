import { defineBuildConfig } from "unbuild";
import type { Plugin, OutputChunk } from "rollup";
import { transform } from "esbuild";

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
  entries: ["src/index", "src/containers/index", "src/wsl/index"],
  hooks: {
    "rollup:options"(ctx, rollupConfig) {
      (rollupConfig.plugins as Plugin[]).push({
        name: "compat",
        async generateBundle(_options, bundle) {
          const cjsEntry = bundle["index.cjs"] as OutputChunk;
          if (!cjsEntry) {
            return;
          }
          cjsEntry.code = await transform(cjsEntry.code, {
            target: "es6",
            minify: true,
          }).then((r) => r.code);
        },
      } satisfies Plugin);
    },
  },
});
