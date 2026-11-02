/* Every new visit lands on the HOME page top:
   a new tab / a link click after the tab was closed / coming back after 30+ minutes -> start at the top, no #section in the address. */
(function(){
var NOW=Date.now(),GAP=30*60*1000,first=true;
try{
 var seen=sessionStorage.getItem("swp_seen"),last=+localStorage.getItem("swp_last")||0;
 first=!seen||(NOW-last>GAP);
 sessionStorage.setItem("swp_seen","1");
 localStorage.setItem("swp_last",String(NOW));
}catch(e){first=true}
function stamp(){try{localStorage.setItem("swp_last",String(Date.now()))}catch(e){}}
addEventListener("pagehide",stamp);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")stamp()});
if(!first)return;
try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
try{if(location.hash)history.replaceState(null,"",location.pathname+location.search)}catch(e){}
function top(){window.scrollTo(0,0)}
top();
addEventListener("load",function(){top();setTimeout(top,80);setTimeout(top,500)});
addEventListener("pageshow",function(e){if(e.persisted)return;top()});
})();
