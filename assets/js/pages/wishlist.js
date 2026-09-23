/* المفضلة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const root = $("#wishRoot"); if (!root) return;
  const L = D.L || (ar => ar);
  function render() {
    const list = S.wish.list().map(D.byId).filter(Boolean);
    $("#wishSub").textContent = list.length ? list.length + " " + (list.length === 1 ? L("منتج محفوظ", "saved product") : L("منتجات محفوظة", "saved products")) : "";
    if (!list.length) { root.innerHTML = U.empty("heart", L("مفضلتك فاضية", "Your wishlist is empty"), L("اضغط على القلب في أي قطعة وتلقاها هنا.", "Tap the heart on any cut and you'll find it here."), `<a class="btn btn--ember" href="shop.html">${L("تصفّح المتجر", "Browse the shop")}</a>`); return; }
    root.innerHTML = `<div class="grid">${U.grid(list)}</div>`;
    A.paintHearts(root);
  }
  S.on("wish", render);
  render();
})();
