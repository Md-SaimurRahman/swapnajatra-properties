/* Property details v2: breadcrumb, photo counter + full screen, share / save, icon stats and amenities, Read more.
   Works on top of the existing details popup (nothing is removed). Share links look like  ...?p=ID */
(function(){
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var md=$("#md");if(!md)return;
var lastId=0;
document.addEventListener("click",function(e){var c=e.target.closest&&e.target.closest("#gd .card");if(c&&c.dataset.id)lastId=+c.dataset.id},true);
function bn(){var b=$(".lt");return !!(b&&/English/.test(b.textContent))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function S(p){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
var IC={
home:S('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
bed:S('<path d="M3 19V6"/><path d="M3 15h18v4"/><path d="M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="1.6"/>'),
bath:S('<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M7 19l-1 2M17 19l1 2"/>'),
area:S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><path d="M9 9l-5-5M15 9l5-5M9 15l-5 5M15 15l5 5"/>'),
pin:S('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
share:S('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>'),
heart:S('<path d="M12 20s-7.5-4.6-9-9.5A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 9 3.9C19.5 15.4 12 20 12 20z"/>'),
fs:S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
wa:S('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .7c-.8-.4-1.5-1.100-1.900-1.900l.7-1-1-2z"/>'),
phone:S('<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
cal:S('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M9 14.500l2 2 4-4"/>'),
check:S('<circle cx="12" cy="12" r="8.500"/><path d="M8.500 12.200l2.500 2.500 4.500-5"/>'),
lift:S('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9.500 10l2.500-2.500 2.500 2.500M9.500 14l2.500 2.500 2.500-2.500"/>'),
bolt:S('<path d="M13 3L5 13.500h6L10 21l9-11h-6z"/>'),
car:S('<path d="M5 16V12l2-5h10l2 5v4"/><path d="M3 16h18v3H3z"/><circle cx="7.500" cy="16" r="1"/><circle cx="16.500" cy="16" r="1"/>'),
shield:S('<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>'),
flame:S('<path d="M12 21a6 6 0 0 0 6-6c0-3-2-5-3-8-2 1-3 3-3 5-2-1-3-3-3-5-2 2-3 4-3 8a6 6 0 0 0 6 6z"/>'),
chev:S('<path d="M6 9l6 6 6-6"/>')};
function amIcon(t){t=(t||"").toLowerCase();
 if(/lift|elevator|লিফট/.test(t))return IC.lift;
 if(/generator|জেনারেটর|power|backup/.test(t))return IC.bolt;
 if(/park|garage|পার্কিং/.test(t))return IC.car;
 if(/secur|guard|cctv|নিরাপত্তা/.test(t))return IC.shield;
 if(/gas|গ্যাস|fire|stove/.test(t))return IC.flame;
 return IC.check}
function toast(msg){var t=document.createElement("div");t.className="dv-toast";t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.classList.add("o")},10);setTimeout(function(){t.classList.remove("o");setTimeout(function(){t.remove()},300)},2200)}
function favs(){try{return JSON.parse(localStorage.getItem("swp_fav")||"[]")}catch(e){return[]}}
function lightbox(gl){var lb=document.createElement("div");lb.className="dv-lb";lb.innerHTML='<button type="button" class="dv-lx" aria-label="Close">×</button><button type="button" class="dv-lp" aria-label="Previous">‹</button><div class="dv-li"></div><button type="button" class="dv-ln" aria-label="Next">›</button><div class="dv-lc"></div>';document.body.appendChild(lb);
 function fill(){var g=$("#gm",gl);$(".dv-li",lb).innerHTML=g?g.innerHTML:"";var n=$(".dv-n",gl);$(".dv-lc",lb).textContent=n?n.textContent:""}
 function go(d){var b=$('.nv[data-d="'+d+'"]',gl);if(b)b.click();setTimeout(fill,40)}
 function close(){lb.remove();document.removeEventListener("keydown",key,true)}
 function key(e){if(e.key==="Escape"){e.stopPropagation();e.preventDefault();close()}else if(e.key==="ArrowLeft")go(-1);else if(e.key==="ArrowRight")go(1)}
 lb.onclick=function(e){if(e.target.classList.contains("dv-lx")||e.target===lb)close();else if(e.target.classList.contains("dv-lp"))go(-1);else if(e.target.classList.contains("dv-ln"))go(1)};
 document.addEventListener("keydown",key,true);fill()}
function enhance(){
 var mb=$(".mb",md);if(!mb||mb.dataset.dv)return;var mi=$(".mi",mb),gl=$(".gl",mb);if(!mi||!gl)return;mb.dataset.dv="1";
 var h2=$("h2",mi),title=h2?h2.textContent:"",chip=$("span.lc",mi),loc=$("div.lc",mi);
 var N=$$(".th button",gl).length;
 /* breadcrumb with the close button */
 var bc=document.createElement("nav");bc.className="dv-bc";bc.setAttribute("aria-label","Breadcrumb");
 bc.innerHTML='<a href="#top" class="dv-h">'+IC.home+'<span>'+(bn()?"হোম":"Home")+'</span></a><i>›</i><a href="#properties">'+(bn()?"প্রপার্টি":"Properties")+'</a><i>›</i><b>'+esc(title)+'</b>';
 mb.insertBefore(bc,mb.firstChild);var x=$("#mx",mi);if(x)bc.appendChild(x);
 $$("a",bc).forEach(function(a){a.addEventListener("click",function(){var m=$("#mx");if(m)m.click()})});
 /* counter + full screen */
 var cnt=document.createElement("div");cnt.className="dv-cnt";cnt.innerHTML='<span class="dv-n">1 / '+N+'</span><button type="button" class="dv-fs" aria-label="Full screen">'+IC.fs+'</button>';gl.appendChild(cnt);
 if(N<2){var n0=$(".dv-n",cnt);if(n0)n0.style.display="none"}
 function upd(){var ths=$$(".th button",gl),i=0,th=$(".th",gl);ths.forEach(function(b,k){if(b.classList.contains("a")){i=k;if(th)th.scrollLeft=b.offsetLeft-(th.clientWidth-b.offsetWidth)/2}});$(".dv-n",cnt).textContent=(i+1)+" / "+ths.length}
 new MutationObserver(upd).observe(gl,{subtree:true,attributes:true,attributeFilter:["class"]});
 $(".dv-fs",cnt).onclick=function(){lightbox(gl)};
 /* top row: type chip + share + save */
 var row=document.createElement("div");row.className="dv-row";
 var act=document.createElement("div");act.className="dv-act";
 act.innerHTML='<button type="button" class="dv-share" aria-label="Share">'+IC.share+'</button><button type="button" class="dv-fav" aria-label="Save">'+IC.heart+'</button>';
 if(chip)row.appendChild(chip);row.appendChild(act);mi.insertBefore(row,mi.firstChild);
 var fb=$(".dv-fav",act);function favUI(){fb.classList.toggle("on",favs().indexOf(lastId)>=0)}favUI();
 fb.onclick=function(){var c=$('#gd [data-f="'+lastId+'"]');if(c)c.click();else{var f=favs(),i=f.indexOf(lastId);i>=0?f.splice(i,1):f.push(lastId);try{localStorage.setItem("swp_fav",JSON.stringify(f))}catch(e){}}favUI()};
 $(".dv-share",act).onclick=function(){var url=location.origin+location.pathname+"?p="+lastId;
  if(navigator.share){navigator.share({title:title,url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast(bn()?"লিংক কপি হয়েছে":"Link copied")},function(){toast(url)})}else toast(url)};
 /* location pin, stat icons, amenity icons */
 if(loc)loc.insertAdjacentHTML("afterbegin",IC.pin);
 var si=[IC.bed,IC.bath,IC.area,IC.home];$$(".ov>div",mi).forEach(function(d,i){if(si[i])d.insertAdjacentHTML("afterbegin",si[i])});
 $$(".tags span",mi).forEach(function(s){s.insertAdjacentHTML("afterbegin",amIcon(s.textContent))});
 /* description: Read more */
 var d=$("p.sub",mi);if(d&&d.textContent.length>150){d.classList.add("dv-clamp");var rm=document.createElement("button");rm.type="button";rm.className="dv-rm";
  function lab(){var o=d.classList.contains("open");rm.innerHTML=(bn()?(o?"কম দেখুন":"আরও পড়ুন"):(o?"Read less":"Read more"))+IC.chev;rm.classList.toggle("open",o)}lab();
  rm.onclick=function(){d.classList.toggle("open");lab()};d.insertAdjacentElement("afterend",rm)}
 /* laptop: description goes under the photo so both columns fill evenly */
 if(d){var ph=document.createComment("dv"),box=document.createElement("div"),mq=window.matchMedia("(min-width:701px)");box.className="dv-dsc";d.parentNode.insertBefore(ph,d);gl.appendChild(box);
  var place=function(){if(mq.matches){box.appendChild(d);var r=$(".dv-rm",mi)||$(".dv-rm",box);if(r)box.appendChild(r)}else{ph.parentNode.insertBefore(d,ph.nextSibling);var r2=$(".dv-rm",box);if(r2)d.insertAdjacentElement("afterend",r2)}};
  place();(mq.addEventListener?mq.addEventListener("change",place):mq.addListener(place))}
 /* action buttons */
 var bar=mi.lastElementChild;if(bar&&bar.tagName==="DIV"){bar.classList.add("dv-bar");var bs=$$("a.btn,button.btn",bar);
  var bi=[IC.wa,IC.phone,IC.cal];bs.forEach(function(b,i){if(bi[i])b.insertAdjacentHTML("afterbegin",bi[i])})}
}
new MutationObserver(function(){enhance()}).observe(md,{childList:true});
/* open a shared link  ...?p=ID  */
try{var m=/[?&]p=(\d+)/.exec(location.search);if(m){var id=m[1],tries=0,iv=setInterval(function(){var c=$('#gd .card[data-id="'+id+'"]');tries++;if(c){clearInterval(iv);setTimeout(function(){c.click()},300)}else if(tries>60)clearInterval(iv)},200)}}catch(e){}
})();
