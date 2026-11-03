/* News & Media menu: Bangla/English labels + drawer toggle */
(function(){
var L={en:{menu:"News & Media",news:"News",notices:"Notices",photos:"Photo Gallery",videos:"Video Gallery"},bn:{menu:"সংবাদ ও মিডিয়া",news:"সংবাদ",notices:"নোটিশ",photos:"ফটো গ্যালারি",videos:"ভিডিও গ্যালারি"}};
function isBn(){var b=document.querySelector(".lt");return !!(b&&/English/.test(b.textContent))}
function label(){var t=L[isBn()?"bn":"en"];
document.querySelectorAll("[data-nm]").forEach(function(a){var k=a.getAttribute("data-nm"),cv=a.querySelector(".nmcv");a.textContent=t[k];if(cv)a.appendChild(cv)})}
function wire(){label();
document.querySelectorAll(".nmdd a,.nmsub a").forEach(function(a){a.addEventListener("click",function(){try{sessionStorage.setItem("swp_lang",isBn()?"bn":"en")}catch(e){}})});
var dt=document.getElementById("nmdt"),sb=document.getElementById("nmsub");
function tg(e){e.preventDefault();var o=dt.classList.toggle("o");sb.classList.toggle("o",o);dt.setAttribute("aria-expanded",o)}
if(dt&&sb){dt.addEventListener("click",tg);dt.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")tg(e)})}
new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
var lt=document.querySelector(".lt");if(lt)new MutationObserver(label).observe(lt,{childList:true,characterData:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();
