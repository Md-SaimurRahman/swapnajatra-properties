/* Properties section: third tab "Projects" next to Buy / Rent. Shows the projects the admin has published. */
(function(){
var fm=document.getElementById("fm"),gd=document.getElementById("gd"),box=document.getElementById("prjList");
if(!fm||!gd||!box)return;
var PR=[],loaded=false,IM=[],ii=0;
var T={en:{empty:"No projects have been published yet.",ask:"Enquire about this project →",more:"Read more",less:"Show less",ph:"photos",st:{Upcoming:"Upcoming",Ongoing:"Ongoing",Completed:"Completed"}},
bn:{empty:"এখনো কোনো প্রকল্প প্রকাশ করা হয়নি।",ask:"এই প্রকল্প সম্পর্কে জানতে চাই →",more:"আরও পড়ুন",less:"সংক্ষেপে দেখুন",ph:"টি ছবি",st:{Upcoming:"আসন্ন",Ongoing:"চলমান",Completed:"সম্পন্ন"}}};
function bn(){var b=document.querySelector(".lt");return !!(b&&/English/.test(b.textContent))}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var PH='<svg class="pjph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 21V9l8-4v16M12 21V8l8 3v10M2 21h20M7 12h2M7 15h2M7 18h2M15 14h2M15 17h2"/></svg>';
var PIN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
function render(){var t=T[bn()?"bn":"en"];
if(!loaded){box.innerHTML="";return}
if(!PR.length){box.innerHTML='<div class="pje">'+esc(t.empty)+"</div>";return}
box.innerHTML='<div class="pjg">'+PR.map(function(p,i){var im=(p.images||[]).filter(Boolean),n=im.length;
return '<article class="pjc" data-i="'+i+'"><div class="pji'+(n?" z":"")+'"'+(n?' data-z="'+i+'"':"")+'>'+(n?'<img src="'+esc(encodeURI(im[0]))+'" alt="'+esc(p.title)+'" loading="lazy">':PH)+(p.status?'<span class="pjs '+esc(p.status)+'">'+esc(t.st[p.status]||p.status)+"</span>":"")+(n>1?'<span class="pjn">'+(bn()?n+" "+t.ph:n+" "+t.ph)+"</span>":"")+'</div><div class="pjb"><h3>'+esc(p.title)+"</h3>"
+((p.location||p.project_type)?'<div class="pjm">'+(p.location?"<span>"+PIN+esc(p.location)+"</span>":"")+(p.project_type?'<span class="pjt">'+esc(p.project_type)+"</span>":"")+"</div>":"")
+(p.description?'<p class="pjd">'+esc(p.description)+"</p>"+(p.description.length>180?'<button type="button" class="pjr">'+esc(t.more)+"</button>":""):"")
+'<a class="pjq" href="#contact">'+esc(t.ask)+"</a></div></article>"}).join("")+"</div>"}
function sync(){var on=fm.value==="projects";document.documentElement.classList.toggle("pj-mode",on);box.hidden=!on}
fm.addEventListener("change",sync);setInterval(sync,300);sync();
/* read more + photo viewer */
var lb=document.createElement("div");lb.className="pjl";lb.hidden=true;lb.innerHTML='<button class="x" type="button" aria-label="Close">×</button><button class="p" type="button" aria-label="Previous">‹</button><img alt=""><button class="n" type="button" aria-label="Next">›</button><div class="c"></div>';document.body.appendChild(lb);
function show(i){ii=(i+IM.length)%IM.length;lb.querySelector("img").src=encodeURI(IM[ii]);lb.querySelector(".c").textContent=(ii+1)+" / "+IM.length;lb.hidden=false;lb.querySelector(".p").hidden=lb.querySelector(".n").hidden=IM.length<2}
function hide(){lb.hidden=true}
lb.addEventListener("click",function(e){var c=e.target.className;if(e.target===lb||c==="x")hide();else if(c==="p")show(ii-1);else if(c==="n")show(ii+1)});
document.addEventListener("keydown",function(e){if(lb.hidden)return;if(e.key==="Escape")hide();else if(e.key==="ArrowLeft")show(ii-1);else if(e.key==="ArrowRight")show(ii+1)});
box.addEventListener("click",function(e){var z=e.target.closest&&e.target.closest("[data-z]");
if(z){var p=PR[+z.getAttribute("data-z")];IM=(p.images||[]).filter(Boolean);show(0);return}
var r=e.target.closest&&e.target.closest(".pjr");if(r){var c=r.closest(".pjc"),o=c.classList.toggle("o"),t=T[bn()?"bn":"en"];r.textContent=o?t.less:t.more}});
var lt=document.querySelector(".lt");if(lt)new MutationObserver(render).observe(lt,{childList:true,characterData:true,subtree:true});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
fetch((window.SWP_API_BASE||"")+"/api/bootstrap").then(function(r){return r.json()}).then(function(d){PR=(d.projects||[]).filter(function(p){return !p.publish_status||p.publish_status==="published"});loaded=true;render()}).catch(function(){loaded=true;render()});
})();
