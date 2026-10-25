/* services v2 */
(function(){
var S=document.getElementById("services");if(!S||S.dataset.v2)return;S.dataset.v2="1";S.classList.add("sv2");
var IC={home:'<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5M10 20v-6h4v6"/>',
people:'<circle cx="12" cy="8" r="3"/><path d="M6.5 19c.3-3.2 2.6-5 5.5-5s5.2 1.8 5.5 5"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M2.5 17.5c.2-2 1.4-3.2 3-3.4M21.5 17.5c-.2-2-1.4-3.2-3-3.4"/>',
build:'<path d="M4 21V9l8-4v16M12 21V8l8 3v10M2 21h20M7 12h2M7 15h2M7 18h2M15 14h2M15 17h2"/>',
docs:'<path d="M6 3h8l4 4v6M6 3v18h7"/><circle cx="16" cy="17" r="3"/><path d="M18.2 19.2L21 22M9 10h6M9 13.500h3"/>',
sun:'<circle cx="12" cy="12" r="3.200"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',
search:'<circle cx="11" cy="11" r="6.500"/><path d="M16 16l5 5"/>',
verify:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 14l2 2 4-4M9 9h3"/>',
key:'<circle cx="8.500" cy="14.500" r="4"/><path d="M11.500 11.500L20 3M16 7l3 3M14 9l2 2"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'};
function ic(k,s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(){var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
var T={en:{eb:"OUR SERVICES",h:"Complete Real Estate Solutions for You",g:3,peb:"OUR PROCESS",ph:"How we work with you",pg:2,ps:"A simple and transparent process to make your property journey smooth and secure."},
bn:{eb:"আমাদের সেবাসমূহ",h:"সম্পূর্ণ রিয়েল এস্টেট সমাধান আপনার জন্য",g:3,peb:"আমাদের প্রক্রিয়া",ph:"আমরা যেভাবে আপনার সাথে কাজ করি",pg:3,ps:"আপনার প্রপার্টি যাত্রা মসৃণ ও নিরাপদ করতে একটি সহজ ও স্বচ্ছ প্রক্রিয়া।"}};
var OLD=["Real-estate solutions under one trusted roof."];
var SV=[],CT={};
function kind(s){var t=((s.title||"")+" "+(s.title_bn||"")).toLowerCase();
if(/consult|ভূমি|land manag/.test(t))return"docs";if(/facility|ফেসিলিটি/.test(t))return"sun";if(/share|শেয়ার/.test(t))return"build";if(/joint|যৌথ/.test(t))return"people";return"home"}
function gold(txt,n){var w=esc(txt).split(" ");if(w.length<=n)return esc(txt);return w.slice(0,w.length-n).join(" ")+" <em>"+w.slice(w.length-n).join(" ")+"</em>"}
function render(){var l=L(),t=T[l];S.hidden=!SV.length;if(!SV.length)return;
var bg=CT.services_image&&CT.services_image.value;
var hh=(CT.services_heading&&(l==="bn"&&CT.services_heading.value_bn?CT.services_heading.value_bn:CT.services_heading.value))||"";
var useCms=hh&&OLD.indexOf(hh)<0;var head=useCms?gold(hh,Math.min(3,hh.split(" ").length-1)):gold(t.h,t.g);
var cards=SV.map(function(s){var ti=(l==="bn"&&s.title_bn)||s.title||"",de=(l==="bn"&&s.description_bn)||s.description||"",cl=(l==="bn"&&s.cta_label_bn)||s.cta_label||"";
var ph=s.image?'<img src="'+esc(encodeURI(s.image))+'" alt="" loading="lazy">':'<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="300" height="150" fill="#cfe0f3"/><rect x="80" y="30" width="70" height="120" fill="#8aa6c6"/><rect x="160" y="55" width="60" height="95" fill="#a9bfd9"/><rect y="125" width="300" height="25" fill="#7d9a6a"/></svg>';
return '<article class="sv2c"><div class="sv2p">'+ph+'<span class="sv2i">'+ic(kind(s),30)+'</span></div><div class="sv2b"><h3>'+esc(ti)+'</h3><p>'+esc(de)+'</p>'+(cl?'<a class="sv2a" href="'+esc(s.cta_href||"#contact")+'"><span>'+esc(cl.replace(/\s*[→>]+\s*$/,""))+' &rarr;</span><i>'+ic("arrow",18)+'</i></a>':"")+'</div></article>'}).join("");
S.innerHTML='<div class="sv2bg"'+(bg?' style="background-image:url(\''+esc(encodeURI(bg))+'\')"':"")+'></div><div class="sv2w"><div class="sv2e">'+t.eb+'</div><h2>'+head+'</h2><div class="sv2g">'+cards+'</div></div><div id="svGrid" hidden></div>';
how(l,t)}
function how(l,t){var H=document.getElementById("how");if(!H)return;H.classList.add("hw2");
var hd=H.querySelector(".hd");if(!hd){var w=H.querySelector(".w");hd=document.createElement("div");hd.className="hd";w&&w.insertBefore(hd,w.firstChild)}
hd.setAttribute("data-n","1");hd.innerHTML='<div class="sv2e">'+t.peb+'</div><h2>'+gold(t.ph,t.pg)+'</h2><p>'+t.ps+'</p>';
var ik=["search","verify","people","key"];H.querySelectorAll(".stp").forEach(function(s,i){if(!s.querySelector(".hwi")){var e=document.createElement("span");e.className="hwi";e.innerHTML=ic(ik[i]||"search",30);s.insertBefore(e,s.firstChild)}})}
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){SV=(d.services||[]).filter(function(s){return !s.status||s.status==="active"});CT=d.content||{};render()}).catch(function(){});
})();
