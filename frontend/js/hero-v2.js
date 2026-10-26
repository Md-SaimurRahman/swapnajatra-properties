/* hero v2 */
(function(){
var H=document.getElementById("top");if(!H||H.dataset.v2)return;H.dataset.v2="1";
var IC={
shield:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
gear:'<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="6.6"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
people:'<circle cx="12" cy="8" r="3"/><path d="M6.5 19c.3-3.2 2.6-5 5.5-5s5.2 1.8 5.5 5"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M2.5 17.5c.2-2 1.4-3.2 3-3.4M21.5 17.5c-.2-2-1.4-3.2-3-3.4"/>',
doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h6M9.5 15.5h6M9.5 9h2.5"/>',
idc:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="1.8"/><path d="M5.8 16c.4-1.6 1.5-2.2 2.7-2.2s2.3.6 2.7 2.2M13.5 10h5M13.5 13.5h5"/>',
home:'<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5M10 20v-6h4v6"/>',
grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'};
function ic(k,s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var T={en:{eb:"TRUSTED REAL ESTATE PARTNER",h:"Your Property Journey, Our Expert Guidance.",
p:"From buying and selling to development, land consultancy and ongoing property management — Swapnajatra Properties Ltd. provides practical real-estate solutions with professionalism, transparency and trust.",
i1:"Honest<br>Guidance",i2:"Efficient<br>Process",i3:"Long-term<br>Trust",b1:"Explore properties",b2:"Explore our services",
chair:"CHAIRMAN",msg:"We build trust first, then every deal follows. Your dream property deserves honest guidance and a transparent process.",
reg:"Company Registration",regn:"Registrar of Joint Stock Companies (Companies Act, 1994)",tin:"TIN Number",tinn:"National Board of Revenue",lic:"Trade Licence",licn:"Dhaka North City Corporation<br>Valid till 30 Jun 2027",
lp:"List your property",lpn:"Get in touch with us to list your property for sale or rent."},
bn:{eb:"বিশ্বস্ত রিয়েল এস্টেট পার্টনার",h:"আপনার প্রপার্টি যাত্রায়, আমাদের বিশেষজ্ঞ পরামর্শ।",
p:"কেনা-বেচা থেকে শুরু করে ডেভেলপমেন্ট, ভূমি পরামর্শ ও চলমান প্রপার্টি ম্যানেজমেন্ট — স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেড পেশাদারিত্ব, স্বচ্ছতা ও বিশ্বাসের সাথে বাস্তবসম্মত রিয়েল-এস্টেট সমাধান দেয়।",
i1:"সৎ<br>পরামর্শ",i2:"কার্যকর<br>প্রক্রিয়া",i3:"দীর্ঘমেয়াদি<br>বিশ্বাস",b1:"প্রপার্টি দেখুন",b2:"আমাদের সেবাসমূহ",
chair:"চেয়ারম্যান",msg:"আমরা আগে বিশ্বাস গড়ি, তারপর প্রতিটি চুক্তি। আপনার স্বপ্নের প্রপার্টি পাওয়ার যোগ্য সৎ পরামর্শ ও স্বচ্ছ প্রক্রিয়া।",
reg:"কোম্পানি নিবন্ধন",regn:"যৌথ মূলধন কোম্পানি ও ফার্মসমূহের নিবন্ধক (কোম্পানি আইন, ১৯৯৪)",tin:"টিআইএন নম্বর",tinn:"জাতীয় রাজস্ব বোর্ড",lic:"ট্রেড লাইসেন্স",licn:"ঢাকা উত্তর সিটি কর্পোরেশন<br>মেয়াদ ৩০ জুন ২০২৭ পর্যন্ত",
lp:"আপনার প্রপার্টি তালিকাভুক্ত করুন",lpn:"বিক্রি বা ভাড়ার জন্য প্রপার্টি তালিকাভুক্ত করতে আমাদের সাথে যোগাযোগ করুন।"}};
var OLD_H=[];
var CT={},LOADED=false;
function L(){/* lang v1 */var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
function c(k){var o=CT[k];if(!o)return"";return L()==="bn"&&o.value_bn?o.value_bn:(o.value||"")}
function heading(txt){var w=esc(txt).split(" ");if(w.length<4){if(w.length<2)return esc(txt);return w.slice(0,-1).join(" ")+" <em>"+w[w.length-1]+"</em>"}var n=w.length;
var a=w.slice(0,n-2).join(" "),g=w.slice(n-2).join(" ");
if(txt===T.en.h)a=a.replace("Property Journey,","Property<br>Journey,");
return a+(txt===T.en.h?"<br>":" ")+"<em>"+g+"</em>"}
function render(){var l=L(),t=T[l],hh=c("hero_heading");if(!hh||OLD_H.indexOf(hh)>=0)hh=t.h;
var hp=c("hero_subtitle");if(!hp)hp=t.p;
var hb=c("hero_button");if(!hb)hb=t.b1;
var nm=c("owner_name")||(l==="bn"?"মোঃ হেলাল উদ্দিন":"Md. Helal Uddin"),ti=c("owner_title");
ti=(!ti||/^chairman$/i.test(ti))?t.chair:ti.toUpperCase();
var ms=c("owner_message")||t.msg,im=CT.owner_image&&CT.owner_image.value;
var reg=c("hc_reg")||"C-213667",tin=c("hc_tin")||"122113154693",lic=c("hc_lic")||"TRAD/DNCC/015629/2026";
var regn=c("hc_reg_note")||t.regn,tinn=c("hc_tin_note")||t.tinn,licn=c("hc_lic_note")||t.licn;
function cred(ico,lab,val,note){return '<div class="h2c"><span class="h2i">'+ic(ico,40)+'</span><span class="h2t"><small>'+lab+'</small><b class="fmt-hint">'+esc(val)+'</b><i>'+(/<br>/.test(note)?note:esc(note))+'</i></span></div>'}
var ph=im?'<img src="'+esc(encodeURI(im))+'" alt="'+esc(nm)+'">':'<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="40" r="18" fill="#9fb0c6"/><path d="M12 100c4-30 22-38 38-38s34 8 38 38z" fill="#9fb0c6"/></svg>';
var bg=CT.hero_image&&CT.hero_image.value;H.classList.toggle("v2img",!!bg);
if(bg)H.style.setProperty("--h2img",'url("'+encodeURI(bg)+'")');else H.style.removeProperty("--h2img");
var s=document.getElementById("h2");if(!s){s=document.createElement("div");s.id="h2";s.setAttribute("data-n","1");H.insertBefore(s,H.firstChild)}
s.innerHTML='<svg class="h2bld" viewBox="0 0 800 930" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><defs><linearGradient id="h2g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfa57a"/><stop offset="1" stop-color="#8d6a4a"/></linearGradient></defs><rect x="140" y="150" width="330" height="560" fill="#8a7c75"/><rect x="190" y="250" width="250" height="460" fill="url(#h2g)" opacity=".75"/><rect x="480" y="320" width="200" height="390" fill="#a58a74"/><rect x="0" y="690" width="800" height="240" fill="#3d5a30"/><rect x="0" y="790" width="800" height="140" fill="#b79a74"/></svg>'
+'<div class="h2in"><div class="h2eb">'+t.eb+'</div><h1>'+heading(hh)+'</h1><p class="h2p">'+esc(hp)+'</p>'
+'<div class="h2ic"><div><span class="h2i s">'+ic("shield",28)+'</span><span>'+t.i1+'</span></div><div><span class="h2i s">'+ic("gear",28)+'</span><span>'+t.i2+'</span></div><div><span class="h2i s">'+ic("people",28)+'</span><span>'+t.i3+'</span></div></div>'
+'<div class="h2b"><a class="h2b1" href="#properties">'+ic("home",24)+'<span>'+esc(hb)+'</span>'+ic("arrow",22)+'</a><a class="h2b2" href="#services">'+ic("grid",24)+'<span>'+t.b2+'</span></a></div></div>'
+'<aside class="h2ch"><div class="h2ph">'+ph+'</div><h3>'+esc(nm)+'</h3><div class="h2ti">'+esc(ti)+'</div><p>“ '+esc(ms)+' ”</p></aside>'
+'<div class="h2bar">'+cred("doc",t.reg,reg,regn)+cred("shield",t.tin,tin,tinn)+cred("idc",t.lic,lic,licn)
+'<a class="h2c h2cta" href="#contact" data-lp><span class="h2i">'+ic("home",40)+'</span><span class="h2t"><b>'+t.lp+'</b><i>'+t.lpn+'</i></span><span class="h2go">'+ic("arrow",18)+'</span></a></div>'}
function fit(){var s=innerWidth<=900?1:Math.max(.55,Math.min(1,(innerHeight-78)/790));document.documentElement.style.setProperty("--h2s",s)}fit();addEventListener("resize",fit);
document.body.classList.add("h2on");render();
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){CT=d.content||{};LOADED=true;render()}).catch(function(){});
})();
