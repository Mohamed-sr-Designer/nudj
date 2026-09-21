/* حجز استشارة جزّار: الموضوع ← الطريقة ← الموعد ← الدفع ← تأكيد */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const form = $("#cForm"); if (!form) return;
  const bar = $("#actionBar");
  let channel = "مكالمة فيديو", slot = null;

  const price = () => S.isMember() ? C.consult.memberPrice : C.consult.price;
  function paint() {
    const t = $("input[name=topic]:checked", form);
    $("#sTopic").textContent = t ? t.value : "—";
    $("#sChan").textContent = channel;
    $("#sWhen").textContent = slot ? slot.dateLabel + " · " + slot.time : "—";
    $("#sPrice").textContent = price() + " " + C.currency;
    const ab = $("#abPrice"); if (ab) ab.textContent = price() + " " + C.currency;
    $("#sMember").innerHTML = S.isMember() ? `سعر أعضاء نُضْج+ (بدل ${C.consult.price} ${C.currency}).` : `<a class="link" href="subscribe.html">أعضاء نُضْج+ يدفعون ${C.consult.memberPrice} ${C.currency} فقط</a>`;
  }
  form.addEventListener("change", paint);
  $("#channel").addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    channel = b.dataset.v;
    $$("#channel button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
    paint();
  });
  const picker = A.slotPicker($("#cDays"), $("#cTimes"), { times: C.consultTimes, days: 7, leadHours: 1, onChange: s => { slot = s; paint(); } });
  const pay = A.payMethods($("#cPay"), { cod: false });

  /* نحفظ ما كتبه المستخدم إذا انتقل لتسجيل الدخول، ونعيده عند الرجوع */
  const DK = "nudj_consult_draft";
  function saveDraft() {
    const fd = new FormData(form);
    try { sessionStorage.setItem(DK, JSON.stringify({ topic: fd.get("topic"), channel, people: fd.get("people") || "", notes: fd.get("notes") || "" })); } catch (e) { }
  }
  (function restoreDraft() {
    let d = null; try { d = JSON.parse(sessionStorage.getItem(DK)); sessionStorage.removeItem(DK); } catch (e) { }
    if (!d) return;
    const t = $$("input[name=topic]", form).find(i => i.value === d.topic); if (t) t.checked = true;
    const c = $(`#channel button[data-v="${d.channel}"]`); if (c) c.click();
    form.elements.people.value = d.people; form.elements.notes.value = d.notes;
  })();

  async function book(btn) {
    if (!slot) { A.toast("اختر الموعد", { icon: "calendar" }); return; }
    if (!S.user.get()) saveDraft();
    if (!A.requireLogin("consult.html")) return;
    if (!pay.valid()) { A.toast("أكمل بيانات البطاقة", { icon: "info" }); return; }
    await A.busy(btn, 1000);
    const fd = new FormData(form);
    const c = S.consults.create({ topic: fd.get("topic"), channel, slot, people: fd.get("people") || "", notes: (fd.get("notes") || "").trim(), price: price(), payment: pay.label() });
    form.hidden = true; if (bar) bar.hidden = true; document.body.classList.remove("has-actionbar");
    const done = $("#cDone"); done.hidden = false;
    const u = S.user.get();
    done.innerHTML = `<div class="success"><div class="tick">${U.icon("check", "", 2.6)}</div><h1>تم حجز الاستشارة</h1>
      <p>${U.esc(c.topic)} · ${U.esc(c.channel)}<br><b>${U.esc(slot.dateLabel)} — ${U.esc(slot.time)}</b><br>سيتواصل معك الجزّار على ${S.fmtPhone(u.phone)} في الموعد.</p>
      <div class="order-no">رقم الحجز: ${c.id}</div>
      <div class="btn-col" style="margin-top:20px"><a class="btn btn--brand btn--lg" href="account.html?s=consults">استشاراتي</a><a class="btn btn--ghost" href="shop.html">تسوّق اللحم</a></div></div>`;
    window.scrollTo(0, 0);
  }
  form.addEventListener("submit", e => { e.preventDefault(); book(e.submitter || $(".desk-cta", form)); });
  const ab = $("#abBook"); if (ab) ab.addEventListener("click", e => book(e.currentTarget));
  S.on("auth", paint);
  paint();
})();
