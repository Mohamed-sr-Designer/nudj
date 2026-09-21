/* نموذج التواصل — في النسخة التجريبية لا يُرسل لأي خادم */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $ } = A;
  const f = $("#contactForm"); if (!f) return;
  const u = S.user.get();
  if (u) { f.elements.name.value = u.name || ""; f.elements.phone.value = u.phone; }
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const bad = [];
    if (!f.elements.name.value.trim()) bad.push(f.elements.name);
    if (!S.normPhone(f.elements.phone.value)) bad.push(f.elements.phone);
    if (f.elements.msg.value.trim().length < 5) bad.push(f.elements.msg);
    [f.elements.name, f.elements.phone, f.elements.msg].forEach(el => (el.closest(".phone-field") || el).classList.toggle("is-err", bad.indexOf(el) > -1));
    if (bad.length) { bad[0].focus(); A.toast("أكمل الحقول المطلوبة", { icon: "info" }); return; }
    await A.busy($("button[type=submit]", f), 800);
    f.outerHTML = `<div class="card success" style="max-width:640px"><div class="tick">${U.icon("check", "", 2.6)}</div><h2>شكراً لك</h2>
      <p>${D.CONFIG.demo ? "في النسخة التجريبية لا تُرسل الرسالة فعلياً — عند الربط تصل لفريق خدمة العملاء." : "وصلتنا رسالتك وبنرد عليك قريباً."}</p></div>`;
  });
})();
