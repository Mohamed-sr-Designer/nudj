/* مخطط الذبيحة: اختر المنطقة → قطعياتها (لوحة جانبية على الشاشة الكبيرة، ورقة سفلية على الجوال) */
(function () {
  "use strict";
  const D = window.NUDJ, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const svg = $(".chart-svg"); if (!svg) return;
  let animal = "ضأن", zone = null;
  const mobile = () => window.innerWidth < 900;

  function labels() {
    $$(".zg", svg).forEach(g => {
      const pr = D.PRIMALS[animal][g.dataset.zone];
      $(".zlabel", g).textContent = pr.name; g.setAttribute("aria-label", pr.name);
      const has = D.productsInZone(animal, g.dataset.zone).length > 0;
      g.style.opacity = has ? 1 : .45;
    });
    $$("[data-zi]").forEach(el => { el.hidden = el.dataset.zi !== animal; });
  }
  function listHTML(z) {
    const list = D.productsInZone(animal, z);
    return list.length ? `<div class="rows">${list.map(p => U.productRow(p)).join("")}</div>` : `<p class="muted" style="padding:16px">لا توجد قطعيات من هذه المنطقة حالياً.</p>`;
  }
  function pick(z) {
    zone = z;
    $$(".zg", svg).forEach(g => g.classList.toggle("on", g.dataset.zone === z));
    const pr = D.PRIMALS[animal][z];
    if (mobile()) {
      const sh = A.openSheet({ title: pr.name, body: `<p class="sheet__text">${pr.note}</p>${listHTML(z)}`, onClose: () => { $$(".zg", svg).forEach(g => g.classList.remove("on")); } });
    } else {
      const panel = $("#zonePanel");
      $(".zone-panel__head", panel).innerHTML = `<span class="cut-code"><b>${animal}</b></span><h2 style="margin-top:6px">${pr.name}</h2><p>${pr.note}</p>`;
      $("#zoneRows").outerHTML = `<div id="zoneRows">${listHTML(z)}</div>`;
    }
    try { history.replaceState(null, "", "cuts.html?a=" + encodeURIComponent(animal) + "&z=" + z); } catch (e) { }
  }
  svg.addEventListener("click", e => { const g = e.target.closest(".zg"); if (g) pick(g.dataset.zone); });
  svg.addEventListener("keydown", e => { if (e.key !== "Enter" && e.key !== " ") return; const g = e.target.closest(".zg"); if (g) { e.preventDefault(); pick(g.dataset.zone); } });

  $("#species").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    animal = b.dataset.a;
    $$("#species button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); });
    labels();
    if (zone && !mobile()) pick(zone);
  });

  /* رابط مباشر: cuts.html?a=بقر&z=rack */
  const q = new URLSearchParams(location.search);
  if (q.get("a") && D.PRIMALS[q.get("a")]) { animal = q.get("a"); $$("#species button").forEach(x => { const on = x.dataset.a === animal; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); }); }
  labels();
  if (q.get("z") && D.ZONES.indexOf(q.get("z")) > -1 && !mobile()) pick(q.get("z"));
  else if (!mobile()) pick("rack");
})();
