/* الرئيسية: تبويبات «وش بتطبخ؟» */
(function () {
  "use strict";
  const A = window.NUDJ_APP; const { $$ } = A;
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-use-tab]"); if (!t) return;
    $$("[data-use-tab]").forEach(b => b.setAttribute("aria-selected", b === t ? "true" : "false"));
    $$("[data-use-panel]").forEach(p => { p.hidden = p.dataset.usePanel !== t.dataset.useTab; });
  });

  /* السكين تقطّع الصورة أول ما يظهر القسم، وزر «قطّعها مرة ثانية» يعيدها */
  const band = document.querySelector("[data-cutband]");
  if (band) {
    let t; const cut = () => { clearTimeout(t); const was = band.classList.contains("is-cut"); band.classList.remove("is-cut"); t = setTimeout(() => band.classList.add("is-cut"), was ? 650 : 0); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) band.classList.add("is-cut");
    else { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cut(); io.disconnect(); } }, { threshold: .45 }); io.observe(band); }
    band.addEventListener("click", e => { if (e.target.closest("[data-cut-again]")) cut(); });
  }
})();
