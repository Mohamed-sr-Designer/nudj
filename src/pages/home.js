/* الرئيسية */
module.exports = function (ctx) {
  const { D, U, C, h, S } = ctx;
  const { icon, esc } = U;
  const cutsCount = D.PRODUCTS.filter(p => p.sold === "kg").length;

  /* فاتورة مثال (تُحسب وقت البناء بنفس منطق السلة) */
  const sample = [
    { id: "lamb-shoulder", kg: 2, opts: { prep: "cubes", marinade: "hot", skewer: true }, why: "أوصال · 200 جم للشخص" },
    { id: "lamb-mince", kg: 1.5, opts: { prep: "kebab", marinade: "classic", skewer: true }, why: "كباب · 150 جم للشخص" },
    { id: "lamb-rack", kg: 1.5, opts: { prep: "chops" }, why: "ريش بالعظم · 150 جم للشخص" },
    { id: "charcoal", qty: 2, why: "كيس لكل 4.5 كجم" }
  ];
  const sTotal = sample.reduce((t, l) => t + S.breakdown(l).total, 0);
  const sampleReceipt = U.receipt({
    cls: "receipt--sample", kicker: "خطة المستشار", title: "حفلة مشاوي · 10 أشخاص",
    lines: sample.map(l => { const x = U.lineForReceipt(l); x.sub = [esc(l.why), x.sub].filter(Boolean).join(" · "); return x; }),
    totals: [["مجموع الخطة", U.money2(sTotal), "is-total"], ["للشخص تقريباً", U.money2(sTotal / 10)]],
    stamp: "مثال"
  });

  const uses = ["grill", "kabsa", "steak", "slow", "mince"];
  const byUse = u => D.PRODUCTS.filter(p => p.sold === "kg" && p.uses[0] === u).slice(0, 8);


  /* ============ «التقطيع مجاني»: سكين تقطّع الصورة إلى 7 شرائح (شكل تقطيع لكل شريحة) ============
     الشرائح نسخ من نفس الصورة مقصوصة بمضلعات مائلة (--l/--r)، وخطوط القطع والسكين تُرسم فوقها.
     حركة السكين تُولّد هنا لأن مواضع القطع تُحسب من عدد الأشكال. */
  function cutBand() {
    const forms = ["kabsa", "cubes", "slices", "steaks", "osso", "mince", "kebab"];
    const N = forms.length, W = 100 / N, SL = 2.6, T = 100 / (N - 1), bg = D.IMAGES.texture || "";
    const f = n => +n.toFixed(3);
    const strips = forms.map((k, i) => {
      const p = N - 1 - i, l = p ? f(p * W) : -12, r = p === N - 1 ? 112 : f((p + 1) * W);
      return `<div class="cutband__s" style="--i:${i};--l:${l}%;--r:${r}%;--dir:${i % 2 ? 1 : -1};--mid:${f((p + .5) * W - SL)}%;background-image:url('${bg}')">
      <span class="cutband__lbl"><b>${D.PREPS[k].n}</b><small>${D.PREPS[k].d}</small></span></div>`;
    }).join("");
    const lines = forms.slice(1).map((k, j) => { const x = 100 - (j + 1) * W; return `<line x1="${f(x + SL)}" y1="0" x2="${f(x - SL)}" y2="100" style="--k:${j}"/>`; }).join("");
    /* مسار طرف السكين: ينزل على كل خط قطع ثم يقفز للخط التالي خارج الإطار */
    let kf = "";
    forms.slice(1).forEach((k, j) => {
      const x = 100 - (j + 1) * W, st = j * T;
      kf += `${f(st)}%{left:${f(x + SL + .4)}%;top:-6%;animation-timing-function:cubic-bezier(.55,0,.8,.4)}`;
      kf += `${f(st + T * .6)}%{left:${f(x - SL - .2)}%;top:104%;animation-timing-function:linear}`;
      kf += `${f(st + T * .8)}%{left:${f(x - SL - .6)}%;top:175%;animation-timing-function:steps(1,end)}`;
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
    ${U.kicker(String(N).padStart(2, "0"), "أشكال تقطيع")}
    <h2 id="cutH">التقطيع مجاني.<em>بأي شكل تبغاه.</em></h2>
    <p>اختار الشكل وقت الطلب — والجزّار يقطّعها لك بدون أي رسوم.</p>
  </div>
  <button type="button" class="cutband__again" data-cut-again>${icon("knife")}قطّعها مرة ثانية</button>
  <ul class="cutband__forms">${forms.map(k => `<li><b>${D.PREPS[k].n}</b><small>${D.PREPS[k].d}</small></li>`).join("")}</ul>
</section>`;
  }

  return [{
    name: "home", file: "index.html", tab: "home", nav: "", mode: "root", appTitle: "", scripts: ["home"],
    preload: D.IMAGES["home-hero"] || "",
    title: "نُضْج — ملحمة ومستشار طبخ: لحم مقطّع على مناسبتك بالجرام",
    desc: "قل لمستشار نُضْج وش المناسبة — مشاوي، كبسة، ذبيحة، ستيك — ويحسب لك الكمية بالجرام والتقطيع والتتبيلة والفحم. ضأن وماعز وحاشي وعجل وبقر وجاموس، والتقطيع مجاني.",
    jsonld: [{ "@context": "https://schema.org", "@type": "Store", name: "نُضْج", url: C.base, image: C.base + (D.IMAGES["og-share"] || ""), priceRange: "SAR", currenciesAccepted: "SAR", description: "ملحمة إلكترونية ومستشار طبخ تفاعلي." }],
    main: `
<section class="hero" aria-labelledby="heroT">
  <div class="hero__media">${U.slot("home-hero", "hero__img", "", { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <span class="eyebrow"><i class="live"></i>ملحمة · مستشار طبخ</span>
      <h1 class="hero__t" id="heroT">قل لنا وش المناسبة.<em>نقطّعها لك بالجرام.</em></h1>
      <p class="hero__s">المستشار يسألك عن العدد والطبخة، ويحسب لك كم جرام من كل قطعة، ووش التقطيع والتتبيلة، وكم كيس فحم — وتطلب الخطة كاملة بضغطة.</p>
      <div class="hero__cta"><a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="open">${U.mark("btn__mark")}ابدأ مع المستشار</a><a class="btn btn--line btn--lg" href="shop.html">تسوّق القطعيات</a></div>
      <dl class="hero__stats"><div><dt class="num">6</dt><dd>مواشي</dd></div><div><dt class="num">${cutsCount}</dt><dd>قطعية</dd></div><div><dt class="num">0</dt><dd>ر.س للتقطيع</dd></div></dl>
    </div>
    <div class="hero__adv" id="advisor" data-advisor-inline="adv--hero"><div class="adv adv--hero adv--ssr"><div class="adv__head">${U.mark()}<b>مستشار نُضْج</b></div><div class="adv__log"><p class="muted" style="padding:20px">جارٍ تشغيل المستشار…</p></div></div></div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${Array(2).fill(D.ANIMALS.map(a => `<span>${a.n}</span><i>${a.en}</i>`).join("")).join("")}</div></div>

<section class="section wrap" aria-labelledby="herdH">
  <div class="sec-head">${U.kicker("01", "القطيع")}<h2 id="herdH">ست مواشي. كل قطعة لها رقم.</h2><p>اختر الماشية وشوف قطعياتها على الرسم — كل نقطة قطعة تقدر تطلبها بالتقطيع اللي تبغاه.</p><a class="seeall" href="cuts.html">خريطة القطعيات ${icon("chevL")}</a></div>
  <div class="herd-rail">${D.ANIMALS.map((a, i) => U.herdCard(a, i)).join("")}</div>
</section>

<section class="section wrap" aria-labelledby="occH">
  <div class="sec-head">${U.kicker("02", "المستشار")}<h2 id="occH">مناسبتك أولاً، والقطعة بعدين.</h2><p>اختر المناسبة والمستشار يكمل معك الأسئلة: قطع ولا شرائح ولا قطع سليمة؟ متبّلة؟ مسيّخة؟ — ويطلع لك فاتورة بالجرام.</p></div>
  <div class="bento">${D.ADVISOR.occasions.map((o, i) => `<button type="button" class="bento__i bento__i--${i + 1}" data-advisor="${o.k}">
    ${o.img ? U.slot(o.img, "bento__img", "") : `<span class="bento__ic">${icon(o.ic, "", 1.4)}</span>`}
    <span class="bento__b"><b>${o.n}</b><small>${o.s}</small><span class="bento__go">ابدأ ${icon("chevL", "", 2.2)}</span></span></button>`).join("")}</div>
</section>

<section class="section how" aria-labelledby="howH">
  <div class="wrap how__in">
    <div class="how__steps">
      <div class="sec-head">${U.kicker("03", "كيف تشتغل")}<h2 id="howH">من «عندي عزومة» إلى فاتورة جاهزة.</h2></div>
      <ol class="steps">
        <li><b class="num">01</b><div><h3>قل المناسبة والعدد</h3><p>مشاوي لعشرة؟ كبسة حاشي لعشرين؟ اختر أو اكتبها بكلامك.</p></div></li>
        <li><b class="num">02</b><div><h3>جاوب أسئلة الجزّار</h3><p>قطع ولا شرائح؟ بالعظم؟ تتبيلة؟ تسييخ؟ كل خيار واضح بسعره.</p></div></li>
        <li><b class="num">03</b><div><h3>عدّل واطلب</h3><p>غيّر أي وزن بـ − و +، أضف طبق ثاني، واطلب الخطة كلها بضغطة.</p></div></li>
      </ol>
      <a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="grill">جرّبها على حفلة مشاوي</a>
    </div>
    <div class="how__rc">${sampleReceipt}</div>
  </div>
</section>

<section class="section wrap" aria-labelledby="useH">
  <div class="sec-head">${U.kicker("04", "ابدأ من الطبخة")}<h2 id="useH">وش بتطبخ؟</h2><a class="seeall" href="shop.html">كل القطعيات ${icon("chevL")}</a></div>
  <div class="seg-tabs" role="tablist" aria-label="حسب الطبخة">${uses.map((u, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-use-tab="${u}">${icon(D.USES[u].ic)}${D.USES[u].n}</button>`).join("")}</div>
  ${uses.map((u, i) => `<div class="rail" role="tabpanel" data-use-panel="${u}"${i ? " hidden" : ""}>${U.grid(byUse(u))}</div>`).join("")}
</section>

<section class="section svc" aria-labelledby="svcH">
  <div class="wrap svc__in">
    <div class="svc__media">${U.slot("marinade", "svc__img", "")}</div>
    <div class="svc__b">
      <div class="sec-head">${U.kicker("05", "خدمات بالطلب")}<h2 id="svcH">اللحم يوصلك خام. والباقي على كيفك.</h2><p>التقطيع مجاني بأي شكل. التتبيل والتسييخ والتغليف المفرّغ خدمات إضافية تنحسب بالكيلو — وتشوف سعرها قبل ما تضيف.</p></div>
      <ul class="price-list">
        ${D.MARINADES.filter(m => m.p).map(m => `<li><span><b>تتبيلة ${m.n}</b><small>${m.d}</small></span><em class="num">+${m.p} ر.س/كجم</em></li>`).join("")}
        <li><span><b>${D.SERVICES.skewer.n}</b><small>${D.SERVICES.skewer.d}</small></span><em class="num">+${D.SERVICES.skewer.p} ر.س/كجم</em></li>
        <li><span><b>${D.SERVICES.vacuum.n}</b><small>${D.SERVICES.vacuum.d}</small></span><em class="num">+${D.SERVICES.vacuum.p} ر.س/كجم</em></li>
        <li class="is-free"><span><b>التقطيع</b><small>قطع، مكعبات، شرائح، ستيك، مفروم، كباب…</small></span><em>مجاناً</em></li>
      </ul>
      <a class="seeall" href="shop.html?a=extra">عدّة الشواء والبهارات ${icon("chevL")}</a>
    </div>
  </div>
</section>

${cutBand()}

<section class="section wrap carcass-cta" aria-labelledby="carH">
  <div class="carcass-cta__media">${U.slot("occ-carcass", "carcass-cta__img", "")}</div>
  <div class="carcass-cta__b">
    <div class="sec-head">${U.kicker("06", "الذبائح")}<h2 id="carH">ذبيحة كاملة؟ خلّ المستشار يحسب الحجم.</h2><p>قل كم شخص، ونقترح لك نصف أو كاملة وبأي حجم، ونقطّعها ثلاجة أو كبسة أو مندي — مجاناً.</p></div>
    <div class="sizes">${D.carcasses().filter(p => /whole|half/.test(p.id)).map(p => `<a class="size" href="${U.url.product(p.id)}"><span>${esc(p.name)}</span><b class="num">${U.money(p.sizes[0].p)}–${U.money(p.sizes[p.sizes.length - 1].p)}</b><small>${p.sizes[0].kg}–${p.sizes[p.sizes.length - 1].kg} كجم</small></a>`).join("")}</div>
    <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="carcass">احسب لي الذبيحة</button><a class="btn btn--line" href="shop.html?a=carcass">كل الذبائح</a></div>
  </div>
</section>

<section class="section wrap" aria-labelledby="faqH">
  <div class="sec-head">${U.kicker("07", "أسئلة")}<h2 id="faqH">قبل ما تطلب</h2><a class="seeall" href="help.html">كل الأسئلة ${icon("chevL")}</a></div>
  <div class="faq">${D.FAQ.slice(0, 4).map(f => h.faq(f[0], f[1])).join("")}</div>
</section>`
  }];
};
