/* marks the page while Bangla is on, so the font css can drop letter gaps for Bangla text */
(function(){
function sync(){var b=document.querySelector('.lt'),on=!!(b&&/English/.test(b.textContent));document.documentElement.toggleAttribute('data-bnui',on)}
var t;function later(){clearTimeout(t);t=setTimeout(sync,80)}
function start(){sync();var els=document.querySelectorAll('.lt');els.forEach(function(e){new MutationObserver(later).observe(e,{childList:true,characterData:true,subtree:true})});setTimeout(sync,800);setTimeout(sync,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
