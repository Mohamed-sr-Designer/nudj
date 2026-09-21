/* الاشتراك في نُضْج+: اختيار الخطة ← الدخول (إن لزم) ← الدفع ← نجاح */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG, PL = C.plans;
  const form = $("#subForm"), done = $("#subDone"), active = $("#subActive");
  const bar = $("#actionBar");

  const q = new URLSearchParams(location.search);
  if (q.get("plan") && PL[q.get("plan")]) { const r = $(`input[name=plan][value=${q.get("plan")}]`); if (r) r.checked = true; }
  const next = q.get("next");

  function plan() { const r = $("input[name=plan]:checked"); return PL[r ? r.value : "annual"]; }
  function renewDate(k) { const d = new Date(); if (k === "annual") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1); return d.getTime(); }
  function paint() {
    const P = plan();
    $("#sPlan").textContent = P.name; $("#sRenew").textContent = U.fmtDate(renewDate(P.k));
    $("#sTotal").textContent = U.money(P.price) + " " + C.currency;
    const ap = $("#abPlan"), apr = $("#abPrice"); if (ap) ap.textContent = "اشتراك " + P.name; if (apr) apr.textContent = U.money(P.price) + " " + C.currency;
  }
  form.addEventListener("change", e => { if (e.target.name === "plan") paint(); });

  const pay = A.payMethods($("#payBox"), { cod: false });

  function showActive(m) {
    form.hidden = true; if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar");
    active.hidden = false;
    active.innerHTML = `<div class="success"><div class="tick">${U.icon("check", "", 2.6)}</div><h1>أنت مشترك في نُضْج+</h1>
      <p>اشتراكك ${m.plan === "annual" ? "السنوي" : "الشهري"} فعّال ${m.autoRenew ? "ويتجدد" : "وينتهي"} في ${U.fmtDate(m.renews)}.</p>
      <div class="btn-col"><a class="btn btn--brand btn--lg" href="expertise.html">تصفّح الأدلة</a><a class="btn btn--ghost" href="account.html?s=membership">إدارة الاشتراك</a></div></div>`;
  }
  async function subscribe(btn) {
    if (!A.requireLogin("subscribe.html?plan=" + plan().k + (next ? "&next=" + encodeURIComponent(next) : ""))) return;
    if (!pay.valid()) { A.toast("أكمل بيانات البطاقة", { icon: "info" }); return; }
    await A.busy(btn, 1100);
    const m = S.member.subscribe(plan().k);
    form.hidden = true; if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar");
    done.hidden = false;
    done.innerHTML = `<div class="success"><div class="tick">${U.icon("check", "", 2.6)}</div><h1>مرحباً بك في نُضْج+</h1>
      <p>كل الأدلة (${D.GUIDES.length}) ومختبر الطبخ صارت مفتوحة لك. يتجدد اشتراكك في ${U.fmtDate(m.renews)}، وتقدر تلغيه من حسابك في أي وقت.</p>
      <div class="btn-col">${next ? `<a class="btn btn--brand btn--lg" href="${U.esc(next)}">ارجع لما كنت تشوفه</a>` : ""}<a class="btn ${next ? "btn--ghost" : "btn--brand btn--lg"}" href="expertise.html">تصفّح الأدلة</a><a class="btn btn--ghost" href="cook.html">افتح مختبر الطبخ</a></div></div>`;
    window.scrollTo(0, 0);
  }
  $("#subBtn").addEventListener("click", e => subscribe(e.currentTarget));
  const ab = $("#abSub"); if (ab) ab.addEventListener("click", e => subscribe(e.currentTarget));

  const m = S.member.get();
  if (m) showActive(m); else paint();
})();
