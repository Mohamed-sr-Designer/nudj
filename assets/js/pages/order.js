/* الفاتورة المطبوعة + حالة الطلب + الإلغاء وإعادة الطلب والطباعة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const root = $("#orderRoot"); if (!root) return;
  const q = new URLSearchParams(location.search);
  const isNew = q.get("new") === "1";
  const STEPS = [["placed", "استلمنا الطلب", "receipt"], ["cutting", "على طاولة الجزّار", "knife"], ["onway", "في الطريق إليك", "truck"], ["done", "وصل", "check"]];

  function render() {
    const o = S.orders.get(q.get("id"));
    if (!o) { root.innerHTML = U.empty("receipt", "ما لقينا هذي الفاتورة", "يمكن الرابط قديم أو الطلب محفوظ على جهاز ثاني.", `<a class="btn btn--ember" href="account.html?s=orders">طلباتي</a>`); return; }
    const t = o.totals, cancelled = o.status === "cancelled";
    const cod = o.payment && (o.payment.k === "cod" || o.payment === "الدفع عند الاستلام");
    const payName = typeof o.payment === "string" ? o.payment : (o.payment && o.payment.n) || "";
    const lines = o.items.map(it => U.lineForReceipt(Object.assign({}, it, { base: it.base, adds: it.adds }))).filter(Boolean);
    const rc = U.receipt({
      cls: "receipt--order" + (isNew ? " is-printing" : "") + (cancelled ? " is-void" : ""),
      kicker: "فاتورة ضريبية مبسّطة",
      meta: [["رقم الطلب", `<span class="num">${U.esc(o.id)}</span>`], ["التاريخ", U.fmtDate(o.date, { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + U.fmtTime(o.date)],
        ["التوصيل", o.slot ? U.esc(o.slot.dateLabel + " · " + o.slot.time) : "—"], ["الدفع", U.esc(payName)], ["الرقم الضريبي", D.CONFIG.contact.vatNo]],
      lines,
      totals: [
        ["اللحم", U.money2(t.meat)],
        t.discount ? ["خصم " + U.esc(t.coupon || ""), "−" + U.money2(t.discount), "is-disc"] : null,
        t.services ? ["الخدمات", U.money2(t.services)] : null,
        t.extras ? ["عدّة الشواء", U.money2(t.extras)] : null,
        ["التوصيل", t.delivery ? U.money2(t.delivery) : "مجاني"],
        ["الإجمالي", U.money2(t.total), "is-total"],
        ["منها ضريبة 15٪", U.money2(t.vat), "is-muted"]
      ].filter(Boolean),
      code: o.id,
      stamp: cancelled ? "ملغي" : cod ? "الدفع عند الاستلام" : "مدفوع",
      foot: "شكراً لك — نقطّعها لك على طبختك."
    });
    const cur = cancelled ? -1 : 0;
    const a = o.address;
    root.innerHTML = `${isNew && !cancelled ? `<div class="order-hero"><span class="order-hero__tick">${U.icon("check", "", 2.6)}</span><div><h1>طُبعت فاتورتك</h1><p>وصلنا طلبك وبنبدأ التقطيع قبل موعد التوصيل. ${D.CONFIG.demo ? "<small>(نسخة تجريبية: لم يُخصم أي مبلغ)</small>" : ""}</p></div></div>` : `<div class="page-head"><h1 class="large-title">الفاتورة</h1></div>`}
      <div class="order">
        <div class="order__rc"><div class="printer" aria-hidden="true"><span></span></div>${rc}</div>
        <aside class="order__side">
          <div class="card track"><h2>حالة الطلب</h2>${cancelled ? `<p class="track__void">${U.icon("x", "", 2.4)}أُلغي هذا الطلب</p>` : `<ol>${STEPS.map((s, i) => `<li class="${i < cur ? "done" : i === cur ? "now" : ""}"><span>${U.icon(s[2])}</span><b>${s[1]}</b>${i === 0 ? `<small>${U.fmtTime(o.date)}</small>` : i === 2 && o.slot ? `<small>${U.esc(o.slot.time)}</small>` : ""}</li>`).join("")}</ol>`}</div>
          ${a ? `<div class="card"><h2>${U.icon("pin")}التوصيل إلى</h2><p><b>${U.esc(a.label)}</b><br>${U.esc(A.addrLine(a))}${a.notes ? `<br><small class="muted">${U.esc(a.notes)}</small>` : ""}</p></div>` : ""}
          <div class="row-btns row-btns--col">
            <button type="button" class="btn btn--ember" data-reorder>${U.icon("refresh")}اطلبها مرة ثانية</button>
            <button type="button" class="btn btn--line" data-print>${U.icon("receipt")}اطبع الفاتورة</button>
            ${o.status === "placed" ? `<button type="button" class="btn btn--ghost btn--danger-t" data-cancel>إلغاء الطلب</button>` : ""}
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
      A.bump(); A.toast("أُضيف " + n + " أسطر للسلة", { icon: "cart", action: { label: "السلة", href: "cart.html" } }); return;
    }
    if (e.target.closest("[data-cancel]")) {
      const ok = await A.confirmSheet({ title: "إلغاء الطلب؟", text: "سيُلغى الطلب " + o.id + " قبل بدء التقطيع.", ok: "نعم، ألغِ الطلب", cancel: "تراجع", danger: true });
      if (ok && S.orders.cancel(o.id)) { A.toast("أُلغي الطلب", { icon: "x" }); render(); }
    }
  });
  render();
})();
