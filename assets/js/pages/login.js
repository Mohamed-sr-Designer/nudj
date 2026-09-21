/* تسجيل الدخول برقم الجوال: الرقم ← رمز التحقق (4 أرقام) ← الاسم لأول مرة ← الرجوع لما كنت فيه */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const root = $("#authRoot"); if (!root) return;
  const q = new URLSearchParams(location.search);
  /* نقبل فقط روابط داخل الموقع */
  let next = q.get("next") || "account.html";
  if (!/^[a-z0-9\-]+\.html(\?[^#]*)?(#.*)?$/i.test(next)) next = "account.html";
  let phone = null, timer = null;

  if (S.user.get()) { location.replace(next); return; }

  /* زر الرجوع يسمّي الشاشة التي جئت منها — مثل iOS */
  const TITLES = { "checkout.html": "إتمام الطلب", "subscribe.html": "نُضْج+", "consult.html": "استشارة جزّار", "account.html": "حسابي", "cart.html": "السلة" };
  const back = $(".ab-back");
  if (back) { const f = next.split("?")[0]; back.setAttribute("href", next); const sp = $("span", back); if (sp) sp.textContent = TITLES[f] || "رجوع"; }

  function stepPhone() {
    root.innerHTML = `<h1>تسجيل الدخول</h1><p class="lead">أدخل رقم جوالك ونرسل لك رمز تحقق. لا تحتاج كلمة مرور.</p>
      <form id="fPhone" novalidate>
        <label class="field"><span class="field__l">رقم الجوال</span><div class="phone-field"><span>+966</span><input id="ph" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" maxlength="12" autofocus></div><span class="field__err" id="phErr" hidden>أدخل رقماً سعودياً صحيحاً يبدأ بـ 5</span></label>
        <button class="btn btn--brand btn--lg btn--block" type="submit">إرسال الرمز</button>
      </form>
      <p class="auth__hint" style="margin-top:16px">بتسجيل الدخول أنت توافق على <a class="link" href="terms.html">الشروط</a> و<a class="link" href="privacy.html">سياسة الخصوصية</a>.</p>`;
    const inp = $("#ph");
    setTimeout(() => inp.focus(), 50);
    $("#fPhone").addEventListener("submit", async e => {
      e.preventDefault();
      const n = S.normPhone(inp.value);
      $("#phErr").hidden = !!n; inp.parentNode.classList.toggle("is-err", !n);
      if (!n) { inp.focus(); return; }
      phone = n; await A.busy($("button[type=submit]", root), 700); stepOtp();
    });
  }

  function stepOtp() {
    root.innerHTML = `<h1>أدخل الرمز</h1><p class="lead">أرسلنا رمزاً من 4 أرقام إلى <b class="num" dir="ltr">${S.fmtPhone(phone)}</b> · <button class="link" type="button" id="chg">تغيير الرقم</button></p>
      <form id="fOtp" novalidate>
        <div class="otp" id="otp">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" autocomplete="${i === 0 ? "one-time-code" : "off"}" maxlength="1" aria-label="الرقم ${i + 1}">`).join("")}</div>
        <p class="field__err" id="otpErr" hidden style="text-align:center">أدخل الرمز كاملاً</p>
        <button class="btn btn--brand btn--lg btn--block" type="submit">تأكيد</button>
      </form>
      <p class="auth__hint" style="margin-top:14px"><button class="auth__resend" type="button" id="resend" disabled>إعادة الإرسال بعد <span class="num" id="sec">30</span> ث</button></p>
      ${C.demo ? `<p class="demo-banner" style="margin-top:14px">${U.icon("info")}نسخة تجريبية: اكتب أي 4 أرقام.</p>` : ""}`;
    const boxes = $$("#otp input");
    boxes[0].focus();
    boxes.forEach((b, i) => {
      b.addEventListener("input", () => {
        const v = b.value.replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
        if (v.length > 1) { v.split("").slice(0, 4 - i).forEach((d, k) => { boxes[i + k].value = d; }); (boxes[Math.min(3, i + v.length)] || b).focus(); }
        else { b.value = v; if (v && boxes[i + 1]) boxes[i + 1].focus(); }
        if (boxes.every(x => x.value)) $("#fOtp").requestSubmit ? $("#fOtp").requestSubmit() : null;
      });
      b.addEventListener("keydown", e => { if (e.key === "Backspace" && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ""; } });
    });
    $("#chg").addEventListener("click", stepPhone);
    let n = 30; clearInterval(timer);
    timer = setInterval(() => { n--; const s = $("#sec"); if (s) s.textContent = n; if (n <= 0) { clearInterval(timer); const r = $("#resend"); if (r) { r.disabled = false; r.textContent = "إعادة إرسال الرمز"; } } }, 1000);
    $("#resend").addEventListener("click", () => { A.toast("أُرسل رمز جديد", { icon: "chat" }); stepOtp(); });
    $("#fOtp").addEventListener("submit", async e => {
      e.preventDefault();
      const code = boxes.map(x => x.value).join("");
      $("#otpErr").hidden = code.length === 4;
      if (code.length !== 4) { (boxes.find(x => !x.value) || boxes[0]).focus(); return; }
      clearInterval(timer);
      await A.busy($("button[type=submit]", root), 600);
      const nm = S.user.knownName(phone);
      if (nm != null) { S.user.login(phone, nm); A.toast("أهلاً بعودتك" + (nm ? " يا " + nm : "")); location.replace(next); return; }
      stepName();
    });
  }

  function stepName() {
    root.innerHTML = `<h1>أهلاً بك في نُضْج</h1><p class="lead">وش نسمّيك؟ نستخدم الاسم في الطلبات والتوصيل.</p>
      <form id="fName" novalidate>
        <label class="field"><span class="field__l">الاسم</span><input class="input" id="nm" autocomplete="name" placeholder="اسمك" autofocus></label>
        <button class="btn btn--brand btn--lg btn--block" type="submit">متابعة</button>
      </form>`;
    setTimeout(() => $("#nm").focus(), 50);
    $("#fName").addEventListener("submit", e => {
      e.preventDefault();
      S.user.login(phone, $("#nm").value.trim());
      A.toast("تم تسجيل الدخول");
      location.replace(next);
    });
  }

  stepPhone();
})();
