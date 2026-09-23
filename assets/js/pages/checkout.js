/* إتمام الطلب: التواصل ← العنوان ← الموعد ← الدفع ← الكود، والملخص فاتورة حرارية */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const L = D.L || (ar => ar);
  const root = $("#coRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;
  const here = "checkout.html";
  let coupon = null, slot = null, pay = null, addrId = null;

  function summary(ls) {
    const t = S.cart.totals(ls, coupon);
    return U.receipt({
      cls: "receipt--compact", kicker: L("ملخص الطلب", "Order summary"),
      lines: ls.map(U.lineForReceipt).filter(Boolean),
      totals: [
        [L("اللحم", "Meat"), U.money2(t.meat)],
        t.discount ? [L("خصم ", "Discount ") + U.esc(t.coupon), "−" + U.money2(t.discount), "is-disc"] : null,
        t.services ? [L("الخدمات", "Services"), U.money2(t.services)] : null,
        t.extras ? [L("عدّة الشواء", "BBQ kit"), U.money2(t.extras)] : null,
        [L("التوصيل", "Delivery"), t.delivery ? U.money2(t.delivery) : L("مجاني", "Free")],
        [L("الإجمالي", "Total"), U.money2(t.total), "is-total"],
        [L("منها ضريبة 15٪", "Incl. 15% VAT"), U.money2(t.vat), "is-muted"]
      ].filter(Boolean)
    }) + `<button class="btn btn--ember btn--lg btn--block desk-cta" type="button" data-place>${L("تأكيد الطلب", "Place order")} · <span class="num">${cur(t.total)}</span></button>`;
  }
  function contactSec() {
    const u = S.user.get();
    if (!u) return `<div class="card login-card">${U.icon("user", "big", 1.6)}<b>${L("سجّل دخولك برقم جوالك", "Sign in with your mobile number")}</b><p>${L("نستخدمه لتأكيد الطلب والتواصل بخصوص التوصيل.", "We use it to confirm your order and contact you about delivery.")}</p><a class="btn btn--ember" href="login.html?next=${encodeURIComponent(here)}">${L("تسجيل الدخول", "Sign in")}</a></div>`;
    return `<div class="group">${U.cell({ icon: "user", title: U.esc(u.name || L("بدون اسم", "No name")), sub: S.fmtPhone(u.phone) })}</div>`;
  }
  function addrSec() {
    const list = S.addr.list();
    if (!list.length) return `<button class="btn btn--line btn--block btn--lg" type="button" data-addr-new>${U.icon("plus")}${L("أضف عنوان التوصيل", "Add a delivery address")}</button>`;
    if (!addrId || !list.find(a => a.id === addrId)) addrId = (S.addr.def() || list[0]).id;
    return `<div class="addr-pick">${list.map(a => `<label class="radio-card"><input type="radio" name="addr" value="${a.id}"${a.id === addrId ? " checked" : ""}><span class="radio-card__b"><b>${U.esc(A.addrLabel(a.label))}${a.isDefault ? ` <span class="pill">${L("الافتراضي", "Default")}</span>` : ""}</b><small>${U.esc(A.addrLine(a))}</small></span><button class="icon-btn" type="button" data-addr-edit="${a.id}" aria-label="${L("تعديل", "Edit")}">${U.icon("edit")}</button></label>`).join("")}
      <button class="btn btn--ghost btn--sm" type="button" data-addr-new>${U.icon("plus")}${L("عنوان جديد", "New address")}</button></div>`;
  }

  function render() {
    const ls = S.cart.get();
    if (!ls.length) {
      root.innerHTML = U.empty("cart", L("ما فيه شي نطلبه", "Nothing to order yet"), L("سلتك فاضية.", "Your cart is empty."), `<a class="btn btn--ember" href="advisor.html">${L("خطّط مع المستشار", "Plan with the advisor")}</a>`);
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    const t = S.cart.totals(ls, coupon);
    let n = 0;
    const sec = (title, body) => `<section class="co-sec"><h2 class="co-sec__h"><span class="num">0${++n}</span>${title}</h2>${body}</section>`;
    root.innerHTML = `<ol class="co-steps" id="coSteps"></ol><div class="co">
      <div class="co__main">
        ${sec(L("بيانات التواصل", "Contact details"), contactSec())}
        ${sec(L("عنوان التوصيل", "Delivery address"), `<div id="addrBox">${addrSec()}</div>`)}
        ${sec(L("موعد التوصيل", "Delivery time"), `<div class="card"><div class="days" id="days" role="radiogroup" aria-label="${L("اليوم", "Day")}"></div><div class="times" id="times" role="radiogroup" aria-label="${L("الفترة", "Time slot")}"></div></div>`)}
        ${sec(L("طريقة الدفع", "Payment method"), `<div id="payBox"></div>`)}
        ${sec(L("كود الخصم", "Discount code"), `<div class="coupon"><input class="input" id="coupon" placeholder="${L("أدخل الكود", "Enter code")}" autocomplete="off" value="${U.esc(coupon || "")}" dir="ltr"><button class="btn btn--line" type="button" id="applyC">${coupon ? L("إزالة", "Remove") : L("تطبيق", "Apply")}</button></div>`)}
      </div>
      <aside class="co__sum" id="sumBox" aria-label="${L("ملخص الطلب", "Order summary")}">${summary(ls)}</aside>
    </div>`;
    const prev = pay && pay.value();
    pay = A.payMethods($("#payBox"), { cod: true });
    if (prev) { const r = $(`#payBox input[value="${prev}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); } }
    const picker = A.slotPicker($("#days"), $("#times"), { onChange: s => { slot = s; } });
    slot = picker.get();
    if (bar) { bar.hidden = false; $("#abTotal").textContent = cur(t.total); }
    steps();
  }
  /* المرحلة الحالية تتحدث مع إكمال البيانات */
  function steps() {
    const el = $("#coSteps"); if (!el) return;
    const ready = !!(S.user.get() && S.addr.get(addrId) && slot);
    const list = [[L("السلة", "Cart"), 1], [L("البيانات والتوصيل", "Details & delivery"), ready ? 1 : 2], [L("الدفع", "Payment"), ready ? 2 : 0], [L("الفاتورة", "Receipt"), 0]];
    el.innerHTML = list.map((x, i) => `<li class="${x[1] === 1 ? "done" : x[1] === 2 ? "now" : ""}"><b>${x[1] === 1 ? U.icon("check", "", 2.6) : i + 1}</b><span>${x[0]}</span></li>`).join("");
  }
  function refreshSummary() {
    const ls = S.cart.get(); const t = S.cart.totals(ls, coupon);
    $("#sumBox").innerHTML = summary(ls);
    if (bar) $("#abTotal").textContent = cur(t.total);
  }

  root.addEventListener("change", e => { if (e.target.name === "addr") addrId = e.target.value; steps(); });
  root.addEventListener("click", () => setTimeout(steps, 0));
  root.addEventListener("click", e => {
    if (e.target.closest("[data-addr-new]")) { A.addressSheet(null, a => { addrId = a.id; $("#addrBox").innerHTML = addrSec(); }); return; }
    const ed = e.target.closest("[data-addr-edit]");
    if (ed) { e.preventDefault(); A.addressSheet(S.addr.get(ed.dataset.addrEdit), a => { addrId = a.id; $("#addrBox").innerHTML = addrSec(); }); return; }
    if (e.target.closest("#applyC")) {
      if (coupon) { coupon = null; $("#coupon").value = ""; $("#applyC").textContent = L("تطبيق", "Apply"); refreshSummary(); return; }
      const code = ($("#coupon").value || "").trim().toUpperCase();
      if (!code) return;
      if (C.coupons[code]) { coupon = code; $("#applyC").textContent = L("إزالة", "Remove"); A.toast(L("طُبّق الكود: ", "Code applied: ") + C.coupons[code].label, { icon: "tag" }); }
      else { $("#coupon").classList.add("is-err"); A.toast(L("الكود غير صحيح", "That code isn't valid"), { icon: "info" }); setTimeout(() => $("#coupon").classList.remove("is-err"), 1600); }
      refreshSummary(); return;
    }
    const pl = e.target.closest("[data-place]"); if (pl) place(pl);
  });
  if ($("#abPlace")) $("#abPlace").addEventListener("click", e => place(e.currentTarget));

  async function place(btn) {
    const ls = S.cart.get(); if (!ls.length) return;
    if (!S.user.get()) { A.requireLogin(here); return; }
    const address = S.addr.get(addrId);
    if (!address) { A.toast(L("أضف عنوان التوصيل", "Add a delivery address"), { icon: "pin" }); $("#addrBox").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!slot) { A.toast(L("اختر موعد التوصيل", "Choose a delivery time"), { icon: "calendar" }); return; }
    if (!pay.valid()) { A.toast(L("أكمل بيانات البطاقة", "Complete your card details"), { icon: "info" }); return; }
    await A.busy(btn, 1200);
    const o = S.orders.create({ lines: ls, coupon, address, slot, payment: { k: pay.value(), n: pay.label() } });
    S.cart.clear();
    location.replace("order.html?id=" + encodeURIComponent(o.id) + "&new=1");
  }

  S.on("addr", () => { const b = $("#addrBox"); if (b) b.innerHTML = addrSec(); steps(); });
  S.on("auth", render);
  render();
})();
