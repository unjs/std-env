import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [{ type: "bundle", input: ["src/index", "src/containers/index", "src/wsl/index"] }],
  hooks: {
    rolldownOutput(cfg) {
      cfg.minify = true;
    },
  },
});
