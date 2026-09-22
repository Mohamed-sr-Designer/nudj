/* =========================================================
   نُضْج — المولّد الوحيد للموقع
   node build.js
   يبني كل الصفحات من src/ ومن assets/js/data.js، ويولّد:
   sitemap.xml · robots.txt · llms.txt · manifest.webmanifest
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const ROOT = __dirname;
const rel = p => path.join(ROOT, p);
const read = p => fs.readFileSync(rel(p), "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(rel(p)), { recursive: true }); fs.writeFileSync(rel(p), s); };

/* ---------- تحميل البيانات ودوال العرض في بيئة معزولة ---------- */
const sandbox = { window: { addEventListener() { } }, console };
vm.createContext(sandbox);
vm.runInContext(read("assets/js/data.js"), sandbox, { filename: "data.js" });

/* ---------- اكتشاف الصور من أسماء الملفات → assets/js/images.js ----------
   site/<key>.ext · products/<id>-1|2|3.ext */
{
  const EXT = /\.(jpe?g|png|webp)$/i;
  const list = dir => { try { return fs.readdirSync(rel(dir)).filter(f => EXT.test(f)).sort(); } catch (e) { return []; } };
  const M = { site: {}, products: {} };
  list("assets/img/site").forEach(f => { const k = f.replace(EXT, ""); if (!M.site[k] || /\.webp$/i.test(f)) M.site[k] = "assets/img/site/" + f; });
  list("assets/img/products").forEach(f => {
    const m = f.replace(EXT, "").match(/^(.+)-([123])$/); if (!m) return;
    (M.products[m[1]] = M.products[m[1]] || [])[+m[2] - 1] = "assets/img/products/" + f;
  });
  const n = Object.keys(M.site).length + Object.keys(M.products).reduce((t, k) => t + M.products[k].filter(Boolean).length, 0);
  write("assets/js/images.js", `/* مولّد تلقائياً بواسطة build.js — لا تعدّله يدوياً (${n} صورة مكتشفة).
   يربط الصور المحفوظة بأسمائها الصحيحة بخاناتها في الموقع. */
(function (D) {
  if (!D) return;
  var M = ${JSON.stringify(M)};
  Object.keys(M.site).forEach(function (k) { if (!D.IMAGES[k]) D.IMAGES[k] = M.site[k]; });
  D.PRODUCTS.forEach(function (p) {
    var f = (M.products[p.id] || []).filter(Boolean);
    if (f.length) { if (!p.img) p.img = f[0]; if (!p.gallery || !p.gallery.length) p.gallery = p.img === f[0] ? f.slice(1) : f; }
  });
})(window.NUDJ);
`);
  console.log("  images: " + n + " detected");
}
vm.runInContext(read("assets/js/images.js"), sandbox, { filename: "images.js" });
vm.runInContext(read("assets/js/store.js"), sandbox, { filename: "store.js" });
vm.runInContext(read("assets/js/ui.js"), sandbox, { filename: "ui.js" });
const D = sandbox.window.NUDJ, U = sandbox.window.NUDJ_UI, S = sandbox.window.NUDJ_STORE, C = D.CONFIG;

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
  faq(q, a) { return `<details><summary>${q}${icon("plus", "faq__ic", 2)}</summary><div class="a">${a}</div></details>`; }
};
const ctx = { D, U, C, S, V, h };
const render = require("./src/shell.js")(ctx);

/* ---------- الصفحات ---------- */
const MODULES = ["home", "shop", "product", "commerce", "info"];
let pages = [];
MODULES.forEach(m => { pages = pages.concat(require("./src/pages/" + m + ".js")(ctx)); });

const produced = [];
pages.forEach(p => { write(p.file, render(p, p.main)); produced.push(p.file); });

