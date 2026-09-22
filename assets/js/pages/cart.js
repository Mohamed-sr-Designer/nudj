/* السلة = فاتورة حرارية حيّة: عدّل الوزن، الخدمات، واسمع ملاحظات المستشار */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI, ADV = window.NUDJ_ADVISOR;
  const { $ } = A;
  const C = D.CONFIG;
  const root = $("#cartRoot"); if (!root) return;
  const bar = $("#actionBar");
  const cur = n => U.money(n) + " " + C.currency;

  function lineTools(l) {
    const p = D.byId(l.id);
    const val = p.sold === "kg" ? U.kgTxt(l.kg) : l.qty + " " + (p.sold === "carcass" ? "ذبيحة" : p.unitName || "حبة");
    const svc = p.sold !== "piece";
    return `<div class="rc__tools">
      <div class="rc__adj"><button type="button" data-amt="-1" aria-label="أنقص">${U.icon("minus", "", 2.4)}</button><span class="num">${val}</span><button type="button" data-amt="1" aria-label="زد">${U.icon("plus", "", 2.4)}</button></div>
      ${svc ? `<button type="button" class="rc__tool" data-svc>${U.icon("spark")}خدمات</button>` : ""}
      <a class="rc__tool" href="${U.url.product(p.id)}">${U.icon("edit")}القطعة</a>
      <button type="button" class="rc__tool rc__tool--x" data-rm aria-label="احذف ${U.esc(p.name)}">${U.icon("trash")}</button>
    </div>`;
  }

  function tipsHTML(ls) {
    if (!ADV) return "";
    const tips = ADV.cartTips(ls); if (!tips.length) return "";
    return `<div class="tips"><div class="tips__h">${U.mark("tips__mark")}<b>المستشار لاحظ</b></div>${tips.map((t, i) => {
      const p = t.id ? D.byId(t.id) : null;
      return `<div class="tip"><p>${U.esc(t.t)}</p>${p ? `<button type="button" class="btn btn--line btn--sm" data-tip="${i}">${U.icon("plus", "", 2.4)}${t.qty} × ${U.esc(p.name)} <span class="num">${U.money(p.price * t.qty)}</span></button>` : `<button type="button" class="btn btn--line btn--sm" data-tip="${i}">${U.icon("spark")}أضف التتبيلة</button>`}</div>`;
    }).join("")}</div>`;
  }

  function render() {
    const ls = S.cart.get();
    const t = S.cart.totals(ls);
    $("#cartSub").textContent = ls.length ? `${ls.length} ${ls.length === 1 ? "سطر" : "أسطر"}${t.kg ? " · " + U.kgTxt(t.kg) + " لحم" : ""}` : "";
    if (!ls.length) {
      root.innerHTML = `<div class="cart cart--empty">${U.receipt({ title: "السلة فاضية", lines: [], empty: "ما في شي على الميزان بعد.", foot: "ابدأ من المستشار أو من القطيع." })}
        <div class="row-btns" style="justify-content:center"><a class="btn btn--ember btn--lg" href="advisor.html">${U.mark("btn__mark")}خطّط مع المستشار</a><a class="btn btn--line btn--lg" href="shop.html">تسوّق القطعيات</a></div></div>`;
      if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar"); return;
    }
    const lines = ls.map(l => { const x = U.lineForReceipt(l); x.tools = lineTools(l); return x; });
    const now = new Date();
    const rc = U.receipt({
      cls: "receipt--cart", kicker: "فاتورة مبدئية",
      meta: [["التاريخ", U.fmtDate(now, { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + U.fmtTime(now)], ["التوصيل إلى", S.city.get()]],
      lines,
      totals: [
        ["اللحم", U.money2(t.meat)],
        t.services ? ["خدمات (تتبيل/تسييخ/تغليف)", U.money2(t.services)] : null,
        t.extras ? ["عدّة الشواء والبهارات", U.money2(t.extras)] : null,
        ["التوصيل", t.delivery ? U.money2(t.delivery) : "مجاني"],
        ["الإجمالي", U.money2(t.total), "is-total"],
        ["منها ضريبة 15٪", U.money2(t.vat), "is-muted"]
      ].filter(Boolean),
      foot: "الأسعار شاملة الضريبة · التقطيع مجاني"
    });
    const pct = Math.min(100, Math.round((t.sub / C.delivery.freeOver) * 100));
    root.innerHTML = `<div class="cart">
      <div class="cart__rc">${rc}</div>
      <aside class="cart__side">
        <div class="card sum-card">
          <div class="free${t.delivery ? "" : " is-done"}"><p>${t.delivery ? `باقي <b class="num">${cur(t.toFree)}</b> على التوصيل المجاني` : `${U.icon("check", "", 2.4)}التوصيل مجاني لطلبك`}</p><span class="free__bar"><i style="width:${pct}%"></i></span></div>
          <div class="sum-total"><span>الإجمالي</span><b class="num">${cur(t.total)}</b></div>
          <a class="btn btn--ember btn--lg btn--block" href="checkout.html">إتمام الطلب ${U.icon("chevL", "", 2.2)}</a>
          <a class="btn btn--ghost btn--block" href="shop.html">أكمل التسوق</a>
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
    body.innerHTML = p.sold === "kg" ? `${U.chips("svc-marinade", "التتبيل", D.MARINADES.map(m => ({ k: m.k, n: m.n, d: m.d, p: m.p, per: "/كجم" })), o.marinade || "none", { cls: "opt--paid" })}
      <div class="opt opt--paid"><span class="opt__label">خدمات</span>
        ${skewOk ? `<label class="toggle"><input type="checkbox" name="skewer"${o.skewer ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.skewer.n}</b><small>${D.SERVICES.skewer.d}</small></span><em class="num">+${D.SERVICES.skewer.p}/كجم</em></label>` : ""}
        <label class="toggle"><input type="checkbox" name="vacuum"${o.vacuum ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.vacuum.n}</b><small>${D.SERVICES.vacuum.d}</small></span><em class="num">+${D.SERVICES.vacuum.p}/كجم</em></label></div>`
      : `<div class="opt opt--paid"><label class="toggle"><input type="checkbox" name="vacuum"${o.vacuum ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${D.SERVICES.vacuum.n}</b><small>كل وجبة في كيس مفرّغ</small></span><em class="num">+${D.SERVICES.vacuum.carcass}</em></label></div>`;
    const foot = document.createElement("div");
    foot.innerHTML = `<button class="btn btn--ember btn--block btn--lg" type="button" data-ok>حفظ</button>`;
    const sh = A.openSheet({ title: "خدمات · " + p.name, body, foot });
    $("[data-ok]", foot).addEventListener("click", () => {
      const m = body.querySelector('input[name="svc-marinade"]:checked');
      S.cart.setOpts(key, { marinade: m ? m.value : o.marinade, skewer: !!(body.elements.skewer && body.elements.skewer.checked), vacuum: !!(body.elements.vacuum && body.elements.vacuum.checked) });
      sh.close(true); A.toast("حُدّثت الخدمات", { icon: "spark" });
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
      A.toast("حُذف " + D.byId(l.id).name, { icon: "trash" }); return;
    }
    const tip = e.target.closest("[data-tip]");
    if (tip && ADV) {
      const t = ADV.cartTips(S.cart.get())[+tip.dataset.tip]; if (!t) return;
      if (t.id) { S.cart.add(t.id, { qty: t.qty, src: "advisor" }); A.bump(); A.toast("أُضيف " + D.byId(t.id).name, { icon: "cart" }); }
      else if (t.key) { S.cart.setOpts(t.key, { marinade: t.marinade }); A.toast("أُضيفت التتبيلة", { icon: "spark" }); }
    }
  });
  S.on("cart", render);
  render();
})();
