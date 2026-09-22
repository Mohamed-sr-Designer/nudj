/* حسابي — قائمة بنمط الإعدادات في iOS، وكل قسم شاشة فرعية (account.html?s=...) */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const C = D.CONFIG;
  const root = $("#accRoot"), side = $("#accSide"); if (!root) return;
  const s = new URLSearchParams(location.search).get("s") || "";
  const cur = n => U.money(n) + " " + C.currency;

  const SEC = { orders: { t: "طلباتي", i: "receipt" }, plans: { t: "خطط المستشار", i: "chat" }, addresses: { t: "العناوين", i: "pin" }, profile: { t: "الملف الشخصي", i: "user" } };
  const STATUS = { placed: ["قيد التجهيز", "placed"], done: ["مكتمل", "done"], cancelled: ["ملغي", "cancelled"] };

  if (SEC[s]) {
    const bar = $(".app-bar");
    $(".ab-lead", bar).innerHTML = `<a class="ab-back" href="account.html" data-back>${U.icon("chevR", "", 2.4)}<span>حسابي</span></a>`;
    $(".ab-title", bar).textContent = SEC[s].t;
    $("#accHead .large-title").textContent = SEC[s].t;
    document.title = SEC[s].t + " · نُضْج";
    document.body.classList.add("is-sub");
  }

  const initial = u => (u && u.name ? u.name.trim()[0] : "ن");
  const loginCard = msg => `<div class="login-card">${U.icon("user", "big", 1.5)}<h2>سجّل دخولك</h2><p>${msg || "تابع طلباتك وفواتيرك وخطط المستشار — برقم جوالك فقط."}</p>
    <a class="btn btn--ember btn--lg" href="login.html?next=${encodeURIComponent("account.html" + location.search)}">تسجيل الدخول</a></div>`;
  const infoGroup = () => U.group([
    U.cell({ href: "help.html", icon: "help", title: "المساعدة والأسئلة الشائعة" }),
    U.cell({ href: "contact.html", icon: "phone", title: "تواصل معنا" }),
    U.cell({ href: "about.html", icon: "info", title: "من نحن" }),
    U.cell({ href: "terms.html", icon: "doc", title: "الشروط والأحكام" }),
    U.cell({ href: "privacy.html", icon: "doc", title: "سياسة الخصوصية" })
  ], "نُضْج");
  const ordRow = o => { const st = STATUS[o.status] || STATUS.placed; const n = o.items.length;
    return `<a class="ord" href="order.html?id=${encodeURIComponent(o.id)}"><span class="ord__ic">${U.icon("receipt")}</span><span class="ord__b"><b class="num">${o.id}</b><small>${U.fmtDate(o.date)} · ${n} ${n === 1 ? "سطر" : "أسطر"}</small></span><span class="ord__s is-${st[1]}">${st[0]}</span><span class="ord__p num">${cur(o.totals.total)}</span>${U.icon("chevL", "cell__chev")}</a>`; };

  function home(u) {
    if (!u) { root.innerHTML = loginCard() + infoGroup(); return; }
    const orders = S.orders.list(), plans = S.plans.list();
    const stat = (n, t, href) => `<a class="stat" href="${href}"><b class="num">${n}</b><span>${t}</span></a>`;
    root.innerHTML = `<div class="desk-only">
      <div class="stats">${stat(orders.length, "طلبات", "account.html?s=orders")}${stat(plans.length, "خطط محفوظة", "account.html?s=plans")}${stat(S.addr.list().length, "عناوين", "account.html?s=addresses")}${stat(S.wish.list().length, "في المفضلة", "wishlist.html")}</div>
      <h2 class="group__head">آخر الطلبات</h2>
      ${orders.length ? `<div class="rows">${orders.slice(0, 4).map(ordRow).join("")}</div>` : `<div class="card">${U.empty("receipt", "ما عندك طلبات للحين", "", `<a class="btn btn--ember" href="advisor.html">خطّط مع المستشار</a>`)}</div>`}
    </div>
    <div class="mob-only">
      <div class="profile"><span class="avatar">${U.esc(initial(u))}</span><span><b>${U.esc(u.name || "أهلاً بك")}</b><small class="num">${S.fmtPhone(u.phone)}</small></span>
        <a class="btn btn--ghost btn--sm" href="account.html?s=profile">تعديل</a></div>
      ${U.group([
        U.cell({ href: "account.html?s=orders", icon: "receipt", title: "طلباتي", detail: orders.length || "" }),
        U.cell({ href: "account.html?s=plans", icon: "chat", title: "خطط المستشار", detail: plans.length || "" }),
        U.cell({ href: "wishlist.html", icon: "heart", title: "المفضلة", detail: S.wish.list().length || "" })
      ])}
      ${U.group([
        U.cell({ href: "account.html?s=addresses", icon: "pin", title: "العناوين", detail: S.addr.list().length || "" }),
        U.cell({ href: "account.html?s=profile", icon: "user", title: "الملف الشخصي" })
      ], "الإعدادات")}
      ${infoGroup()}
      <div class="group" style="margin-top:22px">${U.cell({ button: true, cls: "cell--danger cell--center", title: "تسجيل الخروج", attrs: "data-logout" })}</div>
    </div>`;
  }

  function orders() {
    const list = S.orders.list();
    if (!list.length) return U.empty("receipt", "ما عندك طلبات للحين", "أول طلب لك يظهر هنا مع فاتورته وحالته.", `<a class="btn btn--ember" href="advisor.html">خطّط مع المستشار</a>`);
    return `<div class="rows">${list.map(ordRow).join("")}</div>`;
  }
  function plans() {
    const list = S.plans.list();
    if (!list.length) return U.empty("chat", "ما عندك خطط محفوظة", "بعد ما يطلع لك المستشار خطة، اضغط «احفظ الخطة» وتلقاها هنا تطلبها متى ما بغيت.", `<a class="btn btn--ember" href="advisor.html">افتح المستشار</a>`);
    return `<div class="plans">${list.map(p => `<article class="plan" id="${p.id}">
      <div class="plan__h"><b>${U.esc(p.title)}</b><small>${U.fmtDate(p.saved)}</small></div>
      <ul>${p.sections.map(sec => `<li><span>${U.esc(sec.title)}</span><em class="num">${sec.lines.length} أسطر</em></li>`).join("")}</ul>
      <div class="plan__f"><b class="num">${cur(p.total)}</b><span><button class="btn btn--ember btn--sm" type="button" data-plan-cart="${p.id}">${U.icon("cart")}اطلبها</button><button class="icon-btn" type="button" data-plan-del="${p.id}" aria-label="احذف الخطة">${U.icon("trash")}</button></span></div>
    </article>`).join("")}</div>`;
  }
  function addresses() {
    const list = S.addr.list();
    return `${list.length ? `<div class="rows">${list.map(a => `<div class="ord"><span class="ord__ic">${U.icon("pin")}</span><span class="ord__b"><b>${U.esc(a.label)}${a.isDefault ? ' <span class="pill">الافتراضي</span>' : ""}</b><small class="wrap-t">${U.esc(A.addrLine(a))}</small></span>
      ${a.isDefault ? "" : `<button class="btn btn--ghost btn--sm" type="button" data-def="${a.id}">افتراضي</button>`}
      <button class="icon-btn" type="button" data-edit="${a.id}" aria-label="تعديل">${U.icon("edit")}</button><button class="icon-btn" type="button" data-del="${a.id}" aria-label="حذف">${U.icon("trash")}</button></div>`).join("")}</div>`
      : U.empty("pin", "ما عندك عناوين محفوظة", "أضف عنوانك مرة واحدة ويظهر لك في كل طلب.")}
      <button class="btn btn--ember" type="button" data-new style="margin-top:14px">${U.icon("plus")}أضف عنواناً</button>`;
  }
  function profile(u) {
    return `<form class="card" id="profForm" novalidate style="max-width:560px">
      <label class="field"><span class="field__l">الاسم</span><input class="input" name="name" value="${U.esc(u.name || "")}" autocomplete="name" placeholder="اسمك الكامل"></label>
      <label class="field"><span class="field__l">رقم الجوال</span><input class="input num" value="${S.fmtPhone(u.phone)}" dir="ltr" disabled></label>
      <button class="btn btn--ember" type="submit">حفظ</button></form>`;
  }

  function sidebar(u) {
    if (!side) return;
    if (!u) { side.innerHTML = ""; return; }
    side.innerHTML = `<div class="profile"><span class="avatar">${U.esc(initial(u))}</span><span><b>${U.esc(u.name || "أهلاً بك")}</b><small class="num">${S.fmtPhone(u.phone)}</small></span></div>
      <div class="group">${[["", "نظرة عامة", "grid"]].concat(Object.keys(SEC).map(k => [k, SEC[k].t, SEC[k].i])).map(x =>
      `<a class="cell${s === x[0] ? " is-on" : ""}" href="account.html${x[0] ? "?s=" + x[0] : ""}"${s === x[0] ? ' aria-current="page"' : ""}><span class="cell__ic">${U.icon(x[2])}</span><span class="cell__b"><span class="cell__t">${x[1]}</span></span></a>`).join("")}
      <a class="cell" href="wishlist.html"><span class="cell__ic">${U.icon("heart")}</span><span class="cell__b"><span class="cell__t">المفضلة</span></span></a>
      <button class="cell cell--danger" type="button" data-logout><span class="cell__ic">${U.icon("logout")}</span><span class="cell__b"><span class="cell__t">تسجيل الخروج</span></span></button></div>`;
  }

  function render() {
    const u = S.user.get();
    sidebar(u);
    if (!SEC[s]) return home(u);
    if (!u) { root.innerHTML = loginCard("سجّل دخولك لتشوف " + SEC[s].t + "."); return; }
    root.innerHTML = ({ orders, plans, addresses, profile })[s](u);
  }

  root.addEventListener("click", async e => {
    const t = e.target;
    if (t.closest("[data-new]")) { A.addressSheet(null, render); return; }
    const ed = t.closest("[data-edit]"); if (ed) { A.addressSheet(S.addr.get(ed.dataset.edit), render); return; }
    const del = t.closest("[data-del]");
    if (del) { if (await A.confirmSheet({ title: "حذف العنوان؟", ok: "حذف", danger: true })) { S.addr.remove(del.dataset.del); A.toast("حُذف العنوان", { icon: "trash" }); render(); } return; }
    const df = t.closest("[data-def]"); if (df) { S.addr.setDefault(df.dataset.def); render(); return; }
    const pc = t.closest("[data-plan-cart]");
    if (pc) {
      const p = S.plans.get(pc.dataset.planCart); if (!p) return; let n = 0;
      p.sections.forEach(sec => sec.lines.forEach(l => { const o = { opts: l.opts, src: "advisor" }; if (l.kg != null) o.kg = l.kg; else o.qty = l.qty; if (S.cart.add(l.id, o)) n++; }));
      A.bump(); A.toast("أُضيفت الخطة للسلة (" + n + " أسطر)", { icon: "cart", action: { label: "السلة", href: "cart.html" } }); return;
    }
    const pd = t.closest("[data-plan-del]");
    if (pd) { if (await A.confirmSheet({ title: "حذف الخطة؟", ok: "حذف", danger: true })) { S.plans.remove(pd.dataset.planDel); render(); } }
  });
  document.addEventListener("click", async e => {
    if (!e.target.closest("[data-logout]")) return;
    if (!(await A.confirmSheet({ title: "تسجيل الخروج؟", ok: "تسجيل الخروج", cancel: "تراجع", danger: true }))) return;
    S.user.logout(); A.toast("سُجّل خروجك", { icon: "logout" });
    if (SEC[s]) location.href = "account.html"; else render();
  });
  root.addEventListener("submit", e => {
    if (e.target.id !== "profForm") return;
    e.preventDefault();
    S.user.update({ name: e.target.elements.name.value.trim() }); A.toast("حُفظت بياناتك"); render();
  });
  S.on("auth", render);
  render();
})();
