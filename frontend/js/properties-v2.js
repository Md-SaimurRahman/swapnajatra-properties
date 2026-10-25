/* properties v2 */
(function(){
var S=document.getElementById("properties");if(!S||S.dataset.v2)return;S.dataset.v2="1";S.classList.add("pr2");
var CT={};
var T={en:{eb:"DISCOVER YOUR NEXT ADDRESS",h:"Properties",s:"Explore a wide range of premium properties in prime locations across Dhaka.",
a:["Buy","Your Dream Home"],b:["Rent","Flexible Options"],c:["Invest","High Potential Areas"],g:"Grid",l:"List"},
bn:{eb:"আপনার পরবর্তী ঠিকানা খুঁজুন",h:"প্রপার্টি",s:"ঢাকার সেরা এলাকায় প্রিমিয়াম প্রপার্টির বিস্তৃত সংগ্রহ দেখুন।",
a:["কিনুন","স্বপ্নের বাড়ি"],b:["ভাড়া","নমনীয় সুযোগ"],c:["বিনিয়োগ","সম্ভাবনাময় এলাকা"],g:"গ্রিড",l:"লিস্ট"}};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(){var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
function ic(n){var p={home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',bld:'<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1M3 21h18"/>',
grid:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
list:'<path d="M5 6h14M5 12h14M5 18h14"/>',pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
type:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',bed:'<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5"/>',
tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',sort:'<path d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/>',
heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>'}[n];
return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
var bn=document.createElement("div");bn.className="pr2b";S.insertBefore(bn,S.firstChild);
function c(k){var o=CT[k];if(!o)return"";return L()==="bn"&&o.value_bn?o.value_bn:(o.value||"")}
function banner(){var l=L(),t=T[l],bg=(CT.properties_image&&CT.properties_image.value)||(CT.hero_image&&CT.hero_image.value);
if(bg)bn.style.backgroundImage="url('"+encodeURI(bg)+"')";else bn.style.backgroundImage="";
bn.innerHTML='<div class="pr2in"><div class="pr2t"><div class="pr2e">'+esc(c("properties_eyebrow")||t.eb)+'</div><h2>'+esc(c("properties_heading")||t.h)+'</h2><p>'+esc(c("properties_subtitle")||t.s)+'</p></div>'
+'<div class="pr2f"><div>'+ic("home")+'<b>'+t.a[0]+'</b><span>'+t.a[1]+'</span></div><div>'+ic("key")+'<b>'+t.b[0]+'</b><span>'+t.b[1]+'</span></div><div>'+ic("bld")+'<b>'+t.c[0]+'</b><span>'+t.c[1]+'</span></div></div></div>'}
function build(){var w=S.querySelector(".w");if(!w||w.querySelector(".pr2p"))return;
var P=document.createElement("div");P.className="pr2p";var bt=w.querySelector(".bt"),bar=w.querySelector(".bar"),cnt=w.querySelector("#cnt");
if(!bt||!bar)return;w.insertBefore(P,bt);P.appendChild(bt);P.appendChild(bar);
var hp=document.getElementById("hp");if(hp){var d=hp.parentElement;d.querySelector("label").textContent="Max budget";var fa=document.getElementById("fa").parentElement;bar.insertBefore(d,fa)}
var map={fl:"pin",ft:"type",fb:"bed",hp:"tag",fa:"star",fs:"sort"};
Object.keys(map).forEach(function(id){var e=document.getElementById(id);if(!e)return;var lb=e.parentElement.querySelector("label");if(lb&&!lb.querySelector("svg"))lb.insertAdjacentHTML("afterbegin",ic(map[id]))});
var sb=document.getElementById("sb"),rs=document.getElementById("rs");if(sb&&rs){var A=document.createElement("div");A.className="pr2a";P.appendChild(A);A.appendChild(sb);A.appendChild(rs)}}
function vt(){var t=T[L()],g=document.getElementById("vg"),l=document.getElementById("vl");
if(g)g.innerHTML=ic("grid")+"<span>"+t.g+"</span>";if(l)l.innerHTML=ic("list")+"<span>"+t.l+"</span>"}
function wrapBadges(){var g=document.getElementById("gd");if(!g)return;g.querySelectorAll(".card .ph").forEach(function(ph){if(ph.querySelector(".pr2bs"))return;
var bs=ph.querySelectorAll(".bd");var a=[];bs.forEach(function(b){var st=b.getAttribute("style")||"";if(st.indexOf("top:44px")<0)a.push(b)});if(!a.length)return;
var w=document.createElement("div");w.className="pr2bs";ph.insertBefore(w,a[0]);a.forEach(function(b){b.removeAttribute("style");w.appendChild(b)})})}
function init(){build();vt();wrapBadges();var g=document.getElementById("gd");if(g)new MutationObserver(wrapBadges).observe(g,{childList:true})}
new MutationObserver(function(){banner();vt()}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
banner();
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){CT=d.content||{};banner()}).catch(function(){});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
