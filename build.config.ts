import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [{ type: "transform", input: "src", minify: true }],
});
