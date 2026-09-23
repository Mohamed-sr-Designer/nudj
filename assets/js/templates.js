/* مولّد تلقائياً بواسطة build.js — لا تعدّله يدوياً.
   قوالب الصفحات في المتصفح: تُحمَّل فقط حين يختلف محتوى لوحة التحكم عن الصفحة الثابتة. */
window.NUDJ_TPL = (function () {
  "use strict";
  var M = {};
M["shell"] = (function () { var module = { exports: {} };
/* =========================================================
   نُضْج — الإطار المشترك لكل الصفحات
   ترويسة الموقع + شريط التطبيق (iOS) + شريط التبويبات + الفوتر
   (يعمل في build.js وفي المتصفح لإعادة الرسم بعد تعديلات لوحة التحكم)
   العربية في الجذر (rtl) والإنجليزية في /en/ (ltr) — نفس أسماء الملفات.
   ========================================================= */
module.exports = function makeShell(ctx) {
  const { D, U, C, V } = ctx;
  const { icon, esc, tpl, L } = U;
  const T = () => D.COPY;
  const EN = D.lang === "en";
  /* بادئة ملفات الموقع (css/js/الأيقونات): ../ في /en/، ومطلقة في 404 */
  const R = ctx.R != null ? ctx.R : (D.R || "");
  const SITE = L("نُضْج", "NUDJ");
  const url = f => C.base + (EN ? "en/" : "") + (f === "index.html" ? "" : f);
  const alt = f => C.base + (EN ? "" : "en/") + (f === "index.html" ? "" : f);

  const NAV = () => [
    ["shop", "shop.html", T().nav.shop],
    ["herd", "cuts.html", T().nav.herd],
    ["carcass", "shop.html?a=carcass", T().nav.carcass],
    ["extras", "shop.html?a=extra", T().nav.extras]
  ];
  const TABS = [
    ["home", "index.html", "home", L("الرئيسية", "Home")],
    ["shop", "shop.html", "shop", L("المتجر", "Shop")],
    ["advisor", "advisor.html", "", L("المستشار", "Advisor")],
    ["cart", "cart.html", "cart", L("السلة", "Cart")],
    ["account", "account.html", "user", L("حسابي", "Account")]
  ];

  /* رابط اللغة الثانية لنفس الصفحة (app.js يحافظ على ?البحث و#القسم) */
  const langHref = m => (EN ? "../" : "en/") + (m.file === "index.html" || m.file === "404.html" ? "" : m.file);
  const langBtn = (m, cls) => `<a class="${cls}" href="${langHref(m)}" data-lang-switch hreflang="${EN ? "ar" : "en"}" lang="${EN ? "ar" : "en"}" aria-label="${EN ? "العربية" : "English"}"><span>${EN ? "ع" : "EN"}</span></a>`;

  const head = m => `<!DOCTYPE html>
<html lang="${EN ? "en" : "ar"}" dir="${EN ? "ltr" : "rtl"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${url(m.file)}">
<link rel="alternate" hreflang="${EN ? "en" : "ar"}" href="${url(m.file)}">
<link rel="alternate" hreflang="${EN ? "ar" : "en"}" href="${alt(m.file)}">
<link rel="alternate" hreflang="x-default" href="${EN ? alt(m.file) : url(m.file)}">`}
<meta name="nudj-content" content="${ctx.contentHash || "0"}" data-tpl="${V("assets/js/templates.js")}">
<meta name="theme-color" content="#0E1216">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${SITE}">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="${EN ? "manifest.webmanifest" : R + "manifest.webmanifest"}">
<link rel="icon" href="${R}assets/icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="${R}assets/icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${R}assets/icons/apple-touch-icon.png">
<meta property="og:type" content="${m.ogType || "website"}">
<meta property="og:site_name" content="${SITE}">
<meta property="og:locale" content="${EN ? "en_US" : "ar_SA"}">
<meta property="og:locale:alternate" content="${EN ? "ar_SA" : "en_US"}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${url(m.file)}">
${(m.ogImage || D.IMAGES["og-share"]) ? `<meta property="og:image" content="${C.base}${String(m.ogImage || D.IMAGES["og-share"]).replace(/^(\.\.\/)+/, "")}">
<meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;500;700;800;900&family=Handjet:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${R}assets/css/style.css?v=${V("assets/css/style.css")}">
<style id="theme">:root{--ember:${esc(D.THEME.accent || "#FF5A36")}}</style>
${m.preload ? `<link rel="preload" as="image" href="${m.preload}">` : ""}
${(m.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;

  const ticker = () => (T().ticker || []).length ? `<div class="util" role="note"><div class="util__track"><span>${T().ticker.map(t => `<i>${esc(tpl(t))}</i>`).join("")}</span></div></div>` : "";

  const siteHeader = m => `<header class="site-header"><div class="wrap hdr">
  <a class="hdr__logo" href="index.html" aria-label="${L("نُضْج — الرئيسية", "NUDJ — Home")}">${U.brand()}</a>
  <nav class="nav" aria-label="${L("التنقل الرئيسي", "Main navigation")}">${NAV().map(([k, h, t]) => `<a href="${h}"${m.nav === k ? ' class="is-on" aria-current="page"' : ""}>${esc(t)}</a>`).join("")}
    <a href="advisor.html" class="nav__adv${m.nav === "advisor" ? " is-on" : ""}"${m.nav === "advisor" ? ' aria-current="page"' : ""}><i class="live"></i>${esc(T().nav.advisor)}</a></nav>
  <form class="hdr-search" role="search" data-search-form>${icon("search")}<input type="search" name="q" placeholder="${esc(T().nav.search)}" aria-label="${L("ابحث في المتجر", "Search the shop")}" autocomplete="off"></form>
  <div class="hdr-tools">
    ${langBtn(m, "tool tool--lang")}
    <a class="tool${m.tab === "account" ? " is-on" : ""}" href="account.html" aria-label="${L("حسابي", "My account")}">${icon("user")}</a>
    <a class="tool" href="wishlist.html" aria-label="${L("المفضلة", "Wishlist")}">${icon("heart")}</a>
    <a class="tool hdr-cart${m.tab === "cart" ? " is-on" : ""}" href="cart.html" aria-label="${L("السلة", "Cart")}">${icon("cart")}<b class="badge" data-cart-count>0</b></a>
  </div>
</div></header>`;

  const trailBtn = t => {
    if (t === "search") return `<a class="ab-btn" href="search.html" aria-label="${L("بحث", "Search")}">${icon("search")}</a>`;
    if (t === "share") return `<button class="ab-btn" type="button" data-share aria-label="${L("مشاركة", "Share")}">${icon("share")}</button>`;
    if (t === "cart") return `<a class="ab-btn" href="cart.html" aria-label="${L("السلة", "Cart")}">${icon("cart")}<b class="badge" data-cart-count>0</b></a>`;
    if (t === "herd") return `<a class="ab-btn" href="cuts.html" aria-label="${L("القطيع", "The Herd")}">${icon("map")}</a>`;
    if (t.indexOf("wish:") === 0) return `<button class="ab-btn" type="button" data-wish="${t.slice(5)}" aria-label="${L("أضف للمفضلة", "Add to wishlist")}" aria-pressed="false">${icon("heart")}</button>`;
    return "";
  };
  const appBar = m => `<header class="app-bar">
  <div class="ab-lead">${m.mode === "push"
      ? `<a class="ab-back" href="${m.back ? m.back[0] : "index.html"}" data-back aria-label="${L("رجوع إلى", "Back to")} ${esc(m.back ? m.back[1] : L("الرئيسية", "Home"))}">${icon("chevR", "", 2.4)}<span>${esc(m.back ? m.back[1] : L("رجوع", "Back"))}</span></a>`
      : `<a class="ab-brand" href="index.html" aria-label="${L("نُضْج — الرئيسية", "NUDJ — Home")}">${U.logo()}</a>`}</div>
  <div class="ab-title" aria-hidden="true">${esc(m.appTitle || "")}</div>
  <div class="ab-trail">${m.mode === "push" || m.chrome === false ? "" : langBtn(m, "ab-btn ab-lang")}${(m.trail || []).map(trailBtn).join("")}</div>
</header>`;

  const tabbar = m => `<nav class="tabbar" aria-label="${L("التبويبات", "Tabs")}">${TABS.map(([k, h, ic, t]) => k === "advisor"
    ? `<a href="${h}" data-tab="${k}" class="tab-adv${m.tab === k ? " is-on" : ""}"${m.tab === k ? ' aria-current="page"' : ""}><span class="tab-adv__b">${U.mark()}</span><span>${t}</span></a>`
    : `<a href="${h}" data-tab="${k}"${m.tab === k ? ' class="is-on" aria-current="page"' : ""}>${icon(ic)}<span>${t}</span>${k === "cart" ? '<b class="badge" data-cart-count>0</b>' : ""}</a>`).join("")}</nav>`;

  const footer = m => `<footer class="site-footer"><div class="wrap">
  <div class="ftr">
    <div class="ftr__brand"><a href="index.html" class="ftr__logo" aria-label="${L("نُضْج — الرئيسية", "NUDJ — Home")}">${U.brand()}</a><p>${tpl(T().footer.about)}</p>
      <div class="ftr__meta"><span>${L("السجل التجاري", "CR no.")} <b>${esc(C.contact.cr)}</b></span><span>${L("الرقم الضريبي", "VAT no.")} <b>${esc(C.contact.vatNo)}</b></span><span>${L("للطلبات", "Orders")} <b>${esc(C.contact.phone)}</b></span></div></div>
    <div><h3>${esc(T().nav.herd)}</h3><ul>${D.ANIMALS.map(a => `<li><a href="${a.k}.html">${esc(a.n)}</a></li>`).join("")}</ul></div>
    <div><h3>${L("تسوّق", "Shop")}</h3><ul><li><a href="shop.html">${L("كل القطعيات", "All cuts")}</a></li><li><a href="shop.html?a=carcass">${esc(T().nav.carcass)}</a></li><li><a href="shop.html?a=extra">${esc(T().nav.extras)}</a></li><li><a href="advisor.html">${L("مستشار نُضْج", "NUDJ Advisor")}</a></li><li><a href="cuts.html">${L("خريطة القطعيات", "Cuts map")}</a></li></ul></div>
    <div><h3>${L("المساعدة", "Help")}</h3><ul><li><a href="help.html">${L("الأسئلة الشائعة", "FAQ")}</a></li><li><a href="help.html#delivery">${L("التوصيل", "Delivery")}</a></li><li><a href="account.html?s=orders">${L("تتبّع طلبك", "Track your order")}</a></li><li><a href="contact.html">${L("تواصل معنا", "Contact us")}</a></li><li><a href="about.html">${L("من نحن", "About us")}</a></li>
      <li><a href="${langHref(m)}" data-lang-switch hreflang="${EN ? "ar" : "en"}">${EN ? "العربية" : "English"}</a></li>
      <li><a href="${R}admin.html" class="ftr__admin" rel="nofollow">${icon("grid")}${L("لوحة التحكم", "Dashboard")}</a></li></ul></div>
  </div>
  <div class="ftr__bottom"><span>${esc(T().footer.copyright)}</span><span><a href="terms.html">${L("الشروط", "Terms")}</a> · <a href="privacy.html">${L("الخصوصية", "Privacy")}</a></span>
    <span class="pays" aria-label="${L("طرق الدفع", "Payment methods")}">${U.payments().filter(p => (p.logos || []).length).map(p => U.payLogos(p)).join("")}</span></div>
</div></footer>`;

  /* en.js يُحمَّل في الإنجليزية ولوحة التحكم و404 (التي تخدم اللغتين) */
  const SCRIPTS = m => ["assets/js/data.js"].concat(EN || m.name === "admin" || m.file === "404.html" ? ["assets/js/en.js"] : [],
    ["assets/js/images.js", "assets/js/content.js", "assets/js/cms.js", "assets/js/store.js", "assets/js/ui.js", "assets/js/app.js", "assets/js/advisor.js"]);

  function render(m, main) {
    const mode = m.mode || "root";
    m.mode = mode;
    const hasTab = m.tabbar !== false;
    const cls = ["page-" + m.name, hasTab ? "has-tabbar" : "", m.actionbar ? "has-actionbar" : "", "mode-" + mode].filter(Boolean).join(" ");
    const attrs = Object.keys(m.data || {}).map(k => ` data-${k}="${esc(m.data[k])}"`).join("");
    const scripts = (m.ownScripts || SCRIPTS(m)).concat((m.scripts || []).map(s => "assets/js/pages/" + s + ".js"));
    return `${head(m)}
<body class="${cls}" data-tab="${m.tab || ""}" data-file="${esc(m.file)}"${attrs}>
<a class="skip" href="#main">${L("تخطَّ إلى المحتوى", "Skip to content")}</a>
${m.chrome === false ? "" : ticker()}
${m.chrome === false ? "" : siteHeader(m)}
${appBar(m)}
<main id="main">
${main}
</main>
${m.footer === false ? "" : footer(m)}
${m.actionbar ? `<div class="action-bar" id="actionBar">${m.actionbar === true ? "" : m.actionbar}</div>` : ""}
${hasTab ? tabbar(m) : ""}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
${scripts.map(s => `<script src="${R}${s}?v=${V(s)}"></script>`).join("\n")}
</body>
</html>
`;
  }
  render.parts = { ticker, siteHeader, footer, appBar, tabbar };
  return render;
};

return module.exports; })();
M["home"] = (function () { var module = { exports: {} };
/* الرئيسية — كل النصوص من D.COPY.home، وترتيب الأقسام وإظهارها من D.HOME (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C, S } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY.home;
  const EN = D.lang === "en", KG = L("كجم", "kg"), G = L("جم", "g");
  const cutsCount = D.live().filter(p => p.sold === "kg").length;

  /* ---------- فاتورة مثال (تُحسب بنفس منطق السلة) ---------- */
  function sampleReceipt() {
    const sample = [
      { id: "lamb-shoulder", kg: 2, opts: { prep: "cubes", marinade: "hot", skewer: true }, why: L("أوصال · 200 جم للشخص", "Cubes · 200 g per person") },
      { id: "lamb-mince", kg: 1.5, opts: { prep: "kebab", marinade: "classic", skewer: true }, why: L("كباب · 150 جم للشخص", "Kebab · 150 g per person") },
      { id: "lamb-rack", kg: 1.5, opts: { prep: "chops" }, why: L("ريش بالعظم · 150 جم للشخص", "Bone-in ribs · 150 g per person") },
      { id: "charcoal", qty: 2, why: L("كيس لكل 4.5 كجم", "1 bag per 4.5 kg") }
    ].filter(l => D.byId(l.id));
    const tot = sample.reduce((t, l) => t + S.breakdown(l).total, 0);
    return U.receipt({
      cls: "receipt--sample", kicker: L("خطة المستشار", "Advisor's plan"), title: L("حفلة مشاوي · 10 أشخاص", "BBQ party · 10 people"),
      lines: sample.map(l => { const x = U.lineForReceipt(l); x.sub = [esc(l.why), x.sub].filter(Boolean).join(" · "); return x; }),
      totals: [[L("مجموع الخطة", "Plan total"), U.money2(tot), "is-total"], [L("للشخص تقريباً", "Per person, approx."), U.money2(tot / 10)]], stamp: L("مثال", "Sample")
    });
  }

  /* ---------- «التقطيع مجاني»: سكين تقطّع الصورة إلى شرائح (شكل تقطيع لكل شريحة) ----------
     الشرائح نسخ من نفس الصورة مقصوصة بمضلعات مائلة، والسكين تمر على خطوط القطع
     من اليمين في العربية ومن اليسار في الإنجليزية. العنوان في منتصف الصورة. */
  function cutBand(n) {
    const B = T.cutband;
    const forms = (B.forms || []).filter(k => D.PREPS[k]);
    const N = Math.max(2, forms.length), W = 100 / N, SL = 2.6, TT = 100 / (N - 1), bg = D.IMAGES.texture || "";
    const f = x => +x.toFixed(3);
    const pos = i => EN ? i : N - 1 - i; /* موضع الشريحة i من اليسار */
    const strips = forms.map((k, i) => {
      const p = pos(i), l = p ? f(p * W) : -12, r = p === N - 1 ? 112 : f((p + 1) * W);
      return `<div class="cutband__s" style="--i:${i};--l:${l}%;--r:${r}%;--dir:${i % 2 ? 1 : -1};--mid:${f((p + .5) * W - SL)}%;background-image:url('${esc(bg)}')">
      <span class="cutband__lbl"><b>${esc(D.PREPS[k].n)}</b><small>${esc(D.PREPS[k].d)}</small></span></div>`;
    }).join("");
    /* خط القطع j بين الشريحة j والتي بعدها */
    const cutX = j => EN ? (j + 1) * W : 100 - (j + 1) * W;
    const lines = forms.slice(1).map((k, j) => { const x = cutX(j); return `<line x1="${f(x + SL)}" y1="0" x2="${f(x - SL)}" y2="100" style="--k:${j}"/>`; }).join("");
    let kf = "";
    forms.slice(1).forEach((k, j) => {
      const x = cutX(j), st = j * TT;
      kf += `${f(st)}%{left:${f(x + SL + .4)}%;top:-6%;animation-timing-function:cubic-bezier(.55,0,.8,.4)}`;
      kf += `${f(st + TT * .6)}%{left:${f(x - SL - .2)}%;top:104%;animation-timing-function:linear}`;
      kf += `${f(st + TT * .8)}%{left:${f(x - SL - .6)}%;top:175%;animation-timing-function:steps(1,end)}`;
    });
    kf += `100%{left:${f(cutX(N - 2) - SL - .6)}%;top:175%}`;
    return `<section class="cutband" data-cutband aria-labelledby="cutH">
  <style>@keyframes knife{${kf}}</style>
  <div class="cutband__stage" style="--sl:${SL}%" aria-hidden="true">
    ${strips}
    <svg class="cutband__lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>
    <svg class="cutband__knife" viewBox="0 0 60 300"><defs><linearGradient id="kbl" x1="0" x2="1"><stop offset="0" stop-color="#F3F5F7"/><stop offset=".55" stop-color="#B9C0C6"/><stop offset="1" stop-color="#7E868D"/></linearGradient><linearGradient id="khd" x1="0" x2="1"><stop offset="0" stop-color="#2B2522"/><stop offset="1" stop-color="#120F0E"/></linearGradient></defs>
      <rect x="15" y="0" width="30" height="86" rx="9" fill="url(#khd)"/><circle cx="30" cy="20" r="3.2" fill="#C9CED3"/><circle cx="30" cy="43" r="3.2" fill="#C9CED3"/><circle cx="30" cy="66" r="3.2" fill="#C9CED3"/>
      <rect x="12" y="84" width="36" height="12" rx="3" fill="#9AA2A9"/>
      <path d="M12 96H46V262Q46 286 38 300Q20 276 14 250Q12 240 12 228Z" fill="url(#kbl)"/><path d="M40 100V258" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/><path d="M12 96V228Q12 240 14 250Q20 276 38 300" fill="none" stroke="#FF5A36" stroke-opacity=".7" stroke-width="1.2"/></svg>
  </div>
  <div class="wrap cutband__copy">
    <div class="cutband__panel">
      ${U.kicker(String(forms.length).padStart(2, "0"), esc(B.kicker))}
      <h2 id="cutH">${esc(B.title)}<em>${esc(B.em)}</em></h2>
      <p>${tpl(B.sub)}</p>
      <button type="button" class="cutband__again" data-cut-again>${icon("knife")}${esc(B.again)}</button>
    </div>
  </div>
  <ul class="cutband__forms">${forms.map(k => `<li><b>${esc(D.PREPS[k].n)}</b><small>${esc(D.PREPS[k].d)}</small></li>`).join("")}</ul>
</section>`;
  }

  /* ---------- الأقسام ---------- */
  const uses = ["grill", "kabsa", "steak", "slow", "mince"];
  const byUse = u => D.live().filter(p => p.sold === "kg" && p.uses[0] === u).slice(0, 8);
  const num = i => String(i).padStart(2, "0");
  const SECTIONS = {
    hero: () => `<section class="hero" aria-labelledby="heroT">
  <div class="hero__media">${U.slot("home-hero", "hero__img", "", { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <span class="eyebrow"><i class="live"></i>${esc(T.hero.eyebrow)}</span>
      <h1 class="hero__t" id="heroT">${esc(T.hero.title)}<em>${esc(T.hero.em)}</em></h1>
      <p class="hero__s">${tpl(T.hero.sub)}</p>
      <div class="hero__cta"><a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="open">${U.mark("btn__mark")}${esc(T.hero.cta1)}</a><a class="btn btn--line btn--lg" href="shop.html">${esc(T.hero.cta2)}</a></div>
      <dl class="hero__stats"><div><dt class="num">${D.ANIMALS.length}</dt><dd>${esc(T.hero.s1)}</dd></div><div><dt class="num">${cutsCount}</dt><dd>${esc(T.hero.s2)}</dd></div><div><dt class="num">0</dt><dd>${esc(T.hero.s3)}</dd></div></dl>
    </div>
    <div class="hero__adv" id="advisor" data-advisor-inline="adv--hero"><div class="adv adv--hero adv--ssr"><div class="adv__head">${U.mark()}<b>${L("مستشار نُضْج", "NUDJ Advisor")}</b></div><div class="adv__log"><p class="muted" style="padding:20px">${L("جارٍ تشغيل المستشار…", "Starting the advisor…")}</p></div></div></div>
  </div>
</section>`,
    marquee: () => `<div class="marquee" aria-hidden="true"><div class="marquee__track">${Array(2).fill(D.ANIMALS.map(a => `<span>${esc(a.n)}</span><i>${esc(U.altName(a))}</i>`).join("")).join("")}</div></div>`,
    herd: n => `<section class="section wrap" aria-labelledby="herdH">
  <div class="sec-head">${U.kicker(num(n), esc(T.herd.kicker))}<h2 id="herdH">${esc(T.herd.title)}</h2><p>${tpl(T.herd.sub)}</p><a class="seeall" href="cuts.html">${esc(T.herd.link)} ${icon("chevL")}</a></div>
  <div class="herd-rail">${D.ANIMALS.map((a, i) => U.herdCard(a, i)).join("")}</div>
</section>`,
    occasions: n => `<section class="section wrap" aria-labelledby="occH">
  <div class="sec-head">${U.kicker(num(n), esc(T.occasions.kicker))}<h2 id="occH">${esc(T.occasions.title)}</h2><p>${tpl(T.occasions.sub)}</p></div>
  <div class="bento">${D.ADVISOR.occasions.filter(o => o.on !== false).map((o, i) => `<button type="button" class="bento__i bento__i--${i + 1}${o.img ? "" : " bento__i--plain"}" data-advisor="${o.k}">
    ${o.img ? U.slot(o.img, "bento__img", "") : `<span class="bento__ic">${icon(o.ic, "", 1.4)}</span>`}
    <span class="bento__b"><b>${esc(o.n)}</b><small>${esc(o.s)}</small><span class="bento__go">${esc(T.occasions.go)} ${icon("chevL", "", 2.2)}</span></span></button>`).join("")}</div>
</section>`,
    how: n => `<section class="section how" aria-labelledby="howH">
  <div class="wrap how__in">
    <div class="how__steps">
      <div class="sec-head">${U.kicker(num(n), esc(T.how.kicker))}<h2 id="howH">${esc(T.how.title)}</h2></div>
      <ol class="steps">${T.how.steps.map((s, i) => `<li><b class="num">${num(i + 1)}</b><div><h3>${esc(s.t)}</h3><p>${tpl(s.d)}</p></div></li>`).join("")}</ol>
      <a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="grill">${esc(T.how.cta)}</a>
    </div>
    <div class="how__rc">${sampleReceipt()}</div>
  </div>
</section>`,
    uses: n => `<section class="section wrap" aria-labelledby="useH">
  <div class="sec-head">${U.kicker(num(n), esc(T.uses.kicker))}<h2 id="useH">${esc(T.uses.title)}</h2><a class="seeall" href="shop.html">${esc(T.uses.link)} ${icon("chevL")}</a></div>
  <div class="seg-tabs" role="tablist" aria-label="${L("حسب الطبخة", "By dish")}">${uses.map((u, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-use-tab="${u}">${icon(D.USES[u].ic)}${esc(D.USES[u].n)}</button>`).join("")}</div>
  ${uses.map((u, i) => `<div class="rail" role="tabpanel" data-use-panel="${u}"${i ? " hidden" : ""}>${U.grid(byUse(u))}</div>`).join("")}
</section>`,
    services: n => `<section class="section svc" aria-labelledby="svcH">
  <div class="wrap svc__in">
    <div class="svc__media">${U.slot("marinade", "svc__img", "")}</div>
    <div class="svc__b">
      <div class="sec-head">${U.kicker(num(n), esc(T.services.kicker))}<h2 id="svcH">${esc(T.services.title)}</h2><p>${tpl(T.services.sub)}</p></div>
      <ul class="price-list">
        ${D.MARINADES.filter(m => m.p).map(m => `<li><span><b>${esc(S.marinadeLabel(m))}</b><small>${esc(m.d)}</small></span><em class="num">+${m.p} ${C.currency}/${KG}</em></li>`).join("")}
        <li><span><b>${esc(D.SERVICES.skewer.n)}</b><small>${esc(D.SERVICES.skewer.d)}</small></span><em class="num">+${D.SERVICES.skewer.p} ${C.currency}/${KG}</em></li>
        <li><span><b>${esc(D.SERVICES.vacuum.n)}</b><small>${esc(D.SERVICES.vacuum.d)}</small></span><em class="num">+${D.SERVICES.vacuum.p} ${C.currency}/${KG}</em></li>
        <li class="is-free"><span><b>${esc(T.services.freeT)}</b><small>${esc(T.services.freeD)}</small></span><em>${L("مجاناً", "Free")}</em></li>
      </ul>
      <a class="seeall" href="shop.html?a=extra">${esc(T.services.link)} ${icon("chevL")}</a>
    </div>
  </div>
</section>`,
    cutband: cutBand,
    carcass: n => `<section class="section wrap carcass-cta" aria-labelledby="carH">
  <div class="carcass-cta__media">${U.slot("occ-carcass", "carcass-cta__img", "")}</div>
  <div class="carcass-cta__b">
    <div class="sec-head">${U.kicker(num(n), esc(T.carcass.kicker))}<h2 id="carH">${esc(T.carcass.title)}</h2><p>${tpl(T.carcass.sub)}</p></div>
    <div class="sizes">${D.carcasses().filter(p => /whole|half/.test(p.id)).map(p => `<a class="size" href="${U.url.product(p.id)}"><span>${esc(p.name)}</span><b class="num">${U.money(p.sizes[0].p)}–${U.money(p.sizes[p.sizes.length - 1].p)}</b><small>${p.sizes[0].kg}–${p.sizes[p.sizes.length - 1].kg} ${KG}</small></a>`).join("")}</div>
    <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="carcass">${esc(T.carcass.btn1)}</button><a class="btn btn--line" href="shop.html?a=carcass">${esc(T.carcass.btn2)}</a></div>
  </div>
</section>`,
    faq: n => `<section class="section wrap" aria-labelledby="faqH">
  <div class="sec-head">${U.kicker(num(n), esc(T.faq.kicker))}<h2 id="faqH">${esc(T.faq.title)}</h2><a class="seeall" href="help.html">${esc(T.faq.link)} ${icon("chevL")}</a></div>
  <div class="faq">${D.FAQ.slice(0, T.faq.count || 4).map(f => h.faq(esc(f[0]), tpl(f[1]))).join("")}</div>
</section>`
  };
  /* ترقيم الأقسام (01، 02…) حسب الظاهر منها فقط */
  const numbered = ["herd", "occasions", "how", "uses", "services", "carcass", "faq"];
  let counter = 0;
  const main = D.HOME.filter(s => s.on !== false && SECTIONS[s.k]).map(s => SECTIONS[s.k](numbered.indexOf(s.k) > -1 ? ++counter : 0)).join("\n");

  return [{
    name: "home", file: "index.html", tab: "home", nav: "", mode: "root", appTitle: "", scripts: ["home"],
    preload: D.IMAGES["home-hero"] || "",
    title: T.seoTitle, desc: T.seoDesc,
    jsonld: [{ "@context": "https://schema.org", "@type": "Store", name: L("نُضْج", "NUDJ"), url: C.base + (EN ? "en/" : ""), inLanguage: EN ? "en" : "ar", image: C.base + String(D.IMAGES["og-share"] || "").replace(/^(\.\.\/)+/, ""), priceRange: "SAR", currenciesAccepted: "SAR", description: T.seoDesc }],
    main
  }];
};

return module.exports; })();
M["shop"] = (function () { var module = { exports: {} };
/* المتجر + خريطة القطيع + صفحة لكل ماشية */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY;
  const R = D.R || "", SITE = L(" · نُضْج", " · NUDJ"), KG = L("كجم", "kg");
  const pages = [];

  /* ================= المتجر ================= */
  const filters = [["all", L("الكل", "All")]].concat(D.ANIMALS.map(a => [a.k, a.n]), [["carcass", T.nav.carcass], ["extra", T.nav.extras]]);
  const uses = Object.keys(D.USES);
  pages.push({
    name: "shop", file: "shop.html", tab: "shop", nav: "shop", mode: "root", appTitle: T.shop.title, scripts: ["shop"], trail: ["search", "herd"],
    title: L("المتجر — قطعيات ضأن وماعز وحاشي وعجل وبقر وجاموس · نُضْج", "Shop — lamb, goat, camel, veal, beef and buffalo cuts · NUDJ"),
    desc: L("كل قطعيات نُضْج بالكيلو مع التقطيع المجاني، والذبائح الكاملة، وعدّة الشواء والبهارات.", "Every NUDJ cut by the kilo with free cutting, plus whole carcasses, BBQ kit and spices."),
    main: `<div class="wrap">
  ${h.crumbs([[T.shop.title]])}
  <div class="page-head page-head--row"><div><h1 class="large-title">${esc(T.shop.title)}</h1><p><b class="num" id="shopCount">${D.live().length}</b> ${esc(T.shop.sub)}</p></div>
    <button type="button" class="btn btn--line" data-advisor="open">${U.mark("btn__mark")}${esc(T.shop.ask)}</button></div>
  <div class="filters" id="filters">
    <div class="chips-row" role="radiogroup" aria-label="${L("الماشية", "Animal")}">${filters.map(([k, n], i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-f-a="${k}">${k !== "all" && k !== "carcass" && k !== "extra" ? `<img src="${esc((D.animal(k) || {}).art || R + "assets/img/herd/" + k + ".png")}" alt="" aria-hidden="true">` : ""}${esc(n)}</button>`).join("")}</div>
    <div class="filters__row">
      <div class="chips-row chips-row--sm" role="radiogroup" aria-label="${L("الطبخة", "Dish")}"><button type="button" role="radio" aria-checked="true" data-f-u="all">${L("كل الطبخات", "All dishes")}</button>${uses.map(u => `<button type="button" role="radio" aria-checked="false" data-f-u="${u}">${icon(D.USES[u].ic)}${D.USES[u].n}</button>`).join("")}</div>
      <label class="sort">${icon("filter")}<select id="sort" aria-label="${L("الترتيب", "Sort")}"><option value="">${L("الترتيب: حسب الماشية", "Sort: by animal")}</option><option value="asc">${L("السعر: من الأقل", "Price: low to high")}</option><option value="desc">${L("السعر: من الأعلى", "Price: high to low")}</option></select></label>
    </div>
  </div>
  <div class="grid" id="grid">${D.live().map(p => U.tagCard(p).replace('<article class="tag-card', `<article data-a="${p.sold === "carcass" ? "carcass " + p.animal : p.animal}" data-u="${(p.uses || []).join(" ")}" data-p="${p.sold === "carcass" ? p.sizes[0].p : p.price}" class="tag-card`)).join("")}</div>
  <div id="shopEmpty" hidden>${U.empty("search", esc(T.shop.empty), L("جرّب ماشية أو طبخة ثانية.", "Try another animal or dish."), `<button class="btn btn--line" type="button" data-f-reset>${L("عرض الكل", "Show all")}</button>`)}</div>
</div>`
  });

  /* ================= خريطة القطيع ================= */
  pages.push({
    name: "herd", file: "cuts.html", tab: "shop", nav: "herd", mode: "push", back: ["shop.html", T.shop.title], appTitle: T.herd.title,
    title: L("القطيع — خريطة قطعيات الضأن والماعز والحاشي والعجل والبقر والجاموس · نُضْج", "The Herd — cuts map for lamb, goat, camel, veal, beef and buffalo · NUDJ"),
    desc: L("خريطة القطعيات لكل ماشية: اضغط على أي رقم لتشوف القطعة وسعرها والتقطيع المتاح.", "A cuts map for every animal: tap any number to see the cut, its price and the cutting styles available."),
    main: `<div class="wrap">
  ${h.crumbs([[T.herd.title]])}
  <div class="page-head"><h1 class="large-title">${esc(T.herd.title)}</h1><p>${tpl(T.herd.sub)}</p></div>
  <div class="herd-index">${D.ANIMALS.map((a, i) => `<a class="herd-tile" href="${U.url.animal(a.k)}">
    <span class="herd-tile__n num">0${i + 1}</span>${U.herdMap(a, { cls: "herd-map--tile", static: true })}
    <span class="herd-tile__b"><b>${esc(a.n)}</b><i class="num">${esc(U.altName(a))}</i><small>${esc(a.note)}</small><span class="seeall">${D.cutsOf(a.k).length} ${L("منتجات", "products")} ${icon("chevL")}</span></span></a>`).join("")}</div>
</div>`
  });

  /* ================= صفحة كل ماشية ================= */
  D.ANIMALS.forEach((a, i) => {
    const list = D.cutsOf(a.k), kg = list.filter(p => p.sold === "kg"), car = list.filter(p => p.sold === "carcass");
    const from = kg.length ? Math.min.apply(null, kg.map(p => p.price)) : 0;
    pages.push({
      name: "animal", file: a.k + ".html", tab: "shop", nav: "herd", mode: "push", back: ["cuts.html", T.herd.title], appTitle: a.n, scripts: ["animal"], trail: ["share"],
      title: L(`${a.n} — قطعيات ${a.n} وأسعارها بالكيلو · نُضْج`, `${a.n} — ${a.n.toLowerCase()} cuts and prices per kilo · NUDJ`),
      desc: L(`${a.note} ${kg.length} قطعيات ${a.n} من ${from} ر.س للكيلو، والتقطيع مجاني.`, `${a.note} ${kg.length} ${a.n.toLowerCase()} cuts from ${from} SAR per kilo, with free cutting.`),
      ogImage: kg[0] && kg[0].img,
      main: `<div class="wrap">
  ${h.crumbs([[T.herd.title, "cuts.html"], [a.n]])}
  <section class="animal-hero">
    <div class="animal-hero__t"><span class="animal-hero__n num">0${i + 1} / 06</span><h1 class="animal-hero__name">${esc(a.n)}<i class="num">${esc(U.altName(a))}</i></h1><p>${esc(a.note)}</p>
      <dl class="hero__stats"><div><dt class="num">${kg.length}</dt><dd>${L("قطعيات", "Cuts")}</dd></div><div><dt class="num">${from}</dt><dd>${L("ر.س/كجم يبدأ من", "SAR/kg, from")}</dd></div>${car.length ? `<div><dt class="num">${car.length}</dt><dd>${L("ذبائح", "Carcasses")}</dd></div>` : ""}</dl>
      <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="ask" data-animal="${a.k}">${U.mark("btn__mark")}${esc(T.animal.ask)} ${esc(L(a.n, a.n.toLowerCase()))}</button></div></div>
    <div class="animal-hero__map">${U.herdMap(a)}</div>
  </section>
  <ol class="cut-index">${list.map(p => `<li><a href="${U.url.product(p.id)}" data-row="${p.id}"><span class="num">${p.code.slice(2)}</span><b>${esc(p.name)}</b><small>${p.zone ? D.ZONES[p.zone] : p.sold === "carcass" ? L("ذبيحة", "Carcass") : L("بدون موقع", "No zone")}</small><em>${U.priceTag(p)}</em></a></li>`).join("")}</ol>
  ${car.length ? `<section class="section"><div class="sec-head"><h2>${L("ذبائح " + a.n, a.n + " carcasses")}</h2><p>${tpl(T.animal.carcassSub)}</p></div><div class="grid">${U.grid(car)}</div></section>` : ""}
  <section class="section"><div class="sec-head"><h2>${L("قطعيات " + a.n + " بالكيلو", a.n + " cuts by the kilo")}</h2></div><div class="grid">${U.grid(kg)}</div></section>
  <section class="section"><div class="sec-head"><h2>${L("مواشي ثانية", "Other animals")}</h2></div><div class="herd-rail herd-rail--sm">${D.ANIMALS.map((x, j) => x.k === a.k ? "" : U.herdCard(x, j)).join("")}</div></section>
</div>`
    });
  });

  return pages;
};

return module.exports; })();
M["product"] = (function () { var module = { exports: {} };
/* صفحة ثابتة لكل منتج */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY.product;
  const R = D.R || "", EN = D.lang === "en", KG = L("كجم", "kg"), CUR = C.currency;

  return D.PRODUCTS.map(p => {
    const a = D.animal(p.animal);
    const isExtra = p.animal === "extra";
    const back = isExtra ? ["shop.html?a=extra", D.COPY.nav.extras] : [p.animal + ".html", a.n];
    const related = (isExtra ? D.extras() : D.cutsOf(p.animal)).filter(x => x.id !== p.id).slice(0, 8);
    const pair = isExtra ? [] : (p.uses.indexOf("grill") > -1 ? ["charcoal", "spice-grill", "skewers"] : p.uses.indexOf("kabsa") > -1 ? ["spice-kabsa", "spice-mandi", "trays"] : ["trays", "spice-kabsa"]).map(D.byId).filter(x => x && !x.hidden);
    const imgs = [p.img].concat(p.gallery || []).filter(Boolean);
    const unit = p.sold === "kg" ? L("للكيلو", "per kilo") : p.sold === "carcass" ? L("حسب الحجم", "by size") : L("لل" + (p.unitName || "حبة"), "per " + (p.unitName || "piece"));
    const price = p.sold === "carcass" ? p.sizes[0].p : p.price;
    const offer = p.sold === "carcass"
      ? { "@type": "AggregateOffer", priceCurrency: "SAR", lowPrice: p.sizes[0].p, highPrice: p.sizes[p.sizes.length - 1].p, offerCount: p.sizes.length, availability: "https://schema.org/InStock" }
      : { "@type": "Offer", priceCurrency: "SAR", price, availability: "https://schema.org/InStock", url: C.base + (EN ? "en/" : "") + p.id + ".html" };

    /* مستشار صغير داخل الصفحة: كم أحتاج؟ */
    const helper = p.sold === "kg" ? `<div class="mini-adv" id="miniAdv">
  <div class="mini-adv__h">${U.mark("mini-adv__mark")}<b>${esc(T.howMuch)}</b><small>${L("المستشار يحسبها لك", "The advisor works it out")}</small></div>
  <div class="mini-adv__row"><span>${L("عدد الأشخاص", "Number of people")}</span><div class="stepper stepper--sm"><button type="button" data-mp="-1" aria-label="${L("أقل", "Fewer")}">${icon("minus", "", 2.4)}</button><output class="num" id="mpV">4</output><button type="button" data-mp="1" aria-label="${L("أكثر", "More")}">${icon("plus", "", 2.4)}</button></div></div>
  <p class="mini-adv__out" id="mpOut"></p>
  <div class="mini-adv__btns"><button type="button" class="btn btn--line btn--sm" id="mpSet">${L("اضبط الميزان", "Set the scale")}</button><button type="button" class="btn btn--ghost btn--sm" data-advisor="open" data-sheet data-ask="${p.id}">${L("اسأل المستشار عنها", "Ask the advisor about it")} ${icon("chevL")}</button></div>
</div>` : p.sold === "carcass" ? `<div class="mini-adv"><div class="mini-adv__h">${U.mark("mini-adv__mark")}<b>${L("كم شخص تكفي؟", "How many does it feed?")}</b></div>
  <ul class="serves">${p.sizes.map(s => `<li><b>${esc(s.l)}</b><span class="num">≈ ${s.kg} ${KG}</span><em>${L("كبسة لـ " + Math.floor(s.kg / 0.45) + " شخص تقريباً", "Kabsa for about " + Math.floor(s.kg / 0.45) + " people")}</em></li>`).join("")}</ul>
  <button type="button" class="btn btn--line btn--sm" data-advisor="carcass" data-sheet>${L("احسبها لي على عددنا", "Work it out for our group")} ${icon("chevL")}</button></div>` : "";

    const where = p.zone && a && a.pins[p.zone] ? `<section class="section pd-where"><div class="sec-head"><h2>${L("مكانها في " + a.n, "Where it sits on the " + a.n.toLowerCase())}</h2><p>${D.ZONES[p.zone]}</p></div>
      ${U.herdMap(a).replace(`data-pin="${p.id}"`, `data-pin="${p.id}" aria-current="true"`).replace('class="herd-map"', 'class="herd-map herd-map--focus"')}</section>` : "";

    return {
      name: "product", file: p.id + ".html", tab: "shop", nav: isExtra ? "extras" : p.sold === "carcass" ? "carcass" : "herd", mode: "push", back, appTitle: p.name,
      scripts: ["product"], trail: ["wish:" + p.id, "share"], data: { product: p.id },
      ogImage: p.img, ogType: "product",
      title: `${p.name} — ${p.sold === "carcass" ? L("من ", "from ") + U.money(price) + " " + CUR : U.money(price) + " " + CUR + " " + unit}${L(" · نُضْج", " · NUDJ")}`,
      desc: `${p.name}: ${p.short}. ${p.info}`.slice(0, 300),
      actionbar: `<div class="action-bar__p"><small>${p.sold === "kg" ? `<span id="abKg">1</span> ${KG}` : L("الإجمالي", "Total")}</small><b id="abTotal" class="num">—</b></div><button class="btn btn--ember" type="button" id="abAdd">${icon("cart")}${L("أضف للسلة", "Add to cart")}</button>`,
      jsonld: [{ "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.code, description: p.info, image: imgs.map(i => C.base + String(i).replace(/^(\.\.\/)+/, "")), brand: { "@type": "Brand", name: L("نُضْج", "NUDJ") }, offers: offer }],
      main: `<div class="wrap">
  ${h.crumbs(isExtra ? [[D.COPY.shop.title, "shop.html"], [D.COPY.nav.extras, "shop.html?a=extra"], [p.name]] : [[D.COPY.herd.title, "cuts.html"], [a.n, a.k + ".html"], [p.name]])}
  <div class="pd">
    <div class="pd__media">
      <div class="pd__img">${U.productImg(p, "pd__ph", { eager: true })}<span class="pd__code num">${p.code}</span>${a ? `<span class="pd__animal"><img src="${esc(a.art || R + "assets/img/herd/" + a.k + ".png")}" alt="" aria-hidden="true">${esc(a.n)}</span>` : ""}</div>
      ${imgs.length > 1 ? `<div class="pd__thumbs">${imgs.map((s, i) => `<button type="button" data-thumb="${esc(s)}"${i ? "" : ' aria-current="true"'}><img src="${esc(s)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
    </div>
    <div class="pd__buy">
      <div class="pd__meta"><span class="tag__code num">${p.code}</span><span>${a ? esc(a.n) : esc(D.COPY.nav.extras)}${p.bone ? L(" · بالعظم", " · bone-in") : ""}${p.zone ? " · " + D.ZONES[p.zone] : ""}</span></div>
      <h1 class="pd__t">${esc(p.name)}</h1>
      <p class="pd__short">${esc(p.short)}</p>
      <div class="pd__price">${U.priceTag(p)}${p.sold === "kg" ? `<span class="pd__free">${icon("knife")}${esc(T.free)}</span>` : ""}</div>
      ${helper}
      ${U.buyForm(p)}
    </div>
  </div>

  <section class="section pd-info">
    <div class="pd-info__b"><div class="sec-head"><h2>${L("عن ", "About ")}${esc(p.name)}</h2></div><p class="lead">${esc(p.info)}</p>
      ${p.uses && !isExtra ? `<div class="use-tags">${p.uses.map(u => `<span>${icon(D.USES[u].ic)}${D.USES[u].n}</span>`).join("")}</div>` : ""}</div>
    ${p.spec ? `<div class="pd-info__spec">${U.spec(p.spec)}</div>` : ""}
  </section>
  ${where}
  ${pair.length ? `<section class="section"><div class="sec-head"><h2>${esc(T.pair)}</h2><p>${tpl(T.pairSub)}</p></div><div class="rail">${U.grid(pair)}</div></section>` : ""}
  <section class="section"><div class="sec-head"><h2>${isExtra ? L("عدّة ثانية", "More kit") : L("قطعيات " + a.n + " ثانية", "More " + a.n.toLowerCase() + " cuts")}</h2><a class="seeall" href="${isExtra ? "shop.html?a=extra" : a.k + ".html"}">${L("الكل", "All")} ${icon("chevL")}</a></div><div class="rail">${U.grid(related)}</div></section>
</div>`
    };
  });
};

return module.exports; })();
M["commerce"] = (function () { var module = { exports: {} };
/* المستشار + السلة + الدفع + الطلب + المفضلة + البحث + الحساب + الدخول */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY.advisorPage;
  const SITE = L(" · نُضْج", " · NUDJ"), KG = L("كجم", "kg"), GP = L("جم للشخص — ", "g per person — ");
  const loading = `<div class="loading" aria-hidden="true"><i></i><i></i><i></i></div>`;
  const noscript = `<noscript><p class="card" style="margin:20px 0">${L("هذه الصفحة تحتاج تفعيل JavaScript في المتصفح.", "This page needs JavaScript enabled in your browser.")}</p></noscript>`;
  const G = D.ADVISOR.grams;

  return [
    {
      name: "advisor", file: "advisor.html", tab: "advisor", nav: "advisor", mode: "root", appTitle: L("مستشار نُضْج", "NUDJ Advisor"), scripts: ["advisor-page"], footer: false,
      title: L("مستشار نُضْج — احسب لحم مناسبتك بالجرام", "NUDJ Advisor — work out the meat for your occasion, to the gram"),
      desc: L("مستشار تفاعلي يسألك عن مناسبتك وعددكم ويحسب لك القطعيات بالجرام، التقطيع، التتبيلة، الفحم والبهارات — ثم تطلب الخطة كاملة.", "An interactive advisor that asks about your occasion and headcount, then works out the cuts to the gram, plus cutting, marinade, charcoal and spices — and you order the whole plan."),
      main: `<div class="adv-page">
  <aside class="adv-side">
    <div class="adv-side__b">
      ${U.kicker("N°", esc(T.kicker))}
      <h1 class="adv-side__t">${esc(T.title)} <em>${esc(T.em)}</em></h1>
      <p>${tpl(T.sub)}</p>
      <h2 class="adv-side__h">${esc(T.rules)}</h2>
      <ul class="rules">
        <li><b class="num">${G.grill}</b><span>${GP}${L("مشاوي بدون عظم", "boneless BBQ")}</span></li>
        <li><b class="num">${G.kabsa}</b><span>${GP}${L("كبسة ومندي بالعظم", "bone-in kabsa and mandi")}</span></li>
        <li><b class="num">${G.steak}</b><span>${GP}${L("ستيك", "steak")}</span></li>
        <li><b class="num">${G.stew}</b><span>${GP}${L("مرق وإيدام", "broth and stew")}</span></li>
        <li><b class="num">1</b><span>${L("كيس فحم لكل " + D.ADVISOR.charcoalKgPerBag + " كجم مشاوي", "bag of charcoal per " + D.ADVISOR.charcoalKgPerBag + " kg of grilling")}</span></li>
      </ul>
      <p class="muted small">${tpl(T.note)}</p>
      <div id="advPlans"></div>
    </div>
  </aside>
  <div class="adv-main" data-advisor-inline="adv--page"><div class="adv adv--page adv--ssr"><div class="adv__log">${loading}</div></div></div>
</div>${noscript}`
    },
    {
      name: "cart", file: "cart.html", tab: "cart", mode: "root", appTitle: L("السلة", "Cart"), scripts: ["cart"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>${L("الإجمالي", "Total")}</small><b id="abTotal" class="num">—</b></div><a class="btn btn--ember" href="checkout.html" id="abGo">${L("إتمام الطلب", "Checkout")}</a>`,
      title: L("السلة", "Cart") + SITE, desc: L("سلة مشترياتك في نُضْج.", "Your NUDJ shopping cart."),
      main: `<div class="wrap">
  ${h.crumbs([[L("السلة", "Cart")]])}
  <div class="page-head"><h1 class="large-title">${L("السلة", "Cart")}</h1><p id="cartSub"></p></div>
  <div id="cartRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "checkout", file: "checkout.html", tab: "cart", mode: "push", back: ["cart.html", L("السلة", "Cart")], appTitle: L("إتمام الطلب", "Checkout"), tabbar: false, scripts: ["checkout"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>${L("الإجمالي", "Total")}</small><b id="abTotal" class="num">—</b></div><button class="btn btn--ember" type="button" id="abPlace">${L("تأكيد الطلب", "Place order")}</button>`,
      title: L("إتمام الطلب", "Checkout") + SITE, desc: L("أكمل طلبك: عنوان التوصيل، الموعد، وطريقة الدفع.", "Complete your order: delivery address, time and payment method."),
      main: `<div class="wrap">
  ${h.crumbs([[L("السلة", "Cart"), "cart.html"], [L("إتمام الطلب", "Checkout")]])}
  <div class="page-head"><h1 class="large-title">${L("إتمام الطلب", "Checkout")}</h1></div>
  <div id="coRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "order", file: "order.html", tab: "account", mode: "push", back: ["account.html?s=orders", L("طلباتي", "My orders")], appTitle: L("الفاتورة", "Receipt"), scripts: ["order"], noindex: true,
      title: L("فاتورة الطلب", "Order receipt") + SITE, desc: L("فاتورة طلبك وحالته.", "Your order receipt and status."),
      main: `<div class="wrap">
  ${h.crumbs([[L("حسابي", "My account"), "account.html"], [L("طلباتي", "My orders"), "account.html?s=orders"], [L("الفاتورة", "Receipt")]])}
  <div id="orderRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "wishlist", file: "wishlist.html", tab: "account", mode: "push", back: ["account.html", L("حسابي", "My account")], appTitle: L("المفضلة", "Wishlist"), scripts: ["wishlist"], noindex: true,
      title: L("المفضلة", "Wishlist") + SITE, desc: L("المنتجات التي حفظتها في نُضْج.", "The products you've saved at NUDJ."),
      main: `<div class="wrap">
  ${h.crumbs([[L("حسابي", "My account"), "account.html"], [L("المفضلة", "Wishlist")]])}
  <div class="page-head"><h1 class="large-title">${L("المفضلة", "Wishlist")}</h1><p id="wishSub"></p></div>
  <div id="wishRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "search", file: "search.html", tab: "shop", mode: "push", back: ["shop.html", D.COPY.shop.title], appTitle: L("البحث", "Search"), scripts: ["search"], noindex: true,
      title: L("البحث", "Search") + SITE, desc: L("ابحث في قطعيات نُضْج.", "Search NUDJ cuts."),
      main: `<div class="wrap">
  ${h.crumbs([[L("البحث", "Search")]])}
  <h1 class="large-title" style="margin-bottom:12px">${L("البحث", "Search")}</h1>
  <form class="search-bar" role="search" id="sForm">${icon("search")}<input type="search" id="sq" placeholder="${L("قطعة، ماشية، أو طبخة…", "A cut, an animal or a dish…")}" aria-label="${L("ابحث", "Search")}" autocomplete="off" enterkeyhint="search"><button class="search-bar__x" type="button" id="sClear" aria-label="${L("مسح", "Clear")}" hidden>${icon("x", "", 2.4)}</button></form>
  <div id="sRoot" style="margin-top:16px"></div>
</div>`
    },
    {
      name: "account", file: "account.html", tab: "account", mode: "root", appTitle: L("حسابي", "My account"), scripts: ["account"], noindex: true,
      title: L("حسابي", "My account") + SITE, desc: L("حسابك في نُضْج: الطلبات، خطط المستشار، العناوين والإعدادات.", "Your NUDJ account: orders, advisor plans, addresses and settings."),
      main: `<div class="wrap">
  ${h.crumbs([[L("حسابي", "My account")]])}
  <div class="page-head" id="accHead"><h1 class="large-title">${L("حسابي", "My account")}</h1></div>
  <div class="acc">
    <aside class="acc-side desk-only" id="accSide"></aside>
    <div class="acc-main" id="accRoot">${loading}</div>
  </div>${noscript}
</div>`
    },
    {
      name: "login", file: "login.html", tab: "account", mode: "push", back: ["account.html", L("حسابي", "My account")], appTitle: L("تسجيل الدخول", "Sign in"), tabbar: false, scripts: ["login"], noindex: true,
      title: L("تسجيل الدخول", "Sign in") + SITE, desc: L("سجّل دخولك في نُضْج برقم جوالك.", "Sign in to NUDJ with your mobile number."),
      main: `<div class="wrap"><div class="auth" id="authRoot">${loading}</div>${noscript}</div>`
    }
  ];
};

return module.exports; })();
M["info"] = (function () { var module = { exports: {} };
/* المساعدة + من نحن + تواصل + الشروط + الخصوصية — كل المحتوى من D.COPY و D.HELP (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY, K = C.contact;
  const draft = C.demo ? `<p class="demo-banner">${icon("info")}${L("نموذج مبدئي — راجع النص مع مستشار قانوني وعدّل ما بين [الأقواس] قبل الإطلاق.", "Draft template — review this text with a legal adviser and replace everything in [brackets] before launch.")}</p>` : "";
  const push = (name, file, title, appTitle, desc, main, extra) => Object.assign({
    name, file, tab: "account", mode: "push", back: ["account.html", L("حسابي", "My account")], appTitle, title: title + L(" · نُضْج", " · NUDJ"), desc, main
  }, extra || {});
  const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const help = push("help", "help.html", L("الأسئلة الشائعة والمساعدة", "Help & FAQ"), L("المساعدة", "Help"),
    L("إجابات عن الطلب والتوصيل والتقطيع والتتبيل والدفع والاسترجاع ومستشار نُضْج.", "Answers about ordering, delivery, cutting, marinating, payment, returns and the NUDJ advisor."),
    `<div class="wrap">
  ${h.crumbs([[L("المساعدة", "Help")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.help.title)}</h1><p>${tpl(T.help.sub)}</p></div>
  <div class="help-cats">${D.HELP.map(g => `<a class="cell" href="#${esc(g.k)}"><span class="cell__ic">${icon(g.ic || "help")}</span><span class="cell__b"><span class="cell__t">${esc(g.t)}</span></span>${icon("chevL", "cell__chev")}</a>`).join("")}</div>
  ${D.HELP.map(g => `<h2 class="group__head" id="${esc(g.k)}">${esc(g.t)}</h2>
  <div class="faq">${(g.items || []).map(it => h.faq(esc(it[0]), tpl(it[1]))).join("")}</div>`).join("\n")}
</div>`);

  const about = push("about", "about.html", L("من نحن", "About us"), L("من نحن", "About us"), strip(tpl(T.about.body)).slice(0, 180),
    `<div class="wrap">
  ${h.crumbs([[L("من نحن", "About us")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.about.title)}</h1></div>
  ${U.slot("about", "about-img", L("نُضْج", "NUDJ"))}
  <div class="prose" style="margin-top:28px">${tpl(T.about.body)}</div>
</div>`);

  const contact = push("contact", "contact.html", L("تواصل معنا", "Contact us"), L("تواصل معنا", "Contact us"), L("تواصل مع نُضْج بخصوص طلبك أو التقطيع أو التتبيل.", "Contact NUDJ about your order, cutting or marinating."),
    `<div class="wrap">
  ${h.crumbs([[L("تواصل معنا", "Contact us")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.contact.title)}</h1><p>${tpl(T.contact.sub)}</p></div>
  <div class="contact-grid">
    <div class="ccard">${icon("phone")}<b>${L("الهاتف", "Phone")}</b><span class="num" dir="ltr">${esc(K.phone)}</span></div>
    <div class="ccard">${icon("chat")}<b>${L("واتساب", "WhatsApp")}</b><span class="num" dir="ltr">${esc(K.whatsapp)}</span></div>
    <div class="ccard">${icon("mail")}<b>${L("البريد الإلكتروني", "Email")}</b><span>${esc(K.email)}</span></div>
    <div class="ccard">${icon("clock")}<b>${L("ساعات العمل", "Opening hours")}</b><span>${esc(K.hours)}</span></div>
  </div>
  <section class="section" aria-labelledby="cfH">
    <h2 id="cfH" class="h2">${esc(T.contact.formTitle)}</h2>
    <form class="card" id="contactForm" novalidate style="max-width:640px">
      <div class="form-grid">
        <label class="field"><span class="field__l">${L("الاسم", "Name")}</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span class="field__l">${L("رقم الجوال", "Mobile number")}</span><div class="phone-field"><span>+966</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" required></div></label>
      </div>
      <div class="form-grid">
        <label class="field"><span class="field__l">${L("الموضوع", "Topic")}</span><select class="select" name="topic">${L(["استفسار عن طلب", "التقطيع والتتبيل", "المستشار والكميات", "ملاحظة أو شكوى", "أخرى"], ["A question about an order", "Cutting & marinating", "The advisor & quantities", "Feedback or a complaint", "Other"]).map(o => `<option>${o}</option>`).join("")}</select></label>
        <label class="field"><span class="field__l">${L("رقم الطلب", "Order no.")} <small>${L("(اختياري)", "(optional)")}</small></span><input class="input" name="order" placeholder="NJ..."></label>
      </div>
      <label class="field"><span class="field__l">${L("الرسالة", "Message")}</span><textarea class="textarea" name="msg" required maxlength="1000"></textarea></label>
      <button class="btn btn--ember btn--lg" type="submit">${L("إرسال", "Send")}</button>
    </form>
  </section>
</div>`, { scripts: ["contact"] });

  const legal = (name, file, title, appTitle, desc, x) => push(name, file, title, appTitle, desc, `<div class="wrap">
  ${h.crumbs([[title]])}
  <div class="page-head"><h1 class="large-title">${esc(title)}</h1><p>${L("آخر تحديث", "Last updated")}: ${esc(x.updated)}</p></div>
  ${draft}
  <div class="prose">${tpl(x.body)}</div>
</div>`);
  const terms = legal("terms", "terms.html", L("الشروط والأحكام", "Terms & conditions"), L("الشروط والأحكام", "Terms"), L("الشروط والأحكام لاستخدام متجر نُضْج والمستشار والخدمات الإضافية.", "The terms and conditions for using the NUDJ store, the advisor and extra services."), T.terms);
  const privacy = legal("privacy", "privacy.html", L("سياسة الخصوصية", "Privacy policy"), L("الخصوصية", "Privacy"), L("كيف يجمع نُضْج بياناتك ويستخدمها ويحميها.", "How NUDJ collects, uses and protects your data."), T.privacy);

  return [help, about, contact, terms, privacy];
};

return module.exports; })();
  function rerender() {
    var D = window.NUDJ, U = window.NUDJ_UI, S = window.NUDJ_STORE;
    var ctx = { D: D, U: U, C: D.CONFIG, S: S, V: function () { return ""; }, h: U.h, R: D.R || "", contentHash: "" };
    var render = M.shell(ctx);
    var cur = document.body.getAttribute("data-file"), is404 = cur === "404.html";
    var file = is404 ? (decodeURIComponent(location.pathname.split("/").pop() || "") || "index.html") : cur;
    var page = null, mods = ["home","shop","product","commerce","info"];
    for (var i = 0; i < mods.length && !page; i++) { var list = M[mods[i]](ctx); for (var j = 0; j < list.length; j++) if (list[j].file === file) { page = list[j]; break; } }
    /* صفحة غير موجودة فعلاً: نرسم إطارها بلغة الزائر (العربية أو /en/) */
    if (!page && is404) {
      var L = D.L;
      page = { name: "notfound", file: "404.html", tab: "", mode: "push", back: ["index.html", L("الرئيسية", "Home")], appTitle: L("غير موجودة", "Not found"), noindex: true,
        title: L("الصفحة غير موجودة · نُضْج", "Page not found · NUDJ"), desc: "",
        main: '<div class="wrap"><div class="nf"><div class="nf__code num">404</div><h1>' + L("الصفحة غير موجودة", "Page not found") + '</h1><p class="muted">' + L("يمكن الرابط قديم أو فيه خطأ. جرّب واحدة من هذي:", "The link may be old or mistyped. Try one of these:") +
          '</p><div class="row-btns" style="justify-content:center"><a class="btn btn--ember" href="shop.html">' + L("المتجر", "Shop") + '</a><a class="btn btn--line" href="advisor.html">' + L("المستشار", "Advisor") + '</a><a class="btn btn--line" href="index.html">' + L("الرئيسية", "Home") + '</a></div></div></div>' };
    }
    if (!page) return false;
    var doc = new DOMParser().parseFromString(render(page, page.main), "text/html");
    [".util", ".site-header", ".app-bar", "main", ".site-footer", "#actionBar", ".tabbar"].forEach(function (sel) {
      var a = document.querySelector(sel), b = doc.querySelector(sel);
      if (a && b) a.replaceWith(document.importNode(b, true));
      else if (a && !b) a.remove();
      else if (!a && b) document.body.insertBefore(document.importNode(b, true), document.getElementById("toast"));
    });
    document.title = doc.title;
    var md = document.querySelector('meta[name="description"]'), nd = doc.querySelector('meta[name="description"]'); if (md && nd) md.setAttribute("content", nd.getAttribute("content"));
    Array.prototype.forEach.call(doc.body.attributes, function (at) { document.body.setAttribute(at.name, at.value); });
    if (is404) (page.scripts || []).forEach(function (s) { var el = document.createElement("script"); el.src = (D.R || "") + "assets/js/pages/" + s + ".js"; el.async = false; document.body.appendChild(el); });
    return true;
  }
  return { M: M, rerender: rerender };
})();
