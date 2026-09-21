/* =========================================================
   نُضْج — المولّد الوحيد للموقع
   node build.js
   يبني كل الصفحات من src/ ومن assets/js/data.js، ويولّد:
   sitemap.xml · robots.txt · llms.txt · manifest.webmanifest · أيقونات التطبيق
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");
const crypto = require("crypto");

const ROOT = __dirname;
const rel = p => path.join(ROOT, p);
const read = p => fs.readFileSync(rel(p), "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(rel(p)), { recursive: true }); fs.writeFileSync(rel(p), s); };

/* ---------- تحميل البيانات ودوال العرض في بيئة معزولة ---------- */
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(read("assets/js/data.js"), sandbox, { filename: "data.js" });
vm.runInContext(read("assets/js/ui.js"), sandbox, { filename: "ui.js" });
const D = sandbox.window.NUDJ, U = sandbox.window.NUDJ_UI, C = D.CONFIG;

/* ---------- إصدار الملفات (بصمة المحتوى) لكسر الكاش ---------- */
const vcache = {};
const V = p => vcache[p] || (vcache[p] = crypto.createHash("md5").update(fs.readFileSync(rel(p))).digest("hex").slice(0, 8));

/* ---------- مساعدات القوالب ---------- */
const { icon, esc } = U;
const h = {
  crumbs(list) {
    const items = [["الرئيسية", "index.html"]].concat(list);
    return `<nav class="crumbs" aria-label="مسار التنقل">${items.map((c, i) => {
      const last = i === items.length - 1;
      return (i ? icon("chevL") : "") + (last || !c[1] ? `<span${last ? ' aria-current="page"' : ""}>${esc(c[0])}</span>` : `<a href="${c[1]}">${esc(c[0])}</a>`);
    }).join("")}</nav>`;
  },
  secHead(title, sub, href, label, id) {
    return `<div class="sec-head"><div><h2${id ? ` id="${id}"` : ""}>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${href ? `<a class="seeall" href="${href}">${label}${icon("chevL")}</a>` : ""}</div>`;
  },
  faq(q, a) { return `<details><summary>${q}${icon("chevD")}</summary><div class="a">${a}</div></details>`; }
};
const ctx = { D, U, C, V, h };
const render = require("./src/shell.js")(ctx);

/* ---------- الصفحات ---------- */
const MODULES = ["home", "shop", "product", "expertise", "commerce", "info"];
let pages = [];
MODULES.forEach(m => { const r = require("./src/pages/" + m + ".js")(ctx); pages = pages.concat(r); });

const produced = [];
pages.forEach(p => {
  const html = render(p, p.main);
  write(p.file, html);
  produced.push(p.file);
});

/* ---------- صفحة 404 (مسارات مطلقة لأنها قد تُعرض من أي مسار) ---------- */
{
  const p = { name: "notfound", file: "404.html", tab: "", mode: "push", back: ["index.html", "الرئيسية"], appTitle: "غير موجودة", noindex: true,
    title: "الصفحة غير موجودة · نُضْج", desc: "الصفحة المطلوبة غير موجودة." };
  let html = render(p, `<div class="wrap"><div class="nf">
  <div class="code">404</div><h1 style="margin-top:12px">الصفحة غير موجودة</h1>
  <p class="muted" style="margin:8px 0 22px">يمكن الرابط قديم أو فيه خطأ. جرّب واحدة من هذي:</p>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn--brand" href="shop.html">المتجر</a><a class="btn btn--ghost" href="index.html">الرئيسية</a><a class="btn btn--ghost" href="search.html">البحث</a></div>
</div></div>`);
  html = html.replace("<head>", `<head>\n<base href="${C.base}">`);
  write("404.html", html); produced.push("404.html");
}

