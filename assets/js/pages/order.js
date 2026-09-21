/* تفاصيل الطلب: تأكيد (new=1) + مراحل الطلب + التوصيل + المحتوى + إعادة الطلب/الإلغاء */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const root = $("#orderRoot"); if (!root) return;
  const q = new URLSearchParams(location.search);
  const cur = n => U.money(n) + " " + C.currency;

  function render() {
    const o = S.orders.get(q.get("id"));
    if (!o) { root.innerHTML = U.empty("search", "ما لقينا هذا الطلب", "تأكد من الرابط أو افتح طلباتك من حسابك.", `<a class="btn btn--brand" href="account.html?s=orders">طلباتي</a>`); return; }
    const isNew = q.get("new") === "1";
    const t = o.totals, meat = o.items.filter(i => i.kind === "meat"), dig = o.items.filter(i => i.kind === "guide");
    const steps = o.status === "cancelled"
      ? [["تم إلغاء الطلب", "لن يُجهّز هذا الطلب", "now"]]
      : t.hasMeat
        ? [["تم استلام الطلب", U.fmtDate(o.date, { hour: "numeric", minute: "2-digit" }), "done"], ["التقطيع والتجهيز", "يبدأ قبل موعد التوصيل", o.status === "placed" ? "now" : "done"],
          ["في الطريق إليك", o.slot ? o.slot.dateLabel + " · " + o.slot.time : "", ""], ["تم التوصيل", "", ""]]
        : [["تم الدفع", U.fmtDate(o.date, { hour: "numeric", minute: "2-digit" }), "done"], ["الأدلة متاحة في حسابك", "افتحها من هنا أو من «أدلتي»", "done"]];
    root.innerHTML = `
      ${isNew ? `<div class="order-hero"><div class="tick">${U.icon("check", "", 2.6)}</div><h1>${t.hasMeat ? "تم استلام طلبك" : "تم الدفع — أدلتك جاهزة"}</h1>
        <p>${t.hasMeat ? "بنرسل لك رسالة عند كل مرحلة." : "افتح الأدلة الآن أو من «أدلتي» في حسابك متى ما بغيت."}</p><div class="order-no">${U.icon("doc")}${o.id}</div></div>`
        : `<div class="page-head"><h1 class="large-title">طلب ${o.id}</h1><p>${U.fmtDate(o.date)}</p></div>`}
      <div class="co">
        <div>
          ${dig.length ? `<h2 class="group__head">أدلتك</h2><div class="rows">${dig.map(i => { const g = D.guideById(i.id); return `<a class="prow" href="${g.href}"><span class="gcard__ic">${U.icon("video")}</span><span class="prow__b"><b>${U.esc(g.title)}</b><small>متاح لك الآن</small></span>${U.ownPill("افتح")}</a>`; }).join("")}</div>` : ""}
          <h2 class="group__head">حالة الطلب</h2>
          <div class="card"><div class="timeline">${steps.map(s => `<div class="tl${s[2] === "done" ? " is-done" : s[2] === "now" ? " is-now" : ""}"><span class="tl__dot">${s[2] === "done" ? U.icon("check", "", 3) : ""}</span><span class="tl__b"><b>${s[0]}</b>${s[1] ? `<small>${U.esc(s[1])}</small>` : ""}</span></div>`).join("")}</div></div>
          ${o.address ? `<h2 class="group__head">التوصيل</h2><div class="card"><dl class="kv"><div><dt>العنوان</dt><dd>${U.esc(o.address.label)} — ${U.esc(A.addrLine(o.address))}</dd></div><div><dt>الموعد</dt><dd>${U.esc(o.slot.dateLabel)} · ${U.esc(o.slot.time)}</dd></div>${o.address.notes ? `<div><dt>ملاحظات</dt><dd>${U.esc(o.address.notes)}</dd></div>` : ""}</dl></div>` : ""}
          ${meat.length ? `<h2 class="group__head">اللحوم</h2><div class="rows">${meat.map(i => { const p = D.byId(i.id); return `<a class="prow" href="${U.url.product(i.id)}">${p ? U.productImg(p, "prow__img") : ""}<span class="prow__b"><b>${U.esc(i.name)} × ${i.qty}</b><small>${U.esc(U.optsText(i))}${i.note ? " · «" + U.esc(i.note) + "»" : ""}</small></span><span class="prow__p num">${cur(i.price)}</span></a>`; }).join("")}</div>` : ""}
        </div>
        <aside class="summary">
          <h2>الفاتورة</h2>
          ${t.hasMeat ? `<div class="sum-line"><span>اللحوم</span><span>${cur(t.meat)}</span></div>` : ""}
          ${t.discount ? `<div class="sum-line is-disc"><span>خصم (${U.esc(t.coupon)})</span><span>−${cur(t.discount)}</span></div>` : ""}
          ${t.digital ? `<div class="sum-line"><span>الخدمات الرقمية</span><span>${cur(t.digital)}</span></div>` : ""}
          ${t.hasMeat ? `<div class="sum-line${t.delivery ? "" : " is-free"}"><span>التوصيل</span><span>${t.delivery ? cur(t.delivery) : "مجاني"}</span></div>` : ""}
          <div class="sum-total"><b>الإجمالي</b><strong>${cur(t.total)}</strong></div>
          <p class="sum-vat">شامل ضريبة القيمة المضافة (${cur(t.vat)}) · الدفع: ${U.esc(o.payment || "")}</p>
          <div style="display:grid;gap:8px;margin-top:14px">
            ${meat.length ? `<button class="btn btn--brand btn--block" type="button" id="reorder">${U.icon("refresh")}اطلب نفس الطلب مرة ثانية</button>` : ""}
            ${o.status === "placed" ? `<button class="btn btn--ghost btn--block" type="button" id="cancelO">إلغاء الطلب</button>` : ""}
            <a class="btn btn--ghost btn--block" href="contact.html">تحتاج مساعدة؟ تواصل معنا</a>
          </div>
        </aside>
      </div>`;
    const ro = $("#reorder");
    if (ro) ro.addEventListener("click", () => {
      meat.forEach(i => { if (D.byId(i.id)) S.cart.addMeat(i.id, i.opts, i.qty, i.note); });
      A.bump(); A.toast("أُضيفت المنتجات للسلة", { action: { label: "عرض السلة", href: "cart.html" } });
    });
    const co = $("#cancelO");
    if (co) co.addEventListener("click", async () => {
      const ok = await A.confirmSheet({ title: "إلغاء الطلب؟", text: "سيُلغى الطلب قبل تجهيزه. الأدلة الرقمية المشتراة تبقى في حسابك.", ok: "نعم، ألغِ الطلب", cancel: "تراجع", danger: true });
      if (!ok) return;
      if (S.orders.cancel(o.id)) { A.toast("أُلغي الطلب", { icon: "info" }); render(); }
    });
    if (isNew) try { history.replaceState(null, "", "order.html?id=" + encodeURIComponent(o.id)); } catch (e) { }
  }
  render();
})();
