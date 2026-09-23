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
<meta name="theme-color" content="#161A1F">
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
<main id="main"${m.tone === "light" ? ' class="tone-light"' : ""}>
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
