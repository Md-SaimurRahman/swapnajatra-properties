(function(){
var L=[].slice.call(document.querySelectorAll('.links a[href^="#"]'));
function spy(){
var y=window.scrollY+140,cur=null,best=-1;
L.forEach(function(a){
var h=a.getAttribute('href').slice(1);
var el=h==='top'?document.body:document.getElementById(h);
if(!el||el.hidden)return;
var t=h==='top'?0:el.getBoundingClientRect().top+window.scrollY;
if(t<=y&&t>best){best=t;cur=a}
});
L.forEach(function(a){a.classList.toggle('act',a===cur)});
}
window.addEventListener('scroll',spy,{passive:true});
window.addEventListener('resize',spy);
window.addEventListener('load',spy);
setTimeout(spy,600);spy();
})();
