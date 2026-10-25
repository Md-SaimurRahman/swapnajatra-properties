(function () {
  var ART = [
    '<g transform="translate(64 -34) scale(.68)"><circle cx="320" cy="80" r="46" fill="#d9a93a" opacity=".9"/><g fill="#fff" opacity=".18"><rect x="30" y="90" width="90" height="18" rx="9"/><rect x="60" y="120" width="70" height="14" rx="7"/></g><rect x="95" y="190" width="170" height="120" fill="#eaf1f8"/><polygon points="80,196 180,120 280,196" fill="#d9a93a"/><rect x="165" y="236" width="36" height="74" rx="3" fill="#14508c"/><rect x="112" y="214" width="34" height="34" rx="3" fill="#6fa8e6"/><rect x="220" y="214" width="34" height="34" rx="3" fill="#6fa8e6"/><rect x="318" y="206" width="8" height="106" fill="#cfd9e6"/><rect x="286" y="190" width="72" height="50" rx="6" fill="#d9a93a"/><path d="M303 214 l11 11 l22 -24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>',
    '<g transform="translate(64 -34) scale(.68)"><g fill="#fff" opacity=".16"><circle cx="70" cy="70" r="30"/><circle cx="110" cy="85" r="22"/></g><rect x="40" y="250" width="100" height="72" fill="#eaf1f8"/><polygon points="30,254 90,206 150,254" fill="#6fa8e6"/><rect x="78" y="280" width="24" height="42" fill="#14508c"/><rect x="215" y="140" width="130" height="182" fill="#eaf1f8"/><g fill="#6fa8e6"><rect x="230" y="156" width="22" height="22"/><rect x="264" y="156" width="22" height="22"/><rect x="298" y="156" width="22" height="22"/><rect x="230" y="192" width="22" height="22"/><rect x="264" y="192" width="22" height="22"/><rect x="298" y="192" width="22" height="22"/><rect x="230" y="228" width="22" height="22"/><rect x="264" y="228" width="22" height="22"/><rect x="298" y="228" width="22" height="22"/></g><rect x="266" y="272" width="28" height="50" fill="#14508c"/><g fill="none" stroke="#d9a93a" stroke-width="9"><circle cx="168" cy="110" r="30"/><circle cx="198" cy="110" r="30"/></g></g>',
    '<g transform="translate(64 -34) scale(.68)"><circle cx="90" cy="86" r="40" fill="#d9a93a" opacity=".85"/><g fill="#eaf1f8"><rect x="120" y="270" width="150" height="60"/><rect x="132" y="214" width="126" height="52"/></g><g fill="none" stroke="#eaf1f8" stroke-width="5"><rect x="144" y="160" width="102" height="50"/><line x1="144" y1="185" x2="246" y2="185"/><line x1="195" y1="160" x2="195" y2="210"/></g><g fill="#6fa8e6"><rect x="134" y="282" width="20" height="20"/><rect x="168" y="282" width="20" height="20"/><rect x="202" y="282" width="20" height="20"/><rect x="236" y="282" width="20" height="20"/><rect x="146" y="226" width="20" height="20"/><rect x="180" y="226" width="20" height="20"/><rect x="214" y="226" width="20" height="20"/></g><g stroke="#d9a93a" stroke-width="7" fill="none" stroke-linecap="square"><line x1="300" y1="330" x2="300" y2="72"/><line x1="228" y1="84" x2="378" y2="84"/><line x1="300" y1="72" x2="236" y2="84"/><line x1="300" y1="72" x2="370" y2="84"/><line x1="244" y1="84" x2="244" y2="140" stroke-width="3"/></g><rect x="232" y="138" width="24" height="14" fill="#d9a93a"/><rect x="354" y="84" width="30" height="20" fill="#d9a93a"/></g>',
    '<g transform="translate(96 -36) scale(.52)"><g fill="#1d4f80"><rect x="30" y="250" width="110" height="80"/><rect x="160" y="250" width="90" height="80"/><rect x="270" y="250" width="100" height="80"/><rect x="30" y="350" width="150" height="70"/><rect x="200" y="350" width="170" height="70"/></g><g stroke="#d9a93a" stroke-width="5" fill="rgba(217,169,58,.14)" stroke-dasharray="14 9"><polygon points="62,262 238,248 252,330 70,344"/></g><g fill="#d9a93a"><circle cx="62" cy="262" r="8"/><circle cx="238" cy="248" r="8"/><circle cx="252" cy="330" r="8"/><circle cx="70" cy="344" r="8"/></g><rect x="238" y="96" width="120" height="150" rx="8" fill="#eaf1f8"/><g stroke="#14508c" stroke-width="6" stroke-linecap="round"><line x1="256" y1="124" x2="338" y2="124"/><line x1="256" y1="148" x2="338" y2="148"/><line x1="256" y1="172" x2="318" y2="172"/></g><circle cx="322" cy="214" r="18" fill="none" stroke="#d9a93a" stroke-width="6"/><path d="M313 214 l7 7 l12 -14" fill="none" stroke="#d9a93a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="150" cy="150" r="46" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="9"/><line x1="184" y1="184" x2="226" y2="226" stroke="#fff" stroke-width="12" stroke-linecap="round"/></g>',
    '<g transform="translate(64 -34) scale(.68)"><circle cx="330" cy="76" r="40" fill="#d9a93a" opacity=".85"/><rect x="90" y="120" width="140" height="210" fill="#eaf1f8"/><rect x="236" y="190" width="80" height="140" fill="#d3e1ef"/><g fill="#6fa8e6"><rect x="106" y="138" width="24" height="24"/><rect x="144" y="138" width="24" height="24"/><rect x="182" y="138" width="24" height="24"/><rect x="106" y="178" width="24" height="24"/><rect x="144" y="178" width="24" height="24"/><rect x="182" y="178" width="24" height="24"/><rect x="106" y="218" width="24" height="24"/><rect x="182" y="218" width="24" height="24"/><rect x="252" y="206" width="20" height="20"/><rect x="284" y="206" width="20" height="20"/></g><rect x="144" y="270" width="30" height="60" fill="#14508c"/><g transform="translate(300 300)"><circle r="40" fill="none" stroke="#d9a93a" stroke-width="16" stroke-dasharray="11 14.1"/><circle r="31" fill="#d9a93a"/><circle r="13" fill="#12395f"/></g></g>'
  ];
  function pick(title, idx) {
    var t = (title || '').toLowerCase();
    if (t.indexOf('land share') > -1) return 2;
    if (t.indexOf('joint') > -1) return 1;
    if (t.indexOf('buy') > -1) return 0;
    if (t.indexOf('consult') > -1 || t.indexOf('land management') > -1) return 3;
    if (t.indexOf('facility') > -1 || t.indexOf('property management') > -1) return 4;
    return idx < 5 ? idx : -1;
  }
  function apply() {
    var cards = document.querySelectorAll('#services .sc');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.classList.contains('has-img')) continue;
      var h = c.querySelector('h3');
      var k = pick(h ? h.textContent : '', i);
      if (k < 0) continue;
      var wrap = document.createElement('div');
      wrap.innerHTML =
        '<svg class="sc-bg" viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs><linearGradient id="svcg' + i + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#245f9f"/><stop offset="1" stop-color="#0b2342"/></linearGradient></defs>' +
        '<rect width="400" height="440" fill="url(#svcg' + i + ')"/>' +
        '<path d="M0 176 Q200 164 400 176 V440 H0Z" fill="#12395f"/>' + ART[k] + '</svg>' +
        '<div class="sc-ov"></div>';
      while (wrap.lastChild) c.insertBefore(wrap.lastChild, c.firstChild);
      c.classList.add('has-img');
    }
  }
  var timer;
  function later() { clearTimeout(timer); timer = setTimeout(apply, 30); }
  document.addEventListener('DOMContentLoaded', apply);
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
