/* المساعدة + من نحن + تواصل + الشروط + الخصوصية — كل المحتوى من D.COPY و D.HELP (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h } = U;
  const T = D.COPY, K = C.contact;
  const draft = C.demo ? `<p class="demo-banner">${icon("info")}نموذج مبدئي — راجع النص مع مستشار قانوني وعدّل ما بين [الأقواس] قبل الإطلاق.</p>` : "";
  const push = (name, file, title, appTitle, desc, main, extra) => Object.assign({
    name, file, tab: "account", mode: "push", back: ["account.html", "حسابي"], appTitle, title: title + " · نُضْج", desc, main
  }, extra || {});
  const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const help = push("help", "help.html", "الأسئلة الشائعة والمساعدة", "المساعدة",
    "إجابات عن الطلب والتوصيل والتقطيع والتتبيل والدفع والاسترجاع ومستشار نُضْج.",
    `<div class="wrap">
  ${h.crumbs([["المساعدة"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.help.title)}</h1><p>${tpl(T.help.sub)}</p></div>
  <div class="help-cats">${D.HELP.map(g => `<a class="cell" href="#${esc(g.k)}"><span class="cell__ic">${icon(g.ic || "help")}</span><span class="cell__b"><span class="cell__t">${esc(g.t)}</span></span>${icon("chevL", "cell__chev")}</a>`).join("")}</div>
  ${D.HELP.map(g => `<h2 class="group__head" id="${esc(g.k)}">${esc(g.t)}</h2>
  <div class="faq">${(g.items || []).map(it => h.faq(esc(it[0]), tpl(it[1]))).join("")}</div>`).join("\n")}
</div>`);

  const about = push("about", "about.html", "من نحن", "من نحن", strip(tpl(T.about.body)).slice(0, 180),
    `<div class="wrap">
  ${h.crumbs([["من نحن"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.about.title)}</h1></div>
  ${U.slot("about", "about-img", "نُضْج")}
  <div class="prose" style="margin-top:28px">${tpl(T.about.body)}</div>
</div>`);

  const contact = push("contact", "contact.html", "تواصل معنا", "تواصل معنا", "تواصل مع نُضْج بخصوص طلبك أو التقطيع أو التتبيل.",
    `<div class="wrap">
  ${h.crumbs([["تواصل معنا"]])}
  <div class="page-head"><h1 class="large-title">${esc(T.contact.title)}</h1><p>${tpl(T.contact.sub)}</p></div>
  <div class="contact-grid">
    <div class="ccard">${icon("phone")}<b>الهاتف</b><span class="num" dir="ltr">${esc(K.phone)}</span></div>
    <div class="ccard">${icon("chat")}<b>واتساب</b><span class="num" dir="ltr">${esc(K.whatsapp)}</span></div>
    <div class="ccard">${icon("mail")}<b>البريد الإلكتروني</b><span>${esc(K.email)}</span></div>
    <div class="ccard">${icon("clock")}<b>ساعات العمل</b><span>${esc(K.hours)}</span></div>
  </div>
  <section class="section" aria-labelledby="cfH">
    <h2 id="cfH" class="h2">${esc(T.contact.formTitle)}</h2>
    <form class="card" id="contactForm" novalidate style="max-width:640px">
      <div class="form-grid">
        <label class="field"><span class="field__l">الاسم</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span class="field__l">رقم الجوال</span><div class="phone-field"><span>+966</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" required></div></label>
      </div>
      <div class="form-grid">
        <label class="field"><span class="field__l">الموضوع</span><select class="select" name="topic"><option>استفسار عن طلب</option><option>التقطيع والتتبيل</option><option>المستشار والكميات</option><option>ملاحظة أو شكوى</option><option>أخرى</option></select></label>
        <label class="field"><span class="field__l">رقم الطلب <small>(اختياري)</small></span><input class="input" name="order" placeholder="NJ..."></label>
      </div>
      <label class="field"><span class="field__l">الرسالة</span><textarea class="textarea" name="msg" required maxlength="1000"></textarea></label>
      <button class="btn btn--ember btn--lg" type="submit">إرسال</button>
    </form>
  </section>
</div>`, { scripts: ["contact"] });

  const legal = (name, file, title, appTitle, desc, x) => push(name, file, title, appTitle, desc, `<div class="wrap">
  ${h.crumbs([[title]])}
  <div class="page-head"><h1 class="large-title">${esc(title)}</h1><p>آخر تحديث: ${esc(x.updated)}</p></div>
  ${draft}
  <div class="prose">${tpl(x.body)}</div>
</div>`);
  const terms = legal("terms", "terms.html", "الشروط والأحكام", "الشروط والأحكام", "الشروط والأحكام لاستخدام متجر نُضْج والمستشار والخدمات الإضافية.", T.terms);
  const privacy = legal("privacy", "privacy.html", "سياسة الخصوصية", "الخصوصية", "كيف يجمع نُضْج بياناتك ويستخدمها ويحميها.", T.privacy);

  return [help, about, contact, terms, privacy];
};
