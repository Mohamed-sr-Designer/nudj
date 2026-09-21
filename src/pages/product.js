/* صفحة لكل منتج — HTML ثابت قابل للأرشفة، والتفاعل يُضاف في المتصفح */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon, esc, money } = U;

  const MI = { grill: "flame", pan: "pan", oven: "oven", slow: "clock", braise: "pot", reverse: "swap" };

  return D.PRODUCTS.map(p => {
    const gid = D.guideIdFor(p);
    const typeName = U.typeName(p);
    const typeHref = p.type === "carcass" ? "shop.html?t=carcass" : p.type === "box" ? "shop.html?t=box" : p.mince ? "shop.html?t=mince" : p.animal === "ضأن" ? "shop.html?t=lamb" : "shop.html?t=beef";
    const dishes = D.dishesForProduct(p.id);
    const related = D.PRODUCTS.filter(q => q.id !== p.id && (p.type === "cut" ? q.type === "cut" && (q.zone === p.zone || q.animal === p.animal) : q.type === p.type || q.featured)).slice(0, 8);
    const vatLine = p.unit === "kg" ? "السعر للكيلو، شامل ضريبة القيمة المضافة" : p.type === "carcass" ? "السعر حسب الحجم، شامل ضريبة القيمة المضافة" : "شامل ضريبة القيمة المضافة";

    /* ---------- أقسام المحتوى المجاني ---------- */
    let about = "";
    if (p.type === "cut") {
      const pr = D.PRIMALS[p.animal][p.zone];
      about = `<section class="pdp-sec" aria-labelledby="aboutH">
  <h2 id="aboutH">عن القطعة</h2>
  <div class="about-grid">
    <div class="stack"><p>${esc(p.why)}</p><p class="muted">${esc(p.origin)}</p></div>
    <div class="facts">
      <div class="fact">${U.locatorSVG(p.zone)}<span><span class="fact__k">المنطقة في ذبيحة ${p.animal === "ضأن" ? "الضأن" : "البقر"}</span><b>${pr.name}</b></span></div>
      <div class="fact">${U.specStrip(p.spec, true)}</div>
    </div>
  </div>
</section>
<section class="pdp-sec" aria-labelledby="useH">
  <h2 id="useH">تنفع لـ</h2>
  <div class="tags">${p.bestFor.map(b => `<span class="tag">${esc(b)}</span>`).join("")}${dishes.map(d => `<a class="tag" href="${U.url.dish(d.slug)}">${U.dishIcon(d.slug)}${d.name}</a>`).join("")}</div>
  <h3 class="sub-head">طرق الطبخ المناسبة</h3>
  <div class="methods">${p.methods.map(m => `<span class="tag">${icon(MI[m])}${D.METHODS[m].name}</span>`).join("")}</div>
</section>`;
    } else if (p.type === "carcass") {
      about = `<section class="pdp-sec" aria-labelledby="aboutH">
  <h2 id="aboutH">عن ${esc(p.name)}</h2>
  <p style="max-width:70ch">${esc(p.about)}</p>
  <h3 class="sub-head">أساليب التقطيع</h3>
  <div class="styles">${D.CARCASS_GUIDE.styles.filter(s => p.cuts.indexOf(s.n) > -1).map(s => `<div><b>${s.n}</b><p>${s.d}</p></div>`).join("")}</div>
</section>`;
    } else {
      const val = U.boxValue(p);
      about = `<section class="pdp-sec" aria-labelledby="aboutH">
  <h2 id="aboutH">عن ${esc(p.name)}</h2>
  <p style="max-width:70ch">${esc(p.about)}</p>
  <h3 class="sub-head">المحتويات</h3>
  <div class="rows">${p.contents.map(c => { const q = D.byId(c.id); const s = q.unit === "kg" ? U.sizeOf(q, c.size).l : (c.qty > 1 ? c.qty + " × " : "") + (q.unitName || "حبة"); return U.productRow(q, { sub: s + (c.cut ? " · " + c.cut : "") }); }).join("")}</div>
  <p class="cart-note">${icon("tag")}<span>قيمة المحتويات لو اشتريتها منفصلة <b class="num">${money(val)}</b> ${C.currency} — توفّر <b class="num">${money(val - p.price)}</b> ${C.currency}.</span></p>
</section>`;
    }

    /* ---------- بطاقة الدليل المصوّر (الخدمة المدفوعة) ---------- */
    const chapters = gid ? D.CHAPTERS[gid === "carcass" ? "carcass" : "cut"] : [];
    const xp = gid ? `<section class="pdp-sec" id="guide" aria-labelledby="xpH">
  <h2 id="xpH">الدليل المصوّر</h2>
  <div class="xp-card" data-xp="${gid}">
    <a class="xp-card__vid ph" href="${U.url.guide(gid)}" aria-label="افتح صفحة الدليل"><span class="pill pill--brand">${icon("lock")}خدمة إضافية</span><span class="play">${U.playIcon()}</span></a>
    <div class="xp-card__b">
      <h3>${gid === "carcass" ? "دليل تقطيع الذبيحة" : "دليل " + esc(p.name) + ": من التقطيع حتى الطبق"}</h3>
      <p class="muted">${gid === "carcass" ? "فيديو يشرح كيف تُقسم الذبيحة، وأي تقطيع يناسب كل طبخة، وكم تكفي حسب حجمها." : "فيديو يشرح كيف تُقطّع هذي القطعة، وخطوات طبخها بكل طريقة مع الحرارة والوقت."}</p>
      <ol class="chapters" data-chapters="${gid}">${chapters.map(c => `<li>${esc(c)}${icon("lock")}</li>`).join("")}</ol>
      <div class="xp-card__cta" data-xp-cta="${gid}">
        <button class="btn btn--brand" type="button" data-add-guide="${gid}">أضف الدليل للسلة · ${C.guidePrice} ${C.currency}</button>
        <a class="btn btn--tint" href="subscribe.html">كل الأدلة مع نُضْج+</a>
      </div>
      <a class="link" href="${U.url.guide(gid)}">معاينة الدليل ${icon("chevL")}</a>
    </div>
  </div>
</section>` : "";

    const main = `<div class="wrap">
  ${h.crumbs([["المتجر", "shop.html"], [typeName, typeHref], [p.name]])}
  <div class="pdp">
    <div class="gallery" aria-label="صور ${esc(p.name)}">
      <div class="gallery__track" id="gTrack">${[0, 1, 2].map(i => U.img(i === 0 ? p.img || "" : (p.gallery || [])[i - 1] || "", p.name)).join("")}</div>
      <div class="gallery__dots" id="gDots" aria-hidden="true"><i class="on"></i><i></i><i></i></div>
    </div>
    <div class="pinfo">
      <div class="pinfo__meta">${p.code ? U.codeTag(p.code) : ""}<a class="pill pill--ghost" href="${typeHref}">${typeName}</a></div>
      <h1>${esc(p.name)}</h1>
      <div class="pinfo__en">${esc(p.en)}</div>
      <p class="pinfo__short">${esc(p.short)}</p>
      <div class="pinfo__price">${U.priceTag(p)}<span class="pinfo__vat">${vatLine}</span></div>
      ${p.weightNote ? `<p class="pinfo__wn">${icon("scale")}${esc(p.weightNote)}</p>` : ""}
      ${U.buyForm(p, { note: p.type === "cut" })}
      <div class="pinfo__trust"><div>${icon("snow")}توصيل مبرّد</div><div>${icon("knife")}تقطيع مجاني</div><div>${icon("shield")}ذبح حلال</div><div>${icon("cash")}الدفع عند الاستلام</div></div>
    </div>
  </div>
  ${about}
  ${xp}
  <section class="pdp-sec" aria-labelledby="revH">
    <h2 id="revH">التقييمات</h2>
    <div class="card" style="text-align:center;padding:24px">${icon("info", "", 1.6)}<p class="muted" style="margin-top:6px">لا توجد تقييمات بعد. تظهر التقييمات هنا من العملاء بعد استلام طلباتهم.</p></div>
  </section>
  <section class="pdp-sec" aria-labelledby="relH">
    <h2 id="relH">قد يعجبك</h2>
    <div class="shelf">${U.productGrid(related, { spec: false })}</div>
  </section>
</div>`;

    const priceNum = p.type === "carcass" ? Math.min.apply(null, p.sizes.map(s => s.p)) : p.price;
    return {
      name: "product", file: U.url.product(p.id), tab: "shop", nav: "shop", mode: "push", back: ["shop.html", "المتجر"],
      appTitle: p.name, trail: ["share", "wish:" + p.id, "cart"], tabbar: false,
      actionbar: `<div class="action-bar__p"><small>الإجمالي</small><b id="abTotal">${money(U.unitPrice(p, {}))} ${C.currency}</b></div><button class="btn btn--brand" type="button" id="abAdd">${icon("cart")}أضف للسلة</button>`,
      scripts: ["product"], data: { id: p.id }, ogType: "product",
      title: `${p.name} — ${typeName} · نُضْج`,
      desc: `${p.name}: ${p.short}. ${p.type === "cut" ? p.why : p.about}`.slice(0, 300),
      jsonld: [
        { "@context": "https://schema.org", "@type": "Product", name: p.name, alternateName: p.en, sku: p.code, description: p.type === "cut" ? p.why : p.about,
          brand: { "@type": "Brand", name: "نُضْج" }, category: typeName,
          offers: { "@type": "Offer", priceCurrency: "SAR", price: String(priceNum), availability: "https://schema.org/InStock", url: C.base + U.url.product(p.id) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: C.base },
          { "@type": "ListItem", position: 2, name: "المتجر", item: C.base + "shop.html" },
          { "@type": "ListItem", position: 3, name: p.name }] }
      ],
      main
    };
  });
};
