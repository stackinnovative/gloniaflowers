import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./env";

export default defineCliConfig({
  api: { projectId, dataset },
  // TODO client: pick the Studio address, e.g. glonia → https://glonia.sanity.studio
  studioHost: "glonia",
});
