/* الفاتورة المطبوعة + حالة الطلب + الإلغاء وإعادة الطلب والطباعة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const root = $("#orderRoot"); if (!root) return;
  const q = new URLSearchParams(location.search);
  const isNew = q.get("new") === "1";
  const STEPS = D.ORDER_STEPS;
  const L = D.L || (ar => ar), C = D.CONFIG;

  function render() {
    const o = S.orders.get(q.get("id"));
    if (!o) { root.innerHTML = U.empty("receipt", L("ما لقينا هذي الفاتورة", "We couldn't find this receipt"), L("يمكن الرابط قديم أو الطلب محفوظ على جهاز ثاني.", "The link may be old, or the order was saved on another device."), `<a class="btn btn--ember" href="account.html?s=orders">${L("طلباتي", "My orders")}</a>`); return; }
    const t = o.totals, cancelled = o.status === "cancelled";
    const cod = o.payment && (o.payment.k === "cod" || o.payment === "الدفع عند الاستلام");
    /* الاسم من الإعدادات بلغة الصفحة، والمحفوظ مع الطلب احتياط */
    const payName = typeof o.payment === "string" ? o.payment : (o.payment && ((C.payments || []).find(x => x.k === o.payment.k) || {}).n) || (o.payment && o.payment.n) || "";
    const win = o.slot ? (C.windows || []).find(w => w.h === o.slot.h) : null;
    const slotTxt = o.slot ? (o.slot.date ? U.fmtDate(o.slot.date, { weekday: "long", day: "numeric", month: "long", year: undefined }) : o.slot.dateLabel) + " · " + (win ? win.l : o.slot.time) : "—";
    const lines = o.items.map(it => U.lineForReceipt(Object.assign({}, it, { base: it.base, adds: it.adds }))).filter(Boolean);
    const rc = U.receipt({
      cls: "receipt--order" + (isNew ? " is-printing" : "") + (cancelled ? " is-void" : ""),
      kicker: L("فاتورة ضريبية مبسّطة", "Simplified tax invoice"),
      meta: [[L("رقم الطلب", "Order no."), `<span class="num">${U.esc(o.id)}</span>`], [L("التاريخ", "Date"), U.fmtDate(o.date, { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + U.fmtTime(o.date)],
        [L("التوصيل", "Delivery"), U.esc(slotTxt)], [L("الدفع", "Payment"), U.esc(payName)], [L("الرقم الضريبي", "VAT no."), U.esc(D.CONFIG.contact.vatNo)]],
      lines,
      totals: [
        [L("اللحم", "Meat"), U.money2(t.meat)],
        t.discount ? [L("خصم ", "Discount ") + U.esc(t.coupon || ""), "−" + U.money2(t.discount), "is-disc"] : null,
        t.services ? [L("الخدمات", "Services"), U.money2(t.services)] : null,
        t.extras ? [L("عدّة الشواء", "BBQ kit"), U.money2(t.extras)] : null,
        [L("التوصيل", "Delivery"), t.delivery ? U.money2(t.delivery) : L("مجاني", "Free")],
        [L("الإجمالي", "Total"), U.money2(t.total), "is-total"],
        [L("منها ضريبة 15٪", "Incl. 15% VAT"), U.money2(t.vat), "is-muted"]
      ].filter(Boolean),
      code: o.id,
      stamp: cancelled ? L("ملغي", "Void") : cod ? L("الدفع عند الاستلام", "Cash on delivery") : L("مدفوع", "Paid"),
      foot: L("شكراً لك — نقطّعها لك على طبختك.", "Thank you — we cut it for your dish.")
    });
    const cur = cancelled ? -1 : Math.max(0, STEPS.findIndex(s => s.k === o.status));
    const when = k => { const e = (o.log || []).filter(x => x.s === k).pop(); return e ? U.fmtTime(e.t) : k === "placed" ? U.fmtTime(o.date) : ""; };
    const a = o.address;
    root.innerHTML = `${isNew && !cancelled ? `<div class="order-hero"><span class="order-hero__tick">${U.icon("check", "", 2.6)}</span><div><h1>${L("طُبعت فاتورتك", "Your receipt is printed")}</h1><p>${L("وصلنا طلبك وبنبدأ التقطيع قبل موعد التوصيل.", "We've got your order and will start cutting before your delivery slot.")} ${D.CONFIG.demo ? `<small>${L("(نسخة تجريبية: لم يُخصم أي مبلغ)", "(Demo version: nothing was charged)")}</small>` : ""}</p></div></div>` : `<div class="page-head"><h1 class="large-title">${L("الفاتورة", "Receipt")}</h1></div>`}
      <div class="order">
        <div class="order__rc"><div class="printer" aria-hidden="true"><span></span></div>${rc}</div>
        <aside class="order__side">
          <div class="card track"><h2>${L("حالة الطلب", "Order status")}</h2>${cancelled ? `<p class="track__void">${U.icon("x", "", 2.4)}${L("أُلغي هذا الطلب", "This order was cancelled")}</p>` : `<span class="track__now">${U.icon(STEPS[cur].ic, "", 2)}${U.esc(STEPS[cur].n)} · ${cur + 1}/${STEPS.length}</span><ol>${STEPS.map((s, i) => `<li class="${i < cur || (i === cur && s.k === "done") ? "done" : i === cur ? "now" : ""}"><span>${U.icon(i < cur ? "check" : s.ic)}</span><b>${U.esc(s.n)}</b><small class="num">${i <= cur ? when(s.k) : s.k === "onway" && o.slot ? U.esc(win ? win.l : o.slot.time) : ""}</small><p>${U.esc(s.d)}</p></li>`).join("")}</ol>`}</div>
          ${a ? `<div class="card"><h2>${U.icon("pin")}${L("التوصيل إلى", "Deliver to")}</h2><p><b>${U.esc(A.addrLabel(a.label))}</b><br>${U.esc(A.addrLine(a))}${a.notes ? `<br><small class="muted">${U.esc(a.notes)}</small>` : ""}</p></div>` : ""}
          <div class="row-btns row-btns--col">
            <button type="button" class="btn btn--ember" data-reorder>${U.icon("refresh")}${L("اطلبها مرة ثانية", "Order it again")}</button>
            <button type="button" class="btn btn--line" data-print>${U.icon("receipt")}${L("اطبع الفاتورة", "Print receipt")}</button>
            ${o.status === "placed" ? `<button type="button" class="btn btn--ghost btn--danger-t" data-cancel>${L("إلغاء الطلب", "Cancel order")}</button>` : ""}
          </div>
        </aside>
      </div>`;
    if (isNew) try { history.replaceState(null, "", "order.html?id=" + encodeURIComponent(o.id)); } catch (e) { }
  }
  root.addEventListener("click", async e => {
    const o = S.orders.get(q.get("id")); if (!o) return;
    if (e.target.closest("[data-print]")) { window.print(); return; }
    if (e.target.closest("[data-reorder]")) {
      let n = 0; o.items.forEach(it => { if (D.byId(it.id) && S.cart.add(it.id, { kg: it.kg, qty: it.qty, opts: it.opts, note: it.note })) n++; });
      A.bump(); A.toast(L("أُضيف " + n + " أسطر للسلة", n + " lines added to cart"), { icon: "cart", action: { label: L("السلة", "Cart"), href: "cart.html" } }); return;
    }
    if (e.target.closest("[data-cancel]")) {
      const ok = await A.confirmSheet({ title: L("إلغاء الطلب؟", "Cancel this order?"), text: L("سيُلغى الطلب " + o.id + " قبل بدء التقطيع.", "Order " + o.id + " will be cancelled before cutting starts."), ok: L("نعم، ألغِ الطلب", "Yes, cancel it"), cancel: L("تراجع", "Keep it"), danger: true });
      if (ok && S.orders.cancel(o.id)) { A.toast(L("أُلغي الطلب", "Order cancelled"), { icon: "x" }); render(); }
    }
  });
  render();
})();
