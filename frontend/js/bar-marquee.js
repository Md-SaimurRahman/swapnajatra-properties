/* Turns the hero's navy info box into a gently moving ticker (left -> right, endless loop). */
(function(){
  try{ if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; }catch(_){}
  var SPEED=55; // pixels per second
  function layout(bar){
    var sets=bar.querySelectorAll('.h2set'); if(!sets.length) return;
    var first=sets[0], iw=innerWidth<=900?300:420;
    bar.style.setProperty('--mq-iw',iw+'px');
    var setW=first.scrollWidth||iw*4, cw=bar.clientWidth||innerWidth;
    var need=Math.ceil(cw/setW)+1;
    while(bar.querySelectorAll('.h2set').length<need){
      var c=first.cloneNode(true); c.setAttribute('aria-hidden','true');
      c.querySelectorAll('a,button').forEach(function(a){a.setAttribute('tabindex','-1')});
      first.parentNode.appendChild(c);
    }
    while(bar.querySelectorAll('.h2set').length>need){ var l=bar.querySelectorAll('.h2set'); l[l.length-1].remove(); }
    bar.style.setProperty('--mq-w',setW+'px');
    bar.style.setProperty('--mq-t',(setW/SPEED).toFixed(1)+'s');
  }
  function setup(){
    var bar=document.querySelector('.h2bar'); if(!bar||bar.dataset.mq) return;
    bar.dataset.mq='1';
    var kids=Array.prototype.slice.call(bar.children);
    var track=document.createElement('div'); track.className='h2track';
    var set=document.createElement('div'); set.className='h2set';
    kids.forEach(function(k){set.appendChild(k)});
    track.appendChild(set); bar.appendChild(track); bar.classList.add('mq');
    layout(bar);
  }
  var top=document.getElementById('top');
  function init(){ setup(); }
  if(top){ new MutationObserver(init).observe(top,{childList:true,subtree:true}); }
  var rt; addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var b=document.querySelector('.h2bar.mq');if(b)layout(b)},150)});
  init();
})();
