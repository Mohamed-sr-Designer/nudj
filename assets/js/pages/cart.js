/* السلة = فاتورة حرارية حيّة: عدّل الوزن، الخدمات، واسمع ملاحظات المستشار */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI, ADV = window.NUDJ_ADVISOR;
  const { $ } = A;
  const C = D.CONFIG;
  const L = D.L || (ar => ar);
  const root = $("#cartRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;

  function lineTools(l) {
    const p = D.byId(l.id);
    const val = p.sold === "kg" ? U.kgTxt(l.kg) : l.qty + " " + (p.sold === "carcass" ? L("ذبيحة", "carcass") : p.unitName || L("حبة", "piece"));
    const svc = p.sold !== "piece";
    return `<div class="rc__tools">
      <div class="rc__adj"><button type="button" data-amt="-1" aria-label="${L("أنقص", "Less")}">${U.icon("minus", "", 2.4)}</button><span class="num">${val}</span><button type="button" data-amt="1" aria-label="${L("زد", "More")}">${U.icon("plus", "", 2.4)}</button></div>
      ${svc ? `<button type="button" class="rc__tool" data-svc>${U.icon("spark")}${L("خدمات", "Services")}</button>` : ""}
      <a class="rc__tool" href="${U.url.product(p.id)}">${U.icon("edit")}${L("القطعة", "The cut")}</a>
      <button type="button" class="rc__tool rc__tool--x" data-rm aria-label="${L("احذف", "Remove")} ${U.esc(p.name)}">${U.icon("trash")}</button>
    </div>`;
  }

  function tipsHTML(ls) {
    if (!ADV) return "";
    const tips = ADV.cartTips(ls); if (!tips.length) return "";
    return `<div class="tips"><div class="tips__h">${U.mark("tips__mark")}<b>${L("المستشار لاحظ", "The advisor noticed")}</b></div>${tips.map((t, i) => {
      const p = t.id ? D.byId(t.id) : null;
      return `<div class="tip"><p>${U.esc(t.t)}</p>${p ? `<button type="button" class="btn btn--line btn--sm" data-tip="${i}">${U.icon("plus", "", 2.4)}${t.qty} × ${U.esc(p.name)} <span class="num">${U.money(p.price * t.qty)}</span></button>` : `<button type="button" class="btn btn--line btn--sm" data-tip="${i}">${U.icon("spark")}${L("أضف التتبيلة", "Add the marinade")}</button>`}</div>`;
    }).join("")}</div>`;
  }

  function render() {
    const ls = S.cart.get();
    const t = S.cart.totals(ls);
    $("#cartSub").textContent = ls.length ? `${ls.length} ${ls.length === 1 ? L("سطر", "line") : L("أسطر", "lines")}${t.kg ? " · " + U.kgTxt(t.kg) + L(" لحم", " of meat") : ""}` : "";
    if (!ls.length) {
      root.innerHTML = `<div class="cart cart--empty">${U.receipt({ title: L("السلة فاضية", "Your cart is empty"), lines: [], empty: L("ما في شي على الميزان بعد.", "Nothing on the scale yet."), foot: L("ابدأ من المستشار أو من القطيع.", "Start with the advisor or the herd.") })}
        <div class="row-btns" style="justify-content:center"><a class="btn btn--ember btn--lg" href="advisor.html">${U.mark("btn__mark")}${L("خطّط مع المستشار", "Plan with the advisor")}</a><a class="btn btn--line btn--lg" href="shop.html">${L("تسوّق القطعيات", "Shop the cuts")}</a></div></div>`;
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    const lines = ls.map(l => { const x = U.lineForReceipt(l); x.tools = lineTools(l); return x; });
    const now = new Date();
    const rc = U.receipt({
      cls: "receipt--cart", kicker: L("فاتورة مبدئية", "Draft receipt"),
      meta: [[L("التاريخ", "Date"), U.fmtDate(now, { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + U.fmtTime(now)], [L("التوصيل إلى", "Deliver to"), U.esc(S.cityLabel(S.city.get()))]],
      lines,
      totals: [
        [L("اللحم", "Meat"), U.money2(t.meat)],
        t.services ? [L("خدمات (تتبيل/تسييخ/تغليف)", "Services (marinade/skewers/packing)"), U.money2(t.services)] : null,
        t.extras ? [L("عدّة الشواء والبهارات", "BBQ kit & spices"), U.money2(t.extras)] : null,
        [L("التوصيل", "Delivery"), t.delivery ? U.money2(t.delivery) : L("مجاني", "Free")],
        [L("الإجمالي", "Total"), U.money2(t.total), "is-total"],
        [L("منها ضريبة 15٪", "Incl. 15% VAT"), U.money2(t.vat), "is-muted"]
      ].filter(Boolean),
      foot: L("الأسعار شاملة الضريبة · التقطيع مجاني", "Prices include VAT · Cutting is free")
    });
    const pct = Math.min(100, Math.round((t.sub / C.delivery.freeOver) * 100));
    root.innerHTML = `<div class="cart">
      <div class="cart__rc">${rc}</div>
      <aside class="cart__side">
        <div class="card sum-card">
          <div class="free${t.delivery ? "" : " is-done"}"><p>${t.delivery ? L(`باقي <b class="num">${cur(t.toFree)}</b> على التوصيل المجاني`, `<b class="num">${cur(t.toFree)}</b> away from free delivery`) : `${U.icon("check", "", 2.4)}${L("التوصيل مجاني لطلبك", "Your order ships free")}`}</p><span class="free__bar"><i style="width:${pct}%"></i></span></div>
          <div class="sum-total"><span>${L("الإجمالي", "Total")}</span><b class="num">${cur(t.total)}</b></div>
          <a class="btn btn--ember btn--lg btn--block" href="checkout.html">${L("إتمام الطلب", "Checkout")} ${U.icon("chevL", "", 2.2)}</a>
          <a class="btn btn--ghost btn--block" href="shop.html">${L("أكمل التسوق", "Continue shopping")}</a>
        </div>
        ${tipsHTML(ls)}
      </aside>
    </div>`;
    if (bar) { bar.hidden = false; document.body.classList.add("has-actionbar"); $("#abTotal").textContent = cur(t.total); }
  }

  function servicesSheet(key) {
    const l = S.cart.get().find(x => x.key === key); if (!l) return;
    const p = D.byId(l.id), o = l.opts || {};
    const body = document.createElement("form");
    const skewOk = p.sold === "kg" && D.PREPS[o.prep] && D.PREPS[o.prep].skew;
    body.innerHTML = p.sold === "kg" ? `${U.chips("svc-marinade", L("التتبيل", "Marinade"), D.MARINADES.map(m => ({ k: m.k, n: m.n, d: m.d, p: m.p, per: "/" + L("كجم", "kg") })), o.marinade || "none", { cls: "opt--paid" })}
      <div class="opt opt--paid"><span class="opt__label">${L("خدمات", "Services")}</span>
        ${skewOk ? `<label class="toggle"><input type="checkbox" name="skewer"${o.skewer ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.skewer.n}</b><small>${D.SERVICES.skewer.d}</small></span><em class="num">+${D.SERVICES.skewer.p}/${L("كجم", "kg")}</em></label>` : ""}
        <label class="toggle"><input type="checkbox" name="vacuum"${o.vacuum ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.vacuum.n}</b><small>${D.SERVICES.vacuum.d}</small></span><em class="num">+${D.SERVICES.vacuum.p}/${L("كجم", "kg")}</em></label></div>`
      : `<div class="opt opt--paid"><label class="toggle"><input type="checkbox" name="vacuum"${o.vacuum ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.vacuum.n}</b><small>${L("كل وجبة في كيس مفرّغ", "Each meal in a vacuum bag")}</small></span><em class="num">+${D.SERVICES.vacuum.carcass}</em></label></div>`;
    const foot = document.createElement("div");
    foot.innerHTML = `<button class="btn btn--ember btn--block btn--lg" type="button" data-ok>${L("حفظ", "Save")}</button>`;
    const sh = A.openSheet({ title: L("خدمات · ", "Services · ") + p.name, body, foot });
    $("[data-ok]", foot).addEventListener("click", () => {
      const m = body.querySelector('input[name="svc-marinade"]:checked');
      S.cart.setOpts(key, { marinade: m ? m.value : o.marinade, skewer: !!(body.elements.skewer && body.elements.skewer.checked), vacuum: !!(body.elements.vacuum && body.elements.vacuum.checked) });
      sh.close(true); A.toast(L("حُدّثت الخدمات", "Services updated"), { icon: "spark" });
    });
  }

  root.addEventListener("click", e => {
    const line = e.target.closest("[data-key]"); const key = line && line.dataset.key;
    const amt = e.target.closest("[data-amt]");
    if (amt && key) {
      const l = S.cart.get().find(x => x.key === key); if (!l) return;
      const p = D.byId(l.id), d = +amt.dataset.amt;
      S.cart.setAmount(key, p.sold === "kg" ? l.kg + d * (p.step || 0.5) : l.qty + d);
      return;
    }
    if (e.target.closest("[data-svc]") && key) { servicesSheet(key); return; }
    if (e.target.closest("[data-rm]") && key) {
      const l = S.cart.get().find(x => x.key === key); S.cart.remove(key);
      A.toast(L("حُذف ", "Removed ") + D.byId(l.id).name, { icon: "trash" }); return;
    }
    const tip = e.target.closest("[data-tip]");
    if (tip && ADV) {
      const t = ADV.cartTips(S.cart.get())[+tip.dataset.tip]; if (!t) return;
      if (t.id) { S.cart.add(t.id, { qty: t.qty, src: "advisor" }); A.bump(); A.toast(L("أُضيف ", "Added ") + D.byId(t.id).name, { icon: "cart" }); }
      else if (t.key) { S.cart.setOpts(t.key, { marinade: t.marinade }); A.toast(L("أُضيفت التتبيلة", "Marinade added"), { icon: "spark" }); }
    }
  });
  S.on("cart", render);
  render();
})();
