import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzip } from "node:zlib";
import { promisify } from "node:util";

const compress = promisify(gzip);
const textExtensions = new Set([".html", ".txt", ".js", ".css", ".json", ".svg"]);

// Preview the production export, including Next's clean URLs and navigation payloads.
const root = path.resolve("out");
const portArgument = process.argv.indexOf("--port");
const port = Number(portArgument < 0 ? process.env.PORT ?? 3000 : process.argv[portArgument + 1]);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Use a valid --port (0–65535).");
await stat(path.join(root, "index.html")).catch(() => { throw new Error("Run npm run build before npm start."); });
const types = {
  ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2",
};

const server = http.createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); response.end("Bad request"); return; }
  let file = path.resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403); response.end("Forbidden"); return;
  }
  if (pathname === "/") file = path.join(root, "index.html");
  else if (pathname.endsWith("/")) file = `${file}.html`;
  else if (!path.extname(file)) file += ".html";
  try {
    let body = await readFile(file);
    const headers = {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache",
    };
    if (textExtensions.has(path.extname(file))) {
      headers.Vary = "Accept-Encoding";
      const acceptsGzip = (request.headers["accept-encoding"] ?? "").split(",").some((part) => {
        const [encoding, ...parameters] = part.trim().split(";");
        return encoding.trim() === "gzip" && !parameters.some((parameter) => /^\s*q\s*=\s*0(?:\.0*)?\s*$/.test(parameter));
      });
      if (acceptsGzip) {
        body = await compress(body);
        headers["Content-Encoding"] = "gzip";
      }
    }
    headers["Content-Length"] = body.length;
    response.writeHead(200, headers);
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    const body = await readFile(path.join(root, "404.html")).catch(() => "Not found");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : body);
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
