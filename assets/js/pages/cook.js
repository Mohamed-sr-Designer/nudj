/* مختبر الطبخ: الجزء المجاني ظاهر، ومرجع الحرارات والأخطاء لأعضاء نُضْج+ */
(function () {
  "use strict";
  const S = window.NUDJ_STORE, A = window.NUDJ_APP;
  const { $ } = A;
  let ready = false;
  function paint() {
    const open = S.hasAccess("lab");
    $("#labLocked").hidden = open;
    $("#labFull").hidden = !open;
    if (open && !ready) { A.ruler($("#labRuler"), "mr"); ready = true; }
  }
  S.on("auth", paint);
  paint();
})();
