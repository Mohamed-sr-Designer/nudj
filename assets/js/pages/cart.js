/* السلة: اللحوم + الخدمات الرقمية + الملخص — وفرصة ثانية لإضافة الدليل */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const root = $("#cartRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;

  function line(l) {
    if (l.kind === "guide") {
      const g = D.guideById(l.id);
      return `<div class="citem citem--digital"><div class="citem__img ph">${U.icon("video")}</div>
        <div class="citem__b"><div class="citem__t"><a href="${g.href}">${U.esc(g.title)}</a><button class="citem__x" type="button" data-rm="${l.key}" aria-label="حذف">${U.icon("trash")}</button></div>
        <span class="citem__o">دليل مصوّر · يُفتح في حسابك فور الدفع</span>
        <div class="citem__row"><span class="pill pill--ghost">${U.icon("video")}رقمي</span><span class="citem__p num">${cur(C.guidePrice)}</span></div></div></div>`;
    }
    const p = D.byId(l.id); const gid = D.guideIdFor(p);
    const up = gid && !S.hasAccess(gid) && !S.cart.guideInCart(gid)
      ? `<button class="citem__up" type="button" data-up="${gid}">${U.icon("plus", "", 2.4)}أضف ${gid === "carcass" ? "دليل تقطيع الذبيحة" : "الدليل المصوّر"} · ${C.guidePrice} ${C.currency}</button>` : "";
    return `<div class="citem"><a href="${U.url.product(p.id)}" tabindex="-1" aria-hidden="true">${U.productImg(p, "citem__img")}</a>
      <div class="citem__b"><div class="citem__t"><a href="${U.url.product(p.id)}">${U.esc(p.name)}</a><button class="citem__x" type="button" data-rm="${l.key}" aria-label="حذف ${U.esc(p.name)}">${U.icon("trash")}</button></div>
      <span class="citem__o">${U.esc(U.optsText(l))}${l.note ? " · «" + U.esc(l.note) + "»" : ""}</span>
      <div class="citem__row"><div class="stepper stepper--sm"><button type="button" data-q="${l.key}" data-d="-1" aria-label="إنقاص">${U.icon(l.qty > 1 ? "minus" : "trash", "", 2.2)}</button><output class="num">${l.qty}</output><button type="button" data-q="${l.key}" data-d="1" aria-label="زيادة">${U.icon("plus", "", 2.2)}</button></div>
      <span class="citem__p num">${cur(S.cart.linePrice(l))}</span></div>${up}</div></div>`;
  }

  function render() {
    const lines = S.cart.get();
    if (!lines.length) {
      root.innerHTML = U.empty("cart", "سلتك فاضية", "تصفّح المتجر وأضف اللي يعجبك — ذبائح، قطعيات، أو بوكسات.", `<a class="btn btn--brand btn--lg" href="shop.html">تسوّق الآن</a>`);
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar");
      return;
    }
    const t = S.cart.totals(lines);
    const meat = lines.filter(l => l.kind === "meat"), dig = lines.filter(l => l.kind === "guide");
    const pct = t.hasMeat ? Math.min(100, Math.round((t.meat - t.discount) / C.delivery.freeOver * 100)) : 0;
    const nudge = !S.isMember() && dig.length >= 2
      ? `<div class="member-nudge">${U.icon("spark")}<span><b>${dig.length} أدلة = ${cur(t.digital)}</b><small>نُضْج+ يفتح كل الأدلة (${D.GUIDES.length}) بـ ${cur(C.plans.monthly.price)} شهرياً</small></span><a class="btn btn--light btn--sm" href="subscribe.html">اشترك</a></div>` : "";
    root.innerHTML = `<div class="cart-page">
      <div>
        ${meat.length ? `<h2 class="group__head">اللحوم (${meat.reduce((n, l) => n + l.qty, 0)})</h2><div class="rows">${meat.map(line).join("")}</div>` : ""}
        ${t.hasMeat ? (t.delivery ? `<div class="cart-note">${U.icon("truck")}<span>أضف <b class="num">${cur(t.toFree)}</b> للحصول على توصيل مجاني<div class="freebar"><i style="width:${pct}%"></i></div></span></div>`
          : `<div class="cart-note">${U.icon("truck")}<span>طلبك مؤهل <b>للتوصيل المجاني</b></span></div>`) : ""}
        ${dig.length ? `<h2 class="group__head">خدمات رقمية</h2><div class="rows">${dig.map(line).join("")}</div>${nudge}` : ""}
        <a class="link" href="shop.html" style="display:inline-block;margin-top:16px">${U.icon("chevR")} متابعة التسوّق</a>
      </div>
      <aside class="summary" aria-label="ملخص السلة">
        <h2>الملخص</h2>
        ${t.hasMeat ? `<div class="sum-line"><span>اللحوم</span><span>${cur(t.meat)}</span></div>` : ""}
        ${t.digital ? `<div class="sum-line"><span>الخدمات الرقمية</span><span>${cur(t.digital)}</span></div>` : ""}
        ${t.hasMeat ? `<div class="sum-line${t.delivery ? "" : " is-free"}"><span>التوصيل</span><span>${t.delivery ? cur(t.delivery) : "مجاني"}</span></div>` : ""}
        <div class="sum-total"><b>الإجمالي</b><strong>${cur(t.total)}</strong></div>
        <p class="sum-vat">شامل ضريبة القيمة المضافة (${cur(t.vat)}). كود الخصم في الخطوة التالية.</p>
        <a class="btn btn--brand btn--lg btn--block desk-cta" href="checkout.html" style="margin-top:14px">إتمام الطلب</a>
      </aside>
    </div>`;
    if (bar) { bar.hidden = false; $("#abTotal").textContent = cur(t.total); }
    document.body.classList.add("has-actionbar");
  }

  root.addEventListener("click", e => {
    const q = e.target.closest("[data-q]");
    if (q) { const l = S.cart.get().find(x => x.key === q.dataset.q); if (l) S.cart.setQty(l.key, l.qty + parseInt(q.dataset.d, 10)); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { S.cart.remove(rm.dataset.rm); A.toast("أُزيل من السلة", { icon: "trash" }); return; }
    const up = e.target.closest("[data-up]");
    if (up) { S.cart.addGuide(up.dataset.up); A.toast("أُضيف الدليل", { icon: "video" }); }
  });
  S.on("cart", render); S.on("auth", render);
  render();
})();
