/* =========================================================
   نُضْج — الإطار المشترك لكل الصفحات
   ترويسة الموقع + شريط التطبيق (iOS) + شريط التبويبات + الفوتر
   ========================================================= */
module.exports = function makeShell(ctx) {
  const { D, U, C, V } = ctx;
  const { icon, esc } = U;

  const NAV = [
    ["shop", "shop.html", "المتجر"],
    ["herd", "cuts.html", "القطيع"],
    ["carcass", "shop.html?a=carcass", "الذبائح"],
    ["extras", "shop.html?a=extra", "عدّة الشواء"]
  ];
  const TABS = [
    ["home", "index.html", "home", "الرئيسية"],
    ["shop", "shop.html", "shop", "المتجر"],
    ["advisor", "advisor.html", "", "المستشار"],
    ["cart", "cart.html", "cart", "السلة"],
    ["account", "account.html", "user", "حسابي"]
  ];

  const head = m => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${C.base}${m.file === "index.html" ? "" : m.file}">`}
<meta name="theme-color" content="#0E1216">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="نُضْج">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="assets/icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<meta property="og:type" content="${m.ogType || "website"}">
<meta property="og:site_name" content="نُضْج">
<meta property="og:locale" content="ar_SA">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${C.base}${m.file === "index.html" ? "" : m.file}">
${(m.ogImage || D.IMAGES["og-share"]) ? `<meta property="og:image" content="${C.base}${m.ogImage || D.IMAGES["og-share"]}">
<meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;500;700;800;900&family=Handjet:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=${V("assets/css/style.css")}">
${m.preload ? `<link rel="preload" as="image" href="${m.preload}">` : ""}
${(m.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;

  const ticker = () => `<div class="util" role="note"><div class="util__track"><span>${[
    "التقطيع مجاني بأي شكل", "التتبيل والتسييخ حسب الطلب", "المستشار يحسب لك بالجرام", "توصيل مجاني من " + C.delivery.freeOver + " ر.س", "ضأن · ماعز · حاشي · عجل · بقر · جاموس"
  ].map(t => `<i>${t}</i>`).join("")}</span></div></div>`;

  const siteHeader = m => `<header class="site-header"><div class="wrap hdr">
  <a class="hdr__logo" href="index.html" aria-label="نُضْج — الرئيسية">${U.brand()}</a>
  <nav class="nav" aria-label="التنقل الرئيسي">${NAV.map(([k, h, t]) => `<a href="${h}"${m.nav === k ? ' class="is-on" aria-current="page"' : ""}>${t}</a>`).join("")}
    <a href="advisor.html" class="nav__adv${m.nav === "advisor" ? " is-on" : ""}"${m.nav === "advisor" ? ' aria-current="page"' : ""}><i class="live"></i>المستشار</a></nav>
  <form class="hdr-search" role="search" data-search-form>${icon("search")}<input type="search" name="q" placeholder="ريش، كبسة، حاشي…" aria-label="ابحث في المتجر" autocomplete="off"></form>
  <div class="hdr-tools">
    <a class="tool${m.tab === "account" ? " is-on" : ""}" href="account.html" aria-label="حسابي">${icon("user")}</a>
    <a class="tool" href="wishlist.html" aria-label="المفضلة">${icon("heart")}</a>
    <a class="tool hdr-cart${m.tab === "cart" ? " is-on" : ""}" href="cart.html" aria-label="السلة">${icon("cart")}<b class="badge" data-cart-count>0</b></a>
  </div>
</div></header>`;

  const trailBtn = t => {
    if (t === "search") return `<a class="ab-btn" href="search.html" aria-label="بحث">${icon("search")}</a>`;
    if (t === "share") return `<button class="ab-btn" type="button" data-share aria-label="مشاركة">${icon("share")}</button>`;
    if (t === "cart") return `<a class="ab-btn" href="cart.html" aria-label="السلة">${icon("cart")}<b class="badge" data-cart-count>0</b></a>`;
    if (t === "herd") return `<a class="ab-btn" href="cuts.html" aria-label="القطيع">${icon("map")}</a>`;
    if (t === "reset") return `<button class="ab-btn" type="button" data-act="reset-adv" aria-label="ابدأ من جديد">${icon("refresh")}</button>`;
    if (t.indexOf("wish:") === 0) return `<button class="ab-btn" type="button" data-wish="${t.slice(5)}" aria-label="أضف للمفضلة" aria-pressed="false">${icon("heart")}</button>`;
    return "";
  };
  const appBar = m => `<header class="app-bar">
  <div class="ab-lead">${m.mode === "push"
      ? `<a class="ab-back" href="${m.back ? m.back[0] : "index.html"}" data-back aria-label="رجوع إلى ${esc(m.back ? m.back[1] : "الرئيسية")}">${icon("chevR", "", 2.4)}<span>${esc(m.back ? m.back[1] : "رجوع")}</span></a>`
      : `<a class="ab-brand" href="index.html" aria-label="نُضْج — الرئيسية">${U.logo()}</a>`}</div>
  <div class="ab-title" aria-hidden="true">${esc(m.appTitle || "")}</div>
  <div class="ab-trail">${(m.trail || []).map(trailBtn).join("")}</div>
</header>`;

  const tabbar = m => `<nav class="tabbar" aria-label="التبويبات">${TABS.map(([k, h, ic, t]) => k === "advisor"
    ? `<a href="${h}" data-tab="${k}" class="tab-adv${m.tab === k ? " is-on" : ""}"${m.tab === k ? ' aria-current="page"' : ""}><span class="tab-adv__b">${U.mark()}</span><span>${t}</span></a>`
    : `<a href="${h}" data-tab="${k}"${m.tab === k ? ' class="is-on" aria-current="page"' : ""}>${icon(ic)}<span>${t}</span>${k === "cart" ? '<b class="badge" data-cart-count>0</b>' : ""}</a>`).join("")}</nav>`;

  const footer = () => `<footer class="site-footer"><div class="wrap">
  <div class="ftr__big" aria-hidden="true">${U.logo()}</div>
  <div class="ftr">
    <div class="ftr__brand"><p>ملحمة إلكترونية ومستشار طبخ: قل لنا وش المناسبة، ونقطّع لك اللحم على طبختك بالجرام.</p>
      <div class="ftr__meta"><span>السجل التجاري <b>${C.contact.cr}</b></span><span>الرقم الضريبي <b>${C.contact.vatNo}</b></span><span>للطلبات <b>${C.contact.phone}</b></span></div></div>
    <div><h3>القطيع</h3><ul>${D.ANIMALS.map(a => `<li><a href="${a.k}.html">${a.n}</a></li>`).join("")}</ul></div>
    <div><h3>تسوّق</h3><ul><li><a href="shop.html">كل القطعيات</a></li><li><a href="shop.html?a=carcass">الذبائح</a></li><li><a href="shop.html?a=extra">عدّة الشواء والبهارات</a></li><li><a href="advisor.html">مستشار نُضْج</a></li><li><a href="cuts.html">خريطة القطعيات</a></li></ul></div>
    <div><h3>المساعدة</h3><ul><li><a href="help.html">الأسئلة الشائعة</a></li><li><a href="help.html#delivery">التوصيل</a></li><li><a href="account.html?s=orders">تتبّع طلبك</a></li><li><a href="contact.html">تواصل معنا</a></li><li><a href="about.html">من نحن</a></li></ul></div>
  </div>
  <div class="ftr__bottom"><span>© 2026 نُضْج · المملكة العربية السعودية</span><span><a href="terms.html">الشروط</a> · <a href="privacy.html">الخصوصية</a></span>
    <span class="pays" aria-label="طرق الدفع"><span>مدى</span><span>Apple Pay</span><span>VISA</span><span>Mastercard</span><span>تمارا</span></span></div>
</div></footer>`;

  const SCRIPTS = ["assets/js/data.js", "assets/js/images.js", "assets/js/store.js", "assets/js/ui.js", "assets/js/app.js", "assets/js/advisor.js"];

  return function render(m, main) {
    const mode = m.mode || "root";
    m.mode = mode;
    const hasTab = m.tabbar !== false;
    const cls = ["page-" + m.name, hasTab ? "has-tabbar" : "", m.actionbar ? "has-actionbar" : "", "mode-" + mode].filter(Boolean).join(" ");
    const attrs = Object.keys(m.data || {}).map(k => ` data-${k}="${esc(m.data[k])}"`).join("");
    const scripts = SCRIPTS.concat((m.scripts || []).map(s => "assets/js/pages/" + s + ".js"));
    return `${head(m)}
<body class="${cls}" data-tab="${m.tab || ""}"${attrs}>
<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
${ticker()}
${siteHeader(m)}
${appBar(m)}
<main id="main">
${main}
</main>
${m.footer === false ? "" : footer()}
${m.actionbar ? `<div class="action-bar" id="actionBar">${m.actionbar === true ? "" : m.actionbar}</div>` : ""}
${hasTab ? tabbar(m) : ""}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
${scripts.map(s => `<script src="${s}?v=${V(s)}"></script>`).join("\n")}
</body>
</html>
`;
  };
};
