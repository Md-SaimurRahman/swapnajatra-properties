/* Property cards: slide in from the left the first time they come into view. */
(function(){
  try{ if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; }catch(_){}
  if(!('IntersectionObserver' in window)||!('MutationObserver' in window)) return;
  var gd=document.getElementById('gd'); if(!gd) return;
  var seen={};
  var io=new IntersectionObserver(function(entries){
    var vis=entries.filter(function(e){return e.isIntersecting}).sort(function(a,b){
      var A=a.target.getBoundingClientRect(),B=b.target.getBoundingClientRect();return (A.top-B.top)||(A.left-B.left)});
    vis.forEach(function(e,i){
      var el=e.target; io.unobserve(el);
      el.style.setProperty('--swp-d',Math.min(i,8)*200+'ms');
      el.classList.add('swp-go'); void el.offsetWidth;
      el.classList.remove('swp-pre'); el.classList.add('swp-done');
      if(el.dataset.id) seen[el.dataset.id]=1;
      setTimeout(function(){el.classList.remove('swp-go')},1400);
    });
  },{threshold:0.08,rootMargin:'0px 0px -6% 0px'});
  function prep(){
    gd.querySelectorAll('.card').forEach(function(el){
      if(el.dataset.swp) return; el.dataset.swp='1';
      if(el.dataset.id && seen[el.dataset.id]) return;   // already revealed before (filters, hearts): keep normal behaviour
      el.classList.add('swp-pre'); io.observe(el);
    });
  }
  new MutationObserver(prep).observe(gd,{childList:true});
  prep();
})();
