/* المستشار + السلة + الدفع + الطلب + المفضلة + البحث + الحساب + الدخول */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon } = U;
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
      ${U.kicker("N°", "مستشار نُضْج")}
      <h1 class="adv-side__t">قل المناسبة. <em>نحسبها بالجرام.</em></h1>
      <p>كل إجابة تقدر ترجع لها وتغيّرها. وبعد الخطة تقدر تضيف مناسبة ثانية أو تعدّل أي وزن قبل الطلب.</p>
      <h2 class="adv-side__h">كيف يحسب؟</h2>
      <ul class="rules">
        <li><b class="num">${G.grill}</b><span>جم للشخص — مشاوي بدون عظم</span></li>
        <li><b class="num">${G.kabsa}</b><span>جم للشخص — كبسة ومندي بالعظم</span></li>
        <li><b class="num">${G.steak}</b><span>جم للشخص — ستيك</span></li>
        <li><b class="num">${G.stew}</b><span>جم للشخص — مرق وإيدام</span></li>
        <li><b class="num">1</b><span>كيس فحم لكل ${D.ADVISOR.charcoalKgPerBag} كجم مشاوي</span></li>
      </ul>
      <p class="muted small">الكميات تقريبية للحم النيء وتُقرّب لأقرب نصف كيلو.</p>
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
