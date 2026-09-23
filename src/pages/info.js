/* المساعدة + من نحن + تواصل + الشروط + الخصوصية — كل المحتوى من D.COPY و D.HELP (لوحة التحكم) */
module.exports = function (ctx) {
  const { D, U, C } = ctx;
  const { icon, esc, tpl, h, L } = U;
  const T = D.COPY, K = C.contact;
  const draft = C.demo ? `<p class="demo-banner">${icon("info")}${L("نموذج مبدئي — راجع النص مع مستشار قانوني وعدّل ما بين [الأقواس] قبل الإطلاق.", "Draft template — review this text with a legal adviser and replace everything in [brackets] before launch.")}</p>` : "";
  const push = (name, file, title, appTitle, desc, main, extra) => Object.assign({
    name, file, tab: "account", mode: "push", back: ["account.html", L("حسابي", "My account")], appTitle, title: title + L(" · نُضْج", " · NUDJ"), desc, main, tone: "light"
  }, extra || {});
  const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const help = push("help", "help.html", L("الأسئلة الشائعة والمساعدة", "Help & FAQ"), L("المساعدة", "Help"),
    L("إجابات عن الطلب والتوصيل والتقطيع والتتبيل والدفع والاسترجاع ومستشار نُضْج.", "Answers about ordering, delivery, cutting, marinating, payment, returns and the NUDJ advisor."),
    `<div class="wrap">
  ${h.crumbs([[L("المساعدة", "Help")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.help.title)}</h1><p>${tpl(T.help.sub)}</p></div>
  <div class="help-cats">${D.HELP.map(g => `<a class="cell" href="#${esc(g.k)}"><span class="cell__ic">${icon(g.ic || "help")}</span><span class="cell__b"><span class="cell__t">${esc(g.t)}</span></span>${icon("chevL", "cell__chev")}</a>`).join("")}</div>
  ${D.HELP.map(g => `<h2 class="group__head" id="${esc(g.k)}">${esc(g.t)}</h2>
  <div class="faq">${(g.items || []).map(it => h.faq(esc(it[0]), tpl(it[1]))).join("")}</div>`).join("\n")}
</div>`);

  const about = push("about", "about.html", L("من نحن", "About us"), L("من نحن", "About us"), strip(tpl(T.about.body)).slice(0, 180),
    `<div class="wrap">
  ${h.crumbs([[L("من نحن", "About us")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.about.title)}</h1></div>
  ${U.slot("about", "about-img", L("نُضْج", "NUDJ"))}
  <div class="prose" style="margin-top:28px">${tpl(T.about.body)}</div>
</div>`);

  const contact = push("contact", "contact.html", L("تواصل معنا", "Contact us"), L("تواصل معنا", "Contact us"), L("تواصل مع نُضْج بخصوص طلبك أو التقطيع أو التتبيل.", "Contact NUDJ about your order, cutting or marinating."),
    `<div class="wrap">
  ${h.crumbs([[L("تواصل معنا", "Contact us")]])}
  <div class="page-head"><h1 class="large-title">${esc(T.contact.title)}</h1><p>${tpl(T.contact.sub)}</p></div>
  <div class="contact-grid">
    <div class="ccard">${icon("phone")}<b>${L("الهاتف", "Phone")}</b><span class="num" dir="ltr">${esc(K.phone)}</span></div>
    <div class="ccard">${icon("chat")}<b>${L("واتساب", "WhatsApp")}</b><span class="num" dir="ltr">${esc(K.whatsapp)}</span></div>
    <div class="ccard">${icon("mail")}<b>${L("البريد الإلكتروني", "Email")}</b><span>${esc(K.email)}</span></div>
    <div class="ccard">${icon("clock")}<b>${L("ساعات العمل", "Opening hours")}</b><span>${esc(K.hours)}</span></div>
  </div>
  <section class="section" aria-labelledby="cfH">
    <h2 id="cfH" class="h2">${esc(T.contact.formTitle)}</h2>
    <form class="card" id="contactForm" novalidate style="max-width:640px">
      <div class="form-grid">
        <label class="field"><span class="field__l">${L("الاسم", "Name")}</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span class="field__l">${L("رقم الجوال", "Mobile number")}</span><div class="phone-field"><span>+966</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5X XXX XXXX" required></div></label>
      </div>
      <div class="form-grid">
        <label class="field"><span class="field__l">${L("الموضوع", "Topic")}</span><select class="select" name="topic">${L(["استفسار عن طلب", "التقطيع والتتبيل", "المستشار والكميات", "ملاحظة أو شكوى", "أخرى"], ["A question about an order", "Cutting & marinating", "The advisor & quantities", "Feedback or a complaint", "Other"]).map(o => `<option>${o}</option>`).join("")}</select></label>
        <label class="field"><span class="field__l">${L("رقم الطلب", "Order no.")} <small>${L("(اختياري)", "(optional)")}</small></span><input class="input" name="order" placeholder="NJ..."></label>
      </div>
      <label class="field"><span class="field__l">${L("الرسالة", "Message")}</span><textarea class="textarea" name="msg" required maxlength="1000"></textarea></label>
      <button class="btn btn--ember btn--lg" type="submit">${L("إرسال", "Send")}</button>
    </form>
  </section>
</div>`, { scripts: ["contact"] });

  const legal = (name, file, title, appTitle, desc, x) => push(name, file, title, appTitle, desc, `<div class="wrap">
  ${h.crumbs([[title]])}
  <div class="page-head"><h1 class="large-title">${esc(title)}</h1><p>${L("آخر تحديث", "Last updated")}: ${esc(x.updated)}</p></div>
  ${draft}
  <div class="prose">${tpl(x.body)}</div>
</div>`);
  const terms = legal("terms", "terms.html", L("الشروط والأحكام", "Terms & conditions"), L("الشروط والأحكام", "Terms"), L("الشروط والأحكام لاستخدام متجر نُضْج والمستشار والخدمات الإضافية.", "The terms and conditions for using the NUDJ store, the advisor and extra services."), T.terms);
  const privacy = legal("privacy", "privacy.html", L("سياسة الخصوصية", "Privacy policy"), L("الخصوصية", "Privacy"), L("كيف يجمع نُضْج بياناتك ويستخدمها ويحميها.", "How NUDJ collects, uses and protects your data."), T.privacy);

  return [help, about, contact, terms, privacy];
};
