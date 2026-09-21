/* الرئيسية — المتجر أولاً، والخبرة عرض اختياري */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon } = U;
  const P = D.PRODUCTS;
  const featured = P.filter(p => p.featured && p.type !== "box");
  const carcass = P.filter(p => p.type === "carcass");
  const boxes = P.filter(p => p.type === "box");
  const guidesCount = D.GUIDES.length;

  const trust = [
    ["snow", "توصيل مبرّد سريع", "يحفظ اللحم طازجاً"],
    ["shield", "ذبح حلال", "بإشراف شرعي كامل"],
    ["knife", "تقطيع وتجهيز مجاني", "حسب طلبك وطبختك"],
    ["cash", "الدفع عند الاستلام", "وطرق دفع إلكترونية"]
  ];

  const main = `<div class="wrap">
  <button class="city-chip mob-only" type="button" data-city>${icon("pin")}التوصيل إلى <b data-city-label>${C.cities[0]}</b>${icon("chevD")}</button>
  <a class="search-bar home-search mob-only" href="search.html">${icon("search")}<span>ابحث عن قطعة أو طبخة…</span></a>

  <section class="hero" aria-labelledby="heroTitle">
    <div class="hero__text">
      <span class="eyebrow">ملحمة إلكترونية</span>
      <h1 id="heroTitle">لحم طازج،<br><em>مقطّع على طبختك.</em></h1>
      <p>ذبائح وقطعيات ضأن وبقر، نقطّعها ونغلّفها حسب طلبك، وتوصلك مبرّدة في الموعد اللي تختاره.</p>
      <div class="hero__cta"><a class="btn btn--brand btn--lg" href="shop.html">تسوّق الآن</a><a class="btn btn--ghost btn--lg" href="shop.html?t=carcass">اطلب ذبيحة</a></div>
    </div>
    <div class="hero__media">${U.slot("home-hero", "hero__img", "لحم طازج من نُضْج")}</div>
  </section>

  <section class="section--tight" aria-label="لماذا نُضْج">
    <ul class="trust">${trust.map(t => `<li class="trust__i">${icon(t[0])}<span><b>${t[1]}</b><small>${t[2]}</small></span></li>`).join("")}</ul>
  </section>

  <section class="section">
    ${h.secHead("تسوّق حسب النوع", "", "shop.html", "المتجر")}
    <div class="type-grid">${D.TYPES.map(U.typeTile).join("")}</div>
  </section>

  <section class="section">
    ${h.secHead("مختارات", "قطعيات يكثر طلبها للطبخ اليومي والعزائم", "shop.html", "كل المنتجات")}
    <div class="shelf">${U.productGrid(featured)}</div>
  </section>

  <section class="section" aria-labelledby="xpTitle">
    <div class="xp-band">
      <div class="xp-band__b">
        <span class="eyebrow">خدمة إضافية اختيارية</span>
        <h2 id="xpTitle">تبغى تطبخها صح؟</h2>
        <p>لحمك تشتريه عادي. وإذا تبغى تتقنه، أضف الخبرة:</p>
        <ul class="xp-list">
          <li>${icon("video")}<span>فيديو يشرح كيف تُقطّع القطعة ومن وين تجي</span></li>
          <li>${icon("thermo")}<span>خطوات الطبخ والحرارة والوقت لكل طريقة</span></li>
          <li>${icon("chat")}<span>استشارة مباشرة مع جزّار قبل عزيمتك</span></li>
        </ul>
        <div class="btn-row"><a class="btn btn--light btn--lg" href="expertise.html">اكتشف الخبرة</a><span class="from">دليل واحد بـ ${C.guidePrice} ${C.currency} · أو ${guidesCount} دليلاً مع نُضْج+</span></div>
      </div>
      ${U.slot("home-expertise", "xp-band__img", "خبرة نُضْج")}
    </div>
  </section>

  <section class="section">
    ${h.secHead("وش تطبخ اليوم؟", "اختر الطبخة ونقول لك أي قطعة تحتاج وكم للشخص", "expertise.html#dishes", "الكل")}
    <div class="dish-grid">${D.DISHES.map(U.dishTile).join("")}</div>
  </section>

  <section class="section">
    ${h.secHead("الذبائح", "كاملة ونصف وربع — تُقطّع حسب طبختك", "shop.html?t=carcass", "الكل")}
    <div class="grid-p grid-p--3">${U.productGrid(carcass, { spec: false })}</div>
    <h3 class="sub-head">كيف تطلب ذبيحتك؟</h3>
    <ol class="steps3">
      <li><b>اختر الحجم</b><small>صغيرة أو متوسطة أو كبيرة — الوزن التقريبي مكتوب تحت كل حجم.</small></li>
      <li><b>اختر التقطيع</b><small>ثلاجة، كبسة، مندي، أرباع أو مفصّل — واكتب أي تفصيل للجزّار.</small></li>
      <li><b>اختر موعد التوصيل</b><small>تصلك مبرّدة ومغلّفة في الفترة اللي تناسبك.</small></li>
    </ol>
  </section>

  <section class="section">
    ${h.secHead("البوكسات", "تشكيلات جاهزة بسعر أقل من شرائها منفصلة", "shop.html?t=box", "الكل")}
    <div class="shelf">${U.productGrid(boxes, { spec: false })}</div>
  </section>

  <section class="section">
    <div class="chart-teaser">
      <div>
        <span class="eyebrow">تسوّق من الذبيحة</span>
        <h2>اعرف كل قطعة من وين تجي</h2>
        <p class="muted">اضغط على أي منطقة في المخطط وتشوف قطعياتها وأسعارها وطريقة الطبخ المناسبة.</p>
        <a class="btn btn--ghost" href="cuts.html" style="margin-top:14px">افتح مخطط الذبيحة ${icon("chevL")}</a>
      </div>
      <a href="cuts.html" aria-label="افتح مخطط الذبيحة">${U.chartSVG({ cls: "chart-svg--teaser" })}</a>
    </div>
  </section>
</div>`;

  return {
    name: "home", file: "index.html", tab: "home", nav: "", mode: "root", lead: "brand", trail: ["wishlist"], appTitle: "",
    title: "نُضْج — لحم طازج مقطّع على طبختك",
    desc: "ملحمة إلكترونية سعودية: ذبائح وقطعيات ضأن وبقر ومفروم وبوكسات، تُقطّع وتُغلّف حسب طبختك وتوصلك مبرّدة. ومعها أدلة مصوّرة واستشارة جزّار لمن يبغى يتقن الطبخ.",
    jsonld: [
      { "@context": "https://schema.org", "@type": "Organization", "@id": C.base + "#org", name: "نُضْج", alternateName: "NUDJ", url: C.base },
      { "@context": "https://schema.org", "@type": "WebSite", "@id": C.base + "#site", name: "نُضْج", inLanguage: "ar-SA", url: C.base,
        potentialAction: { "@type": "SearchAction", target: C.base + "search.html?q={q}", "query-input": "required name=q" } }
    ],
    main
  };
};
