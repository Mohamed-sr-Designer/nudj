/* البحث: منتجات + أدلة + طبخات، مع توحيد الكتابة العربية وعمليات بحث سابقة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const inp = $("#sq"), root = $("#sRoot"), clr = $("#sClear"); if (!inp) return;
  const SUGG = ["ذبيحة", "ريش", "كبسة", "مندي", "ستيك", "مفروم", "موزة", "بوكس الشواء"];

  const idx = [];
  D.PRODUCTS.forEach(p => idx.push({ k: "p", p, h: A.norm([p.name, p.en, p.short, (p.bestFor || []).join(" "), U.typeName(p), p.code].join(" ")) }));
  D.GUIDES.forEach(g => idx.push({ k: "g", g, h: A.norm([g.title, g.short, "دليل فيديو شرح"].join(" ")) }));
  D.DISHES.forEach(d => idx.push({ k: "d", d, h: A.norm([d.name, d.en, d.needs, d.intro].join(" ")) }));

  function results(q) {
    const w = A.norm(q).split(" ").filter(Boolean);
    const hit = idx.filter(x => w.every(t => x.h.indexOf(t) > -1));
    const P = hit.filter(x => x.k === "p").map(x => x.p), G = hit.filter(x => x.k === "g").map(x => x.g), Dd = hit.filter(x => x.k === "d").map(x => x.d);
    if (!P.length && !G.length && !Dd.length) return U.empty("search", `ما لقينا نتائج لـ «${U.esc(q)}»`, "جرّب كلمة أبسط، مثل: ريش، فخذ، ذبيحة، كبسة.",
      `<div class="sugg" style="justify-content:center">${SUGG.slice(0, 5).map(s => `<button class="tag" type="button" data-s="${s}">${s}</button>`).join("")}</div>`);
    return `${P.length ? `<div class="res-group"><h2>المنتجات (${P.length})</h2><div class="rows">${P.map(p => U.productRow(p)).join("")}</div></div>` : ""}
      ${Dd.length ? `<div class="res-group"><h2>وش تطبخ</h2><div class="rows">${Dd.map(d => `<a class="prow" href="${U.url.dish(d.slug)}"><span class="gcard__ic" style="background:var(--oxblood-tint);color:var(--oxblood)">${U.dishIcon(d.slug)}</span><span class="prow__b"><b>${d.name}</b><small>${U.esc(d.needs)}</small></span>${U.icon("chevL", "prow__chev")}</a>`).join("")}</div></div>` : ""}
      ${G.length ? `<div class="res-group"><h2>الأدلة المصوّرة</h2><div class="gcards">${G.map(U.guideCard).join("")}</div></div>` : ""}`;
  }
  function idle() {
    const rec = S.recent.list();
    return `${rec.length ? `<div class="res-group" style="margin-top:0"><h2 style="display:flex;justify-content:space-between">عمليات بحث سابقة <button class="link" type="button" data-clear-recent>مسح</button></h2><div class="sugg">${rec.map(s => `<button class="tag" type="button" data-s="${U.esc(s)}">${U.icon("clock")}${U.esc(s)}</button>`).join("")}</div></div>` : ""}
      <div class="res-group"${rec.length ? "" : ' style="margin-top:0"'}><h2>اقتراحات</h2><div class="sugg">${SUGG.map(s => `<button class="tag" type="button" data-s="${s}">${s}</button>`).join("")}</div></div>
      <div class="res-group"><h2>تصفّح حسب النوع</h2><div class="rows">${D.TYPES.map(t => `<a class="prow" href="shop.html?t=${t.k}"><span class="prow__b"><b>${t.n}</b><small>${t.s}</small></span>${U.icon("chevL", "prow__chev")}</a>`).join("")}</div></div>`;
  }
  function run(push) {
    const q = inp.value.trim();
    clr.hidden = !q;
    root.innerHTML = q ? results(q) : idle();
    A.paintGuides(root);
    try { history.replaceState(null, "", "search.html" + (q ? "?q=" + encodeURIComponent(q) : "")); } catch (e) { }
    if (push && q) S.recent.push(q);
  }
  let t;
  inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => run(false), 120); });
  $("#sForm").addEventListener("submit", e => { e.preventDefault(); run(true); inp.blur(); });
  clr.addEventListener("click", () => { inp.value = ""; run(false); inp.focus(); });
  root.addEventListener("click", e => {
    const s = e.target.closest("[data-s]"); if (s) { inp.value = s.dataset.s; run(true); return; }
    if (e.target.closest("[data-clear-recent]")) { S.recent.clear(); run(false); return; }
    /* نحفظ البحث عند فتح نتيجة */
    if (e.target.closest("a") && inp.value.trim()) S.recent.push(inp.value.trim());
  });
  inp.value = new URLSearchParams(location.search).get("q") || "";
  run(false);
  if (!inp.value) setTimeout(() => inp.focus(), 80);
})();
