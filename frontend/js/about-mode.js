/* Home page: when admin chooses "About Us page" mode, hide Chairman + Board on home and show the About Us menu link. */
(function(){
var H=document.documentElement;
function mode(d){try{return(((d||{}).settings||{}).site||{}).boardMode==="about"}catch(e){return false}}
function apply(on){H.classList.toggle("swp-about",!!on)}
try{apply(mode(JSON.parse(localStorage.getItem("swp-boot-v1")||"null")))}catch(e){}
function isBn(){var b=document.querySelector(".lt");return !!(b&&/English/.test(b.textContent))}
function label(){var bn=isBn();document.querySelectorAll(".swp-aboutlink").forEach(function(a){a.textContent=bn?"আমাদের সম্পর্কে":"About Us"})}
function wire(){label();document.querySelectorAll(".swp-aboutlink").forEach(function(a){a.addEventListener("click",function(){try{sessionStorage.setItem("swp_lang",isBn()?"bn":"en")}catch(e){}})});
new MutationObserver(label).observe(H,{attributes:true,attributeFilter:["lang"]});var lt=document.querySelector(".lt");if(lt)new MutationObserver(label).observe(lt,{childList:true,characterData:true,subtree:true});
fetch((window.SWP_API_BASE||"")+"/api/bootstrap").then(function(r){return r.json()}).then(function(d){apply(mode(d))}).catch(function(){})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();
