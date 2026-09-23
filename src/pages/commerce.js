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
