/* contact v2 */
(function(){
var S=document.getElementById("contact");if(!S||S.dataset.v2)return;S.dataset.v2="1";
var W=S.querySelector(".ct"),F=document.getElementById("cf"),MINI=S.querySelector("a.mini");if(!W||!F)return;
var CO={address:"Kohinoor Tower-03, Road #7\nHouse #7-SW(E), 3rd Floor\nGulshan-1, Dhaka",phone1:"01310 094 907",phone2:"01726 191 921",phone3:"01870 763 179",email:"",hours:""},CT={};
var T={en:{eb:"GET IN TOUCH",h:"Contact Us",s:"We’re here to help. Reach out to us for any property inquiries, consultations or partnership opportunities.",
hh:"Office Hours",hd:"Sun – Thu: 9:00 AM – 6:00 PM\nFri – Sat: Closed",lh:"Our Location",ld:"Prime location in Gulshan",qh:"Quick Support",qd:"We usually respond within 24 hours",
fe:"SEND A MESSAGE",fh:"How can we help?",fs:"Fill out the form below and we’ll get back to you soon."},
bn:{eb:"যোগাযোগ করুন",h:"যোগাযোগ",s:"আমরা সাহায্য করতে প্রস্তুত। প্রপার্টি সংক্রান্ত যেকোনো জিজ্ঞাসা, পরামর্শ বা অংশীদারিত্বের জন্য আমাদের জানান।",
hh:"অফিস সময়",hd:"রবি – বৃহস্পতি: সকাল ৯:০০ – সন্ধ্যা ৬:০০\nশুক্র – শনি: বন্ধ",lh:"আমাদের অবস্থান",ld:"গুলশানের প্রাইম লোকেশনে",qh:"দ্রুত সহায়তা",qd:"আমরা সাধারণত ২৪ ঘণ্টার মধ্যে সাড়া দিই",
fe:"বার্তা পাঠান",fh:"আমরা কীভাবে সাহায্য করতে পারি?",fs:"নিচের ফর্মটি পূরণ করুন, আমরা শীঘ্রই যোগাযোগ করব।"}};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(){var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
function c(k){var o=CT[k];if(!o)return"";return L()==="bn"&&o.value_bn?o.value_bn:(o.value||"")}
function ic(n){var p={pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',bld:'<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M3 21h18"/>',
head:'<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1.5-2 2-5 2"/>'}[n];
return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
function lines(s){return String(s||"").split(/\r?\n|\|/).map(function(x){return x.trim()}).filter(Boolean)}
function tel(v){var d=String(v).replace(/\D/g,"");return "tel:"+(d.indexOf("88")===0?"+"+d:"+88"+d)}
var host=document.createElement("div");host.className="ct2in";
var left=document.createElement("div");left.className="ct2l";var card=document.createElement("div");card.className="ct2f";
var hd=document.createElement("div");hd.className="ct2fh";
card.appendChild(hd);card.appendChild(F);host.appendChild(left);host.appendChild(card);
var mapBox=document.createElement("div");mapBox.className="ct2m";var info=document.createElement("div");info.className="ct2h";
if(MINI){MINI.removeAttribute("style");mapBox.appendChild(MINI)}
W.parentNode.insertBefore(host,W);W.remove();S.classList.add("ct2");
function row(ico,html){return '<div class="ct2r"><span class="ct2i">'+ic(ico)+'</span><div>'+html+'</div></div>'}
function render(){var l=L(),t=T[l],bg=(CT.contact_image&&CT.contact_image.value)||"";
if(bg)S.style.setProperty("--ct2bg","url('"+encodeURI(bg)+"')");else S.style.removeProperty("--ct2bg");S.classList.toggle("ct2img",!!bg);
var addr=lines(CO.address).map(esc).join("<br>"),ph=[1,2,3].map(function(i){return CO["phone"+i]}).filter(Boolean).map(function(v){return '<a href="'+tel(v)+'">'+esc(v)+'</a>'}).join("");
var hrs=lines(CO.hours).length?lines(CO.hours):lines(t.hd);
var sub=c("contact_subtitle")||t.s,loc=c("contact_location")||t.ld,sup=c("contact_support")||t.qd;
left.innerHTML='<div class="ct2e">'+t.eb+'<i></i></div><h2>'+t.h+'</h2><p class="ct2s">'+esc(sub)+'</p>'
+row("pin",addr)+(ph?row("phone",ph):"")+(CO.email?row("mail",'<a href="mailto:'+esc(CO.email)+'">'+esc(CO.email)+'</a>'):"")+'<div class="ct2mh"></div>';
info.innerHTML=row("clock",'<b>'+t.hh+'</b><span>'+hrs.map(esc).join("<br>")+'</span>')+row("bld",'<b>'+t.lh+'</b><span>'+esc(loc)+'</span>')+row("head",'<b>'+t.qh+'</b><span>'+esc(sup)+'</span>');
var mh=left.querySelector(".ct2mh");mh.appendChild(mapBox);mh.appendChild(info);
hd.innerHTML='<div class="ct2e">'+t.fe+'<i></i></div><h3>'+t.fh+'</h3><p>'+t.fs+'</p>'}
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
render();
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){var co=(d.settings||{}).company||{};for(var k in co)if(co[k]!==undefined&&co[k]!==null&&co[k]!=="")CO[k]=co[k];CT=d.content||{};render()}).catch(function(){});
})();