/* ---------- تحويل الروابط القديمة ---------- */
const stub = (file, js, fallback) => {
  write(file, `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow">
<title>انتقال · نُضْج</title><meta http-equiv="refresh" content="1;url=${fallback}"><link rel="canonical" href="${C.base}${fallback}">
<script>(function(){var q=new URLSearchParams(location.search);${js}location.replace(t||"${fallback}");})();</script></head>
<body style="font-family:system-ui;padding:40px;text-align:center">جارٍ نقلك… <a href="${fallback}">اضغط هنا إن لم يحدث تلقائياً</a></body></html>`);
  produced.push(file);
};
const ids = JSON.stringify(D.PRODUCTS.map(p => p.id));
stub("category.html", `var a=q.get("a"),m=q.get("m"),t=a==="ضأن"?"shop.html?t=lamb":a==="بقر"?"shop.html?t=beef":m?"shop.html?m="+encodeURIComponent(m):"";`, "shop.html");
stub("cut.html", `var c=q.get("c");if(c==="beef-neck")c="beef-mince";var t=${ids}.indexOf(c)>-1?c+".html":"";`, "shop.html");
stub("product.html", `var c=q.get("id");var t=${ids}.indexOf(c)>-1?c+".html":"";`, "shop.html");
stub("dish.html", `var d=q.get("d");var t=${JSON.stringify(D.DISHES.map(d => d.slug))}.indexOf(d)>-1?"dish-"+d+".html":"";`, "expertise.html");
stub("library.html", `var t="";`, "expertise.html");

/* ---------- حذف الصفحات المولّدة سابقاً ولم تعد موجودة ---------- */
const MAN = ".build-manifest.json";
try {
  const old = JSON.parse(read(MAN));
  old.filter(f => produced.indexOf(f) < 0).forEach(f => { try { fs.unlinkSync(rel(f)); console.log("  − removed " + f); } catch (e) { } });
} catch (e) { }
write(MAN, JSON.stringify(produced.sort(), null, 1));

/* ---------- sitemap / robots / llms ---------- */
const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter(p => !p.noindex).map(p => p.file);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(f => `  <url><loc>${C.base}${f === "index.html" ? "" : f}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *
Allow: /
Disallow: /src/

Sitemap: ${C.base}sitemap.xml
`);
const money = U.money;
write("llms.txt", `# نُضْج — NUDJ

> ملحمة إلكترونية سعودية تبيع الذبائح وقطعيات الضأن والبقر والمفروم والبوكسات، مقطّعة ومغلّفة حسب طبخة العميل وتوصل مبرّدة. ومعها خدمة إضافية اختيارية مدفوعة اسمها «الخبرة»: أدلة مصوّرة للتقطيع والطبخ، مختبر الطبخ، واستشارة مع جزّار.

- كل الأسعار بالريال السعودي وشاملة ضريبة القيمة المضافة (15٪).
- التوصيل ${C.delivery.fee} ر.س، ومجاني من ${C.delivery.freeOver} ر.س. المدن: ${C.cities.join("، ")}.
- الخبرة: الدليل الواحد ${C.guidePrice} ر.س، اشتراك نُضْج+ ${C.plans.monthly.price} ر.س شهرياً أو ${C.plans.annual.price} ر.س سنوياً، الاستشارة ${C.consult.price} ر.س (${C.consult.memberPrice} ر.س للأعضاء).
- ملاحظة: الموقع حالياً نسخة عرض؛ الصور مستطيلات رمادية مؤقتة والأسعار تقريبية.

## المتجر
- [كل المنتجات](${C.base}shop.html)
- [مخطط الذبيحة](${C.base}cuts.html): تسوّق حسب المنطقة (الرقبة، الكتف، الريش، الخاصرة، الفخذ، الصدر، الموزة)
${D.PRODUCTS.map(p => `- [${p.name}](${C.base}${p.id}.html): ${p.short} — ${p.type === "carcass" ? "من " + money(Math.min.apply(null, p.sizes.map(s => s.p))) + " ر.س" : money(p.price) + " ر.س" + (p.unit === "kg" ? " للكيلو" : p.type === "box" ? "" : " لل" + (p.unitName || "حبة"))}`).join("\n")}

## وش تطبخ؟ (أي قطعة لأي طبخة)
${D.DISHES.map(d => `- [${d.name}](${C.base}dish-${d.slug}.html): ${d.needs}. ${d.perPerson}. القطعيات: ${d.cuts.map(c => D.byId(c).name).join("، ")}.`).join("\n")}

## الخبرة
- [مركز الخبرة ونُضْج+](${C.base}expertise.html)
- [مختبر الطبخ](${C.base}cook.html)
- [استشارة جزّار](${C.base}consult.html)
- [دليل تقطيع الذبيحة](${C.base}guide-carcass.html)

## المساعدة
- [الأسئلة الشائعة](${C.base}help.html) · [تواصل معنا](${C.base}contact.html) · [من نحن](${C.base}about.html)
`);

