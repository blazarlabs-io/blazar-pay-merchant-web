import "server-only";
import { createClient } from "@sanity/client";
import { sanityConfig } from "@/lib/env";

export const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: "2023-05-03", // use current date (YYYY-MM-DD) to target the latest API version
  token: sanityConfig.token, // Needed for certain operations like updating content or accessing previewDrafts perspective
});

export const getSystemVariables = async () => {
  const data = await client.fetch('*[_type == "systemVariables"]');
  return data;
};
