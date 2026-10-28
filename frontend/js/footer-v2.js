/* footer v2: adds Home/Contact to Explore, mirrors the Services list, builds social icons from #soc (admin Settings) */
(function(){
var ft=document.querySelector('footer.ft');if(!ft)return;
var w=ft.querySelector('.w');if(!w||w.dataset.v2)return;w.dataset.v2='1';
var brand=w.children[0],explore=w.children[1],visit=document.getElementById('ftVisit');
if(!brand||!explore||!visit)return;
/* Explore: add Home first and Contact last, same names as the top menu */
var ex=explore.querySelectorAll('a');
for(var i=0;i<ex.length;i++){if(/^How we work$/i.test(ex[i].textContent.trim()))ex[i].textContent='How it works'}
var home=document.createElement('a');home.href='#top';home.textContent='Home';explore.querySelector('h4').after(home);
var ct=document.createElement('a');ct.href='#contact';ct.textContent='Contact';explore.appendChild(ct);
/* Our Services column */
var sv=document.createElement('div');sv.id='ftSvc';sv.innerHTML='<h4>Our Services</h4>';w.insertBefore(sv,visit);
/* social icons */
var soc=document.createElement('div');soc.className='ftsoc';soc.hidden=true;soc.setAttribute('aria-label','Social links');
var d=document.getElementById('ftDesc');(d||brand.lastElementChild).after(soc);
var IC={
facebook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h2V5h-2.5C11.3 5 10 6.4 10 8.5V10H8v3h2v6h3v-6h2.2l.4-3H13V8.6c0-.4.2-.6 1-.6z"/></svg>',
linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 9h-3v10h3V9zM5 4.5a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM20 19v-5.5c0-2.7-1.4-4-3.3-4-1.5 0-2.2.8-2.6 1.4V9h-3v10h3v-5.5c0-1.3.6-2 1.6-2s1.4.8 1.4 2V19H20z"/></svg>',
youtube:'<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z"/></svg>',
instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" stroke="none"/></svg>'};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var sigS='',sigV='';
function render(){
  var out=[];document.querySelectorAll('#soc a').forEach(function(a){var k=a.textContent.trim().toLowerCase();if(IC[k]&&/^https?:\/\//.test(a.href))out.push([k,a.href,a.textContent.trim()])});
  var s=JSON.stringify(out);if(s!==sigS){sigS=s;soc.innerHTML=out.map(function(o){return '<a href="'+esc(o[1])+'" target="_blank" rel="noopener" aria-label="'+esc(o[2])+'">'+IC[o[0]]+'</a>'}).join('');soc.hidden=!out.length}
  var names=[];document.querySelectorAll('#services .sv2c h3').forEach(function(h){var t=h.textContent.trim();if(t)names.push(t)});
  var v=JSON.stringify(names);if(v!==sigV&&names.length){sigV=v;sv.innerHTML='<h4>'+esc(sv.dataset.h||'Our Services')+'</h4>'+names.map(function(n){return '<a href="#services">'+esc(n)+'</a>'}).join('')}
}
var tm;function later(){clearTimeout(tm);tm=setTimeout(render,150)}
var mo=new MutationObserver(later);
mo.observe(ft,{childList:true,subtree:true});
var sc=document.getElementById('services');if(sc)mo.observe(sc,{childList:true,subtree:true,characterData:true});
render();setTimeout(render,1200);setTimeout(render,3500);
})();
