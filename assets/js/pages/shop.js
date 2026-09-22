/* المتجر: فلترة حسب الماشية والطبخة والترتيب (البطاقات مبنية مسبقاً في الصفحة) */
(function () {
  "use strict";
  const A = window.NUDJ_APP; const { $, $$ } = A;
  const grid = $("#grid"); if (!grid) return;
  const cards = $$(".tag-card", grid);
  const order = cards.slice();
  const q = new URLSearchParams(location.search);
  const st = { a: q.get("a") || "all", u: q.get("u") || "all", sort: q.get("sort") || "" };
  const has = (list, k) => (" " + list + " ").indexOf(" " + k + " ") > -1;
  function apply(push) {
    let n = 0;
    cards.forEach(c => {
      const ok = (st.a === "all" || has(c.dataset.a, st.a)) && (st.u === "all" || has(c.dataset.u, st.u));
      c.hidden = !ok; if (ok) n++;
    });
    const sorted = st.sort ? order.slice().sort((x, y) => (st.sort === "asc" ? 1 : -1) * (+x.dataset.p - +y.dataset.p)) : order;
    sorted.forEach(c => grid.appendChild(c));
    $("#shopCount").textContent = n;
    $("#shopEmpty").hidden = n > 0;
    $$("[data-f-a]").forEach(b => b.setAttribute("aria-checked", b.dataset.fA === st.a ? "true" : "false"));
    $$("[data-f-u]").forEach(b => b.setAttribute("aria-checked", b.dataset.fU === st.u ? "true" : "false"));
    $("#sort").value = st.sort;
    if (push) {
      const p = new URLSearchParams();
      if (st.a !== "all") p.set("a", st.a); if (st.u !== "all") p.set("u", st.u); if (st.sort) p.set("sort", st.sort);
      try { history.replaceState(null, "", "shop.html" + (p.toString() ? "?" + p : "")); } catch (e) { }
    }
    const on = $("[data-f-a][aria-checked=true]");
    if (on && on.parentNode.scrollWidth > on.parentNode.clientWidth) on.scrollIntoView({ inline: "center", block: "nearest" });
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-f-a]"); if (a) { st.a = a.dataset.fA; apply(true); return; }
    const u = e.target.closest("[data-f-u]"); if (u) { st.u = u.dataset.fU; apply(true); return; }
    if (e.target.closest("[data-f-reset]")) { st.a = "all"; st.u = "all"; apply(true); }
  });
  $("#sort").addEventListener("change", e => { st.sort = e.target.value; apply(true); });
  apply(false);
})();
