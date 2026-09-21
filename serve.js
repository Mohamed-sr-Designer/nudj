// خادم محلي للتطوير — يحاكي GitHub Pages (صفحة 404 مخصصة) بدون كاش
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 4774;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".ico": "image/x-icon", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".mp4": "video/mp4"
};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) {
      return fs.readFile(path.join(ROOT, "404.html"), (e2, nf) => {
        res.writeHead(404, { "Content-Type": TYPES[".html"], "Cache-Control": "no-store" });
        res.end(e2 ? "not found" : nf);
      });
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(PORT, () => console.log("نُضْج dev server → http://localhost:" + PORT));
