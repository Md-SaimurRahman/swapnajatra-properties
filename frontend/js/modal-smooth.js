/* View details: switching photos must not flash.
   The old photo stays on screen until the next one is fully loaded AND decoded, then the switch happens instantly.
   All photos of the open property are also preloaded in the background. */
(function(){
var keep={},pending=false,pass=false;
function load(src){
 if(!src)return Promise.resolve();
 if(keep[src])return keep[src].p;
 var im=new Image();im.decoding="async";im.src=src;
 var p=(im.decode?im.decode():new Promise(function(r){im.onload=r;im.onerror=r})).catch(function(){});
 keep[src]={im:im,p:p};return p}
function thumbs(){return Array.prototype.slice.call(document.querySelectorAll("#md .th button"))}
function srcOf(btn){var i=btn&&btn.querySelector("img");return i&&(i.currentSrc||i.src)}
function preloadAll(){thumbs().forEach(function(b,i){var i2=b.querySelector("img");if(i2)i2.loading="eager";});
 var q=thumbs().map(srcOf).filter(Boolean),k=0;
 (function next(){if(k>=q.length)return;load(q[k++]).then(function(){setTimeout(next,30)})})()}
var seenKey="";
new MutationObserver(function(){var md=document.getElementById("md");if(!md)return;
 var b=thumbs();if(!b.length)return;var key=b.map(srcOf).join("|");
 if(key!==seenKey){seenKey=key;keep={};preloadAll()}
}).observe(document.body,{childList:true,subtree:true});
document.addEventListener("click",function(e){
 if(pass)return;
 var t=e.target;if(!t||!t.closest)return;
 var md=t.closest("#md");if(!md)return;
 var nv=t.closest(".nv"),tb=t.closest(".th button");if(!nv&&!tb)return;
 var b=thumbs();if(!b.length)return;
 var cur=b.findIndex(function(x){return x.classList.contains("a")});if(cur<0)cur=0;
 var idx=tb?b.indexOf(tb):(cur+ +nv.dataset.d+b.length)%b.length;
 var src=srcOf(b[idx]);if(!src)return;
 e.stopPropagation();e.preventDefault();
 if(pending)return;pending=true;
 var el=nv||tb;
 var timer=setTimeout(go,1500);function go(){clearTimeout(timer);if(!pending)return;pending=false;pass=true;try{el.click()}finally{pass=false}}
 load(src).then(go)
},true);
})();
