(function () {
  function fix() {
    var links = document.querySelectorAll('a[href^="tel:"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var t = a.textContent.trim();
      if (!/^[+\d\s\-]+$/.test(t)) continue;
      var d = (a.getAttribute('href') || '').replace(/\D/g, '');
      if (d.indexOf('880') === 0) d = d.slice(3);
      else if (d.charAt(0) === '0') d = d.slice(1);
      else continue;
      if (d.length !== 10) continue;
      var out = '+880 ' + d.slice(0, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7);
      if (a.textContent !== out) a.textContent = out;
    }
  }
  var timer;
  function later() { clearTimeout(timer); timer = setTimeout(fix, 50); }
  document.addEventListener('DOMContentLoaded', fix);
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  fix();
})();
