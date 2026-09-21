/* الخبرة: المركز + صفحات الأدلة + الأطباق + مختبر الطبخ + الاشتراك + الاستشارة */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon, esc, money } = U;
  const PL = C.plans;
  const nGuides = D.GUIDES.length;
  const out = [];

  /* خطوط رمادية مكان المحتوى المقفل (بدون نص وهمي) */
  const ghost = n => `<div class="ghost-lines">${Array.from({ length: n }, (_, i) => `<i style="width:${[92, 86, 97, 74, 88, 64][i % 6]}%"></i>`).join("")}</div>`;
  const locked = (title, sub, gid, cta) => `<div class="locked-block">
  <div class="locked-block__ghost">${ghost(6)}</div>
  <div class="locked-block__over">${icon("lock")}<b>${title}</b><span class="muted">${sub}</span>${cta || ""}</div>
</div>`;

  /* ================= مركز الخبرة ================= */
  const cutGuides = D.GUIDES.filter(g => g.kind !== "dish");
  const dishGuides = D.GUIDES.filter(g => g.kind === "dish");
  const Y = `<span class="y">✓</span>`, N = `<span class="n">—</span>`;
  const compareRows = [
    ["تسوّق كل المنتجات بخيارات الوزن والتقطيع", Y, Y, Y],
    ["مخطط الذبيحة والمعلومات الأساسية لكل قطعة", Y, Y, Y],
    ["«وش تطبخ»: القطعيات المناسبة والكميات", Y, Y, Y],
    ["فيديو التقطيع وشرح القطعة", N, "للقطعة", "لكل القطعيات"],
    ["خطوات الطبخ والحرارات ودرجة النضج", N, "للقطعة", "لكل القطعيات"],
    ["خطوات الطبخات بالتفصيل (كبسة، مندي…)", N, "للطبخة", "لكل الطبخات"],
    ["مختبر الطبخ", N, N, Y],
    ["استشارة جزّار (20 دقيقة)", `${C.consult.price} ${C.currency}`, `${C.consult.price} ${C.currency}`, `${C.consult.memberPrice} ${C.currency}`]
  ];
  out.push({
    name: "expertise", file: "expertise.html", tab: "expertise", nav: "xp", mode: "root", appTitle: "الخبرة", scripts: ["expertise"],
    title: "الخبرة — أدلة مصوّرة للتقطيع والطبخ واستشارة جزّار · نُضْج",
    desc: `خدمة إضافية من نُضْج: أدلة مصوّرة تشرح كيف تُقطّع كل قطعة وكيف تُطبخ، أدلة الطبخات، مختبر الطبخ، واستشارة مباشرة مع جزّار. دليل واحد بـ ${C.guidePrice} ${C.currency} أو كلها مع نُضْج+.`,
    main: `<div class="wrap">
  ${h.crumbs([["الخبرة"]])}
  <div class="xp-hero">
    <div>
      <h1 class="large-title">الخبرة</h1>
      <p class="lead-p">لحمك تشتريه عادي من المتجر. وإذا تبغى تتقن طبخه، هنا تلقى فيديو التقطيع وخطوات الطبخ والحرارات — أو تكلّم جزّاراً مباشرة.</p>
    </div>
    ${U.slot("expertise-hero", "xp-hero__img", "خبرة نُضْج")}
  </div>

  <div id="memberBox">
    <div class="member-card">
      <div class="member-card__top"><span class="member-card__logo">نُضْج<span class="plus">+</span></span><span class="pill pill--brand">اشتراك</span></div>
      <p>كل الأدلة المصوّرة لكل القطعيات والذبائح والطبخات، ومختبر الطبخ كاملاً، وخصم على استشارة الجزّار.</p>
      <ul class="xp-list">
        <li>${icon("video")}<span>${nGuides} دليلاً مصوّراً: التقطيع والطبخ خطوة بخطوة</span></li>
        <li>${icon("thermo")}<span>مختبر الطبخ: الحرارات ودرجات النضج والأخطاء الشائعة</span></li>
        <li>${icon("chat")}<span>استشارة الجزّار بـ ${C.consult.memberPrice} ${C.currency} بدل ${C.consult.price}</span></li>
      </ul>
      <div class="member-card__price"><strong>${PL.monthly.price}</strong><span>${C.currency} شهرياً — أو ${PL.annual.price} ${C.currency} سنوياً (وفّر ${PL.annual.save}٪)</span></div>
      <div class="btn-row"><a class="btn btn--light btn--lg" href="subscribe.html">اشترك في نُضْج+</a><a class="link link--light" href="#compare">قارن الخيارات</a></div>
    </div>
  </div>

  <div class="seg xp-tabs" id="xpTabs" role="tablist" aria-label="الأدلة">
    <button type="button" role="tab" class="on" aria-selected="true" data-pane="cuts">أدلة القطعيات</button>
    <button type="button" role="tab" aria-selected="false" data-pane="dishes" id="dishes">أدلة الطبخات</button>
    <button type="button" role="tab" aria-selected="false" data-pane="lab">مختبر الطبخ</button>
  </div>
  <div class="gcards" data-pane-body="cuts">${cutGuides.map(U.guideCard).join("")}</div>
  <div class="gcards" data-pane-body="dishes" hidden>${dishGuides.map(U.guideCard).join("")}</div>
  <div data-pane-body="lab" hidden>
    <a class="gcard" href="cook.html"><span class="gcard__ic">${icon("thermo")}</span><span class="gcard__b"><b>مختبر الطبخ</b><small>طرق الطبخ الست، مرجع الحرارات ودرجات النضج، كميات اللحم للشخص، والأخطاء التي تفسد قطعة ممتازة.</small></span><span class="gstate" data-gstate="lab">${U.lockPill().replace(`${C.guidePrice} ${C.currency}`, "نُضْج+")}</span></a>
  </div>

  <section class="section">
    <div class="consult-card">
      ${U.slot("consult", "consult-card__img", "استشارة جزّار")}
      <div class="consult-card__b">
        <span class="eyebrow">استشارة مباشرة</span>
        <h2>كلّم جزّاراً قبل ما تطلب</h2>
        <p class="muted">${C.consult.minutes} دقيقة فيديو أو واتساب: نخطط معك العزيمة، نختار القطع والكميات، ونقول لك كيف تطلب التقطيع.</p>
        <div class="consult-card__price"><strong>${C.consult.price}</strong> ${C.currency} <span>· ${C.consult.memberPrice} ${C.currency} لأعضاء نُضْج+</span></div>
        <a class="btn btn--brand" href="consult.html" style="width:fit-content">احجز استشارة</a>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="howH">
    ${h.secHead("كيف تعمل الخبرة؟", "", "", "", "howH")}
    <ol class="steps3">
      <li><b>اشترِ اللحم عادي</b><small>المتجر كامل ومجاني، وكل ما تحتاجه لاختيار القطعة ظاهر في صفحتها.</small></li>
      <li><b>أضف الخبرة إذا احتجتها</b><small>دليل واحد بـ ${C.guidePrice} ${C.currency} مع طلبك، أو كل الأدلة مع نُضْج+.</small></li>
      <li><b>افتحها من حسابك متى ما بغيت</b><small>الأدلة تبقى في «أدلتي»، والاشتراك تديره أو تلغيه من حسابك.</small></li>
    </ol>
  </section>

  <section class="section" id="compare" aria-labelledby="cmpH">
    ${h.secHead("قارن الخيارات", "", "", "", "cmpH")}
    <div class="compare-wrap"><table class="compare">
      <thead><tr><th scope="col"></th><th scope="col">مجاناً</th><th scope="col">دليل واحد · ${C.guidePrice} ${C.currency}</th><th scope="col" class="hi">نُضْج+ · ${PL.monthly.price} ${C.currency}/شهر</th></tr></thead>
      <tbody>${compareRows.map(r => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td class="hi">${r[3]}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>

  <section class="section" aria-labelledby="xfaqH">
    ${h.secHead("أسئلة عن الخبرة", "", "help.html#expertise", "كل الأسئلة", "xfaqH")}
    <div class="faq">
      ${h.faq("هل لازم أشترك عشان أشتري لحم؟", "لا. المتجر كامل للجميع بدون أي اشتراك. الخبرة خدمة إضافية اختيارية لمن يبغى يتعلم التقطيع والطبخ.")}
      ${h.faq("وش الفرق بين الدليل الواحد ونُضْج+؟", `الدليل الواحد (${C.guidePrice} ${C.currency}) يفتح دليل قطعة أو طبخة واحدة ويبقى لك دائماً. نُضْج+ يفتح كل الأدلة (${nGuides} دليلاً) ومختبر الطبخ، مع خصم على الاستشارة، طوال مدة الاشتراك.`)}
      ${h.faq("وين ألقى الأدلة بعد الشراء؟", "في «حسابي ← أدلتي»، وتفتح أيضاً مباشرة من صفحة القطعة أو الطبخة.")}
      ${h.faq("أقدر ألغي الاشتراك؟", "نعم، من «حسابي ← اشتراك نُضْج+» في أي وقت. يبقى الاشتراك فعّالاً حتى نهاية المدة المدفوعة ولا يتجدد بعدها.")}
    </div>
  </section>
</div>`
  });

  /* ================= صفحات أدلة القطعيات ================= */
  D.PRODUCTS.filter(p => p.type === "cut").forEach(p => {
    const pr = D.PRIMALS[p.animal][p.zone];
    out.push(guidePage({
      id: p.id, file: "guide-" + p.id + ".html", title: "دليل " + p.name, code: p.code, product: p,
      lead: `${p.short}. فيديو يشرح كيف تُقطّع ${p.name} ومن وين تجي، وخطوات طبخها بكل طريقة مع الحرارة والوقت.`,
      tags: [["video", "فيديو التقطيع"], ["thermo", "الحرارات"], ["clock", "الأوقات"]],
      chapters: D.CHAPTERS.cut,
      free: `<section class="gsec"><h2>عن القطعة <span class="pill pill--ghost">مجاني</span></h2><p>${esc(p.why)}</p><p class="muted" style="margin-top:8px">${esc(p.origin)} — منطقة ${pr.name}.</p></section>`,
      desc: `دليل ${p.name} المصوّر: كيف تُقطّع، التحضير، خطوات الطبخ لكل طريقة، الحرارة ودرجة النضج، ونصيحة الجزّار.`
    }));
  });
  /* دليل الذبيحة */
  out.push(guidePage({
    id: "carcass", file: "guide-carcass.html", title: D.CARCASS_GUIDE.title, code: "ذ", product: D.byId("lamb-whole"),
    lead: "فيديو يشرح كيف تُقسم الذبيحة إلى أنصاف وأرباع ومناطق، وأي أسلوب تقطيع يناسب كل طبخة، وكم تكفي الذبيحة حسب حجمها.",
    tags: [["video", "فيديو التقسيم"], ["knife", "أساليب التقطيع"], ["people", "كم تكفي"]],
    chapters: D.CHAPTERS.carcass,
    free: `<section class="gsec"><h2>أساليب التقطيع باختصار <span class="pill pill--ghost">مجاني</span></h2><div class="tags">${D.CARCASS_GUIDE.styles.map(s => `<span class="tag">${s.n}</span>`).join("")}</div><p class="muted" style="margin-top:10px">الشرح الكامل لكل أسلوب، والفيديو، وجدول «كم تكفي» ضمن الدليل.</p></section>`,
    desc: "دليل تقطيع الذبيحة المصوّر: كيف تُقسم، أساليب التقطيع (ثلاجة، كبسة، مندي، أرباع، مفصّل)، كم تكفي حسب الحجم، وكيف تكتب طلب التقطيع."
  }));

  function guidePage(g) {
    const buyHref = "checkout.html?buy=" + encodeURIComponent("guide:" + g.id);
    return {
      name: "guide", file: g.file, tab: "expertise", nav: "xp", mode: "push", back: ["expertise.html", "الخبرة"], appTitle: g.title, trail: ["share"],
      scripts: ["guide"], data: { guide: g.id },
      actionbar: `<div class="action-bar__p"><small>الدليل كاملاً</small><b>${C.guidePrice} ${C.currency}</b></div><a class="btn btn--brand" href="${buyHref}" id="abBuy">${icon("unlock")}افتح الدليل</a>`,
      title: `${g.title} — فيديو التقطيع وطريقة الطبخ · نُضْج`, desc: g.desc,
      main: `<div class="wrap">
  ${h.crumbs([["الخبرة", "expertise.html"], [g.title]])}
  <div class="guide-hero">
    <div class="video" id="gVideo">
      <div class="video__lock" id="gLock">${icon("lock")}<span>الفيديو ضمن الدليل الكامل</span></div>
    </div>
    <div>
      <div class="pinfo__meta"><span class="pill pill--brand">${icon("video")}دليل مصوّر</span><span class="gstate" data-gstate="${g.id}">${U.lockPill()}</span></div>
      <h1>${esc(g.title)}</h1>
      <p>${esc(g.lead)}</p>
      <div class="tags" style="margin-top:14px">${g.tags.map(t => `<span class="tag">${icon(t[0])}${t[1]}</span>`).join("")}</div>
      ${g.product ? `<p style="margin-top:14px"><a class="link" href="${U.url.product(g.product.id)}">اطلب ${esc(g.product.name)} من المتجر ${icon("chevL")}</a></p>` : ""}
    </div>
  </div>
  <section class="gsec"><h2>ماذا في الدليل</h2><ol class="chapters" data-chapters="${g.id}">${g.chapters.map(c => `<li>${esc(c)}${icon("lock")}</li>`).join("")}</ol></section>
  ${g.free}
  <div id="gBody">
    <section class="gsec" id="paywall" aria-labelledby="pwH">
      <div class="paywall">
        <h2 id="pwH">افتح الدليل الكامل</h2>
        <div class="pw-opt"><div class="pw-opt__b"><b>هذا الدليل فقط</b><small>دفعة واحدة، ويبقى في حسابك دائماً</small></div><a class="btn btn--brand" href="${buyHref}">${C.guidePrice} ${C.currency}</a></div>
        <div class="pw-opt pw-opt--hi"><div class="pw-opt__b"><b>نُضْج+ — كل الأدلة</b><small>${nGuides} دليلاً ومختبر الطبخ · من ${money(PL.annual.price / 12)} ${C.currency} شهرياً</small></div><a class="btn btn--ink" href="subscribe.html">اشترك</a></div>
        <button class="btn btn--ghost btn--block" type="button" data-add-guide="${g.id}">أو أضفه لسلتك مع طلب اللحم</button>
      </div>
    </section>
    ${locked("الشرح الكامل خطوة بخطوة", "يظهر بعد فتح الدليل", g.id)}
  </div>
</div>`
    };
  }

  /* ================= صفحات الأطباق ================= */
  D.DISHES.forEach(d => {
    const gid = "dish-" + d.slug;
    const cuts = d.cuts.map(D.byId).filter(Boolean);
    const buyHref = "checkout.html?buy=" + encodeURIComponent("guide:" + gid);
    out.push({
      name: "dish", file: U.url.dish(d.slug), tab: "expertise", nav: "xp", mode: "push", back: ["expertise.html", "الخبرة"], appTitle: d.name, trail: ["share"],
      scripts: ["dish"], data: { dish: d.slug },
      title: `${d.name}: أي قطعة لحم تحتاج وكم للشخص؟ · نُضْج`,
      desc: `${d.name}: ${d.needs}. القطعيات المناسبة ولماذا، وكم لحم تحتاج للشخص (${d.perPerson}) — مع دليل الخطوات المصوّر من نُضْج.`,
      main: `<div class="wrap">
  ${h.crumbs([["الخبرة", "expertise.html"], ["وش تطبخ", "expertise.html#dishes"], [d.name]])}
  <header class="dish-head">
    <span class="dish-head__ic">${U.dishIcon(d.slug)}</span>
    <div><span class="pinfo__en">${d.en.toUpperCase()}</span><h1>${d.name}</h1></div>
  </header>
  <p class="dish-intro">${esc(d.intro)}</p>

  <section class="gsec" aria-labelledby="needH"><h2 id="needH">وش تحتاج من القطعة؟</h2><p>${esc(d.needs)}.</p>
    <div class="tipbox" style="margin-top:14px"><span class="k">ليش هذي القطع بالذات</span><p>${esc(d.why)}</p></div></section>

  <section class="gsec" aria-labelledby="cutsH"><h2 id="cutsH">القطعيات المناسبة</h2><div class="rows">${cuts.map(p => U.productRow(p)).join("")}</div></section>

  <section class="gsec" id="calc" aria-labelledby="calcH">
    <h2 id="calcH">كم تحتاج؟</h2>
    <p>${esc(d.perPerson)}. حدد عدد الأشخاص ونحسب لك.</p>
    <div class="calc card">
      <div class="calc__row"><span class="calc__l">${icon("people")}عدد الأشخاص</span>
        <div class="stepper stepper--sm" id="calcStep"><button type="button" data-step="-1" aria-label="إنقاص">${icon("minus", "", 2.2)}</button><output class="num" id="calcN">6</output><button type="button" data-step="1" aria-label="زيادة">${icon("plus", "", 2.2)}</button></div></div>
      <p class="calc__need">تحتاج تقريباً <b class="num" id="calcKg">—</b> من اللحم</p>
      <div class="calc__list" id="calcList"></div>
    </div>
  </section>

  <section class="gsec" aria-labelledby="avoidH"><h2 id="avoidH">تجنّب</h2><p>${esc(d.avoid)}</p></section>

  <section class="gsec" id="steps" aria-labelledby="stepsH">
    <h2 id="stepsH">الخطوات بالتفصيل <span class="gstate" data-gstate="${gid}">${U.lockPill()}</span></h2>
    <div id="dishSteps">
      <div class="paywall">
        <div class="pw-opt"><div class="pw-opt__b"><b>دليل ${d.name} المصوّر</b><small>${d.steps.length} خطوات بالتفصيل مع الفيديو · يبقى لك دائماً</small></div><a class="btn btn--brand" href="${buyHref}">${C.guidePrice} ${C.currency}</a></div>
        <div class="pw-opt pw-opt--hi"><div class="pw-opt__b"><b>نُضْج+ — كل الأدلة</b><small>كل الطبخات والقطعيات ومختبر الطبخ</small></div><a class="btn btn--ink" href="subscribe.html">اشترك</a></div>
      </div>
      ${locked("الخطوات مقفلة", "افتح الدليل لتشوفها مع الفيديو")}
    </div>
  </section>

  <section class="section" aria-labelledby="moreH">
    ${h.secHead("وش تطبخ غير كذا؟", "", "", "", "moreH")}
    <div class="dish-grid">${D.DISHES.filter(x => x.slug !== d.slug).map(U.dishTile).join("")}</div>
  </section>
</div>`
    });
  });

  /* ================= مختبر الطبخ ================= */
  const MI = { grill: "flame", pan: "pan", oven: "oven", slow: "clock", braise: "pot", reverse: "swap" };
  out.push({
    name: "cook", file: "cook.html", tab: "expertise", nav: "xp", mode: "push", back: ["expertise.html", "الخبرة"], appTitle: "مختبر الطبخ", scripts: ["cook"],
    title: "مختبر الطبخ — طرق الطبخ والحرارات ودرجات النضج · نُضْج",
    desc: "مختبر الطبخ من نُضْج: الطرق الست وأي قطعة تناسب كل طريقة، كم لحم تحتاج للشخص، ومرجع الحرارات ودرجات النضج والأخطاء الشائعة (ضمن نُضْج+).",
    main: `<div class="wrap">
  ${h.crumbs([["الخبرة", "expertise.html"], ["مختبر الطبخ"]])}
  <div class="page-head"><h1 class="large-title">مختبر الطبخ</h1><p>اللحم ما يستجيب للنية، يستجيب للحرارة والوقت. هذي القواعد اللي تحكم كل قطعة على النار.</p></div>
  <section class="gsec" aria-labelledby="mH"><h2 id="mH">ست طرق، ست نتائج <span class="pill pill--ghost">مجاني</span></h2>
    <div class="mcards">${Object.keys(D.METHODS).map(k => `<div class="mcard"><div class="mcard__h">${icon(MI[k])}<b>${D.METHODS[k].name}</b></div><p>${D.METHODS[k].long}</p></div>`).join("")}</div></section>
  <section class="gsec" aria-labelledby="qH"><h2 id="qH">كم لحم للشخص؟ <span class="pill pill--ghost">مجاني</span></h2>
    <div class="compare-wrap"><table class="compare"><thead><tr><th scope="col">الحالة</th><th scope="col">للشخص الواحد</th><th scope="col">ملاحظة</th></tr></thead>
    <tbody>${D.LAB.qty.map(r => `<tr><th scope="row">${r[0]}</th><td class="num">${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div></section>
  <div id="labLocked">
    <section class="gsec"><h2>مرجع الحرارات والأخطاء الشائعة <span class="gstate" data-gstate="lab"></span></h2>
      <div class="paywall"><div class="pw-opt pw-opt--hi"><div class="pw-opt__b"><b>ضمن نُضْج+</b><small>مقياس درجات النضج التفاعلي، والأخطاء الست التي تفسد قطعة ممتازة، وكل الأدلة المصوّرة</small></div><a class="btn btn--ink" href="subscribe.html">اشترك</a></div></div>
      ${locked("لأعضاء نُضْج+", "مرجع الحرارات والأخطاء الشائعة")}
    </section>
  </div>
  <div id="labFull" hidden>
    <section class="gsec" id="doneness" aria-labelledby="dH"><h2 id="dH">مرجع الحرارات</h2><p class="muted" style="margin-bottom:12px">حرارة مركز القطعة بالمئوية. اضغط أي درجة لترى أين تقع على المقياس.</p>
      ${U.ruler("labRuler")}
      <div class="temp-rail">${D.DONENESS.map(x => `<div><b>${x.t}°</b><span>${x.n}</span></div>`).join("")}</div></section>
    <section class="gsec" aria-labelledby="xH"><h2 id="xH">ستة أخطاء تفسد قطعة ممتازة</h2>
      <div class="mcards">${D.LAB.mistakes.map((m, i) => `<div class="mcard"><div class="mcard__h"><span class="cut-code"><b>${String(i + 1).padStart(2, "0")}</b></span><b>${m[0]}</b></div><p>${m[1]}</p></div>`).join("")}</div></section>
  </div>
</div>`
  });

  /* ================= الاشتراك ================= */
  out.push({
    name: "subscribe", file: "subscribe.html", tab: "expertise", nav: "xp", mode: "push", back: ["expertise.html", "الخبرة"], appTitle: "نُضْج+", tabbar: false,
    actionbar: `<div class="action-bar__p"><small id="abPlan">سنوي</small><b id="abPrice">${PL.annual.price} ${C.currency}</b></div><button class="btn btn--brand" type="button" id="abSub">اشترك الآن</button>`,
    scripts: ["subscribe"],
    title: "اشترك في نُضْج+ — كل الأدلة المصوّرة ومختبر الطبخ",
    desc: `نُضْج+: ${nGuides} دليلاً مصوّراً للتقطيع والطبخ، مختبر الطبخ، وخصم على استشارة الجزّار. ${PL.monthly.price} ${C.currency} شهرياً أو ${PL.annual.price} ${C.currency} سنوياً.`,
    main: `<div class="wrap">
  ${h.crumbs([["الخبرة", "expertise.html"], ["نُضْج+"]])}
  <div id="subActive" hidden></div>
  <div id="subDone" hidden></div>
  <div id="subForm">
    <div class="page-head"><h1 class="large-title">نُضْج<span style="color:var(--oxblood)">+</span></h1><p>كل الخبرة في اشتراك واحد. إلغاء في أي وقت.</p></div>
    <div class="sub-layout">
      <div>
        <div class="plans" role="radiogroup" aria-label="الخطة">
          <label class="plan"><input type="radio" name="plan" value="annual" checked><span class="plan__badge">وفّر ${PL.annual.save}٪</span><span class="plan__n">سنوي</span><span class="plan__p num">${PL.annual.price} <small>${C.currency} / سنة</small></span><span class="plan__s">${PL.annual.note}</span></label>
          <label class="plan"><input type="radio" name="plan" value="monthly"><span class="plan__n">شهري</span><span class="plan__p num">${PL.monthly.price} <small>${C.currency} / شهر</small></span><span class="plan__s">${PL.monthly.note}</span></label>
        </div>
        <h2 class="group__head">يشمل</h2>
        <ul class="benefits card">
          <li>${icon("check", "", 2.4)}<span>${nGuides} دليلاً مصوّراً: كل القطعيات والذبائح والطبخات</span></li>
          <li>${icon("check", "", 2.4)}<span>فيديو التقطيع وخطوات الطبخ والحرارات لكل قطعة</span></li>
          <li>${icon("check", "", 2.4)}<span>مختبر الطبخ كاملاً: مرجع النضج والأخطاء الشائعة</span></li>
          <li>${icon("check", "", 2.4)}<span>استشارة الجزّار بـ ${C.consult.memberPrice} ${C.currency} بدل ${C.consult.price} ${C.currency}</span></li>
          <li>${icon("check", "", 2.4)}<span>إلغاء في أي وقت من حسابك</span></li>
        </ul>
        <h2 class="group__head">طريقة الدفع</h2>
        <div id="payBox"></div>
      </div>
      <aside class="summary" aria-label="ملخص الاشتراك">
        <h2>الملخص</h2>
        <div class="sum-line"><span>الخطة</span><span id="sPlan">سنوي</span></div>
        <div class="sum-line"><span>يبدأ</span><span id="sStart">اليوم</span></div>
        <div class="sum-line"><span>يتجدد في</span><span id="sRenew">—</span></div>
        <div class="sum-total"><b>الإجمالي اليوم</b><strong id="sTotal">${PL.annual.price} ${C.currency}</strong></div>
        <p class="sum-vat">شامل ضريبة القيمة المضافة. يتجدد تلقائياً ويمكن إلغاؤه في أي وقت.</p>
        <button class="btn btn--brand btn--lg btn--block desk-cta" type="button" id="subBtn" style="margin-top:14px">اشترك الآن</button>
      </aside>
    </div>
  </div>
</div>`
  });

  /* ================= الاستشارة ================= */
  const topics = [
    ["party", "people", "تخطيط عزيمة أو وليمة", "كم ذبيحة أو كم كيلو، وأي تقطيع"],
    ["pick", "search", "اختيار القطعة المناسبة", "لطبخة معيّنة أو لمناسبة"],
    ["carcass", "knife", "تقطيع ذبيحة", "كيف توزّع الذبيحة على أكثر من طبخة"],
    ["cook", "thermo", "الطبخ والحرارة", "طريقة، وقت، ودرجة نضج"],
    ["other", "chat", "موضوع آخر", "اكتب لنا التفاصيل"]
  ];
  out.push({
    name: "consult", file: "consult.html", tab: "expertise", nav: "xp", mode: "push", back: ["expertise.html", "الخبرة"], appTitle: "استشارة جزّار", tabbar: false,
    actionbar: `<div class="action-bar__p"><small>الاستشارة</small><b id="abPrice">${C.consult.price} ${C.currency}</b></div><button class="btn btn--brand" type="button" id="abBook">احجز الموعد</button>`,
    scripts: ["consult"],
    title: "احجز استشارة جزّار — تخطيط العزائم واختيار القطع · نُضْج",
    desc: `استشارة ${C.consult.minutes} دقيقة فيديو أو واتساب مع جزّار: تخطيط العزيمة، اختيار القطع والكميات، وطلب التقطيع. ${C.consult.price} ${C.currency} — ${C.consult.memberPrice} ${C.currency} لأعضاء نُضْج+.`,
    main: `<div class="wrap">
  ${h.crumbs([["الخبرة", "expertise.html"], ["استشارة جزّار"]])}
  <div id="cDone" hidden></div>
  <form id="cForm" novalidate>
    <div class="page-head"><h1 class="large-title">استشارة جزّار</h1><p>${C.consult.minutes} دقيقة مع جزّار يخطط معك قبل ما تطلب.</p></div>
    <div class="co">
      <div>
        <div class="co-sec"><div class="co-sec__h"><h2><span class="n">1</span>وش الموضوع؟</h2></div>
          <div class="topics">${topics.map((t, i) => `<label class="topic"><input type="radio" name="topic" value="${t[2]}"${i === 0 ? " checked" : ""}>${icon(t[1])}<span><b>${t[2]}</b><small>${t[3]}</small></span></label>`).join("")}</div></div>
        <div class="co-sec"><div class="co-sec__h"><h2><span class="n">2</span>كيف تبغى نتواصل؟</h2></div>
          <div class="seg seg--full" id="channel" role="radiogroup" aria-label="طريقة التواصل"><button type="button" role="radio" aria-checked="true" class="on" data-v="مكالمة فيديو">${icon("video")} فيديو</button><button type="button" role="radio" aria-checked="false" data-v="واتساب">${icon("chat")} واتساب</button><button type="button" role="radio" aria-checked="false" data-v="اتصال">${icon("phone")} اتصال</button></div></div>
        <div class="co-sec"><div class="co-sec__h"><h2><span class="n">3</span>اختر الموعد</h2></div>
          <div class="card"><div class="days" id="cDays" role="radiogroup" aria-label="اليوم"></div><div class="times" id="cTimes" role="radiogroup" aria-label="الوقت"></div></div></div>
        <div class="co-sec"><div class="co-sec__h"><h2><span class="n">4</span>تفاصيل <small class="muted">(اختياري)</small></h2></div>
          <div class="card">
            <label class="field"><span class="field__l">عدد الأشخاص المتوقع</span><input class="input" type="number" inputmode="numeric" min="1" max="2000" name="people" placeholder="مثال: 40"></label>
            <label class="field" style="margin:0"><span class="field__l">وش تبغى نعرف قبل الاستشارة؟</span><textarea class="textarea" name="notes" maxlength="400" placeholder="مثال: عزيمة زواج يوم الخميس، نبغى مندي وكبسة"></textarea></label>
          </div></div>
      </div>
      <aside class="summary" aria-label="ملخص الحجز">
        <h2>ملخص الحجز</h2>
        <div class="sum-line"><span>الموضوع</span><span id="sTopic">—</span></div>
        <div class="sum-line"><span>الطريقة</span><span id="sChan">—</span></div>
        <div class="sum-line"><span>الموعد</span><span id="sWhen">—</span></div>
        <div class="sum-line"><span>المدة</span><span>${C.consult.minutes} دقيقة</span></div>
        <div class="sum-total"><b>الإجمالي</b><strong id="sPrice">${C.consult.price} ${C.currency}</strong></div>
        <p class="sum-vat" id="sMember"></p>
        <div id="cPay" style="margin-top:12px"></div>
        <button class="btn btn--brand btn--lg btn--block desk-cta" type="submit" style="margin-top:14px">احجز الموعد</button>
      </aside>
    </div>
  </form>
</div>`
  });

  return out;
};
