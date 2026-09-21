/* صفحة الدليل: معاينة مجانية + جدار دفع، أو المحتوى الكامل لمن اشترى/اشترك */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const gid = document.body.dataset.guide; if (!gid) return;
  const body = $("#gBody");
  const esc = U.esc;
  const MI = { grill: "flame", pan: "pan", oven: "oven", slow: "clock", braise: "pot", reverse: "swap" };

  function video(src) {
    if (!src) return `<button class="video__play" type="button" aria-label="تشغيل الفيديو" data-novideo>${U.playIcon()}</button><span class="video__cap">مكان فيديو الدليل</span>`;
    if (/\.(mp4|webm|m3u8)(\?|$)/.test(src)) return `<video src="${esc(src)}" controls playsinline preload="metadata"></video>`;
    return `<iframe src="${esc(src)}" title="فيديو الدليل" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }

  function cutGuide(p) {
    const G = p.guide || {};
    const dishes = D.dishesForProduct(p.id);
    const done = p.doneness ? D.DONENESS.find(d => d.k === p.doneness) : null;
    return `
<section class="gsec"><h2><span class="n">1</span>كيف تُقطّع ${esc(p.name)}</h2><p>${esc(G.cutting || "")}</p></section>
<section class="gsec"><h2><span class="n">2</span>التحضير قبل الطبخ</h2><ol class="ol">${(G.prep || []).map(s => `<li>${esc(s)}</li>`).join("")}</ol></section>
<section class="gsec"><h2><span class="n">3</span>الطبخ خطوة بخطوة</h2>
  <div class="mcards">${(G.cook || []).map(c => `<div class="mcard"><div class="mcard__h">${U.icon(MI[c.m] || "flame")}<b>${D.METHODS[c.m].name}</b></div><p>${esc(c.how)}</p></div>`).join("")}</div></section>
<section class="gsec"><h2><span class="n">4</span>درجة النضج والراحة</h2>
  ${done ? `<p style="margin-bottom:12px">الدرجة الموصى بها: <b>${done.n} (${done.t}°م في المركز)</b>. جرّب الدرجات الأخرى على المقياس.</p>${U.ruler("gRuler")}` : `<p>هذي قطعة طبخ بطيء: تُقاس بالطراوة لا بالحرارة. تكون جاهزة لما تنزلق فيها الشوكة بلا مقاومة.</p>`}
  <p style="margin-top:12px">${p.restMin ? `أرِح اللحم <b>${p.restMin} دقيقة</b> بعد رفعه عن النار وقبل التقطيع.` : "لا تحتاج راحة طويلة — قدّمها مباشرة من القدر."}</p></section>
<section class="gsec"><h2><span class="n">5</span>نصيحة الجزّار</h2><div class="tipbox"><span class="k">من الجزّار</span><p>${esc(p.tip)}</p></div></section>
${dishes.length ? `<section class="gsec"><h2>تنفع لهذي الطبخات</h2><div class="tags">${dishes.map(d => `<a class="tag" href="${U.url.dish(d.slug)}">${U.dishIcon(d.slug)}${d.name}</a>`).join("")}</div></section>` : ""}
<section class="gsec"><a class="btn btn--brand btn--lg" href="${U.url.product(p.id)}">${U.icon("cart")}اطلب ${esc(p.name)}</a></section>`;
  }

  function carcassGuide() {
    const G = D.CARCASS_GUIDE;
    const sizes = D.byId("lamb-whole").sizes;
    return `
<section class="gsec"><h2><span class="n">1</span>كيف تُقسم الذبيحة</h2><p>${esc(G.split)}</p></section>
<section class="gsec"><h2><span class="n">2</span>أساليب التقطيع</h2><div class="styles">${G.styles.map(s => `<div><b>${s.n}</b><p>${s.d}</p></div>`).join("")}</div></section>
<section class="gsec"><h2><span class="n">3</span>كم تكفي الذبيحة؟</h2><p style="margin-bottom:12px">${esc(G.serves)}</p>
  <div class="compare-wrap"><table class="compare"><thead><tr><th scope="col">الحجم</th><th scope="col">الوزن التقريبي</th><th scope="col">يكفي تقريباً</th></tr></thead>
  <tbody>${sizes.map(s => `<tr><th scope="row">${s.l}</th><td>${s.d.replace(" تقريباً", "")}</td><td>${Math.round(s.kg / .5)}–${Math.round(s.kg / .4)} شخصاً</td></tr>`).join("")}</tbody></table></div></section>
<section class="gsec"><h2><span class="n">4</span>كيف تكتب طلب التقطيع</h2><p>${esc(G.order)}</p><div class="tipbox" style="margin-top:14px"><span class="k">من الجزّار</span><p>${esc(G.tip)}</p></div></section>
<section class="gsec"><a class="btn btn--brand btn--lg" href="${U.url.product("lamb-whole")}">${U.icon("cart")}اطلب ذبيحة</a></section>`;
  }

  function paint() {
    const open = S.hasAccess(gid);
    const vid = $("#gVideo");
    const chapters = $(`[data-chapters="${gid}"]`);
    if (chapters) { chapters.classList.toggle("is-open", open); $$(".ic", chapters).forEach(i => { i.outerHTML = U.icon(open ? "check" : "lock", "", open ? 2.4 : 1.8); }); }
    const bar = $("#actionBar");
    if (open) {
      const p = gid === "carcass" ? null : D.byId(gid);
      vid.innerHTML = video((p && p.video) || (gid === "carcass" ? D.CARCASS_GUIDE.video : ""));
      body.innerHTML = gid === "carcass" ? carcassGuide() : cutGuide(p);
      A.ruler($("#gRuler", body), p && p.doneness);
      if (bar) bar.hidden = true;
      document.body.classList.remove("has-actionbar");
    } else {
      if (bar) bar.hidden = false;
      document.body.classList.add("has-actionbar");
      if (S.cart.guideInCart(gid)) {
        const pw = $("#paywall .paywall");
        if (pw && !$("[data-incart]", pw)) pw.insertAdjacentHTML("afterbegin", `<p class="digital-note" data-incart>${U.icon("cart")}الدليل في سلتك — أكمل الطلب ليُفتح. <a class="link" href="cart.html">السلة</a></p>`);
      }
    }
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-add-guide]");
    if (b) { if (S.cart.addGuide(b.dataset.addGuide)) { A.bump(); A.toast("أُضيف الدليل للسلة", { icon: "video", action: { label: "عرض السلة", href: "cart.html" } }); paint(); } return; }
    if (e.target.closest("[data-novideo]")) A.toast("يُضاف الفيديو هنا عند رفعه", { icon: "video" });
  });
  S.on("auth", paint);
  paint();
})();
