import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./env";

export default defineCliConfig({
  api: { projectId, dataset },
  // Deployed at https://glonia.sanity.studio
  studioHost: "glonia",
  deployment: { appId: "ldt7k2bt792q0bt29r6d85b7" },
});