/* ---------- صفحة 404 (مسارات مطلقة) + تحويل الروابط القديمة ---------- */
{
  const ids = D.PRODUCTS.map(p => p.id);
  const OLD = { "lamb-leg-boneless": "lamb-leg", "beef-round": "beef-topside", "box-family": "shop.html", "box-grill": "shop.html?a=extra", "box-steak": "beef-ribeye" };
  const DISH = { kabsa: "feast", mandi: "feast", slow: "feast", mashawi: "grill", burger: "grill", steak: "steak" };
  const p = { name: "notfound", file: "404.html", tab: "", mode: "push", back: ["index.html", "الرئيسية"], appTitle: "غير موجودة", noindex: true,
    title: "الصفحة غير موجودة · نُضْج", desc: "الصفحة المطلوبة غير موجودة." };
  let html = render(p, `<div class="wrap"><div class="nf">
  <div class="nf__code num">404</div><h1>الصفحة غير موجودة</h1>
  <p class="muted">يمكن الرابط قديم أو فيه خطأ. جرّب واحدة من هذي:</p>
  <div class="row-btns" style="justify-content:center"><a class="btn btn--ember" href="shop.html">المتجر</a><a class="btn btn--line" href="advisor.html">المستشار</a><a class="btn btn--line" href="index.html">الرئيسية</a></div>
</div></div>`);
  /* الروابط القديمة (أدلة، أطباق، منتجات أُعيدت تسميتها) تنتقل تلقائياً لبديلها */
  const redirect = `<script>(function(){var f=location.pathname.split("/").pop().replace(/\\.html$/,""),ids=${JSON.stringify(ids)},old=${JSON.stringify(OLD)},dish=${JSON.stringify(DISH)},t="";
if(f.indexOf("guide-")===0){var g=f.slice(6);t=ids.indexOf(g)>-1?g+".html":old[g]?(old[g].indexOf(".html")>-1?old[g]:old[g]+".html"):"advisor.html";}
else if(f.indexOf("dish-")===0){t="advisor.html?o="+(dish[f.slice(5)]||"feast");}
else if(old[f]){t=old[f].indexOf(".html")>-1?old[f]:old[f]+".html";}
if(t)location.replace(t);})();</script>`;
  html = html.replace("<head>", `<head>\n<base href="${C.base}">\n${redirect}`);
  write("404.html", html); produced.push("404.html");
}
const stub = (file, js, fallback) => {
  write(file, `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow">
<title>انتقال · نُضْج</title><meta http-equiv="refresh" content="1;url=${fallback}"><link rel="canonical" href="${C.base}${fallback}">
<script>(function(){var q=new URLSearchParams(location.search);${js}location.replace(t||"${fallback}");})();</script></head>
<body style="font-family:system-ui;padding:40px;text-align:center;background:#0E1216;color:#EDE8E1">جارٍ نقلك… <a style="color:#FF5A36" href="${fallback}">اضغط هنا إن لم يحدث تلقائياً</a></body></html>`);
  produced.push(file);
};
const idsJ = JSON.stringify(D.PRODUCTS.map(p => p.id));
stub("category.html", `var a=q.get("a"),t=a==="ضأن"?"lamb.html":a==="بقر"?"beef.html":"";`, "shop.html");
stub("cut.html", `var c=q.get("c");var t=${idsJ}.indexOf(c)>-1?c+".html":"";`, "shop.html");
stub("product.html", `var c=q.get("id");var t=${idsJ}.indexOf(c)>-1?c+".html":"";`, "shop.html");
stub("dish.html", `var d=q.get("d"),m={kabsa:"feast",mandi:"feast",mashawi:"grill",steak:"steak",burger:"grill",slow:"feast"};var t="advisor.html?o="+(m[d]||"feast");`, "advisor.html");
["library.html", "expertise.html", "cook.html", "subscribe.html", "consult.html"].forEach(f => stub(f, `var t="";`, "advisor.html"));

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
const priceTxt = p => p.sold === "carcass" ? p.sizes.map(s => `${s.l} ≈${s.kg} كجم ${money(s.p)} ر.س`).join("، ") : money(p.price) + " ر.س " + (p.sold === "kg" ? "للكيلو" : "لل" + (p.unitName || "حبة"));
write("llms.txt", `# نُضْج — NUDJ

> ملحمة إلكترونية سعودية ومستشار طبخ تفاعلي. ست مواشي (ضأن، ماعز، حاشي، عجل، بقر، جاموس)، قطعيات بالكيلو تُقطّع مجاناً بأي شكل، وذبائح كاملة ونصف وربع. المستشار يسأل عن المناسبة وعدد الأشخاص ويحسب الكميات بالجرام مع التتبيلة والفحم والبهارات، ثم يضيف الخطة للسلة.

- كل الأسعار بالريال السعودي وشاملة ضريبة القيمة المضافة (15٪). الأسعار الحالية مقترحة لنسخة العرض.
- التقطيع مجاني. خدمات مدفوعة بالكيلو: تتبيل (${D.MARINADES.filter(m => m.p).map(m => m.n + " " + m.p).join("، ")} ر.س)، تسييخ ${D.SERVICES.skewer.p} ر.س، تغليف مفرّغ ${D.SERVICES.vacuum.p} ر.س (${D.SERVICES.vacuum.carcass} ر.س للذبيحة).
- التوصيل ${C.delivery.fee} ر.س، ومجاني من ${C.delivery.freeOver} ر.س. المدن: ${C.cities.join("، ")}.
- قواعد المستشار: ${D.ADVISOR.grams.grill} جم للشخص مشاوي بدون عظم، ${D.ADVISOR.grams.kabsa} جم كبسة ومندي بالعظم، ${D.ADVISOR.grams.steak} جم ستيك، ${D.ADVISOR.grams.stew} جم مرق.

## المستشار
- [مستشار نُضْج](${C.base}advisor.html)

${D.ANIMALS.map(a => `## ${a.n}
- [قطعيات ${a.n}](${C.base}${a.k}.html): ${a.note}
${D.cutsOf(a.k).map(p => `- [${p.name}](${C.base}${p.id}.html): ${p.short} — ${priceTxt(p)}`).join("\n")}`).join("\n\n")}

## عدّة الشواء والبهارات
${D.extras().map(p => `- [${p.name}](${C.base}${p.id}.html): ${p.short} — ${priceTxt(p)}`).join("\n")}

## المساعدة
- [الأسئلة الشائعة](${C.base}help.html) · [تواصل معنا](${C.base}contact.html) · [من نحن](${C.base}about.html)
`);

/* ---------- تطبيق الويب (PWA) — الأيقونات ملفات ثابتة في assets/icons ---------- */
write("manifest.webmanifest", JSON.stringify({
  name: "نُضْج — ملحمة ومستشار طبخ", short_name: "نُضْج", lang: "ar", dir: "rtl",
  start_url: "./index.html", scope: "./", display: "standalone", orientation: "portrait",
  background_color: "#0E1216", theme_color: "#0E1216",
  icons: [
    { src: "assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "assets/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
}, null, 2));

console.log(`✓ ${pages.length} pages + 404 + redirects · sitemap ${indexable.length} urls`);
