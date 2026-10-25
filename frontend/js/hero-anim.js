/* Hero animation: skyline rises, windows light up in gold, clouds drift, text fades in. */
(function(){
  var svg=document.querySelector('.hero svg.sk');if(!svg)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rect(x,y,w,h,fill,cls,delay,extra){
    return '<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" style="animation-delay:'+delay+'s"'+(extra||'')+'/>';
  }
  var s='';
  s+='<defs><radialGradient id="sunG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe9a8" stop-opacity=".45"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>';
  /* sun v2 */
  (function(){var cx=1010,cy=-100,k=.42,g='';
    g+='<defs><radialGradient id="sunCore" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#fffef6"/><stop offset=".5" stop-color="#ffe98a"/><stop offset="1" stop-color="#f5b93c"/></radialGradient>';
    g+='<linearGradient id="sunRay" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd35a" stop-opacity=".7"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient></defs>';
    g+='<circle class="hs-sun" cx="'+cx+'" cy="'+cy+'" r="'+(190*k)+'" fill="url(#sunG)"/>';
    g+='<g class="hs-rays">';
    for(var i=0;i<24;i++){var a=i*15,L=(i%2?88:128)*k,w=(i%2?5:7)*k,R=50*k;g+='<polygon transform="rotate('+a+' '+cx+' '+cy+')" fill="url(#sunRay)" points="'+(cx-w)+','+(cy-R)+' '+(cx+w)+','+(cy-R)+' '+cx+','+(cy-R-L)+'"/>'}
    g+='</g>';
    g+='<circle class="hs-ring" cx="'+cx+'" cy="'+cy+'" r="'+(66*k)+'" fill="none" stroke="#ffd35a" stroke-opacity=".55" stroke-width="1.5"/>';
    g+='<circle class="hs-ring hs-ring2" cx="'+cx+'" cy="'+cy+'" r="'+(82*k)+'" fill="none" stroke="#fff3c4" stroke-opacity=".5" stroke-width="1"/>';
    g+='<circle class="hs-core" cx="'+cx+'" cy="'+cy+'" r="'+(40*k)+'" fill="url(#sunCore)"/>';
    /* moon v1 */
    g+='<g class="hs-moon"><defs><radialGradient id="moonHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#dfe9ff" stop-opacity=".55"/><stop offset=".45" stop-color="#b9cdf5" stop-opacity=".18"/><stop offset="1" stop-color="#b9cdf5" stop-opacity="0"/></radialGradient>';
    g+='<radialGradient id="moonFace" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fffdf2"/><stop offset=".6" stop-color="#e8ecf6"/><stop offset="1" stop-color="#bcc6dc"/></radialGradient></defs>';
    g+='<circle class="hs-mhalo" cx="'+cx+'" cy="'+cy+'" r="95" fill="url(#moonHalo)"/>';
    g+='<circle cx="'+cx+'" cy="'+cy+'" r="25" fill="url(#moonFace)"/>';
    [[-8,-6,5.2],[7,-9,3.2],[9,6,6],[-9,9,3.4],[0,1,2.4]].forEach(function(c){g+='<circle cx="'+(cx+c[0])+'" cy="'+(cy+c[1])+'" r="'+c[2]+'" fill="#8f9bb8" fill-opacity=".22"/>'});
    g+='</g>';
    s+=g;
  })();
  /* stars v1 */
  (function(){var h=document.querySelector('header.hero');if(!h||h.querySelector('.hs-stars'))return;
    var sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('class','hs-stars');sv.setAttribute('aria-hidden','true');
    var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
    var html='';for(var i=0;i<70;i++){var x=(rnd()*100).toFixed(2),y=(rnd()*70).toFixed(2),q=rnd(),r=q<.12?1.8:(q<.5?1.2:.8),d=(rnd()*6).toFixed(2),t=(2.5+rnd()*4).toFixed(2);html+='<circle class="hs-star" cx="'+x+'%" cy="'+y+'%" r="'+r+'" style="animation-delay:-'+d+'s;animation-duration:'+t+'s"/>'}
    html+='<line class="hs-shoot" x1="55%" y1="9%" x2="53.6%" y2="10.6%"/>';
    sv.innerHTML=html;h.insertBefore(sv,h.firstChild)})();
  var clouds=[[120,60,1,70],[520,30,.8,95],[860,100,.9,80]];
  clouds.forEach(function(c,i){
    s+='<g class="hs-cloud" style="animation-duration:'+c[3]+'s;animation-delay:-'+(i*23)+'s"><g transform="translate('+c[0]+' '+c[1]+') scale('+c[2]+')" fill="#fff" opacity=".75"><ellipse cx="0" cy="0" rx="46" ry="13"/><ellipse cx="-22" cy="-9" rx="24" ry="12"/><ellipse cx="14" cy="-13" rx="28" ry="14"/></g></g>';
  });
  s+='<g fill="#8fbfe6" opacity=".7">'+rect(540,170,80,230,'#8fbfe6','hs-rise',.35)+rect(660,120,70,280,'#8fbfe6','hs-rise',.5)+rect(1060,180,90,220,'#8fbfe6','hs-rise',.65)+'</g>';
  s+=rect(800,40,150,360,'#2f74b5','hs-rise',.8,' rx="3"');
  s+=rect(990,110,60,290,'#5b97cf','hs-rise',1);
  var w='';
  for(var r=0;r<8;r++)for(var c=0;c<3;c++){
    var d=(1.7+Math.random()*2.6).toFixed(2);
    w+='<rect class="hs-win" x="'+(814+c*40)+'" y="'+(62+r*40)+'" width="30" height="14" rx="1.5" style="animation-delay:'+d+'s,'+(+d+1.2+Math.random()*3).toFixed(2)+'s"/>';
  }
  for(var r2=0;r2<6;r2++){
    var d2=(2.1+Math.random()*2.4).toFixed(2);
    w+='<rect class="hs-win" x="1002" y="'+(128+r2*42)+'" width="36" height="12" rx="1.5" style="animation-delay:'+d2+'s,'+(+d2+1.2+Math.random()*3).toFixed(2)+'s"/>';
  }
  s+=w;

  s+='<path class="hs-ground" d="M0 350Q600 300 1200 350V400H0z" fill="#0e6b3b"/>';
  s+='<path class="hs-line" d="M0 350Q600 300 1200 350" fill="none" stroke="#c99a2e" stroke-width="5" pathLength="1"/>';
  svg.innerHTML=s;
  if(reduce)svg.classList.add('hs-static');
  if(!reduce&&matchMedia('(hover:hover)').matches){
    var hero=document.querySelector('.hero'),raf=0;
    hero.addEventListener('mousemove',function(e){
      if(raf)return;raf=requestAnimationFrame(function(){
        raf=0;var x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);
        svg.style.transform='translate('+(x*-14).toFixed(1)+'px,'+(y*-6).toFixed(1)+'px)';
      });
    });
  }
})();

