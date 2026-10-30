/* last word of Properties / Home Loan titles -> <em> (gold on phone, no change on laptop) */
(function(){
var SEL=".pr2t h2,.em2in h2";
function fix(){document.querySelectorAll(SEL).forEach(function(h){
 if(h.querySelector("em")||h.dataset.tg===h.textContent)return;
 var t=h.textContent.trim(),m=t.match(/^(.*\s)(\S+)$/);if(!m)return;
 h.textContent="";h.appendChild(document.createTextNode(m[1]));var e=document.createElement("em");e.textContent=m[2];h.appendChild(e);h.dataset.tg=h.textContent;});}
fix();
new MutationObserver(function(){fix()}).observe(document.body,{childList:true,subtree:true});
})();
