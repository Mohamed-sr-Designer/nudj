/* إتمام الطلب — يتكيّف مع المحتوى: طلب لحم (عنوان + موعد + دفع) أو رقمي فقط (دفع فقط)
   checkout.html?buy=guide:ID = شراء سريع لدليل واحد دون المرور بالسلة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const root = $("#coRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;
  const here = "checkout.html" + location.search;

  const buy = new URLSearchParams(location.search).get("buy");
  const express = buy && buy.indexOf("guide:") === 0 ? buy.slice(6) : null;
  let coupon = null, slot = null, pay = null, addrId = null;

  function lines() {
    if (express) return D.guideById(express) ? [{ key: "guide:" + express, kind: "guide", id: express }] : [];
    return S.cart.get();
  }

  function itemsHTML(ls) {
    return ls.map(l => {
      if (l.kind === "guide") { const g = D.guideById(l.id); return `<div class="co-item co-item--dg"><div class="co-item__img">${U.icon("video")}</div><div class="co-item__b"><b>${U.esc(g.title)}</b><small>دليل مصوّر · رقمي</small></div><span class="co-item__p">${cur(C.guidePrice)}</span></div>`; }
      const p = D.byId(l.id);
      return `<div class="co-item">${U.productImg(p, "co-item__img")}<div class="co-item__b"><b>${U.esc(p.name)} × ${l.qty}</b><small>${U.esc(U.optsText(l))}</small></div><span class="co-item__p">${cur(S.cart.linePrice(l))}</span></div>`;
    }).join("");
  }

  function summary(ls) {
    const t = S.cart.totals(ls, coupon);
    return `<h2>ملخص الطلب</h2><div class="co-items">${itemsHTML(ls)}</div>
      ${t.hasMeat ? `<div class="sum-line"><span>اللحوم</span><span>${cur(t.meat)}</span></div>` : ""}
      ${t.discount ? `<div class="sum-line is-disc"><span>خصم (${U.esc(t.coupon)})</span><span>−${cur(t.discount)}</span></div>` : ""}
      ${t.digital ? `<div class="sum-line"><span>الخدمات الرقمية</span><span>${cur(t.digital)}</span></div>` : ""}
      ${t.hasMeat ? `<div class="sum-line${t.delivery ? "" : " is-free"}"><span>التوصيل</span><span>${t.delivery ? cur(t.delivery) : "مجاني"}</span></div>` : ""}
      <div class="sum-total"><b>الإجمالي</b><strong>${cur(t.total)}</strong></div>
      <p class="sum-vat">شامل ضريبة القيمة المضافة (${cur(t.vat)})</p>
      <button class="btn btn--brand btn--lg btn--block desk-cta" type="button" data-place style="margin-top:14px">تأكيد الطلب</button>`;
  }

  function contactSec() {
    const u = S.user.get();
    if (!u) return `<div class="card login-card" style="margin:0">${U.icon("user", "big", 1.6)}<b>سجّل دخولك برقم جوالك</b><p>نستخدمه لتأكيد الطلب والتواصل بخصوص التوصيل.</p><a class="btn btn--brand" href="login.html?next=${encodeURIComponent(here)}">تسجيل الدخول</a></div>`;
    return `<div class="group">${U.cell({ icon: "user", tone: "soft", title: U.esc(u.name || "بدون اسم"), sub: S.fmtPhone(u.phone) })}</div>`;
  }
  function addrSec() {
    const list = S.addr.list();
    if (!list.length) return `<button class="btn btn--ghost btn--block btn--lg" type="button" data-addr-new>${U.icon("plus")}أضف عنوان التوصيل</button>`;
    if (!addrId || !list.find(a => a.id === addrId)) addrId = (S.addr.def() || list[0]).id;
    return `<div class="addr-pick">${list.map(a => `<label class="radio-card"><input type="radio" name="addr" value="${a.id}"${a.id === addrId ? " checked" : ""}><span class="radio-card__b"><b>${U.esc(a.label)}${a.isDefault ? ' <span class="pill pill--ghost">الافتراضي</span>' : ""}</b><small>${U.esc(A.addrLine(a))}</small></span><button class="citem__x" type="button" data-addr-edit="${a.id}" aria-label="تعديل">${U.icon("edit")}</button></label>`).join("")}
      <button class="btn btn--ghost btn--sm" type="button" data-addr-new style="justify-self:start">${U.icon("plus")}عنوان جديد</button></div>`;
  }

  function render() {
    const ls = lines();
    if (express && S.hasAccess(express)) {
      const g = D.guideById(express);
      root.innerHTML = U.empty("check", "الدليل متاح لك", "اشتريت هذا الدليل أو أنت مشترك في نُضْج+.", `<a class="btn btn--brand" href="${g.href}">افتح الدليل</a>`);
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    if (!ls.length) {
      root.innerHTML = U.empty("cart", "ما فيه شي نطلبه", "سلتك فاضية.", `<a class="btn btn--brand" href="shop.html">تسوّق الآن</a>`);
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    const t = S.cart.totals(ls, coupon);
    let n = 0;
    const sec = (title, body, extra) => `<div class="co-sec"${extra || ""}><div class="co-sec__h"><h2><span class="n">${++n}</span>${title}</h2></div>${body}</div>`;
    root.innerHTML = `<div class="co">
      <div>
        ${!t.hasMeat ? `<p class="digital-note" style="margin-bottom:18px">${U.icon("video")}طلب رقمي — لا يحتاج عنواناً ولا توصيلاً. يُفتح الدليل في حسابك فور الدفع.</p>` : ""}
        ${sec("بيانات التواصل", contactSec())}
        ${t.hasMeat ? sec("عنوان التوصيل", `<div id="addrBox">${addrSec()}</div>`) : ""}
        ${t.hasMeat ? sec("موعد التوصيل", `<div class="card"><div class="days" id="days" role="radiogroup" aria-label="اليوم"></div><div class="times" id="times" role="radiogroup" aria-label="الفترة"></div></div>`) : ""}
        ${sec("طريقة الدفع", `<div id="payBox"></div>`)}
        ${t.hasMeat ? sec("كود الخصم", `<div class="coupon"><input class="input" id="coupon" placeholder="أدخل الكود" autocomplete="off" value="${U.esc(coupon || "")}" dir="ltr"><button class="btn btn--ghost" type="button" id="applyC">${coupon ? "إزالة" : "تطبيق"}</button></div>`) : ""}
      </div>
      <aside class="summary" id="sumBox" aria-label="ملخص الطلب">${summary(ls)}</aside>
    </div>`;
    const prev = pay && pay.value();
    pay = A.payMethods($("#payBox"), { cod: t.hasMeat });
    if (prev) { const r = $(`#payBox input[value="${prev}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); } }
    if (t.hasMeat) {
      const picker = A.slotPicker($("#days"), $("#times"), { onChange: s => { slot = s; } });
      slot = picker.get();
    }
    if (bar) { bar.hidden = false; $("#abTotal").textContent = cur(t.total); }
  }

  function refreshSummary() {
    const ls = lines(); const t = S.cart.totals(ls, coupon);
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
    const ls = lines(); if (!ls.length) return;
    const t = S.cart.totals(ls, coupon);
    if (!S.user.get()) { A.requireLogin(here); return; }
    let address = null;
    if (t.hasMeat) {
      address = S.addr.get(addrId);
      if (!address) { A.toast("أضف عنوان التوصيل", { icon: "pin" }); $("#addrBox").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (!slot) { A.toast("اختر موعد التوصيل", { icon: "calendar" }); return; }
    }
    if (!pay.valid()) { A.toast("أكمل بيانات البطاقة", { icon: "info" }); return; }
    await A.busy(btn, 1200);
    const o = S.orders.create({ lines: ls, coupon, address, slot, payment: pay.label() });
    if (!express) S.cart.clear();
    location.replace("order.html?id=" + encodeURIComponent(o.id) + "&new=1");
  }

  S.on("addr", () => { const b = $("#addrBox"); if (b) b.innerHTML = addrSec(); });
  S.on("auth", render);
  render();
})();
