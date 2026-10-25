/* emi v2 */
(function(){
var S=document.getElementById("emi");if(!S||S.dataset.v2)return;
var W=S.querySelector(".w"),E=S.querySelector(".emi"),EF=S.querySelector(".ef");if(!W||!E||!EF)return;S.dataset.v2="1";S.classList.add("em2");
var CT={};
var T={en:{eb:"PLAN YOUR DREAM HOME",h:"Home Loan Calculator",s:"Estimate your monthly payment with ease. The interest rate is an assumption — use your bank's actual rate for exact figures.",
dh:"Loan Details",ds:"Enter your property and loan information to calculate your monthly payment.",calc:"Calculate",reset:"Reset",
sh:"Loan Summary",ss:"Your estimated loan details",emi:"Monthly EMI",ti:"Total interest",tp:"Total payment",dp:"Down payment",la:"Loan amount",pr:"Principal",it:"Interest"},
bn:{eb:"আপনার স্বপ্নের বাড়ির পরিকল্পনা",h:"হোম লোন ক্যালকুলেটর",s:"সহজেই আপনার মাসিক কিস্তি হিসাব করুন। সুদের হার একটি অনুমান — সঠিক হিসাবের জন্য আপনার ব্যাংকের আসল হার ব্যবহার করুন।",
dh:"লোনের তথ্য",ds:"মাসিক কিস্তি হিসাব করতে আপনার প্রপার্টি ও লোনের তথ্য দিন।",calc:"হিসাব করুন",reset:"রিসেট",
sh:"লোনের সারসংক্ষেপ",ss:"আপনার আনুমানিক লোনের বিবরণ",emi:"মাসিক কিস্তি",ti:"মোট সুদ",tp:"মোট পরিশোধ",dp:"ডাউন পেমেন্ট",la:"লোনের পরিমাণ",pr:"আসল",it:"সুদ"}};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(){var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
function c(k){var o=CT[k];if(!o)return"";return L()==="bn"&&o.value_bn?o.value_bn:(o.value||"")}
function ic(n){var p={home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',coin:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.700 3 3 7 3s7-1.300 7-3V6M5 12v6c0 1.700 3 3 7 3s7-1.300 7-3v-6"/>',
bag:'<path d="M8 3h8l-2 4h-4zM6 21h12l2-9a7 7 0 00-4-5H8a7 7 0 00-4 5z"/>',pct:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.500"/><circle cx="17" cy="17" r="2.500"/>',
cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',doc:'<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
card:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18M6 16h4"/>',pie:'<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/>',bank:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2M16 12v4"/>',rot:'<path d="M20 12a8 8 0 11-3-6.200M20 4v5h-5"/>'}[n];
return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
var bn=document.createElement("div");bn.className="em2b";S.insertBefore(bn,S.firstChild);
var hd=W.querySelector(".hd");if(hd)hd.style.display="none";
var card=document.createElement("div");card.className="em2c";
var left=document.createElement("div");left.className="em2l";var right=document.createElement("div");right.className="em2r";
var lh=document.createElement("div");lh.className="em2lh";var btns=document.createElement("div");btns.className="em2bt";
left.appendChild(lh);left.appendChild(EF);left.appendChild(btns);card.appendChild(left);card.appendChild(right);
E.parentNode.insertBefore(card,E);
var old=E;
var pend=old.querySelector(".eo");
right.innerHTML='<div class="em2sh"><span class="em2si">'+ic("doc")+'</span><div><h3 id="em2sh"></h3><p id="em2ss"></p></div></div>'
+'<div class="em2sb"><div class="em2d"><svg viewBox="0 0 120 120" role="img" aria-label="Principal versus interest"><circle cx="60" cy="60" r="46" fill="none" stroke="#e5b650" stroke-width="15"/><circle id="dn" cx="60" cy="60" r="46" fill="none" stroke="#3b6fd0" stroke-width="15" stroke-dasharray="0 289" transform="rotate(-90 60 60)" style="transition:stroke-dasharray .5s"/></svg><div class="em2dc"><small id="em2l1"></small><b id="em2c"></b></div></div>'
+'<ul class="em2li"><li>'+ic("cal")+'<div><span id="em2k1"></span><b id="o1" class="em2g"></b></div></li><li>'+ic("coin")+'<div><span id="em2k2"></span><b id="o2"></b></div></li><li>'+ic("card")+'<div><span id="em2k3"></span><b id="o3"></b></div></li><li>'+ic("pie")+'<div><span id="em2k4"></span><b><i id="em2dp"></i> <em id="em2dq"></em></b></div></li><li>'+ic("bank")+'<div><span id="em2k5"></span><b><i id="em2ln"></i> <em id="em2lq"></em></b></div></li></ul></div>'
+'<div class="em2lg"><span><i style="background:#3b6fd0"></i><u id="em2p"></u></span><span><i style="background:#e5b650"></i><u id="em2i"></u></span></div>';
if(pend)pend.remove();
var ph={ep:"home",ed:"coin",el:"bag",er:"pct",ey:"cal"};
Object.keys(ph).forEach(function(id){var e=document.getElementById(id);if(e)e.classList.add("em2in","em2i-"+ph[id])});
function dig(s){return +String(s||"").replace(/[^\d.]/g,"")||0}
function grp(n){var d=String(Math.round(n));var l=d.slice(-3),r=d.slice(0,-3);return r?r.replace(/\B(?=(\d{2})+(?!\d))/g,",")+","+l:l}
function sync(){var pr=dig(document.getElementById("ep").value),dp=Math.min(dig(document.getElementById("ed").value),pr),ln=pr-dp,pc=pr?Math.round(dp*100/pr):0;
function tx(i,v){var e=document.getElementById(i);if(e)e.textContent=v}
tx("em2dp","৳"+grp(dp));tx("em2dq","("+pc+"%)");tx("em2ln","৳"+grp(ln));tx("em2lq","("+(pr?100-pc:0)+"%)");tx("em2c",(document.getElementById("o1")||{}).textContent||"")}
function labels(){var l=L(),t=T[l];function tx(i,v){var e=document.getElementById(i);if(e)e.textContent=v}
tx("em2sh",t.sh);tx("em2ss",t.ss);tx("em2l1",t.emi);tx("em2k1",t.emi);tx("em2k2",t.ti);tx("em2k3",t.tp);tx("em2k4",t.dp);tx("em2k5",t.la);tx("em2p",t.pr);tx("em2i",t.it);
lh.innerHTML='<span class="em2hi">'+ic("home")+'</span><div><h3>'+t.dh+'</h3><p>'+t.ds+'</p></div>';
btns.innerHTML='<button type="button" class="em2cb">'+ic("calc")+'<span>'+t.calc+'</span><b>→</b></button><button type="button" class="em2rb">'+ic("rot")+'<span>'+t.reset+'</span></button>';
btns.querySelector(".em2cb").onclick=function(){fire("ep")};btns.querySelector(".em2rb").onclick=reset}
function fire(id){var e=document.getElementById(id);if(e)e.dispatchEvent(new Event("input",{bubbles:true}))}
function reset(){var v={ep:"1,50,00,000",ed:"30,00,000",er:"10",ey:"20"};for(var k in v){var e=document.getElementById(k);if(e){e.value=v[k];fire(k)}}}
function banner(){var l=L(),t=T[l],bg=(CT.emi_image&&CT.emi_image.value)||"";
if(bg)S.style.setProperty("--em2bg","url('"+encodeURI(bg)+"')");else S.style.removeProperty("--em2bg");
bn.innerHTML='<div class="em2in"><div class="em2e">'+esc(c("emi_eyebrow")||t.eb)+'</div><h2>'+esc(c("emi_heading")||t.h)+'</h2><p>'+esc(c("emi_subtitle")||t.s)+'</p></div>'}
["ep","ed","er","ey"].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener("input",function(){setTimeout(sync,0)})});
var o1=document.getElementById("o1");if(o1)new MutationObserver(sync).observe(o1,{childList:true,characterData:true,subtree:true});
new MutationObserver(function(){banner();labels();sync()}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
old.remove();banner();labels();fire("ep");setTimeout(sync,50);
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){CT=d.content||{};banner()}).catch(function(){});
})();
