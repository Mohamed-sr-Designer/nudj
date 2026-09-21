/* المتجر + مخطط الذبيحة */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon } = U;
  const P = D.PRODUCTS;
  const cuts = P.filter(p => p.type === "cut");
  const count = f => cuts.filter(f).length;

  const fgroup = (title, name, items) => `<div class="fgroup"><h3>${title}</h3><div class="fopts">${items.map(([v, t, n]) =>
    `<label class="fopt"><input type="checkbox" name="${name}" value="${v}"><span>${t}</span><small>${n}</small></label>`).join("")}</div></div>`;

  const filters = `<div class="filters__in">
  ${fgroup("المنطقة في الذبيحة", "z", D.ZONES.map(z => [z, D.PRIMALS["ضأن"][z].name, count(p => p.zone === z)]).filter(x => x[2]))}
  ${fgroup("طريقة الطبخ", "m", Object.keys(D.METHODS).map(m => [m, D.METHODS[m].name, count(p => p.methods.indexOf(m) > -1)]).filter(x => x[2]))}
  ${fgroup("الخصائص", "f", [["tender", "طرية جداً", count(p => p.spec[0] >= 4)], ["fat", "دهن عالٍ", count(p => p.spec[1] >= 4)], ["easy", "سهلة التحضير", count(p => p.spec[3] <= 2)]])}
  <button class="btn btn--ghost btn--sm" type="button" data-clear>مسح التصفية</button>
</div>`;

  const shop = {
    name: "shop", file: "shop.html", tab: "shop", nav: "shop", mode: "root", appTitle: "المتجر", trail: ["chart", "search"], scripts: ["shop"],
    title: "المتجر — ذبائح وقطعيات ضأن وبقر ومفروم · نُضْج",
    desc: "كل منتجات نُضْج: ذبائح ضأن كاملة ونصف وربع، قطعيات ضأن وبقر، مفروم، وبوكسات جاهزة. اختر الوزن والتقطيع حسب طبختك.",
    main: `<div class="wrap">
  ${h.crumbs([["المتجر"]])}
  <div class="page-head"><h1 class="large-title">المتجر</h1><p class="desk-only">اختر النوع، أو صفِّ حسب المنطقة وطريقة الطبخ. كل منتج تقدر تحدد وزنه وتقطيعه قبل الإضافة.</p></div>
  <label class="search-bar mob-only" style="margin-bottom:12px">${icon("search")}<input type="search" id="shopQ" placeholder="ابحث في المتجر" aria-label="ابحث في المتجر" autocomplete="off"></label>
  <div class="type-chips" id="typeChips" role="tablist" aria-label="نوع المنتج">
    <button type="button" role="tab" class="on" aria-selected="true" data-t="">الكل</button>
    ${D.TYPES.map(t => `<button type="button" role="tab" aria-selected="false" data-t="${t.k}">${t.n}</button>`).join("")}
  </div>
  <div class="shop">
    <aside class="filters" id="filters" aria-label="تصفية">${filters}</aside>
    <div>
      <a class="chart-entry" href="cuts.html">${icon("map")}<span><b>تسوّق من مخطط الذبيحة</b><small>اختر المنطقة وشوف قطعياتها</small></span>${icon("chevL", "cell__chev")}</a>
      <div class="toolbar">
        <span class="toolbar__n"><b id="resN">${P.length}</b> منتج</span>
        <div class="toolbar__btns">
          <button class="tb-btn mob-only" type="button" id="openFilters">${icon("filter")}تصفية<span class="dot" hidden></span></button>
          <select class="sort-select" id="sort" aria-label="الترتيب">
            <option value="">الترتيب: المقترح</option><option value="low">السعر: الأقل أولاً</option><option value="high">السعر: الأعلى أولاً</option>
            <option value="tender">الأطرى أولاً</option><option value="bold">الأغنى نكهة</option>
          </select>
        </div>
      </div>
      <div class="grid-p grid-p--shop" id="grid">${U.productGrid(P)}</div>
      <div id="noRes" hidden>${U.empty("search", "ما لقينا منتجات بهذي التصفية", "جرّب تمسح بعض الخيارات أو تغيّر النوع.", `<button class="btn btn--ghost" type="button" data-clear>مسح التصفية</button>`)}</div>
    </div>
  </div>
</div>`
  };

  /* فهرس ثابت لكل المناطق (للمحركات ولمن لا يستخدم المخطط) */
  const zoneIndex = ["ضأن", "بقر"].map(a => `<div class="zi" data-zi="${a}"${a === "بقر" ? " hidden" : ""}>${D.ZONES.map(z => {
    const list = D.productsInZone(a, z); if (!list.length) return "";
    const pr = D.PRIMALS[a][z];
    return `<h3 class="group__head">${pr.name} — <span class="muted">${pr.note}</span></h3><div class="rows">${list.map(p => U.productRow(p)).join("")}</div>`;
  }).join("")}</div>`).join("");

  const chart = {
    name: "chart", file: "cuts.html", tab: "shop", nav: "cuts", mode: "push", back: ["shop.html", "المتجر"], appTitle: "مخطط الذبيحة", trail: ["share"], scripts: ["chart"],
    title: "مخطط الذبيحة — تسوّق قطعيات الضأن والبقر حسب المنطقة · نُضْج",
    desc: "مخطط تفاعلي للذبيحة: اضغط على الرقبة أو الكتف أو الريش أو الخاصرة أو الفخذ أو الصدر أو الموزة لتشوف قطعياتها وأسعارها وطريقة الطبخ المناسبة.",
    main: `<div class="wrap">
  ${h.crumbs([["المتجر", "shop.html"], ["مخطط الذبيحة"]])}
  <div class="page-head"><h1 class="large-title">مخطط الذبيحة</h1><p>اضغط على أي منطقة لتشوف قطعياتها وأسعارها.</p></div>
  <div class="seg" id="species" role="tablist" aria-label="نوع الذبيحة" style="margin-bottom:14px">
    <button type="button" role="tab" class="on" aria-selected="true" data-a="ضأن">ضأن</button><button type="button" role="tab" aria-selected="false" data-a="بقر">بقر</button>
  </div>
  <div class="chart-page">
    <div class="chart-stage">${U.chartSVG()}<p class="chart-hint">المخطط تقريبي لتوضيح مواقع القطعيات.</p></div>
    <aside class="zone-panel desk-only" id="zonePanel" aria-live="polite">
      <div class="zone-panel__head"><h2>اختر منطقة</h2><p>كل منطقة لها قوام ونسبة دهن وطريقة طبخ تختلف عن غيرها.</p></div>
      <div class="rows" id="zoneRows"></div>
    </aside>
  </div>
  <section class="section">
    ${h.secHead("كل القطعيات حسب المنطقة", "", "", "")}
    ${zoneIndex}
  </section>
</div>`
  };

  return [shop, chart];
};
