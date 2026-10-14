import { constants } from "node:fs";
import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
let copied = 0;

// Next 16.4 on Windows leaves backslash-separated segment paths nested in out/.
// The browser requests dot-separated payload filenames. Add those aliases to the
// export itself so client navigation works on any static host, not only preview.
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(source);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;
    const parts = path.relative(root, source).split(path.sep);
    const segment = parts.findIndex((part) => part.startsWith("__next."));
    if (segment < 0 || segment === parts.length - 1) continue;
    const destination = path.join(root, ...parts.slice(0, segment), parts.slice(segment).join("."));
    try {
      await copyFile(source, destination, constants.COPYFILE_EXCL);
      copied += 1;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
}

await visit(root);
console.log(`Static export ready: ${copied} navigation payload aliases added.`);
