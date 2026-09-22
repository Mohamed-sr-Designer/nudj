/* المفضلة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const root = $("#wishRoot"); if (!root) return;
  function render() {
    const list = S.wish.list().map(D.byId).filter(Boolean);
    $("#wishSub").textContent = list.length ? list.length + " " + (list.length === 1 ? "منتج محفوظ" : "منتجات محفوظة") : "";
    if (!list.length) { root.innerHTML = U.empty("heart", "مفضلتك فاضية", "اضغط على القلب في أي قطعة وتلقاها هنا.", `<a class="btn btn--ember" href="shop.html">تصفّح المتجر</a>`); return; }
    root.innerHTML = `<div class="grid">${U.grid(list)}</div>`;
    A.paintHearts(root);
  }
  S.on("wish", render);
  render();
})();
