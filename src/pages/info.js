/* المساعدة + من نحن + تواصل + الشروط + الخصوصية */
module.exports = function (ctx) {
  const { D, U, C, h } = ctx;
  const { icon } = U;
  const K = C.contact;
  const draft = C.demo ? `<p class="demo-banner">${icon("info")}نموذج مبدئي — راجع النص مع مستشار قانوني وعدّل ما بين [الأقواس] قبل الإطلاق.</p>` : "";
  const push = (name, file, title, appTitle, desc, main, extra) => Object.assign({
    name, file, tab: "account", mode: "push", back: ["account.html", "حسابي"], appTitle, title: title + " · نُضْج", desc, main
  }, extra || {});

  /* ================= المساعدة ================= */
  const cats = [
    ["delivery", "truck", "الطلب والتوصيل"], ["cutting", "knife", "التقطيع والتتبيل"], ["payment", "card", "الدفع"],
    ["returns", "refresh", "الاسترجاع والإلغاء"], ["advisor", "chat", "المستشار"], ["account", "user", "الحساب"]
  ];
  const help = push("help", "help.html", "الأسئلة الشائعة والمساعدة", "المساعدة",
    "إجابات عن الطلب والتوصيل والتقطيع والتتبيل والدفع والاسترجاع ومستشار نُضْج.",
    `<div class="wrap">
  ${h.crumbs([["المساعدة"]])}
  <div class="page-head"><h1 class="large-title">كيف نقدر نساعدك؟</h1><p>إن ما لقيت إجابتك، <a class="link" href="contact.html">تواصل معنا</a>.</p></div>
  <div class="help-cats">${cats.map(c => `<a class="cell" href="#${c[0]}"><span class="cell__ic">${icon(c[1])}</span><span class="cell__b"><span class="cell__t">${c[2]}</span></span>${icon("chevL", "cell__chev")}</a>`).join("")}</div>

  <h2 class="group__head" id="delivery">الطلب والتوصيل</h2>
  <div class="faq">
    ${h.faq("كيف أطلب؟", "طريقتين: اختر القطعة وحدد الوزن على الميزان والتقطيع ثم أضفها للسلة، أو اسأل المستشار عن مناسبتك ويطلع لك خطة كاملة تضيفها بضغطة. بعدها تختار العنوان وموعد التوصيل وطريقة الدفع.")}
    ${h.faq("متى يوصل طلبي؟", `تختار يوم التوصيل والفترة المناسبة عند إتمام الطلب. الفترات المتاحة: ${C.windows.map(w => w.l).join("، ")}.`)}
    ${h.faq("كم رسوم التوصيل؟", `${C.delivery.fee} ${C.currency}، والتوصيل مجاني للطلبات من ${C.delivery.freeOver} ${C.currency} فأكثر.`)}
    ${h.faq("وين توصلون؟", `حالياً: ${C.cities.join("، ")}.`)}
    ${h.faq("كيف يوصل اللحم؟", "[يُضاف وصف آلية التبريد والتغليف الفعلية]. التغليف المفرّغ متاح كخدمة إضافية.")}
  </div>

  <h2 class="group__head" id="cutting">التقطيع والتتبيل والتغليف</h2>
  <div class="faq">
    ${h.faq("هل التقطيع برسوم إضافية؟", "لا. أي شكل تقطيع — قطع كبسة، مكعبات أوصال، شرائح، ستيك، حلقات، مفروم، كباب — مجاني.")}
    ${h.faq("كم سعر التتبيل والتسييخ والتغليف؟", D.MARINADES.filter(m => m.p).map(m => `<b>تتبيلة ${m.n}:</b> ${m.d} — ${m.p} ${C.currency}/كجم`).join("<br>") + `<br><b>${D.SERVICES.skewer.n}:</b> ${D.SERVICES.skewer.p} ${C.currency}/كجم<br><b>${D.SERVICES.vacuum.n}:</b> ${D.SERVICES.vacuum.p} ${C.currency}/كجم، أو ${D.SERVICES.vacuum.carcass} ${C.currency} للذبيحة`)}
    ${h.faq("وش أساليب تقطيع الذبيحة؟", D.STYLES.map(s => `<b>${s.n}:</b> ${s.d}`).join("<br>"))}
    ${h.faq("أقدر أطلب تقطيعاً خاصاً؟", "نعم. اكتب طلبك في «ملاحظة للجزّار» في صفحة المنتج، مثلاً: «الأفخاذ كاملة والباقي ثلاجة».")}
    ${h.faq("هل الأوزان دقيقة؟", "القطعيات تُوزن بالوزن اللي تختاره على الميزان. أوزان الذبائح تقريبية لأن كل ذبيحة تختلف، والوزن التقريبي مكتوب تحت كل حجم.")}
  </div>

  <h2 class="group__head" id="payment">الدفع</h2>
  <div class="faq">
    ${h.faq("وش طرق الدفع المتاحة؟", "مدى، Apple Pay، البطاقات الائتمانية، التقسيط عبر تمارا، والدفع عند الاستلام.")}
    ${h.faq("هل الأسعار شاملة الضريبة؟", "نعم، كل الأسعار شاملة ضريبة القيمة المضافة (15٪)، وتظهر قيمة الضريبة في الفاتورة.")}
    ${h.faq("كيف أستخدم كود الخصم؟", "أدخله في صفحة إتمام الطلب. أكواد الخصم تنطبق على اللحوم فقط، ولا تشمل الخدمات الإضافية وعدّة الشواء.")}
  </div>

  <h2 class="group__head" id="returns">الاسترجاع والإلغاء</h2>
  <div class="faq">
    ${h.faq("هل أقدر أرجّع اللحم؟", "لأن اللحوم منتجات طازجة، لا تُسترجع بعد الاستلام إلا إذا وصلت بحالة غير سليمة أو مخالفة للطلب. تواصل معنا خلال [مدة الإبلاغ] من الاستلام مع صورة للمنتج ورقم الطلب.")}
    ${h.faq("كيف ألغي طلبي؟", "من صفحة الفاتورة في «حسابي ← طلباتي» قبل بدء التجهيز، أو بالتواصل معنا مع رقم الطلب.")}
  </div>

  <h2 class="group__head" id="advisor">المستشار</h2>
  <div class="faq">
    ${h.faq("وش هو مستشار نُضْج؟", "محادثة تسألك عن مناسبتك (مشاوي، عزومة، ذبيحة، ستيك، طبخ الأسبوع) وعددكم وتفضيلاتكم، وتحسب لك القطعيات بالجرام مع التقطيع والتتبيلة والعدّة وسعر كل شيء. استخدامه مجاني.")}
    ${D.FAQ.slice(1, 3).map(f => h.faq(f[0], f[1])).join("")}
    ${h.faq("هل المستشار ذكاء اصطناعي؟", "لا — يعتمد على قواعد كميات واضحة (مكتوبة في صفحة المستشار)، ويفهم الكلام البسيط مثل «كبسة حاشي لـ 12». الكميات تقديرية ويمكنك تعديلها قبل الطلب.")}
  </div>

  <h2 class="group__head" id="account">الحساب</h2>
  <div class="faq">
    ${h.faq("كيف أسجّل؟", "برقم جوالك فقط: ندخل الرقم ونرسل لك رمز تحقق.")}
    ${h.faq("وين ألقى طلباتي وخططي؟", "في «حسابي»: طلباتي مع فواتيرها، خطط المستشار المحفوظة، والعناوين.")}
  </div>
</div>`);

  /* ================= من نحن ================= */
  const about = push("about", "about.html", "من نحن", "من نحن",
    "نُضْج ملحمة إلكترونية ومستشار طبخ: ست مواشي، قطعيات بالكيلو تُقطّع مجاناً، ومستشار يحسب لحم مناسبتك بالجرام.",
    `<div class="wrap">
  ${h.crumbs([["من نحن"]])}
  <div class="page-head"><h1 class="large-title">ملحمة تسألك قبل ما تقطّع.</h1></div>
  ${U.slot("about", "about-img", "غرفة تبريد")}
  <div class="prose" style="margin-top:28px">
    <p class="lead">أغلب الناس ما يعرفون كم كيلو يحتاجون لعزومة عشرة، ولا أي قطعة تنفع للمندي. نُضْج مبني على هالسؤال: قل لنا المناسبة، ونحسب لك الباقي.</p>
    <h2>وش نقدّم</h2>
    <ul>
      <li><b>القطيع:</b> ضأن، ماعز، حاشي، عجل، بقر، جاموس — ${D.PRODUCTS.filter(p => p.sold === "kg").length} قطعية بالكيلو و${D.carcasses().length} ذبائح.</li>
      <li><b>التقطيع مجاني:</b> قطع كبسة، أوصال، شرائح، ستيك، حلقات، مفروم، كباب — بأي شكل تبغاه.</li>
      <li><b>خدمات بالطلب:</b> تتبيل، تسييخ، وتغليف مفرّغ — بسعر واضح بالكيلو.</li>
      <li><b>المستشار:</b> يحسب لك الكميات بالجرام والعدّة والبهارات، وتطلب الخطة كاملة.</li>
    </ul>
    <h2>معلومات المنشأة</h2>
    <ul><li>الاسم التجاري: نُضْج</li><li>المدينة: ${K.city}</li><li>السجل التجاري: ${K.cr}</li><li>الرقم الضريبي: ${K.vatNo}</li></ul>
  </div>
</div>`);

  /* ================= تواصل ================= */
  const contact = push("contact", "contact.html", "تواصل معنا", "تواصل معنا",
    "تواصل مع نُضْج بخصوص طلبك أو التقطيع أو التتبيل.",
    `<div class="wrap">
  ${h.crumbs([["تواصل معنا"]])}
  <div class="page-head"><h1 class="large-title">تواصل معنا</h1><p>عندك سؤال عن طلبك أو التقطيع؟ نحن هنا.</p></div>
  <div class="contact-grid">
    <div class="ccard">${icon("phone")}<b>الهاتف</b><span class="num" dir="ltr">${K.phone}</span></div>
    <div class="ccard">${icon("chat")}<b>واتساب</b><span class="num" dir="ltr">${K.whatsapp}</span></div>
    <div class="ccard">${icon("mail")}<b>البريد الإلكتروني</b><span>${K.email}</span></div>
    <div class="ccard">${icon("clock")}<b>ساعات العمل</b><span>${K.hours}</span></div>
  </div>
  <section class="section" aria-labelledby="cfH">
    <h2 id="cfH" class="h2">أرسل لنا رسالة</h2>
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

  /* ================= الشروط ================= */
  const terms = push("terms", "terms.html", "الشروط والأحكام", "الشروط والأحكام",
    "الشروط والأحكام لاستخدام متجر نُضْج والمستشار والخدمات الإضافية.",
    `<div class="wrap">
  ${h.crumbs([["الشروط والأحكام"]])}
  <div class="page-head"><h1 class="large-title">الشروط والأحكام</h1><p>آخر تحديث: [التاريخ]</p></div>
  ${draft}
  <div class="prose">
    <h2>1. التعريفات</h2>
    <p>«نُضْج» أو «نحن»: المنشأة المالكة للمتجر (السجل التجاري ${K.cr}). «العميل»: كل من يستخدم المتجر أو يشتري منه. «المستشار»: أداة حساب الكميات التفاعلية في الموقع.</p>
    <h2>2. الطلبات والأسعار</h2>
    <p>الأسعار بالريال السعودي وشاملة ضريبة القيمة المضافة. القطعيات تُباع بالكيلو، وأوزان الذبائح تقريبية ومكتوبة في صفحة كل منتج. يُعد الطلب مؤكداً بعد إتمام الدفع أو اختيار الدفع عند الاستلام.</p>
    <h2>3. التوصيل</h2>
    <p>يتم التوصيل في اليوم والفترة التي يختارها العميل ضمن المدن المغطاة. رسوم التوصيل ${C.delivery.fee} ${C.currency}، ومجاني للطلبات من ${C.delivery.freeOver} ${C.currency} فأكثر.</p>
    <h2>4. الاسترجاع والإلغاء</h2>
    <p>اللحوم منتجات طازجة لا تُسترجع بعد الاستلام إلا إذا وصلت بحالة غير سليمة أو مخالفة للطلب، على أن يُبلَغ عنها خلال [مدة الإبلاغ]. يمكن إلغاء الطلب قبل بدء تجهيزه.</p>
    <h2>5. الخدمات الإضافية</h2>
    <p>التقطيع مجاني. التتبيل والتسييخ والتغليف المفرّغ خدمات مدفوعة تُحسب بالكيلو (أو بمبلغ ثابت للذبيحة) وتظهر منفصلة في الفاتورة.</p>
    <h2>6. المستشار</h2>
    <p>الكميات التي يقترحها المستشار تقديرية لمساعدة العميل، والعميل مسؤول عن مراجعتها وتعديلها قبل تأكيد الطلب.</p>
    <h2>7. التواصل</h2>
    <p>لأي استفسار: ${K.phone} · ${K.email}</p>
  </div>
</div>`);

  /* ================= الخصوصية ================= */
  const privacy = push("privacy", "privacy.html", "سياسة الخصوصية", "الخصوصية",
    "كيف يجمع نُضْج بياناتك ويستخدمها ويحميها.",
    `<div class="wrap">
  ${h.crumbs([["سياسة الخصوصية"]])}
  <div class="page-head"><h1 class="large-title">سياسة الخصوصية</h1><p>آخر تحديث: [التاريخ]</p></div>
  ${draft}
  <div class="prose">
    <h2>البيانات التي نجمعها</h2>
    <ul><li>رقم الجوال والاسم لتسجيل الدخول وتأكيد الطلبات.</li><li>عناوين التوصيل التي تحفظها.</li><li>تفاصيل الطلبات وخطط المستشار التي تحفظها.</li></ul>
    <h2>كيف نستخدمها</h2>
    <ul><li>تجهيز الطلبات وتوصيلها والتواصل بشأنها.</li><li>حفظ خطط المستشار في حسابك.</li><li>تحسين الخدمة. لا نبيع بياناتك لأي طرف.</li></ul>
    <h2>الدفع</h2>
    <p>تتم عمليات الدفع عبر مزوّد دفع معتمد، ولا نحتفظ ببيانات بطاقتك.</p>
    <h2>حقوقك</h2>
    <p>يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها بالتواصل معنا على ${K.email}، وفق نظام حماية البيانات الشخصية في المملكة العربية السعودية.</p>
  </div>
</div>`);

  return [help, about, contact, terms, privacy];
};
