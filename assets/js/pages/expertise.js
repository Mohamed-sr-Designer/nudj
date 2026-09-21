/* مركز الخبرة: بطاقة العضوية حسب الحالة + تبويبات الأدلة */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const box = $("#memberBox"); const original = box.innerHTML;

  function paintMember() {
    const m = S.member.get();
    if (!m) { box.innerHTML = original; return; }
    const owned = D.GUIDES.length;
    box.innerHTML = `<div class="member-card member-card--active">
      <div class="member-card__top"><span class="member-card__logo">نُضْج<span class="plus" style="color:#fff">+</span></span><span class="pill pill--own">${U.icon("check", "", 2.4)}فعّال</span></div>
      <h2>أهلاً بك في نُضْج+</h2>
      <p>كل الأدلة (${owned}) ومختبر الطبخ مفتوحة لك. ${m.autoRenew ? "يتجدد اشتراكك" : "ينتهي اشتراكك"} (${m.plan === "annual" ? "سنوي" : "شهري"}) في ${U.fmtDate(m.renews)}.</p>
      <div class="btn-row"><a class="btn btn--light" href="#xpTabs">تصفّح الأدلة</a><a class="btn btn--ghost" style="color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4)" href="account.html?s=membership">إدارة الاشتراك</a></div>
    </div>`;
  }

  /* التبويبات */
  const tabs = $("#xpTabs");
  function show(k) {
    $$("button", tabs).forEach(b => { const on = b.dataset.pane === k; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    $$("[data-pane-body]").forEach(p => { p.hidden = p.dataset.paneBody !== k; });
  }
  tabs.addEventListener("click", e => { const b = e.target.closest("button[data-pane]"); if (b) show(b.dataset.pane); });
  if (location.hash === "#dishes") { show("dishes"); setTimeout(() => tabs.scrollIntoView({ block: "start" }), 50); }
  if (location.hash === "#lab") show("lab");

  /* شارة مختبر الطبخ */
  function paintLab() {
    const el = $('[data-gstate="lab"]'); if (!el) return;
    el.innerHTML = S.hasAccess("lab") ? U.ownPill("ضمن نُضْج+") : `<span class="pill pill--lock">${U.icon("lock")}نُضْج+</span>`;
  }
  S.on("auth", () => { paintMember(); paintLab(); });
  paintMember();
  setTimeout(paintLab, 0);
})();
