/* السلة + الدفع + الطلب + المفضلة + البحث + الحساب + الدخول */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon } = U;
  const loading = `<div class="loading" aria-hidden="true"><i></i><i></i><i></i></div>`;
  const noscript = `<noscript><p class="card" style="margin:20px 0">هذه الصفحة تحتاج تفعيل JavaScript في المتصفح.</p></noscript>`;

  return [
    {
      name: "cart", file: "cart.html", tab: "cart", mode: "root", appTitle: "السلة", scripts: ["cart"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>الإجمالي</small><b id="abTotal">—</b></div><a class="btn btn--brand" href="checkout.html" id="abGo">إتمام الطلب</a>`,
      title: "السلة · نُضْج", desc: "سلة مشترياتك في نُضْج.",
      main: `<div class="wrap">
  ${h.crumbs([["السلة"]])}
  <div class="page-head"><h1 class="large-title">السلة</h1></div>
  <div id="cartRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "checkout", file: "checkout.html", tab: "cart", mode: "push", back: ["cart.html", "السلة"], appTitle: "إتمام الطلب", tabbar: false, scripts: ["checkout"], noindex: true,
      actionbar: `<div class="action-bar__p"><small>الإجمالي</small><b id="abTotal">—</b></div><button class="btn btn--brand" type="button" id="abPlace">تأكيد الطلب</button>`,
      title: "إتمام الطلب · نُضْج", desc: "أكمل طلبك: عنوان التوصيل، الموعد، وطريقة الدفع.",
      main: `<div class="wrap">
  ${h.crumbs([["السلة", "cart.html"], ["إتمام الطلب"]])}
  <div class="page-head"><h1 class="large-title">إتمام الطلب</h1></div>
  <div id="coRoot">${loading}</div>${noscript}
</div>`
    },
    {
      name: "order", file: "order.html", tab: "account", mode: "push", back: ["account.html?s=orders", "طلباتي"], appTitle: "تفاصيل الطلب", scripts: ["order"], noindex: true,
      title: "تفاصيل الطلب · نُضْج", desc: "تفاصيل طلبك وحالته.",
      main: `<div class="wrap">
  ${h.crumbs([["حسابي", "account.html"], ["طلباتي", "account.html?s=orders"], ["تفاصيل الطلب"]])}
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
      title: "البحث · نُضْج", desc: "ابحث في منتجات نُضْج وأدلتها.",
      main: `<div class="wrap">
  ${h.crumbs([["البحث"]])}
  <h1 class="large-title" style="margin-bottom:12px">البحث</h1>
  <form class="search-bar" role="search" id="sForm">${icon("search")}<input type="search" id="sq" placeholder="قطعة، طبخة، أو دليل…" aria-label="ابحث" autocomplete="off" enterkeyhint="search"><button class="search-bar__x" type="button" id="sClear" aria-label="مسح" hidden>${icon("x", "", 2.4)}</button></form>
  <div id="sRoot" style="margin-top:16px"></div>
</div>`
    },
    {
      name: "account", file: "account.html", tab: "account", mode: "root", appTitle: "حسابي", scripts: ["account"], noindex: true,
      title: "حسابي · نُضْج", desc: "حسابك في نُضْج: الطلبات، الأدلة، الاشتراك، العناوين والإعدادات.",
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
