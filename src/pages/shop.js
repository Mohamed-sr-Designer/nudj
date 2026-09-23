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
    title: L("المتجر — قطعيات ضأن وماعز وجمل وعجل وبقر وجاموس · نُضْج", "Shop — lamb, goat, camel, veal, beef and buffalo cuts · NUDJ"),
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
    title: L("القطيع — خريطة قطعيات الضأن والماعز والجمل والعجل والبقر والجاموس · نُضْج", "The Herd — cuts map for lamb, goat, camel, veal, beef and buffalo · NUDJ"),
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
