// "Publish all" tab: publishes every product and collection draft in one click, for bulk
// edits (e.g. adding many products). Single edits still use the normal Publish button.
import { useState } from "react";
import { useClient, type SanityDocument, type Tool } from "sanity";
import { Box, Button, Card, Stack, Text } from "@sanity/ui";

type Ref = { _ref: string };
type Draft = SanityDocument & {
  name?: string;
  slug?: { current?: string };
  id?: { current?: string };
  order?: number;
  collection?: Ref;
  alsoIn?: Ref[];
  hasSizes?: boolean;
  price?: number;
  sizes?: { S?: number; M?: number; L?: number };
  image?: { asset?: Ref };
  description?: string;
};

const isPrice = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value > 0;
const publishedId = (id: string) => id.replace(/^drafts\./, "");

/** What a draft is missing, mirroring the required fields in the schemas. Empty means it can go live. */
function missingFields(doc: Draft): string[] {
  const missing: string[] = [];
  if (!doc.name?.trim()) missing.push("name");
  if (typeof doc.order !== "number") missing.push("order");
  if (doc._type === "collection") {
    if (!doc.id?.current) missing.push("link id");
    return missing;
  }
  if (!doc.slug?.current) missing.push("link");
  if (!doc.collection?._ref) missing.push("main collection");
  if (!doc.image?.asset?._ref) missing.push("photo");
  if (!doc.description?.trim()) missing.push("description");
  const priced = doc.hasSizes ? isPrice(doc.sizes?.S) && isPrice(doc.sizes?.M) && isPrice(doc.sizes?.L) : isPrice(doc.price);
  if (!priced) missing.push(doc.hasSizes ? "size prices" : "price");
  return missing;
}

type Result = { published: string[]; skipped: string[] };

function PublishAll() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function run() {
    if (!window.confirm("Publish all product and collection drafts?")) return;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const { drafts, liveCollections } = await client.fetch<{ drafts: Draft[]; liveCollections: string[] }>(`{
        "drafts": *[_type in ["collection", "product"] && _id in path("drafts.**")],
        "liveCollections": *[_type == "collection" && !(_id in path("drafts.**"))]._id
      }`);

      const skipped: string[] = [];
      const ready = drafts.filter((doc) => {
        const missing = missingFields(doc);
        if (missing.length) skipped.push(`${doc.name?.trim() || "Untitled"} — missing ${missing.join(", ")}`);
        return !missing.length;
      });

      // A product can only point to collections that are (or are about to be) published.
      const collections = new Set([...liveCollections, ...ready.filter((doc) => doc._type === "collection").map((doc) => publishedId(doc._id))]);
      const toPublish = ready.filter((doc) => {
        if (doc._type !== "product") return true;
        const refs = [doc.collection, ...(doc.alsoIn ?? [])].flatMap((ref) => (ref ? [publishedId(ref._ref)] : []));
        const unpublished = refs.some((ref) => !collections.has(ref));
        if (unpublished) skipped.push(`${doc.name} — its collection isn't published yet`);
        return !unpublished;
      });

      if (toPublish.length) {
        // Collections first, so products in the same transaction can reference them.
        const ordered = [...toPublish].sort((a, b) => Number(b._type === "collection") - Number(a._type === "collection"));
        const tx = client.transaction();
        for (const { _rev: _ignoredRev, _updatedAt: _ignoredUpdatedAt, ...doc } of ordered) {
          tx.createOrReplace({ ...doc, _id: publishedId(doc._id) });
          tx.delete(doc._id);
        }
        await tx.commit();
      }
      setResult({ published: toPublish.map((doc) => doc.name ?? publishedId(doc._id)), skipped });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box padding={5} style={{ maxWidth: 640 }}>
      <Stack gap={4}>
        <Text size={3} weight="semibold">Publish all</Text>
        <Text size={2} muted>
          Publishes every product and collection draft at once. Drafts with missing details stay as drafts and are listed below.
          For a single change, use the normal Publish button on that item.
        </Text>
        <Box>
          <Button text={busy ? "Publishing…" : "Publish all drafts"} tone="positive" onClick={run} disabled={busy} />
        </Box>
        {error && <Card padding={3} tone="critical" radius={2}><Text size={1}>Nothing was published: {error}</Text></Card>}
        {result && (
          <Card padding={3} tone={result.skipped.length ? "caution" : "positive"} radius={2}>
            <Stack gap={3}>
              <Text size={1} weight="semibold">
                {result.published.length ? `Published ${result.published.length}: ${result.published.join(", ")}` : "No drafts to publish."}
              </Text>
              {result.skipped.length > 0 && (
                <Stack gap={2}>
                  <Text size={1} weight="semibold">Not published — fix these, then click again:</Text>
                  {result.skipped.map((line) => <Text key={line} size={1}>• {line}</Text>)}
                </Stack>
              )}
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

export const publishAllTool = (): Tool => ({
  name: "publish-all",
  title: "Publish all",
  component: PublishAll,
});
