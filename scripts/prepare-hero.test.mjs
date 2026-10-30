import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import ts from "typescript";
import { heroWidths, prepareHero } from "./prepare-hero.mjs";

// Test the server helper with the project's compiler, including on Node versions
// that cannot import TypeScript directly.
const helper = await readFile(new URL("../lib/hero-image.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(helper, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { getHeroImage } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`);
const source = "https://cdn.sanity.io/images/project/production/photo-1200x1600.png?rect=100,50,600,800&w=800&fit=max&auto=format&q=75";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "glonia-hero-test-"));
  t.after(async () => {
    // Only remove the dedicated directory created by this test.
    assert.equal(path.dirname(root), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith("glonia-hero-test-"));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "data"));
  await writeFile(path.join(root, "data/settings.json"), JSON.stringify({ featured: { hero: ["left", "center", "right"] } }));
  await writeFile(path.join(root, "data/products.json"), JSON.stringify([{ slug: "center", image: source }]));
  return root;
}

function imageResponse() {
  // The download validator checks the container signature; real assets are decoded
  // separately in browser QA. No network is used in these failure-path tests.
  return new Response(Buffer.from("RIFF0000WEBPtest-data"), { headers: { "content-type": "image/webp" } });
}

test("widths respect the original/crop and unsupported transformations fall back", () => {
  assert.deepEqual(heroWidths(source), [320, 480, 560, 600]);
  assert.deepEqual(heroWidths(source.replace("600,800", "200,300")), [200]);
  assert.deepEqual(heroWidths(`${source}&h=100`), []);
  assert.deepEqual(heroWidths(`${source}&dpr=2`), []);
  assert.deepEqual(heroWidths(source.replace("fit=max", "fit=crop")), []);
  assert.deepEqual(heroWidths("https://example.com/photo-1200x1600.png"), []);
});

test("preserves CMS crop and quality, publishes complete variants, rejects stale/missing files", async (t) => {
  const root = await fixture(t);
  assert.equal(getHeroImage(source, root), null);
  const requested = [];
  const manifest = await prepareHero(root, async (url) => {
    requested.push(url);
    assert.equal(url.searchParams.get("rect"), "100,50,600,800");
    assert.equal(url.searchParams.get("q"), "75");
    assert.equal(url.searchParams.get("fm"), "webp");
    assert.equal(url.searchParams.get("auto"), null);
    return imageResponse();
  });
  assert.equal(requested.length, 4);
  assert.equal(manifest.source, source);
  assert.ok(getHeroImage(source, root).srcSet.endsWith("600w"));
  assert.equal(getHeroImage(source.replace("rect=100", "rect=101"), root), null);
  await unlink(path.join(root, "public", manifest.variants[0].src));
  assert.equal(getHeroImage(source, root), null);
});

test("failed refresh clears the old manifest and preserves the Sanity fallback", async (t) => {
  const root = await fixture(t);
  await prepareHero(root, async () => imageResponse());
  assert.ok(getHeroImage(source, root));
  const result = await prepareHero(root, async () => new Response("unavailable", { status: 503 }));
  assert.equal(result, null);
  assert.equal(getHeroImage(source, root), null);
  assert.equal(JSON.parse(await readFile(path.join(root, "data/hero-image.json"), "utf8")), null);
});

test("invalid image payloads cannot become a selected local hero", async (t) => {
  const root = await fixture(t);
  assert.equal(await prepareHero(root, async () => new Response("bad", { headers: { "content-type": "image/webp" } })), null);
  assert.equal(getHeroImage(source, root), null);
});

test("a partial download failure waits for other writes and never publishes a partial manifest", async (t) => {
  const root = await fixture(t);
  let completed = 0;
  const result = await prepareHero(root, async (url) => {
    if (url.searchParams.get("w") === "320") return new Response("unavailable", { status: 503 });
    await new Promise((resolve) => setTimeout(resolve, 20));
    completed++;
    return imageResponse();
  });
  assert.equal(completed, 3);
  assert.equal(result, null);
  assert.equal(getHeroImage(source, root), null);
});
