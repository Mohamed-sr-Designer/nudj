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
   ========================================================= */
module.exports = function makeShell(ctx) {
  const { D, U, C, V } = ctx;
  const { icon, esc, tpl } = U;
  const T = () => D.COPY;

  const NAV = () => [
    ["shop", "shop.html", T().nav.shop],
    ["herd", "cuts.html", T().nav.herd],
    ["carcass", "shop.html?a=carcass", T().nav.carcass],
    ["extras", "shop.html?a=extra", T().nav.extras]
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
<meta name="nudj-content" content="${ctx.contentHash || "0"}" data-tpl="${V("assets/js/templates.js")}">
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
<style id="theme">:root{--ember:${esc(D.THEME.accent || "#FF5A36")}}</style>
${m.preload ? `<link rel="preload" as="image" href="${m.preload}">` : ""}
${(m.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;

  const ticker = () => (T().ticker || []).length ? `<div class="util" role="note"><div class="util__track"><span>${T().ticker.map(t => `<i>${esc(tpl(t))}</i>`).join("")}</span></div></div>` : "";

  const siteHeader = m => `<header class="site-header"><div class="wrap hdr">
  <a class="hdr__logo" href="index.html" aria-label="نُضْج — الرئيسية">${U.brand()}</a>
  <nav class="nav" aria-label="التنقل الرئيسي">${NAV().map(([k, h, t]) => `<a href="${h}"${m.nav === k ? ' class="is-on" aria-current="page"' : ""}>${esc(t)}</a>`).join("")}
    <a href="advisor.html" class="nav__adv${m.nav === "advisor" ? " is-on" : ""}"${m.nav === "advisor" ? ' aria-current="page"' : ""}><i class="live"></i>${esc(T().nav.advisor)}</a></nav>
  <form class="hdr-search" role="search" data-search-form>${icon("search")}<input type="search" name="q" placeholder="${esc(T().nav.search)}" aria-label="ابحث في المتجر" autocomplete="off"></form>
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
  <div class="ftr">
    <div class="ftr__brand"><a href="index.html" class="ftr__logo" aria-label="نُضْج — الرئيسية">${U.brand()}</a><p>${tpl(T().footer.about)}</p>
      <div class="ftr__meta"><span>السجل التجاري <b>${esc(C.contact.cr)}</b></span><span>الرقم الضريبي <b>${esc(C.contact.vatNo)}</b></span><span>للطلبات <b>${esc(C.contact.phone)}</b></span></div></div>
    <div><h3>${esc(T().nav.herd)}</h3><ul>${D.ANIMALS.map(a => `<li><a href="${a.k}.html">${esc(a.n)}</a></li>`).join("")}</ul></div>
    <div><h3>تسوّق</h3><ul><li><a href="shop.html">كل القطعيات</a></li><li><a href="shop.html?a=carcass">${esc(T().nav.carcass)}</a></li><li><a href="shop.html?a=extra">${esc(T().nav.extras)}</a></li><li><a href="advisor.html">مستشار نُضْج</a></li><li><a href="cuts.html">خريطة القطعيات</a></li></ul></div>
    <div><h3>المساعدة</h3><ul><li><a href="help.html">الأسئلة الشائعة</a></li><li><a href="help.html#delivery">التوصيل</a></li><li><a href="account.html?s=orders">تتبّع طلبك</a></li><li><a href="contact.html">تواصل معنا</a></li><li><a href="about.html">من نحن</a></li></ul></div>
  </div>
  <div class="ftr__bottom"><span>${esc(T().footer.copyright)}</span><span><a href="terms.html">الشروط</a> · <a href="privacy.html">الخصوصية</a></span>
    <span class="pays" aria-label="طرق الدفع">${U.payments().filter(p => (p.logos || []).length).map(p => U.payLogos(p)).join("")}</span></div>
</div></footer>`;

  const SCRIPTS = ["assets/js/data.js", "assets/js/images.js", "assets/js/content.js", "assets/js/cms.js", "assets/js/store.js", "assets/js/ui.js", "assets/js/app.js", "assets/js/advisor.js"];

  function render(m, main) {
    const mode = m.mode || "root";
    m.mode = mode;
    const hasTab = m.tabbar !== false;
    const cls = ["page-" + m.name, hasTab ? "has-tabbar" : "", m.actionbar ? "has-actionbar" : "", "mode-" + mode].filter(Boolean).join(" ");
    const attrs = Object.keys(m.data || {}).map(k => ` data-${k}="${esc(m.data[k])}"`).join("");
    const scripts = (m.ownScripts || SCRIPTS).concat((m.scripts || []).map(s => "assets/js/pages/" + s + ".js"));
    return `${head(m)}
<body class="${cls}" data-tab="${m.tab || ""}" data-file="${esc(m.file)}"${attrs}>
<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
${m.chrome === false ? "" : ticker()}
${m.chrome === false ? "" : siteHeader(m)}
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
  }
  render.parts = { ticker, siteHeader, footer, appBar, tabbar };
  return render;
};

return module.exports; })();
M["home"] = (function () { var module = { exports: {} };
/* الرئيسية — كل النصوص من D.COPY.home، وترتيب الأقسام وإظهارها من D.HOME (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C, S } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY.home;
  const cutsCount = D.live().filter(p => p.sold === "kg").length;

  /* ---------- فاتورة مثال (تُحسب بنفس منطق السلة) ---------- */
  function sampleReceipt() {
    const sample = [
      { id: "lamb-shoulder", kg: 2, opts: { prep: "cubes", marinade: "hot", skewer: true }, why: "أوصال · 200 جم للشخص" },
      { id: "lamb-mince", kg: 1.5, opts: { prep: "kebab", marinade: "classic", skewer: true }, why: "كباب · 150 جم للشخص" },
      { id: "lamb-rack", kg: 1.5, opts: { prep: "chops" }, why: "ريش بالعظم · 150 جم للشخص" },
      { id: "charcoal", qty: 2, why: "كيس لكل 4.5 كجم" }
    ].filter(l => D.byId(l.id));
    const tot = sample.reduce((t, l) => t + S.breakdown(l).total, 0);
    return U.receipt({
      cls: "receipt--sample", kicker: "خطة المستشار", title: "حفلة مشاوي · 10 أشخاص",
      lines: sample.map(l => { const x = U.lineForReceipt(l); x.sub = [esc(l.why), x.sub].filter(Boolean).join(" · "); return x; }),
      totals: [["مجموع الخطة", U.money2(tot), "is-total"], ["للشخص تقريباً", U.money2(tot / 10)]], stamp: "مثال"
    });
  }

  /* ---------- «التقطيع مجاني»: سكين تقطّع الصورة إلى شرائح (شكل تقطيع لكل شريحة) ----------
     الشرائح نسخ من نفس الصورة مقصوصة بمضلعات مائلة، والسكين تمر على خطوط القطع من اليمين */
  function cutBand(n) {
    const B = T.cutband;
    const forms = (B.forms || []).filter(k => D.PREPS[k]);
    const N = Math.max(2, forms.length), W = 100 / N, SL = 2.6, TT = 100 / (N - 1), bg = D.IMAGES.texture || "";
    const f = x => +x.toFixed(3);
    const strips = forms.map((k, i) => {
      const p = N - 1 - i, l = p ? f(p * W) : -12, r = p === N - 1 ? 112 : f((p + 1) * W);
      return `<div class="cutband__s" style="--i:${i};--l:${l}%;--r:${r}%;--dir:${i % 2 ? 1 : -1};--mid:${f((p + .5) * W - SL)}%;background-image:url('${esc(bg)}')">
      <span class="cutband__lbl"><b>${esc(D.PREPS[k].n)}</b><small>${esc(D.PREPS[k].d)}</small></span></div>`;
    }).join("");
    const lines = forms.slice(1).map((k, j) => { const x = 100 - (j + 1) * W; return `<line x1="${f(x + SL)}" y1="0" x2="${f(x - SL)}" y2="100" style="--k:${j}"/>`; }).join("");
    let kf = "";
    forms.slice(1).forEach((k, j) => {
      const x = 100 - (j + 1) * W, st = j * TT;
      kf += `${f(st)}%{left:${f(x + SL + .4)}%;top:-6%;animation-timing-function:cubic-bezier(.55,0,.8,.4)}`;
      kf += `${f(st + TT * .6)}%{left:${f(x - SL - .2)}%;top:104%;animation-timing-function:linear}`;
      kf += `${f(st + TT * .8)}%{left:${f(x - SL - .6)}%;top:175%;animation-timing-function:steps(1,end)}`;
    });
    kf += `100%{left:${f(W - SL - .6)}%;top:175%}`;
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
    ${U.kicker(String(forms.length).padStart(2, "0"), esc(B.kicker))}
    <h2 id="cutH">${esc(B.title)}<em>${esc(B.em)}</em></h2>
    <p>${tpl(B.sub)}</p>
  </div>
  <button type="button" class="cutband__again" data-cut-again>${icon("knife")}${esc(B.again)}</button>
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
    <div class="hero__adv" id="advisor" data-advisor-inline="adv--hero"><div class="adv adv--hero adv--ssr"><div class="adv__head">${U.mark()}<b>مستشار نُضْج</b></div><div class="adv__log"><p class="muted" style="padding:20px">جارٍ تشغيل المستشار…</p></div></div></div>
  </div>
</section>`,
    marquee: () => `<div class="marquee" aria-hidden="true"><div class="marquee__track">${Array(2).fill(D.ANIMALS.map(a => `<span>${esc(a.n)}</span><i>${esc(a.en)}</i>`).join("")).join("")}</div></div>`,
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
  <div class="seg-tabs" role="tablist" aria-label="حسب الطبخة">${uses.map((u, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-use-tab="${u}">${icon(D.USES[u].ic)}${esc(D.USES[u].n)}</button>`).join("")}</div>
  ${uses.map((u, i) => `<div class="rail" role="tabpanel" data-use-panel="${u}"${i ? " hidden" : ""}>${U.grid(byUse(u))}</div>`).join("")}
</section>`,
    services: n => `<section class="section svc" aria-labelledby="svcH">
  <div class="wrap svc__in">
    <div class="svc__media">${U.slot("marinade", "svc__img", "")}</div>
    <div class="svc__b">
      <div class="sec-head">${U.kicker(num(n), esc(T.services.kicker))}<h2 id="svcH">${esc(T.services.title)}</h2><p>${tpl(T.services.sub)}</p></div>
      <ul class="price-list">
        ${D.MARINADES.filter(m => m.p).map(m => `<li><span><b>تتبيلة ${esc(m.n)}</b><small>${esc(m.d)}</small></span><em class="num">+${m.p} ر.س/كجم</em></li>`).join("")}
        <li><span><b>${esc(D.SERVICES.skewer.n)}</b><small>${esc(D.SERVICES.skewer.d)}</small></span><em class="num">+${D.SERVICES.skewer.p} ر.س/كجم</em></li>
        <li><span><b>${esc(D.SERVICES.vacuum.n)}</b><small>${esc(D.SERVICES.vacuum.d)}</small></span><em class="num">+${D.SERVICES.vacuum.p} ر.س/كجم</em></li>
        <li class="is-free"><span><b>${esc(T.services.freeT)}</b><small>${esc(T.services.freeD)}</small></span><em>مجاناً</em></li>
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
    <div class="sizes">${D.carcasses().filter(p => /whole|half/.test(p.id)).map(p => `<a class="size" href="${U.url.product(p.id)}"><span>${esc(p.name)}</span><b class="num">${U.money(p.sizes[0].p)}–${U.money(p.sizes[p.sizes.length - 1].p)}</b><small>${p.sizes[0].kg}–${p.sizes[p.sizes.length - 1].kg} كجم</small></a>`).join("")}</div>
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
    jsonld: [{ "@context": "https://schema.org", "@type": "Store", name: "نُضْج", url: C.base, image: C.base + (D.IMAGES["og-share"] || ""), priceRange: "SAR", currenciesAccepted: "SAR", description: T.seoDesc }],
    main
  }];
};

return module.exports; })();
M["shop"] = (function () { var module = { exports: {} };
/* المتجر + خريطة القطيع + صفحة لكل ماشية */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY;
  const pages = [];

  /* ================= المتجر ================= */
  const filters = [["all", "الكل"]].concat(D.ANIMALS.map(a => [a.k, a.n]), [["carcass", "الذبائح"], ["extra", "عدّة الشواء"]]);
  const uses = Object.keys(D.USES);
  pages.push({
    name: "shop", file: "shop.html", tab: "shop", nav: "shop", mode: "root", appTitle: "المتجر", scripts: ["shop"], trail: ["search", "herd"],
    title: "المتجر — قطعيات ضأن وماعز وحاشي وعجل وبقر وجاموس · نُضْج",
    desc: "كل قطعيات نُضْج بالكيلو مع التقطيع المجاني، والذبائح الكاملة، وعدّة الشواء والبهارات.",
    main: `<div class="wrap">
  ${h.crumbs([["المتجر"]])}
  <div class="page-head page-head--row"><div><h1 class="large-title">${esc(T.shop.title)}</h1><p><b class="num" id="shopCount">${D.live().length}</b> ${esc(T.shop.sub)}</p></div>
    <button type="button" class="btn btn--line" data-advisor="open">${U.mark("btn__mark")}${esc(T.shop.ask)}</button></div>
  <div class="filters" id="filters">
    <div class="chips-row" role="radiogroup" aria-label="الماشية">${filters.map(([k, n], i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-f-a="${k}">${k !== "all" && k !== "carcass" && k !== "extra" ? `<img src="assets/img/herd/${k}.png" alt="" aria-hidden="true">` : ""}${n}</button>`).join("")}</div>
    <div class="filters__row">
      <div class="chips-row chips-row--sm" role="radiogroup" aria-label="الطبخة"><button type="button" role="radio" aria-checked="true" data-f-u="all">كل الطبخات</button>${uses.map(u => `<button type="button" role="radio" aria-checked="false" data-f-u="${u}">${icon(D.USES[u].ic)}${D.USES[u].n}</button>`).join("")}</div>
      <label class="sort">${icon("filter")}<select id="sort" aria-label="الترتيب"><option value="">الترتيب: حسب الماشية</option><option value="asc">السعر: من الأقل</option><option value="desc">السعر: من الأعلى</option></select></label>
    </div>
  </div>
  <div class="grid" id="grid">${D.live().map(p => U.tagCard(p).replace('<article class="tag-card', `<article data-a="${p.sold === "carcass" ? "carcass " + p.animal : p.animal}" data-u="${(p.uses || []).join(" ")}" data-p="${p.sold === "carcass" ? p.sizes[0].p : p.price}" class="tag-card`)).join("")}</div>
  <div id="shopEmpty" hidden>${U.empty("search", esc(T.shop.empty), "جرّب ماشية أو طبخة ثانية.", `<button class="btn btn--line" type="button" data-f-reset>عرض الكل</button>`)}</div>
</div>`
  });

  /* ================= خريطة القطيع ================= */
  pages.push({
    name: "herd", file: "cuts.html", tab: "shop", nav: "herd", mode: "push", back: ["shop.html", "المتجر"], appTitle: "القطيع",
    title: "القطيع — خريطة قطعيات الضأن والماعز والحاشي والعجل والبقر والجاموس · نُضْج",
    desc: "خريطة القطعيات لكل ماشية: اضغط على أي رقم لتشوف القطعة وسعرها والتقطيع المتاح.",
    main: `<div class="wrap">
  ${h.crumbs([["القطيع"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.herd.title)}</h1><p>${tpl(T.herd.sub)}</p></div>
  <div class="herd-index">${D.ANIMALS.map((a, i) => `<a class="herd-tile" href="${U.url.animal(a.k)}">
    <span class="herd-tile__n num">0${i + 1}</span>${U.herdMap(a, { cls: "herd-map--tile", static: true })}
    <span class="herd-tile__b"><b>${a.n}</b><i class="num">${a.en}</i><small>${esc(a.note)}</small><span class="seeall">${D.cutsOf(a.k).length} منتجات ${icon("chevL")}</span></span></a>`).join("")}</div>
</div>`
  });

  /* ================= صفحة كل ماشية ================= */
  D.ANIMALS.forEach((a, i) => {
    const list = D.cutsOf(a.k), kg = list.filter(p => p.sold === "kg"), car = list.filter(p => p.sold === "carcass");
    const from = kg.length ? Math.min.apply(null, kg.map(p => p.price)) : 0;
    pages.push({
      name: "animal", file: a.k + ".html", tab: "shop", nav: "herd", mode: "push", back: ["cuts.html", "القطيع"], appTitle: a.n, scripts: ["animal"], trail: ["share"],
      title: `${a.n} — قطعيات ${a.n} وأسعارها بالكيلو · نُضْج`,
      desc: `${a.note} ${kg.length} قطعيات ${a.n} من ${from} ر.س للكيلو، والتقطيع مجاني.`,
      ogImage: kg[0] && kg[0].img,
      main: `<div class="wrap">
  ${h.crumbs([["القطيع", "cuts.html"], [a.n]])}
  <section class="animal-hero">
    <div class="animal-hero__t"><span class="animal-hero__n num">0${i + 1} / 06</span><h1 class="animal-hero__name">${a.n}<i class="num">${a.en}</i></h1><p>${esc(a.note)}</p>
      <dl class="hero__stats"><div><dt class="num">${kg.length}</dt><dd>قطعيات</dd></div><div><dt class="num">${from}</dt><dd>ر.س/كجم يبدأ من</dd></div>${car.length ? `<div><dt class="num">${car.length}</dt><dd>ذبائح</dd></div>` : ""}</dl>
      <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="ask" data-animal="${a.k}">${U.mark("btn__mark")}${esc(T.animal.ask)} ${esc(a.n)}</button></div></div>
    <div class="animal-hero__map">${U.herdMap(a)}</div>
  </section>
  <ol class="cut-index">${list.map(p => `<li><a href="${U.url.product(p.id)}" data-row="${p.id}"><span class="num">${p.code.slice(2)}</span><b>${esc(p.name)}</b><small>${p.zone ? D.ZONES[p.zone] : p.sold === "carcass" ? "ذبيحة" : "بدون موقع"}</small><em>${U.priceTag(p)}</em></a></li>`).join("")}</ol>
  ${car.length ? `<section class="section"><div class="sec-head"><h2>ذبائح ${a.n}</h2><p>${tpl(T.animal.carcassSub)}</p></div><div class="grid">${U.grid(car)}</div></section>` : ""}
  <section class="section"><div class="sec-head"><h2>قطعيات ${a.n} بالكيلو</h2></div><div class="grid">${U.grid(kg)}</div></section>
  <section class="section"><div class="sec-head"><h2>مواشي ثانية</h2></div><div class="herd-rail herd-rail--sm">${D.ANIMALS.map((x, j) => x.k === a.k ? "" : U.herdCard(x, j)).join("")}</div></section>
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
  const { icon, esc, tpl, h } = U;
  const T = D.COPY.product;

  return D.PRODUCTS.map(p => {
    const a = D.animal(p.animal);
    const isExtra = p.animal === "extra";
    const back = isExtra ? ["shop.html?a=extra", "عدّة الشواء"] : [p.animal + ".html", a.n];
    const related = (isExtra ? D.extras() : D.cutsOf(p.animal)).filter(x => x.id !== p.id).slice(0, 8);
    const pair = isExtra ? [] : (p.uses.indexOf("grill") > -1 ? ["charcoal", "spice-grill", "skewers"] : p.uses.indexOf("kabsa") > -1 ? ["spice-kabsa", "spice-mandi", "trays"] : ["trays", "spice-kabsa"]).map(D.byId).filter(x => x && !x.hidden);
    const imgs = [p.img].concat(p.gallery || []).filter(Boolean);
    const unit = p.sold === "kg" ? "للكيلو" : p.sold === "carcass" ? "حسب الحجم" : "لل" + (p.unitName || "حبة");
    const price = p.sold === "carcass" ? p.sizes[0].p : p.price;
    const offer = p.sold === "carcass"
      ? { "@type": "AggregateOffer", priceCurrency: "SAR", lowPrice: p.sizes[0].p, highPrice: p.sizes[p.sizes.length - 1].p, offerCount: p.sizes.length, availability: "https://schema.org/InStock" }
      : { "@type": "Offer", priceCurrency: "SAR", price, availability: "https://schema.org/InStock", url: C.base + p.id + ".html" };

    /* مستشار صغير داخل الصفحة: كم أحتاج؟ */
    const helper = p.sold === "kg" ? `<div class="mini-adv" id="miniAdv">
  <div class="mini-adv__h">${U.mark("mini-adv__mark")}<b>${esc(T.howMuch)}</b><small>المستشار يحسبها لك</small></div>
  <div class="mini-adv__row"><span>عدد الأشخاص</span><div class="stepper stepper--sm"><button type="button" data-mp="-1" aria-label="أقل">${icon("minus", "", 2.4)}</button><output class="num" id="mpV">4</output><button type="button" data-mp="1" aria-label="أكثر">${icon("plus", "", 2.4)}</button></div></div>
  <p class="mini-adv__out" id="mpOut"></p>
  <div class="mini-adv__btns"><button type="button" class="btn btn--line btn--sm" id="mpSet">اضبط الميزان</button><button type="button" class="btn btn--ghost btn--sm" data-advisor="open" data-sheet data-ask="${p.id}">اسأل المستشار عنها ${icon("chevL")}</button></div>
</div>` : p.sold === "carcass" ? `<div class="mini-adv"><div class="mini-adv__h">${U.mark("mini-adv__mark")}<b>كم شخص تكفي؟</b></div>
  <ul class="serves">${p.sizes.map(s => `<li><b>${s.l}</b><span class="num">≈ ${s.kg} كجم</span><em>كبسة لـ ${Math.floor(s.kg / 0.45)} شخص تقريباً</em></li>`).join("")}</ul>
  <button type="button" class="btn btn--line btn--sm" data-advisor="carcass" data-sheet>احسبها لي على عددنا ${icon("chevL")}</button></div>` : "";

    const where = p.zone && a && a.pins[p.zone] ? `<section class="section pd-where"><div class="sec-head"><h2>مكانها في ${a.n}</h2><p>${D.ZONES[p.zone]}</p></div>
      ${U.herdMap(a).replace(`data-pin="${p.id}"`, `data-pin="${p.id}" aria-current="true"`).replace('class="herd-map"', 'class="herd-map herd-map--focus"')}</section>` : "";

    return {
      name: "product", file: p.id + ".html", tab: "shop", nav: isExtra ? "extras" : p.sold === "carcass" ? "carcass" : "herd", mode: "push", back, appTitle: p.name,
      scripts: ["product"], trail: ["wish:" + p.id, "share"], data: { product: p.id },
      ogImage: p.img, ogType: "product",
      title: `${p.name} — ${p.sold === "carcass" ? "من " + U.money(price) + " ر.س" : U.money(price) + " ر.س " + unit} · نُضْج`,
      desc: `${p.name}: ${p.short}. ${p.info}`.slice(0, 300),
      actionbar: `<div class="action-bar__p"><small>${p.sold === "kg" ? `<span id="abKg">1</span> كجم` : "الإجمالي"}</small><b id="abTotal" class="num">—</b></div><button class="btn btn--ember" type="button" id="abAdd">${icon("cart")}أضف للسلة</button>`,
      jsonld: [{ "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.code, description: p.info, image: imgs.map(i => C.base + i), brand: { "@type": "Brand", name: "نُضْج" }, offers: offer }],
      main: `<div class="wrap">
  ${h.crumbs(isExtra ? [["المتجر", "shop.html"], ["عدّة الشواء", "shop.html?a=extra"], [p.name]] : [["القطيع", "cuts.html"], [a.n, a.k + ".html"], [p.name]])}
  <div class="pd">
    <div class="pd__media">
      <div class="pd__img">${U.productImg(p, "pd__ph", { eager: true })}<span class="pd__code num">${p.code}</span>${a ? `<span class="pd__animal"><img src="assets/img/herd/${a.k}.png" alt="" aria-hidden="true">${a.n}</span>` : ""}</div>
      ${imgs.length > 1 ? `<div class="pd__thumbs">${imgs.map((s, i) => `<button type="button" data-thumb="${esc(s)}"${i ? "" : ' aria-current="true"'}><img src="${esc(s)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
    </div>
    <div class="pd__buy">
      <div class="pd__meta"><span class="tag__code num">${p.code}</span><span>${a ? a.n : "عدّة الشواء"}${p.bone ? " · بالعظم" : ""}${p.zone ? " · " + D.ZONES[p.zone] : ""}</span></div>
      <h1 class="pd__t">${esc(p.name)}</h1>
      <p class="pd__short">${esc(p.short)}</p>
      <div class="pd__price">${U.priceTag(p)}${p.sold === "kg" ? `<span class="pd__free">${icon("knife")}${esc(T.free)}</span>` : ""}</div>
      ${helper}
      ${U.buyForm(p)}
    </div>
  </div>

  <section class="section pd-info">
    <div class="pd-info__b"><div class="sec-head"><h2>عن ${esc(p.name)}</h2></div><p class="lead">${esc(p.info)}</p>
      ${p.uses && !isExtra ? `<div class="use-tags">${p.uses.map(u => `<span>${icon(D.USES[u].ic)}${D.USES[u].n}</span>`).join("")}</div>` : ""}</div>
    ${p.spec ? `<div class="pd-info__spec">${U.spec(p.spec)}</div>` : ""}
  </section>
  ${where}
  ${pair.length ? `<section class="section"><div class="sec-head"><h2>${esc(T.pair)}</h2><p>${tpl(T.pairSub)}</p></div><div class="rail">${U.grid(pair)}</div></section>` : ""}
  <section class="section"><div class="sec-head"><h2>${isExtra ? "عدّة ثانية" : "قطعيات " + a.n + " ثانية"}</h2><a class="seeall" href="${isExtra ? "shop.html?a=extra" : a.k + ".html"}">الكل ${icon("chevL")}</a></div><div class="rail">${U.grid(related)}</div></section>
</div>`
    };
  });
};

return module.exports; })();
M["commerce"] = (function () { var module = { exports: {} };
/* المستشار + السلة + الدفع + الطلب + المفضلة + البحث + الحساب + الدخول */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY.advisorPage;
  const loading = `<div class="loading" aria-hidden="true"><i></i><i></i><i></i></div>`;
  const noscript = `<noscript><p class="card" style="margin:20px 0">هذه الصفحة تحتاج تفعيل JavaScript في المتصفح.</p></noscript>`;
  const G = D.ADVISOR.grams;

  return [
    {
      name: "advisor", file: "advisor.html", tab: "advisor", nav: "advisor", mode: "root", appTitle: "مستشار نُضْج", scripts: ["advisor-page"], footer: false,
      title: "مستشار نُضْج — احسب لحم مناسبتك بالجرام",
      desc: "مستشار تفاعلي يسألك عن مناسبتك وعددكم ويحسب لك القطعيات بالجرام، التقطيع، التتبيلة، الفحم والبهارات — ثم تطلب الخطة كاملة.",
      main: `<div class="adv-page">
  <aside class="adv-side">
    <div class="adv-side__b">
      ${U.kicker("N°", esc(T.kicker))}
      <h1 class="adv-side__t">${esc(T.title)} <em>${esc(T.em)}</em></h1>
      <p>${tpl(T.sub)}</p>
      <h2 class="adv-side__h">${esc(T.rules)}</h2>
      <ul class="rules">
        <li><b class="num">${G.grill}</b><span>جم للشخص — مشاوي بدون عظم</span></li>
        <li><b class="num">${G.kabsa}</b><span>جم للشخص — كبسة ومندي بالعظم</span></li>
        <li><b class="num">${G.steak}</b><span>جم للشخص — ستيك</span></li>
        <li><b class="num">${G.stew}</b><span>جم للشخص — مرق وإيدام</span></li>
        <li><b class="num">1</b><span>كيس فحم لكل ${D.ADVISOR.charcoalKgPerBag} كجم مشاوي</span></li>
      </ul>
      <p class="muted small">${tpl(T.note)}</p>
      <div id="advPlans"></div>
    </div>
  </aside>
  <div class="adv-main" data-advisor-inline="adv--page"><div class="adv adv--page adv--ssr"><div class="adv__log">${loading}</div></div></div>
</div>${noscript}`
    },
    {
      name: "cart", file: "cart.html", tab: "cart", mode: "root", appTitle: "السلة", scripts: ["cart"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>الإجمالي</small><b id="abTotal" class="num">—</b></div><a class="btn btn--ember" href="checkout.html" id="abGo">إتمام الطلب</a>`,
      title: "السلة · نُضْج", desc: "سلة مشترياتك في نُضْج.",
      main: `<div class="wrap">
  ${h.crumbs([["السلة"]])}
  <div class="page-head"><h1 class="large-title">السلة</h1><p id="cartSub"></p></div>
  <div id="cartRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "checkout", file: "checkout.html", tab: "cart", mode: "push", back: ["cart.html", "السلة"], appTitle: "إتمام الطلب", tabbar: false, scripts: ["checkout"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>الإجمالي</small><b id="abTotal" class="num">—</b></div><button class="btn btn--ember" type="button" id="abPlace">تأكيد الطلب</button>`,
      title: "إتمام الطلب · نُضْج", desc: "أكمل طلبك: عنوان التوصيل، الموعد، وطريقة الدفع.",
      main: `<div class="wrap">
  ${h.crumbs([["السلة", "cart.html"], ["إتمام الطلب"]])}
  <div class="page-head"><h1 class="large-title">إتمام الطلب</h1></div>
  <div id="coRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "order", file: "order.html", tab: "account", mode: "push", back: ["account.html?s=orders", "طلباتي"], appTitle: "الفاتورة", scripts: ["order"], noindex: true,
      title: "فاتورة الطلب · نُضْج", desc: "فاتورة طلبك وحالته.",
      main: `<div class="wrap">
  ${h.crumbs([["حسابي", "account.html"], ["طلباتي", "account.html?s=orders"], ["الفاتورة"]])}
  <div id="orderRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "wishlist", file: "wishlist.html", tab: "account", mode: "push", back: ["account.html", "حسابي"], appTitle: "المفضلة", scripts: ["wishlist"], noindex: true,
      title: "المفضلة · نُضْج", desc: "المنتجات التي حفظتها في نُضْج.",
      main: `<div class="wrap">
  ${h.crumbs([["حسابي", "account.html"], ["المفضلة"]])}
  <div class="page-head"><h1 class="large-title">المفضلة</h1><p id="wishSub"></p></div>
  <div id="wishRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "search", file: "search.html", tab: "shop", mode: "push", back: ["shop.html", "المتجر"], appTitle: "البحث", scripts: ["search"], noindex: true,
      title: "البحث · نُضْج", desc: "ابحث في قطعيات نُضْج.",
      main: `<div class="wrap">
  ${h.crumbs([["البحث"]])}
  <h1 class="large-title" style="margin-bottom:12px">البحث</h1>
  <form class="search-bar" role="search" id="sForm">${icon("search")}<input type="search" id="sq" placeholder="قطعة، ماشية، أو طبخة…" aria-label="ابحث" autocomplete="off" enterkeyhint="search"><button class="search-bar__x" type="button" id="sClear" aria-label="مسح" hidden>${icon("x", "", 2.4)}</button></form>
  <div id="sRoot" style="margin-top:16px"></div>
</div>`
    },
    {
      name: "account", file: "account.html", tab: "account", mode: "root", appTitle: "حسابي", scripts: ["account"], noindex: true,
      title: "حسابي · نُضْج", desc: "حسابك في نُضْج: الطلبات، خطط المستشار، العناوين والإعدادات.",
      main: `<div class="wrap">
  ${h.crumbs([["حسابي"]])}
  <div class="page-head" id="accHead"><h1 class="large-title">حسابي</h1></div>
  <div class="acc">
    <aside class="acc-side desk-only" id="accSide"></aside>
    <div class="acc-main" id="accRoot">${loading}</div>
  </div>${noscript}
</div>`
    },
    {
      name: "login", file: "login.html", tab: "account", mode: "push", back: ["account.html", "حسابي"], appTitle: "تسجيل الدخول", tabbar: false, scripts: ["login"], noindex: true,
      title: "تسجيل الدخول · نُضْج", desc: "سجّل دخولك في نُضْج برقم جوالك.",
      main: `<div class="wrap"><div class="auth" id="authRoot">${loading}</div>${noscript}</div>`
    }
  ];
};

return module.exports; })();
M["info"] = (function () { var module = { exports: {} };
/* المساعدة + من نحن + تواصل + الشروط + الخصوصية — كل المحتوى من D.COPY و D.HELP (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY, K = C.contact;
  const draft = C.demo ? `<p class="demo-banner">${icon("info")}نموذج مبدئي — راجع النص مع مستشار قانوني وعدّل ما بين [الأقواس] قبل الإطلاق.</p>` : "";
  const push = (name, file, title, appTitle, desc, main, extra) => Object.assign({
    name, file, tab: "account", mode: "push", back: ["account.html", "حسابي"], appTitle, title: title + " · نُضْج", desc, main
  }, extra || {});
  const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const help = push("help", "help.html", "الأسئلة الشائعة والمساعدة", "المساعدة",
    "إجابات عن الطلب والتوصيل والتقطيع والتتبيل والدفع والاسترجاع ومستشار نُضْج.",
    `<div class="wrap">
  ${h.crumbs([["المساعدة"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.help.title)}</h1><p>${tpl(T.help.sub)}</p></div>
  <div class="help-cats">${D.HELP.map(g => `<a class="cell" href="#${esc(g.k)}"><span class="cell__ic">${icon(g.ic || "help")}</span><span class="cell__b"><span class="cell__t">${esc(g.t)}</span></span>${icon("chevL", "cell__chev")}</a>`).join("")}</div>
  ${D.HELP.map(g => `<h2 class="group__head" id="${esc(g.k)}">${esc(g.t)}</h2>
  <div class="faq">${(g.items || []).map(it => h.faq(esc(it[0]), tpl(it[1]))).join("")}</div>`).join("\n")}
</div>`);

  const about = push("about", "about.html", "من نحن", "من نحن", strip(tpl(T.about.body)).slice(0, 180),
    `<div class="wrap">
  ${h.crumbs([["من نحن"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.about.title)}</h1></div>
  ${U.slot("about", "about-img", "نُضْج")}
  <div class="prose" style="margin-top:28px">${tpl(T.about.body)}</div>
</div>`);

  const contact = push("contact", "contact.html", "تواصل معنا", "تواصل معنا", "تواصل مع نُضْج بخصوص طلبك أو التقطيع أو التتبيل.",
    `<div class="wrap">
  ${h.crumbs([["تواصل معنا"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.contact.title)}</h1><p>${tpl(T.contact.sub)}</p></div>
  <div class="contact-grid">
    <div class="ccard">${icon("phone")}<b>الهاتف</b><span class="num" dir="ltr">${esc(K.phone)}</span></div>
    <div class="ccard">${icon("chat")}<b>واتساب</b><span class="num" dir="ltr">${esc(K.whatsapp)}</span></div>
    <div class="ccard">${icon("mail")}<b>البريد الإلكتروني</b><span>${esc(K.email)}</span></div>
    <div class="ccard">${icon("clock")}<b>ساعات العمل</b><span>${esc(K.hours)}</span></div>
  </div>
  <section class="section" aria-labelledby="cfH">
    <h2 id="cfH" class="h2">${esc(T.contact.formTitle)}</h2>
    <form class="card" id="contactForm" novalidate style="max-width:640px">
      <div class="form-grid">
        <label class="field"><span class="field__l">الاسم</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span class="field__l">رقم الجوال</span><div class="phone-field"><span>+966</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" required></div></label>
      </div>
      <div class="form-grid">
        <label class="field"><span class="field__l">الموضوع</span><select class="select" name="topic"><option>استفسار عن طلب</option><option>التقطيع والتتبيل</option><option>المستشار والكميات</option><option>ملاحظة أو شكوى</option><option>أخرى</option></select></label>
        <label class="field"><span class="field__l">رقم الطلب <small>(اختياري)</small></span><input class="input" name="order" placeholder="NJ..."></label>
      </div>
      <label class="field"><span class="field__l">الرسالة</span><textarea class="textarea" name="msg" required maxlength="1000"></textarea></label>
      <button class="btn btn--ember btn--lg" type="submit">إرسال</button>
    </form>
  </section>
</div>`, { scripts: ["contact"] });

  const legal = (name, file, title, appTitle, desc, x) => push(name, file, title, appTitle, desc, `<div class="wrap">
  ${h.crumbs([[title]])}
  <div class="page-head"><h1 class="large-title">${esc(title)}</h1><p>آخر تحديث: ${esc(x.updated)}</p></div>
  ${draft}
  <div class="prose">${tpl(x.body)}</div>
</div>`);
  const terms = legal("terms", "terms.html", "الشروط والأحكام", "الشروط والأحكام", "الشروط والأحكام لاستخدام متجر نُضْج والمستشار والخدمات الإضافية.", T.terms);
  const privacy = legal("privacy", "privacy.html", "سياسة الخصوصية", "الخصوصية", "كيف يجمع نُضْج بياناتك ويستخدمها ويحميها.", T.privacy);

  return [help, about, contact, terms, privacy];
};

return module.exports; })();
  function rerender() {
    var D = window.NUDJ, U = window.NUDJ_UI, S = window.NUDJ_STORE;
    var ctx = { D: D, U: U, C: D.CONFIG, S: S, V: function () { return ""; }, h: U.h, contentHash: "" };
    var render = M.shell(ctx);
    var cur = document.body.getAttribute("data-file"), is404 = cur === "404.html";
    var file = is404 ? (decodeURIComponent(location.pathname.split("/").pop() || "") || "index.html") : cur;
    var page = null, mods = ["home","shop","product","commerce","info"];
    for (var i = 0; i < mods.length && !page; i++) { var list = M[mods[i]](ctx); for (var j = 0; j < list.length; j++) if (list[j].file === file) { page = list[j]; break; } }
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
    if (is404) (page.scripts || []).forEach(function (s) { var el = document.createElement("script"); el.src = "assets/js/pages/" + s + ".js"; el.async = false; document.body.appendChild(el); });
    return true;
  }
  return { M: M, rerender: rerender };
})();
