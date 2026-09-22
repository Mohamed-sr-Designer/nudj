/* صفحة الماشية: نقاط الرسم وقائمة القطعيات تتميّز معاً */
(function () {
  "use strict";
  const A = window.NUDJ_APP; const { $$ } = A;
  const hl = (id, on) => {
    $$(`[data-pin="${id}"]`).forEach(p => p.classList.toggle("is-hl", on));
    $$(`[data-row="${id}"]`).forEach(r => r.classList.toggle("is-hl", on));
  };
  const find = e => e.target.closest && e.target.closest("[data-pin],[data-row]");
  ["mouseover", "focusin"].forEach(ev => document.addEventListener(ev, e => { const t = find(e); if (t) hl(t.dataset.pin || t.dataset.row, true); }));
  ["mouseout", "focusout"].forEach(ev => document.addEventListener(ev, e => { const t = find(e); if (t) hl(t.dataset.pin || t.dataset.row, false); }));
})();
