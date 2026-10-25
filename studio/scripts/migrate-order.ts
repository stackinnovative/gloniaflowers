// One-off: turn the old "Order" numbers into drag-and-drop positions (orderRank), keeping the same order.
// Run from studio/: npm run migrate-order   (safe to re-run: it recomputes from the old numbers)
import { getCliClient } from "sanity/cli";
import { orderRanks } from "./orderRanks";

const client = getCliClient({ apiVersion: "2025-02-19" });

for (const type of ["collection", "product"]) {
  // Published and draft versions; a draft-only item is ranked by its draft.
  const docs = await client.fetch<{ _id: string }[]>(
    `*[_type == $type] | order(order asc, name asc) { _id }`,
    { type },
    { perspective: "raw" },
  );
  const ids = [...new Set(docs.map((doc) => doc._id.replace(/^drafts\./, "")))];
  const existing = new Set(docs.map((doc) => doc._id));
  const ranks = orderRanks(ids.length);
  const tx = client.transaction();
  ids.forEach((id, index) => {
    for (const version of [id, `drafts.${id}`]) {
      if (existing.has(version)) tx.patch(version, (patch) => patch.set({ orderRank: ranks[index] }));
    }
  });
  await tx.commit();
  console.log(`${type}: ranked ${ids.length}`);
}
