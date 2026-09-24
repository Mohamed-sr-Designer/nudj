/* البحث: القطعيات والمواشي والطبخات، مع توحيد الكتابة العربية وعمليات بحث سابقة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const inp = $("#sq"), root = $("#sRoot"), clr = $("#sClear"); if (!inp) return;
  const L = D.L || (ar => ar);
  const SUGG = L(["ريش", "كبسة", "جمل", "ستيك", "مفروم", "كبدة", "ذبيحة", "فحم"], ["Rack", "Kabsa", "Camel", "Steak", "Mince", "Liver", "Carcass", "Charcoal"]);
  const idx = D.PRODUCTS.map(p => ({ p, h: A.norm([p.name, p.short, p.info, p.code, U.animalName(p), (p.uses || []).map(u => D.USES[u].n).join(" "), (p.preps || []).map(k => D.PREPS[k].n).join(" ")].join(" ")) }));
  const ALIAS = { "خروف": "ضان", "غنم": "ضان", "حاشي": "جمل", "ابل": "جمل", "قعود": "جمل", "تيس": "ماعز", "مشوي": "مشاوي", "شوي": "مشاوي",
    sheep: "lamb", mutton: "lamb", hashi: "camel", calf: "veal", cow: "beef", bbq: "grill", barbecue: "grill", ribs: "rack", chops: "rack", minced: "mince", ground: "mince" };
  function results(q) {
    const w = A.norm(q).split(" ").filter(Boolean).map(t => ALIAS[t] || t);
    const P = idx.filter(x => w.every(t => x.h.indexOf(t) > -1)).map(x => x.p);
    const animals = D.ANIMALS.filter(a => w.some(t => A.norm(a.n).indexOf(t) > -1));
    if (!P.length) return U.empty("search", L(`ما لقينا نتائج لـ «${U.esc(q)}»`, `No results for “${U.esc(q)}”`), L("جرّب كلمة أبسط، أو اسأل المستشار.", "Try a simpler word, or ask the advisor."),
      `<div class="sugg">${SUGG.slice(0, 5).map(s => `<button class="sg" type="button" data-s="${s}">${s}</button>`).join("")}</div><button class="btn btn--ember" type="button" data-advisor="open" data-sheet style="margin-top:16px">${L("اسأل المستشار", "Ask the advisor")}</button>`);
    return `${animals.length ? `<div class="res-group"><h2>${L("المواشي", "Animals")}</h2><div class="herd-rail herd-rail--sm">${animals.map(a => U.herdCard(a, D.ANIMALS.indexOf(a))).join("")}</div></div>` : ""}
      <div class="res-group"><h2>${L("القطعيات والمنتجات", "Cuts & products")} (${P.length})</h2><div class="rows">${P.map(p => U.productRow(p)).join("")}</div></div>`;
  }
  function idle() {
    const rec = S.recent.list();
    return `${rec.length ? `<div class="res-group"><h2 class="res-group__h">${L("عمليات بحث سابقة", "Recent searches")} <button class="link" type="button" data-clear-recent>${L("مسح", "Clear")}</button></h2><div class="sugg">${rec.map(s => `<button class="sg" type="button" data-s="${U.esc(s)}">${U.icon("clock")}${U.esc(s)}</button>`).join("")}</div></div>` : ""}
      <div class="res-group"><h2>${L("اقتراحات", "Suggestions")}</h2><div class="sugg">${SUGG.map(s => `<button class="sg" type="button" data-s="${s}">${s}</button>`).join("")}</div></div>
      <div class="res-group"><h2>${L("تصفّح القطيع", "Browse the herd")}</h2><div class="herd-rail herd-rail--sm">${D.ANIMALS.map((a, i) => U.herdCard(a, i)).join("")}</div></div>`;
  }
  let first = true;
  function run(push) {
    const q = inp.value.trim();
    clr.hidden = !q;
    root.innerHTML = q ? results(q) : idle();
    if (q && (push || first) && window.NUDJ_TRACK) window.NUDJ_TRACK.ev("search", { q, n: root.querySelectorAll(".prow").length });
    first = false;
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
    if (e.target.closest("a") && inp.value.trim()) S.recent.push(inp.value.trim());
  });
  inp.value = new URLSearchParams(location.search).get("q") || "";
  run(false);
  if (!inp.value) setTimeout(() => inp.focus(), 80);
})();
