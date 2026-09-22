/* إتمام الطلب: التواصل ← العنوان ← الموعد ← الدفع ← الكود، والملخص فاتورة حرارية */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const root = $("#coRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;
  const here = "checkout.html";
  let coupon = null, slot = null, pay = null, addrId = null;

  function summary(ls) {
    const t = S.cart.totals(ls, coupon);
    return U.receipt({
      cls: "receipt--compact", kicker: "ملخص الطلب",
      lines: ls.map(U.lineForReceipt).filter(Boolean),
      totals: [
        ["اللحم", U.money2(t.meat)],
        t.discount ? ["خصم " + U.esc(t.coupon), "−" + U.money2(t.discount), "is-disc"] : null,
        t.services ? ["الخدمات", U.money2(t.services)] : null,
        t.extras ? ["عدّة الشواء", U.money2(t.extras)] : null,
        ["التوصيل", t.delivery ? U.money2(t.delivery) : "مجاني"],
        ["الإجمالي", U.money2(t.total), "is-total"],
        ["منها ضريبة 15٪", U.money2(t.vat), "is-muted"]
      ].filter(Boolean)
    }) + `<button class="btn btn--ember btn--lg btn--block desk-cta" type="button" data-place>تأكيد الطلب · <span class="num">${cur(t.total)}</span></button>`;
  }
  function contactSec() {
    const u = S.user.get();
    if (!u) return `<div class="card login-card">${U.icon("user", "big", 1.6)}<b>سجّل دخولك برقم جوالك</b><p>نستخدمه لتأكيد الطلب والتواصل بخصوص التوصيل.</p><a class="btn btn--ember" href="login.html?next=${encodeURIComponent(here)}">تسجيل الدخول</a></div>`;
    return `<div class="group">${U.cell({ icon: "user", title: U.esc(u.name || "بدون اسم"), sub: S.fmtPhone(u.phone) })}</div>`;
  }
  function addrSec() {
    const list = S.addr.list();
    if (!list.length) return `<button class="btn btn--line btn--block btn--lg" type="button" data-addr-new>${U.icon("plus")}أضف عنوان التوصيل</button>`;
    if (!addrId || !list.find(a => a.id === addrId)) addrId = (S.addr.def() || list[0]).id;
    return `<div class="addr-pick">${list.map(a => `<label class="radio-card"><input type="radio" name="addr" value="${a.id}"${a.id === addrId ? " checked" : ""}><span class="radio-card__b"><b>${U.esc(a.label)}${a.isDefault ? ' <span class="pill">الافتراضي</span>' : ""}</b><small>${U.esc(A.addrLine(a))}</small></span><button class="icon-btn" type="button" data-addr-edit="${a.id}" aria-label="تعديل">${U.icon("edit")}</button></label>`).join("")}
      <button class="btn btn--ghost btn--sm" type="button" data-addr-new>${U.icon("plus")}عنوان جديد</button></div>`;
  }

  function render() {
    const ls = S.cart.get();
    if (!ls.length) {
      root.innerHTML = U.empty("cart", "ما فيه شي نطلبه", "سلتك فاضية.", `<a class="btn btn--ember" href="advisor.html">خطّط مع المستشار</a>`);
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    const t = S.cart.totals(ls, coupon);
    let n = 0;
    const sec = (title, body) => `<section class="co-sec"><h2 class="co-sec__h"><span class="num">0${++n}</span>${title}</h2>${body}</section>`;
    root.innerHTML = `<div class="co">
      <div class="co__main">
        ${sec("بيانات التواصل", contactSec())}
        ${sec("عنوان التوصيل", `<div id="addrBox">${addrSec()}</div>`)}
        ${sec("موعد التوصيل", `<div class="card"><div class="days" id="days" role="radiogroup" aria-label="اليوم"></div><div class="times" id="times" role="radiogroup" aria-label="الفترة"></div></div>`)}
        ${sec("طريقة الدفع", `<div id="payBox"></div>`)}
        ${sec("كود الخصم", `<div class="coupon"><input class="input" id="coupon" placeholder="أدخل الكود" autocomplete="off" value="${U.esc(coupon || "")}" dir="ltr"><button class="btn btn--line" type="button" id="applyC">${coupon ? "إزالة" : "تطبيق"}</button></div>`)}
      </div>
      <aside class="co__sum" id="sumBox" aria-label="ملخص الطلب">${summary(ls)}</aside>
    </div>`;
    const prev = pay && pay.value();
    pay = A.payMethods($("#payBox"), { cod: true });
    if (prev) { const r = $(`#payBox input[value="${prev}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); } }
    const picker = A.slotPicker($("#days"), $("#times"), { onChange: s => { slot = s; } });
    slot = picker.get();
    if (bar) { bar.hidden = false; $("#abTotal").textContent = cur(t.total); }
  }
  function refreshSummary() {
    const ls = S.cart.get(); const t = S.cart.totals(ls, coupon);
    $("#sumBox").innerHTML = summary(ls);
    if (bar) $("#abTotal").textContent = cur(t.total);
  }

  root.addEventListener("change", e => { if (e.target.name === "addr") addrId = e.target.value; });
  root.addEventListener("click", e => {
    if (e.target.closest("[data-addr-new]")) { A.addressSheet(null, a => { addrId = a.id; $("#addrBox").innerHTML = addrSec(); }); return; }
    const ed = e.target.closest("[data-addr-edit]");
    if (ed) { e.preventDefault(); A.addressSheet(S.addr.get(ed.dataset.addrEdit), a => { addrId = a.id; $("#addrBox").innerHTML = addrSec(); }); return; }
    if (e.target.closest("#applyC")) {
      if (coupon) { coupon = null; $("#coupon").value = ""; $("#applyC").textContent = "تطبيق"; refreshSummary(); return; }
      const code = ($("#coupon").value || "").trim().toUpperCase();
      if (!code) return;
      if (C.coupons[code]) { coupon = code; $("#applyC").textContent = "إزالة"; A.toast("طُبّق الكود: " + C.coupons[code].label, { icon: "tag" }); }
      else { $("#coupon").classList.add("is-err"); A.toast("الكود غير صحيح", { icon: "info" }); setTimeout(() => $("#coupon").classList.remove("is-err"), 1600); }
      refreshSummary(); return;
    }
    const pl = e.target.closest("[data-place]"); if (pl) place(pl);
  });
  if ($("#abPlace")) $("#abPlace").addEventListener("click", e => place(e.currentTarget));

  async function place(btn) {
    const ls = S.cart.get(); if (!ls.length) return;
    if (!S.user.get()) { A.requireLogin(here); return; }
    const address = S.addr.get(addrId);
    if (!address) { A.toast("أضف عنوان التوصيل", { icon: "pin" }); $("#addrBox").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!slot) { A.toast("اختر موعد التوصيل", { icon: "calendar" }); return; }
    if (!pay.valid()) { A.toast("أكمل بيانات البطاقة", { icon: "info" }); return; }
    await A.busy(btn, 1200);
    const o = S.orders.create({ lines: ls, coupon, address, slot, payment: { k: pay.value(), n: pay.label() } });
    S.cart.clear();
    location.replace("order.html?id=" + encodeURIComponent(o.id) + "&new=1");
  }

  S.on("addr", () => { const b = $("#addrBox"); if (b) b.innerHTML = addrSec(); });
  S.on("auth", render);
  render();
})();
