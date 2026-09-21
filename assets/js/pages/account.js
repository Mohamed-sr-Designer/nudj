/* حسابي — قائمة بنمط الإعدادات في iOS، وكل قسم شاشة فرعية (account.html?s=...) */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const root = $("#accRoot"), side = $("#accSide"); if (!root) return;
  const s = new URLSearchParams(location.search).get("s") || "";
  const cur = n => U.money(n) + " " + C.currency;

  const SEC = {
    orders: { t: "طلباتي", i: "box" }, guides: { t: "أدلتي", i: "video" }, consults: { t: "استشاراتي", i: "chat" },
    membership: { t: "اشتراك نُضْج+", i: "spark" }, addresses: { t: "العناوين", i: "pin" }, profile: { t: "الملف الشخصي", i: "user" }
  };
  const STATUS = { placed: ["قيد التجهيز", "placed"], done: ["مكتمل", "done"], cancelled: ["ملغي", "cancelled"] };

  /* ---------- شاشة فرعية: زر رجوع وعنوان في شريط التطبيق ---------- */
  if (SEC[s]) {
    const bar = $(".app-bar");
    $(".ab-lead", bar).innerHTML = `<a class="ab-back" href="account.html" data-back>${U.icon("chevR", "", 2.4)}<span>حسابي</span></a>`;
    $(".ab-title", bar).textContent = SEC[s].t;
    $("#accHead .large-title").textContent = SEC[s].t;
    document.title = SEC[s].t + " · نُضْج";
    document.body.classList.add("is-sub");
  }

  const initial = u => (u && u.name ? u.name.trim()[0] : "ن");
  const loginCard = (msg) => `<div class="login-card">${U.icon("user", "big", 1.5)}<h2 style="font-size:1.15rem">سجّل دخولك</h2><p>${msg || "تابع طلباتك، أدلتك، واشتراكك — برقم جوالك فقط."}</p>
    <a class="btn btn--brand btn--lg" href="login.html?next=${encodeURIComponent("account.html" + location.search)}">تسجيل الدخول</a></div>`;

  const infoGroup = () => U.group([
    U.cell({ href: "help.html", icon: "help", tone: "steel", title: "المساعدة والأسئلة الشائعة" }),
    U.cell({ href: "contact.html", icon: "phone", tone: "steel", title: "تواصل معنا" }),
    U.cell({ href: "about.html", icon: "info", tone: "steel", title: "من نحن" }),
    U.cell({ href: "terms.html", icon: "doc", tone: "steel", title: "الشروط والأحكام" }),
    U.cell({ href: "privacy.html", icon: "shield", tone: "steel", title: "سياسة الخصوصية" })
  ], "نُضْج");

  function memberMini() {
    const m = S.member.get();
    if (m) return `<a class="member-card member-card--active" href="account.html?s=membership" style="margin-bottom:6px"><div class="member-card__top"><span class="member-card__logo">نُضْج<span class="plus" style="color:#fff">+</span></span><span class="pill pill--own">${U.icon("check", "", 2.4)}فعّال</span></div><p>${m.autoRenew ? "يتجدد" : "ينتهي"} في ${U.fmtDate(m.renews)} · كل الأدلة مفتوحة لك</p></a>`;
    return `<a class="member-card" href="expertise.html" style="margin-bottom:6px"><div class="member-card__top"><span class="member-card__logo">نُضْج<span class="plus">+</span></span><span class="pill pill--brand">جرّب</span></div><p>كل الأدلة المصوّرة ومختبر الطبخ من ${C.plans.monthly.price} ${C.currency} شهرياً.</p></a>`;
  }

  /* ---------- الشاشة الرئيسية ---------- */
  function home(u) {
    if (!u) {
      root.innerHTML = loginCard() + infoGroup();
      return;
    }
    const orders = S.orders.list(), consults = S.consults.list().filter(c => c.status === "confirmed");
    const guides = S.isMember() ? D.GUIDES.length : S.owned().length;
    const m = S.member.get();
    /* سطح المكتب: نظرة عامة (القائمة الجانبية تتولى التنقل). الجوال: قائمة بنمط الإعدادات. */
    const stat = (n, t, href) => `<a class="stat" href="${href}"><b class="num">${n}</b><span>${t}</span></a>`;
    const overview = `<div class="desk-only">
      <div class="stats">${stat(orders.length, "طلبات", "account.html?s=orders")}${stat(m ? "الكل" : guides, "أدلة متاحة", "account.html?s=guides")}${stat(consults.length, "استشارات قادمة", "account.html?s=consults")}${stat(S.wish.list().length, "في المفضلة", "wishlist.html")}</div>
      ${memberMini()}
      <h2 class="group__head">آخر الطلبات</h2>
      ${orders.length ? `<div class="rows">${orders.slice(0, 3).map(o => { const st = STATUS[o.status] || STATUS.placed; return `<a class="ord" href="order.html?id=${encodeURIComponent(o.id)}"><span class="ord__b"><b>${o.id}</b><small>${U.fmtDate(o.date)}</small></span><span class="ord__s is-${st[1]}">${st[0]}</span><span class="ord__p">${cur(o.totals.total)}</span>${U.icon("chevL", "cell__chev")}</a>`; }).join("")}</div>
        ${orders.length > 3 ? `<a class="link" href="account.html?s=orders" style="display:inline-block;margin-top:10px">كل الطلبات (${orders.length})</a>` : ""}`
        : `<div class="card">${U.empty("box", "ما عندك طلبات للحين", "", `<a class="btn btn--brand" href="shop.html">تسوّق الآن</a>`)}</div>`}
    </div>`;
    root.innerHTML = overview + `<div class="mob-only">
      <div class="profile"><span class="avatar">${U.esc(initial(u))}</span><span><b>${U.esc(u.name || "أهلاً بك")}</b><small>${S.fmtPhone(u.phone)}</small></span>
        <a class="btn btn--ghost btn--sm" href="account.html?s=profile" style="margin-inline-start:auto">تعديل</a></div>
      ${memberMini()}
      ${U.group([
        U.cell({ href: "account.html?s=orders", icon: "box", title: "طلباتي", detail: orders.length || "" }),
        U.cell({ href: "account.html?s=guides", icon: "video", tone: "ink", title: "أدلتي", detail: guides ? (S.isMember() ? "الكل" : guides) : "" }),
        U.cell({ href: "account.html?s=consults", icon: "chat", tone: "ink", title: "استشاراتي", detail: consults.length || "" }),
        U.cell({ href: "account.html?s=membership", icon: "spark", tone: "warn", title: "اشتراك نُضْج+", detail: m ? "فعّال" : "غير مشترك" }),
        U.cell({ href: "wishlist.html", icon: "heart", tone: "ok", title: "المفضلة", detail: S.wish.list().length || "" })
      ], "")}
      ${U.group([
        U.cell({ href: "account.html?s=addresses", icon: "pin", tone: "soft", title: "العناوين", detail: S.addr.list().length || "" }),
        U.cell({ href: "account.html?s=profile", icon: "user", tone: "soft", title: "الملف الشخصي" })
      ], "الإعدادات")}
      ${infoGroup()}
      <div class="group" style="margin-top:22px">${U.cell({ button: true, cls: "cell--danger cell--center", title: "تسجيل الخروج", attrs: "data-logout" })}</div>
    </div>`;
  }

  /* ---------- الأقسام ---------- */
  function orders() {
    const list = S.orders.list();
    if (!list.length) return U.empty("box", "ما عندك طلبات للحين", "أول طلب لك يظهر هنا مع حالته وتفاصيله.", `<a class="btn btn--brand" href="shop.html">تسوّق الآن</a>`);
    return `<div class="rows">${list.map(o => {
      const st = STATUS[o.status] || STATUS.placed;
      const n = o.items.length;
      return `<a class="ord" href="order.html?id=${encodeURIComponent(o.id)}"><span class="ord__b"><b>${o.id}</b><small>${U.fmtDate(o.date)} · ${n} ${n === 1 ? "منتج" : "منتجات"}</small></span>
        <span class="ord__s is-${st[1]}">${st[0]}</span><span class="ord__p">${cur(o.totals.total)}</span>${U.icon("chevL", "cell__chev")}</a>`;
    }).join("")}</div>`;
  }
  function guides() {
    if (S.isMember()) return `<p class="digital-note" style="margin-bottom:14px">${U.icon("spark")}كل الأدلة مفتوحة لك ضمن اشتراكك في نُضْج+.</p><div class="gcards">${D.GUIDES.map(U.guideCard).join("")}</div>`;
    const own = S.owned().map(D.guideById).filter(Boolean);
    if (!own.length) return U.empty("video", "ما عندك أدلة للحين", `أضف الدليل المصوّر مع أي قطعة بـ ${C.guidePrice} ${C.currency}، أو افتح كل الأدلة مع نُضْج+.`, `<a class="btn btn--brand" href="expertise.html">تصفّح الأدلة</a>`);
    return `<div class="gcards">${own.map(U.guideCard).join("")}</div><p class="group__foot" style="margin-top:14px"><a class="link" href="expertise.html">كل الأدلة (${D.GUIDES.length}) مع نُضْج+</a></p>`;
  }
  function consults() {
    const list = S.consults.list();
    if (!list.length) return U.empty("chat", "ما عندك استشارات", `كلّم جزّاراً ${C.consult.minutes} دقيقة قبل عزيمتك.`, `<a class="btn btn--brand" href="consult.html">احجز استشارة</a>`);
    return `<div class="rows">${list.map(c => `<div class="ord"><span class="ord__b"><b>${U.esc(c.topic)}</b><small>${U.esc(c.slot.dateLabel)} · ${U.esc(c.slot.time)} · ${U.esc(c.channel)}</small></span>
      <span class="ord__s is-${c.status === "confirmed" ? "placed" : "cancelled"}">${c.status === "confirmed" ? "مؤكد" : "ملغي"}</span>
      ${c.status === "confirmed" ? `<button class="btn btn--ghost btn--sm" type="button" data-cancel-c="${c.id}">إلغاء</button>` : ""}</div>`).join("")}</div>
      <a class="btn btn--tint" href="consult.html" style="margin-top:14px">${U.icon("plus")}حجز جديد</a>`;
  }
  function membership() {
    const m = S.member.get();
    if (!m) return `<div class="member-card"><div class="member-card__top"><span class="member-card__logo">نُضْج<span class="plus">+</span></span></div><p>أنت غير مشترك. نُضْج+ يفتح كل الأدلة (${D.GUIDES.length}) ومختبر الطبخ، مع خصم على الاستشارة.</p>
      <div class="member-card__price"><strong>${C.plans.monthly.price}</strong><span>${C.currency} شهرياً — أو ${C.plans.annual.price} ${C.currency} سنوياً</span></div><a class="btn btn--light btn--lg" href="subscribe.html" style="width:fit-content">اشترك الآن</a></div>`;
    return `${U.group([
      U.cell({ title: "الخطة", detail: m.plan === "annual" ? "سنوي" : "شهري" }),
      U.cell({ title: "السعر", detail: cur(m.price) }),
      U.cell({ title: "بدأ في", detail: U.fmtDate(m.since) }),
      U.cell({ title: m.autoRenew ? "يتجدد في" : "ينتهي في", detail: U.fmtDate(m.renews) })
    ], "اشتراكك")}
      ${U.group([m.autoRenew
        ? U.cell({ button: true, cls: "cell--danger cell--center", title: "إلغاء التجديد التلقائي", attrs: "data-auto=\"0\"" })
        : U.cell({ button: true, cls: "cell--center", title: "استئناف التجديد التلقائي", attrs: "data-auto=\"1\"" })],
        "", m.autoRenew ? "عند الإلغاء يبقى اشتراكك فعّالاً حتى نهاية المدة المدفوعة ثم يتوقف." : "اشتراكك فعّال حتى تاريخ الانتهاء ولن يتجدد.")}`;
  }
  function addresses() {
    const list = S.addr.list();
    return `${list.length ? `<div class="rows">${list.map(a => `<div class="ord"><span class="ord__b"><b style="font-family:var(--f-display)">${U.esc(a.label)}${a.isDefault ? ' <span class="pill pill--ghost">الافتراضي</span>' : ""}</b><small style="white-space:normal">${U.esc(A.addrLine(a))}</small></span>
      ${a.isDefault ? "" : `<button class="btn btn--ghost btn--sm" type="button" data-def="${a.id}">افتراضي</button>`}
      <button class="citem__x" type="button" data-edit="${a.id}" aria-label="تعديل">${U.icon("edit")}</button><button class="citem__x" type="button" data-del="${a.id}" aria-label="حذف">${U.icon("trash")}</button></div>`).join("")}</div>`
      : U.empty("pin", "ما عندك عناوين محفوظة", "أضف عنوانك مرة واحدة ويظهر لك في كل طلب.")}
      <button class="btn btn--brand" type="button" data-new style="margin-top:14px">${U.icon("plus")}أضف عنواناً</button>`;
  }
  function profile(u) {
    return `<form class="card" id="profForm" novalidate style="max-width:560px">
      <label class="field"><span class="field__l">الاسم</span><input class="input" name="name" value="${U.esc(u.name || "")}" autocomplete="name" placeholder="اسمك الكامل"></label>
      <label class="field"><span class="field__l">رقم الجوال</span><input class="input num" value="${S.fmtPhone(u.phone)}" dir="ltr" disabled></label>
      <button class="btn btn--brand" type="submit">حفظ</button></form>`;
  }

  /* ---------- القائمة الجانبية (سطح المكتب) ---------- */
  function sidebar(u) {
    if (!side) return;
    if (!u) { side.innerHTML = ""; return; }
    side.innerHTML = `<div class="profile"><span class="avatar">${U.esc(initial(u))}</span><span><b>${U.esc(u.name || "أهلاً بك")}</b><small>${S.fmtPhone(u.phone)}</small></span></div>
      <div class="group">${[["", "نظرة عامة", "grid"]].concat(Object.keys(SEC).map(k => [k, SEC[k].t, SEC[k].i])).map(x =>
      `<a class="cell${s === x[0] ? " is-on" : ""}" href="account.html${x[0] ? "?s=" + x[0] : ""}"${s === x[0] ? ' aria-current="page"' : ""}><span class="cell__ic is-soft">${U.icon(x[2])}</span><span class="cell__b"><span class="cell__t">${x[1]}</span></span></a>`).join("")}
      <a class="cell" href="wishlist.html"><span class="cell__ic is-soft">${U.icon("heart")}</span><span class="cell__b"><span class="cell__t">المفضلة</span></span></a>
      <button class="cell cell--danger" type="button" data-logout><span class="cell__ic is-soft">${U.icon("logout")}</span><span class="cell__b"><span class="cell__t">تسجيل الخروج</span></span></button></div>`;
  }

  function render() {
    const u = S.user.get();
    sidebar(u);
    if (!SEC[s]) return home(u);
    if (!u) { root.innerHTML = loginCard("سجّل دخولك لتشوف " + SEC[s].t + "."); return; }
    root.innerHTML = ({ orders, guides, consults, membership, addresses, profile })[s](u);
    A.paintGuides(root);
  }

  root.addEventListener("click", async e => {
    const t = e.target;
    if (t.closest("[data-new]")) { A.addressSheet(null, render); return; }
    const ed = t.closest("[data-edit]"); if (ed) { A.addressSheet(S.addr.get(ed.dataset.edit), render); return; }
    const del = t.closest("[data-del]");
    if (del) { if (await A.confirmSheet({ title: "حذف العنوان؟", ok: "حذف", danger: true })) { S.addr.remove(del.dataset.del); A.toast("حُذف العنوان", { icon: "trash" }); render(); } return; }
    const df = t.closest("[data-def]"); if (df) { S.addr.setDefault(df.dataset.def); render(); return; }
    const cc = t.closest("[data-cancel-c]");
    if (cc) { if (await A.confirmSheet({ title: "إلغاء الاستشارة؟", ok: "إلغاء الاستشارة", cancel: "تراجع", danger: true })) { S.consults.cancel(cc.dataset.cancelC); A.toast("أُلغيت الاستشارة", { icon: "info" }); render(); } return; }
    const au = t.closest("[data-auto]");
    if (au) {
      if (au.dataset.auto === "0" && !(await A.confirmSheet({ title: "إلغاء التجديد التلقائي؟", text: "يبقى اشتراكك فعّالاً حتى نهاية المدة ثم يتوقف.", ok: "إلغاء التجديد", cancel: "تراجع", danger: true }))) return;
      S.member.setAutoRenew(au.dataset.auto === "1"); A.toast(au.dataset.auto === "1" ? "سيتجدد اشتراكك تلقائياً" : "أُلغي التجديد التلقائي", { icon: "spark" }); render();
    }
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
