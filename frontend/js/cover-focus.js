/* Cover photo focus: an image URL ending in  #fp=X,Y  (percent) is shown with that spot centred inside its box. */
(function(){
function ap(i){var s=i.getAttribute("src")||"",m=/#fp=(\d{1,3}),(\d{1,3})/.exec(s);if(m)i.style.setProperty("object-position",m[1]+"% "+m[2]+"%","important")}
function run(r){var l=(r||document).querySelectorAll('img[src*="#fp="]');for(var k=0;k<l.length;k++)ap(l[k])}
run();
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes"){ap(m.target);return}
 m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.tagName==="IMG")ap(n);else run(n)})})}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]});
})();
