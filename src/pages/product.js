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
