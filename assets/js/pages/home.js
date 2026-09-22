/* الرئيسية: تبويبات «وش بتطبخ؟» */
(function () {
  "use strict";
  const A = window.NUDJ_APP; const { $$ } = A;
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-use-tab]"); if (!t) return;
    $$("[data-use-tab]").forEach(b => b.setAttribute("aria-selected", b === t ? "true" : "false"));
    $$("[data-use-panel]").forEach(p => { p.hidden = p.dataset.usePanel !== t.dataset.useTab; });
  });
})();
