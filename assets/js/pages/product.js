/* صفحة المنتج: شريط الإجراء على الجوال + «كم تحتاج؟» يضبط الميزان + المعرض */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI, ADV = window.NUDJ_ADVISOR;
  const { $, $$ } = A;
  const p = D.byId(document.body.dataset.product); if (!p) return;
  const form = $(".pd .buy-form");
  const abT = $("#abTotal"), abKg = $("#abKg");

  if (form) {
    form.dataset.bound = ""; /* نعيد الربط لنستقبل التغييرات */
    A.bindBuyForm(form, { onChange: (r, t) => { if (abT) abT.textContent = U.money(t) + " " + D.CONFIG.currency; if (abKg && r.kg) abKg.textContent = r.kg; } });
  }
  const ab = $("#abAdd"); if (ab && form) ab.addEventListener("click", () => form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true })));

  /* كم تحتاج؟ */
  const out = $("#mpOut"), v = $("#mpV");
  let n = 4;
  function calc() {
    if (!out || !ADV) return;
    const s = ADV.suggestKg(p, n);
    out.innerHTML = `لـ <b>${n}</b> ${n === 1 ? "شخص" : n === 2 ? "شخصين" : n <= 10 ? "أشخاص" : "شخص"} تحتاج <b class="num">${U.kgTxt(s.kg)}</b> <small>(${s.g} جم للشخص · ${s.use})</small>`;
    return s;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-mp]"); if (b) { n = Math.max(1, Math.min(60, n + +b.dataset.mp)); v.textContent = n; calc(); return; }
    if (e.target.closest("#mpSet") && form && form.setKg) {
      const s = calc(); form.setKg(s.kg);
      const sc = $(".scale", form); if (sc) { sc.classList.remove("flash"); void sc.offsetWidth; sc.classList.add("flash"); if (window.innerWidth < 900) sc.scrollIntoView({ behavior: "smooth", block: "center" }); }
      A.toast("ضبطنا الميزان على " + U.kgTxt(s.kg), { icon: "scale" });
    }
    const th = e.target.closest("[data-thumb]"); if (th) {
      const img = $(".pd__img img"); if (img) img.src = th.dataset.thumb;
      $$("[data-thumb]").forEach(x => x.toggleAttribute("aria-current", x === th));
    }
  });
  calc();
})();
