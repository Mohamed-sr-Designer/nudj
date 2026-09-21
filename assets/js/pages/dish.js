/* صفحة الطبخة: حاسبة الكمية (مجانية وتبيع اللحم) + الخطوات (مقفلة إلا للمشتري/المشترك) */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const d = D.dishBySlug(document.body.dataset.dish); if (!d) return;
  const gid = "dish-" + d.slug;

  /* ---------- حاسبة الكمية ---------- */
  const out = $("#calcN"), kgEl = $("#calcKg"), list = $("#calcList");
  let n = 6;
  const fmtKg = x => (Math.round(x * 10) / 10).toLocaleString("en-US") + " كجم";
  /* العدد بالعربية الصحيحة: حبة واحدة، حبتان، 3 حبات، 11 حبة */
  const FORMS = { "حبة": ["حبة واحدة", "حبتان", "حبات"], "شريحة": ["شريحة واحدة", "شريحتان", "شرائح"] };
  const count = (n, unit) => { const f = FORMS[unit] || FORMS["حبة"]; return n === 1 ? f[0] : n === 2 ? f[1] : n <= 10 ? n + " " + f[2] : n + " " + (unit || "حبة"); };
  /* الكمية المقترحة لكل قطعة حسب طريقة بيعها.
     الأطباق المحسوبة بالعظم (كبسة، مندي، طبخ بطيء) تحتاج وزناً أقل من القطع المنزوعة العظم (نحو الثلثين). */
  function suggest(p, lo, hi) {
    const k = d.boneIn && p.boneless ? 0.65 : 1;
    lo *= k; hi *= k; const mid = (lo + hi) / 2;
    if (p.unit === "kg") {
      const half = Math.max(0.5, Math.ceil(mid * 2) / 2);
      const hasHalf = (p.sizes || []).some(s => s.k === "0.5");
      if (half % 1 === 0 || !hasHalf) { const kg = Math.ceil(half); return { size: "1", qty: kg, label: fmtKg(kg) }; }
      return { size: "0.5", qty: half * 2, label: fmtKg(half) };
    }
    const w = p.pieceKg || 1;
    let pcs = Math.max(1, Math.round(mid / w));
    if (pcs * w < lo * 0.9) pcs++; /* لا تقل عن الحاجة بأكثر من 10٪ */
    return { qty: pcs, label: count(pcs, p.unitName) + " (≈ " + fmtKg(pcs * w) + ")" };
  }
  function paint() {
    out.textContent = n;
    const lo = n * d.perKg[0], hi = n * d.perKg[1], mid = (lo + hi) / 2;
    kgEl.textContent = lo === hi ? fmtKg(lo) : fmtKg(lo) + " – " + fmtKg(hi);
    list.innerHTML = d.cuts.map(D.byId).filter(Boolean).map(p => {
      const s = suggest(p, lo, hi);
      const price = S.unitPrice(p, { size: s.size }) * s.qty;
      return `<div class="calc__item"><span class="calc__b"><a href="${U.url.product(p.id)}"><b>${U.esc(p.name)}</b></a><small>${s.label} · ${U.money(price)} ${C.currency}</small></span>
        <button class="btn btn--sm btn--tint" type="button" data-calc-add="${p.id}" data-size="${s.size || ""}" data-qty="${s.qty}">${U.icon("plus", "", 2.2)}أضف</button></div>`;
    }).join("") + `<p class="calc__note">الكمية لطبخة واحدة من ${d.name}، بحساب ${d.perPerson}. القطعة الواحدة تكفي — لا تحتاج كل القطع.</p>`;
  }
  $("#calcStep").addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    n = Math.max(1, Math.min(200, n + parseInt(b.dataset.step, 10))); paint();
  });
  list.addEventListener("click", e => {
    const b = e.target.closest("[data-calc-add]"); if (!b) return;
    const p = D.byId(b.dataset.calcAdd);
    const opts = {}; if (p.sizes) opts.size = b.dataset.size || p.sizeDef;
    if (p.cuts) { const want = d.slug === "kabsa" ? "مقطّع للكبسة" : d.slug === "mandi" ? "مقطّع للمندي" : null; opts.cut = want && p.cuts.indexOf(want) > -1 ? want : p.cuts[0]; }
    S.cart.addMeat(p.id, opts, parseInt(b.dataset.qty, 10) || 1, "");
    A.bump(); A.toast(`أُضيف ${p.name} للسلة`, { action: { label: "عرض السلة", href: "cart.html" } });
  });
  paint();

  /* ---------- الخطوات ---------- */
  function paintSteps() {
    const box = $("#dishSteps");
    if (!S.hasAccess(gid)) {
      if (S.cart.guideInCart(gid) && !$("[data-incart]", box)) box.insertAdjacentHTML("afterbegin", `<p class="digital-note" data-incart style="margin-bottom:12px">${U.icon("cart")}الدليل في سلتك — أكمل الطلب ليُفتح. <a class="link" href="cart.html">السلة</a></p>`);
      return;
    }
    box.innerHTML = `<div class="video" style="margin-bottom:16px">${d.video ? `<iframe src="${U.esc(d.video)}" title="فيديو ${d.name}" allowfullscreen></iframe>` : `<button class="video__play" type="button" aria-label="تشغيل" data-novideo>${U.playIcon()}</button><span class="video__cap">مكان فيديو ${d.name}</span>`}</div>
      <ol class="ol">${d.steps.map(s => `<li>${U.esc(s)}</li>`).join("")}</ol>`;
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-novideo]")) A.toast("يُضاف الفيديو هنا عند رفعه", { icon: "video" }); });
  S.on("auth", paintSteps);
  paintSteps();
})();