/* ---------- تطبيق الويب (PWA) ---------- */
write("manifest.webmanifest", JSON.stringify({
  name: "نُضْج — لحم طازج مقطّع على طبختك", short_name: "نُضْج", lang: "ar", dir: "rtl",
  start_url: "./index.html", scope: "./", display: "standalone", orientation: "portrait",
  background_color: "#F4F1EA", theme_color: "#F4F1EA",
  icons: [
    { src: "assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "assets/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
}, null, 2));

/* ---------- أيقونات PNG (بدون مكتبات): خطوط القطع على مربع بلون الهوية ---------- */
function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function drawIcon(S) {
  const bg = [0x6B, 0x1D, 0x24], fg = [0xF4, 0xF1, 0xEA];
  const curves = [[[6.5, 16.5], [8.5, 12.5], [10.7, 9.9], [12.1, 7.5]], [[10.4, 18.2], [12.3, 14.3], [14.2, 11.8], [15.6, 9.4]], [[14.6, 18.6], [16, 15.7], [17, 14.2], [17.9, 12.8]]];
  const k = S * 0.56 / 11.4, cx = 12.2, cy = 13.05;
  const pts = curves.map(cv => { const a = []; for (let i = 0; i <= 40; i++) { const t = i / 40, u = 1 - t;
    const x = u * u * u * cv[0][0] + 3 * u * u * t * cv[1][0] + 3 * u * t * t * cv[2][0] + t * t * t * cv[3][0];
    const y = u * u * u * cv[0][1] + 3 * u * u * t * cv[1][1] + 3 * u * t * t * cv[2][1] + t * t * t * cv[3][1];
    a.push([S / 2 + (x - cx) * k, S / 2 + (y - cy) * k]); } return a; });
  const half = 1.05 * k;
  const segDist = (px, py, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
    const x = a[0] + t * dx - px, y = a[1] + t * dy - py; return Math.sqrt(x * x + y * y); };
  const raw = Buffer.alloc((S * 4 + 1) * S);
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    for (let x = 0; x < S; x++) {
      let d = 1e9; const px = x + .5, py = y + .5;
      for (const line of pts) for (let i = 0; i < line.length - 1; i++) { const v = segDist(px, py, line[i], line[i + 1]); if (v < d) d = v; }
      const cov = Math.max(0, Math.min(1, half - d + .5));
      const o = y * (S * 4 + 1) + 1 + x * 4;
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(bg[c] + (fg[c] - bg[c]) * cov);
      raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk("IHDR", ihdr), pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })), pngChunk("IEND", Buffer.alloc(0))]);
}
fs.mkdirSync(rel("assets/icons"), { recursive: true });
[["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]].forEach(([f, s]) => {
  const out = rel("assets/icons/" + f);
  if (!fs.existsSync(out)) fs.writeFileSync(out, drawIcon(s));
});
write("assets/icons/icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#6B1D24"/><g fill="none" stroke="#F4F1EA" stroke-width="1.7" stroke-linecap="round"><path d="M6.5 16.5c2-4 4.2-6.6 5.6-9M10.4 18.2c1.9-3.9 3.8-6.4 5.2-8.8M14.6 18.6c1.4-2.9 2.4-4.4 3.3-5.8"/></g></svg>`);

console.log(`✓ ${pages.length} pages + 404 + 5 redirects · sitemap ${indexable.length} urls`);
