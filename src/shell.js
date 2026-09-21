/* =========================================================
   نُضْج — الإطار المشترك لكل الصفحات
   ترويسة الموقع + شريط التطبيق (iOS) + شريط التبويبات + الفوتر
   ========================================================= */
module.exports = function makeShell(ctx) {
  const { D, U, C, V } = ctx;
  const { icon, esc } = U;

  const NAV = [
    ["shop", "shop.html", "المتجر"],
    ["carcass", "shop.html?t=carcass", "الذبائح"],
    ["box", "shop.html?t=box", "البوكسات"],
    ["cuts", "cuts.html", "مخطط الذبيحة"],
    ["xp", "expertise.html", "الخبرة"]
  ];
  const TABS = [
    ["home", "index.html", "home", "الرئيسية"],
    ["shop", "shop.html", "shop", "المتجر"],
    ["expertise", "expertise.html", "expertise", "الخبرة"],
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
<meta name="theme-color" content="#F4F1EA">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=${V("assets/css/style.css")}">
${(m.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;

  const util = () => `<div class="util"><div class="wrap">
  <span class="util__msg">${icon("snow")}توصيل مبرّد · تقطيع وتجهيز مجاني حسب طبختك</span>
  <nav class="util__links" aria-label="روابط سريعة"><a href="help.html#delivery">التوصيل</a><a href="account.html?s=orders">تتبّع طلبك</a><a href="expertise.html">نُضْج+</a><a href="contact.html">تواصل معنا</a></nav>
</div></div>`;

  const siteHeader = m => `<header class="site-header"><div class="wrap hdr">
  <a href="index.html" aria-label="نُضْج — الرئيسية">${U.brand()}</a>
  <nav class="nav" aria-label="التنقل الرئيسي">${NAV.map(([k, h, t]) => `<a href="${h}"${m.nav === k ? ' class="is-on" aria-current="page"' : ""}>${t}${k === "xp" ? '<span class="nav__plus">+</span>' : ""}</a>`).join("")}</nav>
  <form class="hdr-search" role="search" data-search-form>${icon("search")}<input type="search" name="q" placeholder="ابحث عن قطعة أو طبخة…" aria-label="ابحث في المتجر" autocomplete="off"></form>
  <div class="hdr-tools">
    <a class="tool${m.tab === "account" ? " is-on" : ""}" href="account.html">${icon("user")}<span>حسابي</span></a>
    <a class="tool" href="wishlist.html">${icon("heart")}<span>المفضلة</span></a>
    <a class="tool hdr-cart${m.tab === "cart" ? " is-on" : ""}" href="cart.html">${icon("cart")}<span>السلة</span><b class="badge" data-cart-count>0</b></a>
  </div>
</div></header>`;

  const trailBtn = t => {
    if (t === "search") return `<a class="ab-btn" href="search.html" aria-label="بحث">${icon("search")}</a>`;
    if (t === "wishlist") return `<a class="ab-btn" href="wishlist.html" aria-label="المفضلة">${icon("heart")}</a>`;
    if (t === "share") return `<button class="ab-btn" type="button" data-share aria-label="مشاركة">${icon("share")}</button>`;
    if (t === "cart") return `<a class="ab-btn" href="cart.html" aria-label="السلة">${icon("cart")}<b class="badge" data-cart-count>0</b></a>`;
    if (t === "chart") return `<a class="ab-btn" href="cuts.html" aria-label="مخطط الذبيحة">${icon("map")}</a>`;
    if (t.indexOf("wish:") === 0) return `<button class="ab-btn" type="button" data-wish="${t.slice(5)}" aria-label="أضف للمفضلة" aria-pressed="false">${icon("heart")}</button>`;
    return "";
  };
  const appBar = m => `<header class="app-bar">
  <div class="ab-lead">${m.mode === "push"
      ? `<a class="ab-back" href="${m.back ? m.back[0] : "index.html"}" data-back aria-label="رجوع إلى ${esc(m.back ? m.back[1] : "الرئيسية")}">${icon("chevR", "", 2.4)}<span>${esc(m.back ? m.back[1] : "رجوع")}</span></a>`
      : m.lead === "brand" ? `<a class="ab-brand" href="index.html" aria-label="نُضْج — الرئيسية">${U.brand()}</a>` : ""}</div>
  <div class="ab-title" aria-hidden="true">${esc(m.appTitle || "")}</div>
  <div class="ab-trail">${(m.trail || []).map(trailBtn).join("")}</div>
</header>`;

  const tabbar = m => `<nav class="tabbar" aria-label="التبويبات">${TABS.map(([k, h, ic, t]) =>
    `<a href="${h}" data-tab="${k}"${m.tab === k ? ' class="is-on" aria-current="page"' : ""}>${icon(ic)}<span>${t}</span>${k === "cart" ? '<b class="badge" data-cart-count>0</b>' : ""}</a>`).join("")}</nav>`;

  const footer = () => `<footer class="site-footer"><div class="wrap">
  <div class="ftr">
    <div class="ftr__brand">${U.brand()}<p>ملحمة إلكترونية سعودية: لحم طازج مقطّع على طبختك — ومعه خبرة اختيارية لمن يبغى يتقن الطبخ.</p>
      <div class="ftr__meta"><span>السجل التجاري: <b>${C.contact.cr}</b></span><span>الرقم الضريبي: <b>${C.contact.vatNo}</b></span><span>للطلبات: <b>${C.contact.phone}</b></span></div></div>
    <div><h3>تسوّق</h3><ul>
      <li><a href="shop.html">كل المنتجات</a></li><li><a href="shop.html?t=carcass">الذبائح</a></li><li><a href="shop.html?t=lamb">قطعيات ضأن</a></li>
      <li><a href="shop.html?t=beef">قطعيات بقر</a></li><li><a href="shop.html?t=mince">المفروم</a></li><li><a href="shop.html?t=box">البوكسات</a></li><li><a href="cuts.html">مخطط الذبيحة</a></li></ul></div>
    <div><h3>الخبرة</h3><ul>
      <li><a href="expertise.html">نُضْج+</a></li><li><a href="guide-carcass.html">دليل تقطيع الذبيحة</a></li><li><a href="dish-kabsa.html">أي قطعة للكبسة؟</a></li>
      <li><a href="dish-mandi.html">أي قطعة للمندي؟</a></li><li><a href="cook.html">مختبر الطبخ</a></li><li><a href="consult.html">استشارة جزّار</a></li></ul></div>
    <div><h3>المساعدة</h3><ul>
      <li><a href="help.html">الأسئلة الشائعة</a></li><li><a href="help.html#delivery">التوصيل</a></li><li><a href="help.html#returns">الاسترجاع</a></li>
      <li><a href="account.html?s=orders">تتبّع طلبك</a></li><li><a href="contact.html">تواصل معنا</a></li></ul></div>
    <div><h3>نُضْج</h3><ul><li><a href="about.html">من نحن</a></li><li><a href="terms.html">الشروط والأحكام</a></li><li><a href="privacy.html">سياسة الخصوصية</a></li></ul></div>
  </div>
  <div class="ftr__bottom"><span>© 2026 نُضْج — جميع الحقوق محفوظة · المملكة العربية السعودية</span>
    <span class="pays" aria-label="طرق الدفع"><span>مدى</span><span>Apple Pay</span><span>VISA</span><span>Mastercard</span><span>تمارا</span><span>الدفع عند الاستلام</span></span></div>
</div></footer>`;

  const SCRIPTS = ["assets/js/data.js", "assets/js/store.js", "assets/js/ui.js", "assets/js/app.js"];

  /* الصفحة كاملة */
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
${util()}
${siteHeader(m)}
${appBar(m)}
<main id="main">
${main}
</main>
${footer()}
${m.actionbar ? `<div class="action-bar" id="actionBar">${m.actionbar === true ? "" : m.actionbar}</div>` : ""}
${hasTab ? tabbar(m) : ""}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
${scripts.map(s => `<script src="${s}?v=${V(s)}"></script>`).join("\n")}
</body>
</html>
`;
  };
};
