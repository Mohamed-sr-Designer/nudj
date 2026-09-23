/* لوحة التحكم — تعديل كل محتوى الموقع وبياناته (admin.html، غير مفهرسة) */
module.exports = function (ctx) {
  const { U } = ctx;
  return [{
    name: "admin", file: "admin.html", tab: "", mode: "root", appTitle: "لوحة التحكم", noindex: true,
    chrome: false, footer: false, tabbar: false, scripts: ["admin"],
    title: "لوحة التحكم · نُضْج", desc: "لوحة تحكم نُضْج.",
    main: `<div class="adm" id="adm"><div class="loading" aria-hidden="true"><i></i><i></i><i></i></div></div>
<noscript><p class="card" style="margin:20px">لوحة التحكم تحتاج JavaScript.</p></noscript>`
  }];
};
