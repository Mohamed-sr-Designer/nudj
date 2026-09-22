/* صفحة المستشار: ?o=grill يبدأ مناسبة · ?ask=id يسأل عن قطعة · الخطط المحفوظة في الجانب */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI, ADV = window.NUDJ_ADVISOR;
  const { $ } = A;
  const q = new URLSearchParams(location.search);
  const o = q.get("o"), ask = q.get("ask");
  if (ADV) {
    if (o && D.ADVISOR.occasions.some(x => x.k === o) && ADV.state().a.occ !== o) ADV.start(o);
    else if (ask && D.byId(ask)) ADV.askAbout(ask);
    if (o || ask) try { history.replaceState(null, "", "advisor.html"); } catch (e) { }
  }
  const box = $("#advPlans");
  function plans() {
    if (!box) return;
    const l = S.plans.list();
    box.innerHTML = l.length ? `<h2 class="adv-side__h">خططك المحفوظة</h2><div class="plan-list">${l.slice(0, 4).map(p => `<a class="plan-mini" href="account.html?s=plans"><b>${U.esc(p.title)}</b><span class="num">${U.money2(p.total)} ر.س</span></a>`).join("")}</div>` : "";
  }
  S.on("plans", plans); plans();
})();
