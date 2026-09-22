/* المتجر + خريطة القطيع + صفحة لكل ماشية */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon, esc } = U;
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
  <div class="page-head page-head--row"><div><h1 class="large-title">المتجر</h1><p><b class="num" id="shopCount">${D.PRODUCTS.length}</b> منتج · الأسعار شاملة الضريبة</p></div>
    <button type="button" class="btn btn--line" data-advisor="open">${U.mark("btn__mark")}مو متأكد؟ اسأل المستشار</button></div>
  <div class="filters" id="filters">
    <div class="chips-row" role="radiogroup" aria-label="الماشية">${filters.map(([k, n], i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-f-a="${k}">${k !== "all" && k !== "carcass" && k !== "extra" ? `<img src="assets/img/herd/${k}.png" alt="" aria-hidden="true">` : ""}${n}</button>`).join("")}</div>
    <div class="filters__row">
      <div class="chips-row chips-row--sm" role="radiogroup" aria-label="الطبخة"><button type="button" role="radio" aria-checked="true" data-f-u="all">كل الطبخات</button>${uses.map(u => `<button type="button" role="radio" aria-checked="false" data-f-u="${u}">${icon(D.USES[u].ic)}${D.USES[u].n}</button>`).join("")}</div>
      <label class="sort">${icon("filter")}<select id="sort" aria-label="الترتيب"><option value="">الترتيب: حسب الماشية</option><option value="asc">السعر: من الأقل</option><option value="desc">السعر: من الأعلى</option></select></label>
    </div>
  </div>
  <div class="grid" id="grid">${D.PRODUCTS.map(p => U.tagCard(p).replace('<article class="tag-card', `<article data-a="${p.sold === "carcass" ? "carcass " + p.animal : p.animal}" data-u="${(p.uses || []).join(" ")}" data-p="${p.sold === "carcass" ? p.sizes[0].p : p.price}" class="tag-card`)).join("")}</div>
  <div id="shopEmpty" hidden>${U.empty("search", "ما في منتجات بهذا الفلتر", "جرّب ماشية أو طبخة ثانية.", `<button class="btn btn--line" type="button" data-f-reset>عرض الكل</button>`)}</div>
</div>`
  });

  /* ================= خريطة القطيع ================= */
  pages.push({
    name: "herd", file: "cuts.html", tab: "shop", nav: "herd", mode: "push", back: ["shop.html", "المتجر"], appTitle: "القطيع",
    title: "القطيع — خريطة قطعيات الضأن والماعز والحاشي والعجل والبقر والجاموس · نُضْج",
    desc: "خريطة القطعيات لكل ماشية: اضغط على أي رقم لتشوف القطعة وسعرها والتقطيع المتاح.",
    main: `<div class="wrap">
  ${h.crumbs([["القطيع"]])}
  <div class="page-head"><h1 class="large-title">القطيع</h1><p>ست مواشي، كل قطعة لها رقم على الرسم. اختر الماشية.</p></div>
  <div class="herd-index">${D.ANIMALS.map((a, i) => `<a class="herd-tile" href="${U.url.animal(a.k)}">
    <span class="herd-tile__n num">0${i + 1}</span>${U.herdMap(a, { cls: "herd-map--tile", static: true })}
    <span class="herd-tile__b"><b>${a.n}</b><i class="num">${a.en}</i><small>${esc(a.note)}</small><span class="seeall">${D.cutsOf(a.k).length} منتجات ${icon("chevL")}</span></span></a>`).join("")}</div>
</div>`
  });

  /* ================= صفحة كل ماشية ================= */
  D.ANIMALS.forEach((a, i) => {
    const list = D.cutsOf(a.k), kg = list.filter(p => p.sold === "kg"), car = list.filter(p => p.sold === "carcass");
    const from = Math.min.apply(null, kg.map(p => p.price));
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
      <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="ask" data-animal="${a.k}">${U.mark("btn__mark")}اسأل عن قطعيات ${a.n}</button></div></div>
    <div class="animal-hero__map">${U.herdMap(a)}</div>
  </section>
  <ol class="cut-index">${list.map(p => `<li><a href="${U.url.product(p.id)}" data-row="${p.id}"><span class="num">${p.code.slice(2)}</span><b>${esc(p.name)}</b><small>${p.zone ? D.ZONES[p.zone] : p.sold === "carcass" ? "ذبيحة" : "بدون موقع"}</small><em>${U.priceTag(p)}</em></a></li>`).join("")}</ol>
  ${car.length ? `<section class="section"><div class="sec-head"><h2>ذبائح ${a.n}</h2><p>التقطيع مجاني بأي أسلوب: ثلاجة، كبسة، مندي، أو حسب الطبخة.</p></div><div class="grid">${U.grid(car)}</div></section>` : ""}
  <section class="section"><div class="sec-head"><h2>قطعيات ${a.n} بالكيلو</h2></div><div class="grid">${U.grid(kg)}</div></section>
  <section class="section"><div class="sec-head"><h2>مواشي ثانية</h2></div><div class="herd-rail herd-rail--sm">${D.ANIMALS.map((x, j) => x.k === a.k ? "" : U.herdCard(x, j)).join("")}</div></section>
</div>`
    });
  });

  return pages;
};
