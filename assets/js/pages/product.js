/* صفحة المنتج: المعرض، شريط الإجراء على الجوال، وحالة الدليل المصوّر */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const p = D.byId(document.body.dataset.id); if (!p) return;
  const C = D.CONFIG;
  const form = $(".pdp .buy-form");

  /* ---- المعرض: نقاط الصفحات ---- */
  const track = $("#gTrack"), dots = $$("#gDots i");
  if (track) track.addEventListener("scroll", () => {
    const i = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
  }, { passive: true });

  /* ---- شريط الإجراء (الجوال) يعكس إجمالي النموذج ---- */
  const abTotal = $("#abTotal"), abAdd = $("#abAdd");
  if (form) {
    A.bindBuyForm(form, { onChange: (r, t) => { if (abTotal) abTotal.textContent = U.money(t) + " " + C.currency; } });
    form.update && form.update();
  }
  if (abAdd && form) abAdd.addEventListener("click", () => {
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true }));
  });

  /* ---- بطاقة الدليل المصوّر ---- */
  const gid = D.guideIdFor(p);
  function paintXp() {
    const cta = $(`[data-xp-cta="${gid}"]`); if (!cta) return;
    const chapters = $(`[data-chapters="${gid}"]`);
    const open = S.hasAccess(gid);
    if (chapters) { chapters.classList.toggle("is-open", open); $$(".ic", chapters).forEach(i => { i.outerHTML = U.icon(open ? "check" : "lock", "", open ? 2.4 : 1.8); }); }
    const card = $(".xp-card"); if (card) { const pill = $(".xp-card__vid .pill", card); if (pill) pill.innerHTML = open ? U.icon("check", "", 2.4) + "متاح لك" : U.icon("lock") + "خدمة إضافية"; }
    if (open) cta.innerHTML = `<a class="btn btn--brand" href="${U.url.guide(gid)}">${U.playIcon()}افتح الدليل</a><span class="xp-card__note">${S.isMember() ? "ضمن اشتراكك في نُضْج+" : "اشتريته — يبقى لك دائماً"}</span>`;
    else if (S.cart.guideInCart(gid)) cta.innerHTML = `<a class="btn btn--tint" href="cart.html">${U.icon("cart")}الدليل في السلة — أكمل الطلب</a>`;
    else cta.innerHTML = `<button class="btn btn--brand" type="button" data-add-guide="${gid}">أضف الدليل للسلة · ${C.guidePrice} ${C.currency}</button><a class="btn btn--tint" href="subscribe.html">كل الأدلة مع نُضْج+</a>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-add-guide]"); if (!b) return;
    if (S.cart.addGuide(b.dataset.addGuide)) { A.bump(); A.toast("أُضيف الدليل للسلة", { icon: "video", action: { label: "عرض السلة", href: "cart.html" } }); }
  });
  S.on("cart", paintXp); S.on("auth", paintXp);
  if (gid) paintXp();
})();
