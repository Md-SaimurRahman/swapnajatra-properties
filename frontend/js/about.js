/* About Us page: Chairman first, then the Board of Directors (same order as in admin). */
(function(){
var $=function(i){return document.getElementById(i)};
var CT={},TM=[],PF={},lang="en",th="system";
var T={en:{eb:"ABOUT US",h:"Our <em>Leadership</em>",s:"Guiding Swapnajatra Properties Ltd. with experience, integrity and a long-term vision for a better tomorrow.",home:"← Home",back:"Back to home",chair:"Chairman",lt:"বাংলা",title:"About Us — Swapnajatra Properties Ltd."},
bn:{eb:"আমাদের সম্পর্কে",h:"আমাদের <em>নেতৃত্ব</em>",s:"অভিজ্ঞতা, সততা ও দীর্ঘমেয়াদি দূরদৃষ্টি নিয়ে স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেডকে এগিয়ে নিয়ে যাচ্ছেন।",home:"← হোম",back:"হোমে ফিরুন",chair:"চেয়ারম্যান",lt:"English",title:"আমাদের সম্পর্কে — স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেড"}};
var SIL='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="40" r="17" fill="#a9bddb"/><path d="M14 100c4-30 22-38 36-38s32 8 36 38z" fill="#a9bddb"/></svg>';
var TI={system:"◐",light:"☀",dark:"☾"};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cv(k){var o=CT[k];if(!o)return"";return(lang==="bn"&&o.value_bn)?o.value_bn:(o.value||"")}
function card(nm,rl,photo,ch){return '<div class="abc'+(ch?' ch':'')+'"><div class="abp">'+(photo?'<img src="'+esc(encodeURI(photo))+'" alt="'+esc(nm)+'" loading="lazy">':SIL)+'</div><h3>'+esc(nm)+'</h3><i></i><p>'+esc(rl)+'</p></div>'}
function render(){var t=T[lang];document.documentElement.lang=lang;document.documentElement.toggleAttribute("data-bnui",lang==="bn");document.title=t.title;
$("abEye").textContent=t.eb;$("abTitle").innerHTML=t.h;$("abHome").textContent=t.home;$("abBack").textContent=t.back;$("abLg").textContent=t.lt;
var sub=CT.board_subtitle&&CT.board_subtitle.set?cv("board_subtitle"):(cv("board_subtitle")||t.s);$("abSub").textContent=sub;$("abSub").hidden=!sub;
var bg=(CT.board_image&&CT.board_image.value)||(CT.hero_image&&CT.hero_image.value),hd=$("abHead");
if(bg){hd.style.backgroundImage='url("'+encodeURI(bg)+'")';hd.classList.add("img")}else{hd.style.backgroundImage="";hd.classList.remove("img")}
var cp=cv("footer_copyright");$("abCopy").textContent=cp||"© Swapnajatra Properties Ltd.";
var html="",nm=cv("owner_name");
if(nm){var ti=cv("owner_title");if(!ti||/^chairman$/i.test(ti))ti=t.chair;html+=card(nm,ti,CT.owner_image&&CT.owner_image.value,true)}
TM.forEach(function(m){html+=card((lang==="bn"&&m.name_bn)||m.name||"",(lang==="bn"&&m.role_bn)||m.role||"",m.photo,false)});
$("abGrid").innerHTML=html}
function setTh(x){th=x;var r=document.documentElement;x==="system"?r.removeAttribute("data-theme"):r.setAttribute("data-theme",x);$("abTh").textContent=TI[x];$("abTh").title="Theme: "+x;try{localStorage.setItem("swp_theme",x)}catch(e){}}
try{th=localStorage.getItem("swp_theme")||"system"}catch(e){}
setTh(th);
$("abTh").onclick=function(){var o=["system","light","dark"];setTh(o[(o.indexOf(th)+1)%3])};
$("abLg").onclick=function(){lang=lang==="en"?"bn":"en";try{sessionStorage.setItem("swp_lang",lang)}catch(e){}render()};
try{lang=sessionStorage.getItem("swp_lang")||""}catch(e){lang=""}
var haveLang=!!lang;lang=lang||"en";render();
fetch((window.SWP_API_BASE||"")+"/api/bootstrap").then(function(r){return r.json()}).then(function(d){
CT=d.content||{};TM=(d.team||[]).filter(function(m){return !m.status||m.status==="active"});PF=(d.settings&&d.settings.prefs)||{};
var lt=false;try{lt=!!localStorage.getItem("swp_theme")}catch(e){}if(!lt&&PF.theme&&th==="system")setTh(PF.theme);
if(!haveLang&&PF.lang==="bn")lang="bn";render()}).catch(function(){});
})();
