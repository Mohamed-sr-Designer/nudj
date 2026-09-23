/* تسجيل الدخول برقم الجوال: الرقم ← رمز التحقق (4 أرقام) ← الاسم لأول مرة ← الرجوع لما كنت فيه */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const C = D.CONFIG;
  const L = D.L || (ar => ar);
  const root = $("#authRoot"); if (!root) return;
  const q = new URLSearchParams(location.search);
  /* نقبل فقط روابط داخل الموقع */
  let next = q.get("next") || "account.html";
  if (!/^[a-z0-9\-]+\.html(\?[^#]*)?(#.*)?$/i.test(next)) next = "account.html";
  let phone = null, timer = null;

  if (S.user.get()) { location.replace(next); return; }

  /* زر الرجوع يسمّي الشاشة التي جئت منها — مثل iOS */
  const TITLES = { "checkout.html": L("إتمام الطلب", "Checkout"), "advisor.html": L("المستشار", "Advisor"), "account.html": L("حسابي", "My account"), "cart.html": L("السلة", "Cart") };
  const back = $(".ab-back");
  if (back) { const f = next.split("?")[0]; back.setAttribute("href", next); const sp = $("span", back); if (sp) sp.textContent = TITLES[f] || L("رجوع", "Back"); }

  function stepPhone() {
    root.innerHTML = `<h1>${L("تسجيل الدخول", "Sign in")}</h1><p class="lead">${L("أدخل رقم جوالك ونرسل لك رمز تحقق. لا تحتاج كلمة مرور.", "Enter your mobile number and we'll send you a verification code. No password needed.")}</p>
      <form id="fPhone" novalidate>
        <label class="field"><span class="field__l">${L("رقم الجوال", "Mobile number")}</span><div class="phone-field"><span>+966</span><input id="ph" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" maxlength="12" autofocus></div><span class="field__err" id="phErr" hidden>${L("أدخل رقماً سعودياً صحيحاً يبدأ بـ 5", "Enter a valid Saudi number starting with 5")}</span></label>
        <button class="btn btn--ember btn--lg btn--block" type="submit">${L("إرسال الرمز", "Send code")}</button>
      </form>
      <p class="auth__hint" style="margin-top:16px">${L(`بتسجيل الدخول أنت توافق على <a class="link" href="terms.html">الشروط</a> و<a class="link" href="privacy.html">سياسة الخصوصية</a>.`, `By signing in you agree to the <a class="link" href="terms.html">terms</a> and <a class="link" href="privacy.html">privacy policy</a>.`)}</p>`;
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
    root.innerHTML = `<h1>${L("أدخل الرمز", "Enter the code")}</h1><p class="lead">${L("أرسلنا رمزاً من 4 أرقام إلى", "We sent a 4-digit code to")} <b class="num" dir="ltr">${S.fmtPhone(phone)}</b> · <button class="link" type="button" id="chg">${L("تغيير الرقم", "Change number")}</button></p>
      <form id="fOtp" novalidate>
        <div class="otp" id="otp">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" autocomplete="${i === 0 ? "one-time-code" : "off"}" maxlength="1" aria-label="${L("الرقم", "Digit")} ${i + 1}">`).join("")}</div>
        <p class="field__err" id="otpErr" hidden style="text-align:center">${L("أدخل الرمز كاملاً", "Enter the full code")}</p>
        <button class="btn btn--ember btn--lg btn--block" type="submit">${L("تأكيد", "Confirm")}</button>
      </form>
      <p class="auth__hint" style="margin-top:14px"><button class="auth__resend" type="button" id="resend" disabled>${L("إعادة الإرسال بعد", "Resend in")} <span class="num" id="sec">30</span> ${L("ث", "s")}</button></p>
      ${C.demo ? `<p class="demo-banner" style="margin-top:14px">${U.icon("info")}${L("نسخة تجريبية: اكتب أي 4 أرقام.", "Demo version: type any 4 digits.")}</p>` : ""}`;
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
    timer = setInterval(() => { n--; const s = $("#sec"); if (s) s.textContent = n; if (n <= 0) { clearInterval(timer); const r = $("#resend"); if (r) { r.disabled = false; r.textContent = L("إعادة إرسال الرمز", "Resend code"); } } }, 1000);
    $("#resend").addEventListener("click", () => { A.toast(L("أُرسل رمز جديد", "New code sent"), { icon: "chat" }); stepOtp(); });
    $("#fOtp").addEventListener("submit", async e => {
      e.preventDefault();
      const code = boxes.map(x => x.value).join("");
      $("#otpErr").hidden = code.length === 4;
      if (code.length !== 4) { (boxes.find(x => !x.value) || boxes[0]).focus(); return; }
      clearInterval(timer);
      await A.busy($("button[type=submit]", root), 600);
      const nm = S.user.knownName(phone);
      if (nm != null) { S.user.login(phone, nm); A.toast(L("أهلاً بعودتك" + (nm ? " يا " + nm : ""), "Welcome back" + (nm ? ", " + nm : ""))); location.replace(next); return; }
      stepName();
    });
  }

  function stepName() {
    root.innerHTML = `<h1>${L("أهلاً بك في نُضْج", "Welcome to NUDJ")}</h1><p class="lead">${L("وش نسمّيك؟ نستخدم الاسم في الطلبات والتوصيل.", "What should we call you? We use your name for orders and delivery.")}</p>
      <form id="fName" novalidate>
        <label class="field"><span class="field__l">${L("الاسم", "Name")}</span><input class="input" id="nm" autocomplete="name" placeholder="${L("اسمك", "Your name")}" autofocus></label>
        <button class="btn btn--ember btn--lg btn--block" type="submit">${L("متابعة", "Continue")}</button>
      </form>`;
    setTimeout(() => $("#nm").focus(), 50);
    $("#fName").addEventListener("submit", e => {
      e.preventDefault();
      S.user.login(phone, $("#nm").value.trim());
      A.toast(L("تم تسجيل الدخول", "You're signed in"));
      location.replace(next);
    });
  }

  stepPhone();
})();