/* trust-move v1 */
(function(){function mv(){var h=document.querySelector('header.hero'),s=document.querySelector('section.trust-strip');if(h&&s&&h.nextElementSibling!==s)h.after(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mv);else mv()})();

/* clock-move v1 */
(function(){function mv(){var k=document.querySelector('.tk'),sp=document.querySelector('.logo > span');if(!k||!sp||sp.querySelector('.tk'))return;var c=k.closest('.clk')||k.parentElement;if(c&&c!==sp)sp.appendChild(c)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mv);else mv();setTimeout(mv,800)})();

/* clock-fix v2 */
(function(){function fx(){var sp=document.querySelector('.logo > span'),k=document.querySelector('.tk');if(!sp||!k)return;var c=k.closest('.clk')||k.parentElement;if(c.parentNode!==sp)sp.appendChild(c);if(c.getAttribute('data-m2'))return;c.setAttribute('data-m2','1');c.innerHTML='<span class="dot"></span><span class="tz">Dhaka</span>';c.appendChild(k)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fx);else fx();setTimeout(fx,900);setTimeout(fx,1800)})();

/* align-menu v1 */
(function(){function al(){var t=document.querySelector('.nav-r .lt, nav .lt')||document.querySelector('.lt'),m=document.querySelector('#dBtn'),vis=function(e){return e&&e.offsetParent!==null&&e.getBoundingClientRect().width>0};if(!vis(m))m=document.querySelector('#ham');if(!vis(t)||!vis(m))return;m.style.transform='';var a=t.getBoundingClientRect(),b=m.getBoundingClientRect(),d=(a.top+a.height/2)-(b.top+b.height/2);if(Math.abs(d)>0.5)m.style.transform='translateY('+d.toFixed(1)+'px)'}
function run(){al();setTimeout(al,300);setTimeout(al,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('load',al);window.addEventListener('resize',al)})();

/* buyrent v1 */
(function(){function init(){var fm=document.getElementById('fm'),g=document.querySelector('.bt');if(!fm||!g||g.getAttribute('data-i'))return;g.setAttribute('data-i','1');
var bs=g.querySelectorAll('button');function sync(){bs.forEach(function(b){var on=b.getAttribute('data-m')===fm.value;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')})}
bs.forEach(function(b){b.addEventListener('click',function(){if(fm.value===b.getAttribute('data-m'))return;fm.value=b.getAttribute('data-m');fm.dispatchEvent(new Event('change',{bubbles:true}));sync()})});
fm.addEventListener('change',sync);setInterval(sync,300);sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();setTimeout(init,600)})();
