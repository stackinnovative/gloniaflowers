// Set in studio/.env (see studio/.env.example). The Studio only exposes SANITY_STUDIO_* variables.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
export const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) throw new Error("Set SANITY_STUDIO_PROJECT_ID in studio/.env — see studio/README.md.");
