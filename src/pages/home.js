/* الرئيسية — كل النصوص من D.COPY.home، وترتيب الأقسام وإظهارها من D.HOME (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C, S } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY.home;
  const cutsCount = D.live().filter(p => p.sold === "kg").length;

  /* ---------- فاتورة مثال (تُحسب بنفس منطق السلة) ---------- */
  function sampleReceipt() {
    const sample = [
      { id: "lamb-shoulder", kg: 2, opts: { prep: "cubes", marinade: "hot", skewer: true }, why: "أوصال · 200 جم للشخص" },
      { id: "lamb-mince", kg: 1.5, opts: { prep: "kebab", marinade: "classic", skewer: true }, why: "كباب · 150 جم للشخص" },
      { id: "lamb-rack", kg: 1.5, opts: { prep: "chops" }, why: "ريش بالعظم · 150 جم للشخص" },
      { id: "charcoal", qty: 2, why: "كيس لكل 4.5 كجم" }
    ].filter(l => D.byId(l.id));
    const tot = sample.reduce((t, l) => t + S.breakdown(l).total, 0);
    return U.receipt({
      cls: "receipt--sample", kicker: "خطة المستشار", title: "حفلة مشاوي · 10 أشخاص",
      lines: sample.map(l => { const x = U.lineForReceipt(l); x.sub = [esc(l.why), x.sub].filter(Boolean).join(" · "); return x; }),
      totals: [["مجموع الخطة", U.money2(tot), "is-total"], ["للشخص تقريباً", U.money2(tot / 10)]], stamp: "مثال"
    });
  }

  /* ---------- «التقطيع مجاني»: سكين تقطّع الصورة إلى شرائح (شكل تقطيع لكل شريحة) ----------
     الشرائح نسخ من نفس الصورة مقصوصة بمضلعات مائلة، والسكين تمر على خطوط القطع من اليمين */
  function cutBand(n) {
    const B = T.cutband;
    const forms = (B.forms || []).filter(k => D.PREPS[k]);
    const N = Math.max(2, forms.length), W = 100 / N, SL = 2.6, TT = 100 / (N - 1), bg = D.IMAGES.texture || "";
    const f = x => +x.toFixed(3);
    const strips = forms.map((k, i) => {
      const p = N - 1 - i, l = p ? f(p * W) : -12, r = p === N - 1 ? 112 : f((p + 1) * W);
      return `<div class="cutband__s" style="--i:${i};--l:${l}%;--r:${r}%;--dir:${i % 2 ? 1 : -1};--mid:${f((p + .5) * W - SL)}%;background-image:url('${esc(bg)}')">
      <span class="cutband__lbl"><b>${esc(D.PREPS[k].n)}</b><small>${esc(D.PREPS[k].d)}</small></span></div>`;
    }).join("");
    const lines = forms.slice(1).map((k, j) => { const x = 100 - (j + 1) * W; return `<line x1="${f(x + SL)}" y1="0" x2="${f(x - SL)}" y2="100" style="--k:${j}"/>`; }).join("");
    let kf = "";
    forms.slice(1).forEach((k, j) => {
      const x = 100 - (j + 1) * W, st = j * TT;
      kf += `${f(st)}%{left:${f(x + SL + .4)}%;top:-6%;animation-timing-function:cubic-bezier(.55,0,.8,.4)}`;
      kf += `${f(st + TT * .6)}%{left:${f(x - SL - .2)}%;top:104%;animation-timing-function:linear}`;
      kf += `${f(st + TT * .8)}%{left:${f(x - SL - .6)}%;top:175%;animation-timing-function:steps(1,end)}`;
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
    ${U.kicker(String(forms.length).padStart(2, "0"), esc(B.kicker))}
    <h2 id="cutH">${esc(B.title)}<em>${esc(B.em)}</em></h2>
    <p>${tpl(B.sub)}</p>
  </div>
  <button type="button" class="cutband__again" data-cut-again>${icon("knife")}${esc(B.again)}</button>
  <ul class="cutband__forms">${forms.map(k => `<li><b>${esc(D.PREPS[k].n)}</b><small>${esc(D.PREPS[k].d)}</small></li>`).join("")}</ul>
</section>`;
  }

  /* ---------- الأقسام ---------- */
  const uses = ["grill", "kabsa", "steak", "slow", "mince"];
  const byUse = u => D.live().filter(p => p.sold === "kg" && p.uses[0] === u).slice(0, 8);
  const num = i => String(i).padStart(2, "0");
  const SECTIONS = {
    hero: () => `<section class="hero" aria-labelledby="heroT">
  <div class="hero__media">${U.slot("home-hero", "hero__img", "", { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <span class="eyebrow"><i class="live"></i>${esc(T.hero.eyebrow)}</span>
      <h1 class="hero__t" id="heroT">${esc(T.hero.title)}<em>${esc(T.hero.em)}</em></h1>
      <p class="hero__s">${tpl(T.hero.sub)}</p>
      <div class="hero__cta"><a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="open">${U.mark("btn__mark")}${esc(T.hero.cta1)}</a><a class="btn btn--line btn--lg" href="shop.html">${esc(T.hero.cta2)}</a></div>
      <dl class="hero__stats"><div><dt class="num">${D.ANIMALS.length}</dt><dd>${esc(T.hero.s1)}</dd></div><div><dt class="num">${cutsCount}</dt><dd>${esc(T.hero.s2)}</dd></div><div><dt class="num">0</dt><dd>${esc(T.hero.s3)}</dd></div></dl>
    </div>
    <div class="hero__adv" id="advisor" data-advisor-inline="adv--hero"><div class="adv adv--hero adv--ssr"><div class="adv__head">${U.mark()}<b>مستشار نُضْج</b></div><div class="adv__log"><p class="muted" style="padding:20px">جارٍ تشغيل المستشار…</p></div></div></div>
  </div>
</section>`,
    marquee: () => `<div class="marquee" aria-hidden="true"><div class="marquee__track">${Array(2).fill(D.ANIMALS.map(a => `<span>${esc(a.n)}</span><i>${esc(a.en)}</i>`).join("")).join("")}</div></div>`,
    herd: n => `<section class="section wrap" aria-labelledby="herdH">
  <div class="sec-head">${U.kicker(num(n), esc(T.herd.kicker))}<h2 id="herdH">${esc(T.herd.title)}</h2><p>${tpl(T.herd.sub)}</p><a class="seeall" href="cuts.html">${esc(T.herd.link)} ${icon("chevL")}</a></div>
  <div class="herd-rail">${D.ANIMALS.map((a, i) => U.herdCard(a, i)).join("")}</div>
</section>`,
    occasions: n => `<section class="section wrap" aria-labelledby="occH">
  <div class="sec-head">${U.kicker(num(n), esc(T.occasions.kicker))}<h2 id="occH">${esc(T.occasions.title)}</h2><p>${tpl(T.occasions.sub)}</p></div>
  <div class="bento">${D.ADVISOR.occasions.filter(o => o.on !== false).map((o, i) => `<button type="button" class="bento__i bento__i--${i + 1}${o.img ? "" : " bento__i--plain"}" data-advisor="${o.k}">
    ${o.img ? U.slot(o.img, "bento__img", "") : `<span class="bento__ic">${icon(o.ic, "", 1.4)}</span>`}
    <span class="bento__b"><b>${esc(o.n)}</b><small>${esc(o.s)}</small><span class="bento__go">${esc(T.occasions.go)} ${icon("chevL", "", 2.2)}</span></span></button>`).join("")}</div>
</section>`,
    how: n => `<section class="section how" aria-labelledby="howH">
  <div class="wrap how__in">
    <div class="how__steps">
      <div class="sec-head">${U.kicker(num(n), esc(T.how.kicker))}<h2 id="howH">${esc(T.how.title)}</h2></div>
      <ol class="steps">${T.how.steps.map((s, i) => `<li><b class="num">${num(i + 1)}</b><div><h3>${esc(s.t)}</h3><p>${tpl(s.d)}</p></div></li>`).join("")}</ol>
      <a class="btn btn--ember btn--lg" href="advisor.html" data-advisor="grill">${esc(T.how.cta)}</a>
    </div>
    <div class="how__rc">${sampleReceipt()}</div>
  </div>
</section>`,
    uses: n => `<section class="section wrap" aria-labelledby="useH">
  <div class="sec-head">${U.kicker(num(n), esc(T.uses.kicker))}<h2 id="useH">${esc(T.uses.title)}</h2><a class="seeall" href="shop.html">${esc(T.uses.link)} ${icon("chevL")}</a></div>
  <div class="seg-tabs" role="tablist" aria-label="حسب الطبخة">${uses.map((u, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-use-tab="${u}">${icon(D.USES[u].ic)}${esc(D.USES[u].n)}</button>`).join("")}</div>
  ${uses.map((u, i) => `<div class="rail" role="tabpanel" data-use-panel="${u}"${i ? " hidden" : ""}>${U.grid(byUse(u))}</div>`).join("")}
</section>`,
    services: n => `<section class="section svc" aria-labelledby="svcH">
  <div class="wrap svc__in">
    <div class="svc__media">${U.slot("marinade", "svc__img", "")}</div>
    <div class="svc__b">
      <div class="sec-head">${U.kicker(num(n), esc(T.services.kicker))}<h2 id="svcH">${esc(T.services.title)}</h2><p>${tpl(T.services.sub)}</p></div>
      <ul class="price-list">
        ${D.MARINADES.filter(m => m.p).map(m => `<li><span><b>تتبيلة ${esc(m.n)}</b><small>${esc(m.d)}</small></span><em class="num">+${m.p} ر.س/كجم</em></li>`).join("")}
        <li><span><b>${esc(D.SERVICES.skewer.n)}</b><small>${esc(D.SERVICES.skewer.d)}</small></span><em class="num">+${D.SERVICES.skewer.p} ر.س/كجم</em></li>
        <li><span><b>${esc(D.SERVICES.vacuum.n)}</b><small>${esc(D.SERVICES.vacuum.d)}</small></span><em class="num">+${D.SERVICES.vacuum.p} ر.س/كجم</em></li>
        <li class="is-free"><span><b>${esc(T.services.freeT)}</b><small>${esc(T.services.freeD)}</small></span><em>مجاناً</em></li>
      </ul>
      <a class="seeall" href="shop.html?a=extra">${esc(T.services.link)} ${icon("chevL")}</a>
    </div>
  </div>
</section>`,
    cutband: cutBand,
    carcass: n => `<section class="section wrap carcass-cta" aria-labelledby="carH">
  <div class="carcass-cta__media">${U.slot("occ-carcass", "carcass-cta__img", "")}</div>
  <div class="carcass-cta__b">
    <div class="sec-head">${U.kicker(num(n), esc(T.carcass.kicker))}<h2 id="carH">${esc(T.carcass.title)}</h2><p>${tpl(T.carcass.sub)}</p></div>
    <div class="sizes">${D.carcasses().filter(p => /whole|half/.test(p.id)).map(p => `<a class="size" href="${U.url.product(p.id)}"><span>${esc(p.name)}</span><b class="num">${U.money(p.sizes[0].p)}–${U.money(p.sizes[p.sizes.length - 1].p)}</b><small>${p.sizes[0].kg}–${p.sizes[p.sizes.length - 1].kg} كجم</small></a>`).join("")}</div>
    <div class="row-btns"><button type="button" class="btn btn--ember" data-advisor="carcass">${esc(T.carcass.btn1)}</button><a class="btn btn--line" href="shop.html?a=carcass">${esc(T.carcass.btn2)}</a></div>
  </div>
</section>`,
    faq: n => `<section class="section wrap" aria-labelledby="faqH">
  <div class="sec-head">${U.kicker(num(n), esc(T.faq.kicker))}<h2 id="faqH">${esc(T.faq.title)}</h2><a class="seeall" href="help.html">${esc(T.faq.link)} ${icon("chevL")}</a></div>
  <div class="faq">${D.FAQ.slice(0, T.faq.count || 4).map(f => h.faq(esc(f[0]), tpl(f[1]))).join("")}</div>
</section>`
  };
  /* ترقيم الأقسام (01، 02…) حسب الظاهر منها فقط */
  const numbered = ["herd", "occasions", "how", "uses", "services", "carcass", "faq"];
  let counter = 0;
  const main = D.HOME.filter(s => s.on !== false && SECTIONS[s.k]).map(s => SECTIONS[s.k](numbered.indexOf(s.k) > -1 ? ++counter : 0)).join("\n");

  return [{
    name: "home", file: "index.html", tab: "home", nav: "", mode: "root", appTitle: "", scripts: ["home"],
    preload: D.IMAGES["home-hero"] || "",
    title: T.seoTitle, desc: T.seoDesc,
    jsonld: [{ "@context": "https://schema.org", "@type": "Store", name: "نُضْج", url: C.base, image: C.base + (D.IMAGES["og-share"] || ""), priceRange: "SAR", currenciesAccepted: "SAR", description: T.seoDesc }],
    main
  }];
};
