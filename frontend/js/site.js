/* Swapnajatra public site. Data comes from /api (PostgreSQL); nothing is stored in the browser except visitor preferences (theme, favourites). */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const DEFLOC=["Gulshan","Banani","Baridhara","Bashundhara","Dhanmondi","Uttara"],DEFTY=["Apartment","Villa","House","Penthouse","Commercial","Land"],DEFAM=["Lift","Parking","Generator","Security","Rooftop","Gym"];
let LOC=[...DEFLOC],TY=[...DEFTY],AM=[...DEFAM];
let P=[]; /* loaded from the API (PostgreSQL). No localStorage data. */
const num=n=>n.toLocaleString(lang=="bn"?"bn-BD":"en-IN"),dg=x=>lang=="bn"?String(x).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]):x,t=k=>lang=="bn"&&E2B[k]||k;
/*DISCOUNT-PATCH*/const f1=(v,m)=>m=="rent"?`৳${num(v)}<small>${t("/month")}</small>`:`৳${dg((v/1e7).toFixed(2))} ${t("Cr")}`;
const fmt=(p,tag)=>!p.p?t("Price on request"):p.dc?f1(p.p,p.m)+` <s class="was">${f1(p.op,p.m)}</s>`+(tag?` <span class="dc-tag">${dg(p.dc)}% ${t("OFF")}</span>`:""):f1(p.p,p.m);
function art(h,v=0,img=""){if(img)return `<img src="${esc(img)}" alt="Property image" loading="lazy" data-fb style="width:100%;height:100%;object-fit:cover;display:block">`;const w=[...Array(5)].map((_,i)=>`<rect x="180" y="${60+v*8}" width="36" height="${200-v*8}" fill="hsl(${h} 25% ${88-i*2}%)"/>`).join("");let win="";for(let r=0;r<6;r++)for(let c=0;c<5;c++)win+=`<rect x="${190+c*52}" y="${75+r*30+v*8}" width="16" height="16" fill="hsl(${h} 50% ${v%2?70:40}%)" opacity=".7"/>`;return `<svg viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${h}${v}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${205+v*8} 70% 78%)"/><stop offset="1" stop-color="#eaf3fb"/></linearGradient></defs><rect width="600" height="450" fill="url(#g${h}${v})"/><rect x="40" y="170" width="90" height="190" fill="hsl(${h} 20% 60%)" opacity=".5"/><rect x="470" y="140" width="90" height="220" fill="hsl(${h} 20% 55%)" opacity=".5"/><rect x="160" y="${40+v*8}" width="290" height="${320-v*8}" rx="4" fill="#fff"/>${win}<rect x="0" y="360" width="600" height="90" fill="#0e6b3b"/><rect x="270" y="300" width="50" height="60" fill="hsl(${h} 45% 35%)"/></svg>`}
const te=k=>esc(t(k)),gal=(p,v)=>art(p.h,v,p.imgs[v]||""),galN=p=>[...Array(Math.max(1,p.imgs.length||3)).keys()];
document.addEventListener("error",e=>{const im=e.target;if(im&&im.tagName==="IMG"&&im.dataset.fb!==undefined){im.style.display="none";im.parentElement.classList.add("img-fallback")}},true);
let fv=[];try{fv=JSON.parse(localStorage.getItem("swp_fav")||"[]")}catch(e){}const fav=new Set(fv),saveFav=()=>{try{localStorage.setItem("swp_fav",JSON.stringify([...fav]))}catch(e){}};let mode="buy",view="g",onlySaved=false;
function fill(id,arr,first){$(id).innerHTML=`<option value="">${first}</option>`+arr.map(x=>`<option value="${x}">${x}</option>`).join("")}
["#hl","#fl"].forEach(i=>fill(i,LOC,"All locations"));["#ht","#ft"].forEach(i=>fill(i,TY,"All types"));fill("#fa",AM,"Any amenity");
function bands(){const v=$("#hp").value;const b=mode=="rent"?[[40000,"৳40k","৳৪০ হাজার"],[80000,"৳80k","৳৮০ হাজার"],[150000,"৳1.5L","৳১.৫ লাখ"],[250000,"৳2.5L","৳২.৫ লাখ"]]:[[1.5e7,"৳1.5 Cr","৳১.৫ কোটি"],[3e7,"৳3 Cr","৳৩ কোটি"],[5e7,"৳5 Cr","৳৫ কোটি"],[8e7,"৳8 Cr","৳৮ কোটি"]];
$("#hp").innerHTML=`<option value="0">${t("Any price")}</option>`+b.map(x=>`<option value="${x[0]}">${t("Up to")} ${lang=="bn"?x[2]:x[1]}</option>`).join("");if([...$("#hp").options].some(o=>o.value==v))$("#hp").value=v}
function render0(){const m=$("#fm").value,l=$("#fl").value,ty=$("#ft").value,b=+$("#fb").value,a=$("#fa").value,so=$("#fs").value,mp=+$("#hp").value;
let r=P.filter(p=>(onlySaved?fav.has(p.id):p.m==m)&&(!l||p.l==l)&&(!ty||p.y==ty)&&p.b>=b&&(!a||p.am.includes(a))&&(!mp||p.p<=mp));
if(so=="l")r.sort((x,y)=>x.p-y.p);if(so=="h")r.sort((x,y)=>y.p-x.p);if(so=="a")r.sort((x,y)=>y.a-x.a);if(!SET.prop.sold)r=r.filter(p=>p.st!=="Sold");if(SET.prop.rented===false)r=r.filter(p=>p.st!=="Rented");if(SET.prop.featured&&so=="d")r.sort((x,y)=>(y.ft?1:0)-(x.ft?1:0));
$("#cnt").textContent=lang=="bn"?`${dg(r.length)}টি প্রপার্টি পাওয়া গেছে`:`${r.length} propert${r.length==1?"y":"ies"} found`;
$("#sb").textContent="♥ "+t("Saved")+" ("+dg(fav.size)+")";$("#sb").classList.toggle("on",onlySaved);lastTotal=r.length;r=r.slice(0,Math.max(1,+SET.prop.perPage||12)*pg);$("#gd").className="grid"+(view=="l"?" list":"");
$("#gd").innerHTML=r.length?r.map((p,i)=>`<article class="card" style="animation-delay:${i*50}ms" data-id="${p.id}" tabindex="0" aria-label="${te(p.t)}"><div class="ph">${art(p.h,0,p.img)}<span class="bd">${te(p.y)}</span>${p.demo?`<span class="sample-badge">Demo</span>`:""}${p.dc?`<span class="dc-rib">${dg(p.dc)}% ${t("OFF")}</span>`:""}${SET.prop.featured&&p.ft?`<span class="bd" style="left:auto;right:56px">${t("Featured")}</span>`:""}${p.st==="Sold"?`<span class="bd" style="top:44px;background:#b42318;color:#fff">${t("Sold")}</span>`:""}${p.st==="Rented"?`<span class="bd" style="top:44px;background:#8a6212;color:#fff">${t("Rented")}</span>`:""}<button class="hr ${fav.has(p.id)?"on":""}" aria-label="${t("Save to favorites")}" data-f="${p.id}">${fav.has(p.id)?"♥":"♡"}</button></div><div class="cb"><div class="pr">${fmt(p)}</div><h3>${te(p.t)}</h3><div class="lc">${te(p.l)}, ${t("Dhaka")}</div><div class="sp3"><span>${p.b?dg(p.b)+" "+t("beds"):t("Office")}</span><span>${dg(p.ba)} ${t("baths")}</span><span>${num(p.a)} ${t("sq ft")}</span></div><span class="btn" style="padding:8px 18px;font-size:14px">${t("View details")}</span></div></article>`).join(""):!LOADED?`<div class="empty"><h3>${t(loadFailed?"Properties are temporarily unavailable.":"Loading properties…")}</h3></div>`:`<div class="empty"><h3>${t("No properties match these filters")}</h3><p class="sub" style="margin:8px auto 16px">${t("Try a different location or type, or reset the filters.")}</p><button class="btn" data-reset>${t("Reset filters")}</button></div>`}
function reset(){onlySaved=false;["#fl","#ft","#fa"].forEach(i=>$(i).value="");$("#fb").value=0;$("#hp").value=0;$("#fs").value="d";$$("#lg .lo").forEach(x=>x.classList.remove("a"));render();pins()}
$$("#fm,#fl,#ft,#fb,#fa,#fs").forEach(e=>e.onchange=()=>{render();pins()});$("#rs").onclick=reset;
$("#vg").onclick=()=>{view="g";$("#vg").classList.add("a");$("#vl").classList.remove("a");render()};$("#vl").onclick=()=>{view="l";$("#vl").classList.add("a");$("#vg").classList.remove("a");render()};
$$(".tg button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;$$(".tg button").forEach(x=>x.classList.toggle("a",x==b));bands()});
$("#sp").onsubmit=e=>{e.preventDefault();$("#fm").value=mode;$("#fl").value=$("#hl").value;$("#ft").value=$("#ht").value;$("#fb").value=$("#hb").value;render();pins();$("#properties").scrollIntoView()};
$("#gd").onclick=e=>{if(e.target.closest("[data-reset]"))return reset();const f=e.target.closest("[data-f]");if(f){e.stopPropagation();const i=+f.dataset.f;fav.has(i)?fav.delete(i):fav.add(i);saveFav();render();return}const c=e.target.closest(".card");if(c)open(+c.dataset.id)};
$("#gd").onkeydown=e=>{if(e.key=="Enter"&&e.target.classList.contains("card"))open(+e.target.dataset.id)};
/* modal */
let cur=0,last;
let curId=0;
function open(id){last=document.activeElement;curId=id;const p=P.find(x=>x.id===id);if(!p)return;cur=0;
$("#md").innerHTML=`<div class="mb"><div class="gl"><div class="m" id="gm">${gal(p,0)}</div><button class="nv" style="left:10px" aria-label="Previous image" data-d="-1">‹</button><button class="nv" style="right:10px" aria-label="Next image" data-d="1">›</button><div class="th">${galN(p).map(v=>`<button data-v="${v}" aria-label="Image ${v+1}" class="${v?"":"a"}">${gal(p,v)}</button>`).join("")}</div></div>
<div class="mi"><button class="x" aria-label="Close" id="mx">×</button><span class="lc">${te(p.y)} · ${p.m=="rent"?t("For rent"):t("For sale")}</span><h2 style="font-size:30px;margin:4px 0">${te(p.t)}</h2><div class="lc">${te(p.l)}, ${t("Dhaka")}</div><div class="pr" style="margin-top:8px">${fmt(p,1)}</div>
<div class="ov"><div><b>${p.b?dg(p.b):"—"}</b>${t("Bedrooms")}</div><div><b>${dg(p.ba)}</b>${t("Bathrooms")}</div><div><b>${num(p.a)} ${t("sq ft")}</b>${t("Area")}</div><div><b>${te(p.y)}</b>${t("Type")}</div></div>
<div class="tags">${p.am.map(f=>`<span>${te(f)}</span>`).join("")}</div>
${p.d?`<p class="sub" style="margin:0 0 16px;white-space:pre-line">${esc(p.d)}</p>`:""}
<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" style="background:#128c4a" target="_blank" rel="noopener" href="https://wa.me/${WAN()}?text=${encodeURIComponent(lang=="bn"?`হ্যালো, আমি ${t(p.t)} সম্পর্কে আগ্রহী। এই প্রপার্টি সম্পর্কে আরও জানতে চাই।`:`Hello, I am interested in ${p.t}. I would like to know more about this property.`)}">WhatsApp</a><a class="btn" href="tel:${TEL()}">${t("Call")}</a><button class="btn g" id="sv">${t("Schedule a visit")}</button></div></div></div>`;
$("#md").classList.add("o");$("#mx").focus();
$("#sv").onclick=()=>openVisit(p)}
function close(){$("#md").classList.remove("o");last&&last.focus()}
$("#md").onclick=e=>{if(e.target.id=="md"||e.target.id=="mx")close();const n=e.target.closest(".nv"),tb=e.target.closest(".th button");if(n||tb){const pp=P.find(x=>x.id===curId),N=galN(pp).length;cur=tb?+tb.dataset.v:(cur+ +n.dataset.d+N)%N;$("#gm").innerHTML=gal(pp,cur);$$("#md .th button").forEach((b,i)=>b.classList.toggle("a",i==cur))}};
document.addEventListener("keydown",e=>{if(e.key=="Escape"){close();$("#vm").classList.remove("o");$("#dr").classList.remove("o");closeDots()}});
/* locations */
const pos=[[22,62],[40,32],[52,70],[72,40],[30,38],[80,72]];
function buildLg(){}
function pins(){}
document.addEventListener("click",e=>{const x=e.target.closest("[data-l]");if(x){$("#fl").value=$("#fl").value==x.dataset.l?"":x.dataset.l;render();pins()}});
/* misc */
const nv=$("#nav");const sc=()=>nv.classList.toggle("s",scrollY>40);sc();addEventListener("scroll",sc,{passive:true});
$("#ham").onclick=()=>$("#dr").classList.add("o");$("#dx").onclick=()=>$("#dr").classList.remove("o");$$("#dr a").forEach(a=>a.onclick=()=>$("#dr").classList.remove("o"));
function toast(t){const e=$("#ts");e.textContent=t;e.classList.add("o");setTimeout(()=>e.classList.remove("o"),3200)}
$("#cf").onsubmit=async e=>{e.preventDefault();let ok=true;const chk=(id,f,m)=>{const el=$(id),v=el.value.trim(),er=el.parentNode.querySelector(".err");const bad=!f(v);er.textContent=bad?m:"";ok=ok&&!bad};
chk("#cn",v=>v.length>1,t("Enter your name."));chk("#cph",v=>/^(\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g,"")),t("Enter a valid Bangladeshi mobile number, e.g. 01726 191 921."));chk("#cm",v=>v.length>9,t("Tell us a little more (10+ characters)."));
if(ok){const btn=e.target.querySelector("button[type=submit]");btn.disabled=true;try{await api("/enquiries",{method:"POST",body:JSON.stringify({customer_name:$("#cn").value.trim(),phone:$("#cph").value.trim(),message:$("#cm").value.trim(),subject:"Call back request",source:"contact",website:e.target.querySelector(".hp").value})});toast(t("Request sent. We will call you back soon."));e.target.reset()}catch(x){toast(sendErr(x))}finally{btn.disabled=false}}};
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("vis");io.unobserve(x.target)}}),{threshold:.15});$$(".rv,#steps").forEach(e=>io.observe(e));
$("#steps").classList.contains("vis");new MutationObserver(()=>$("#how").classList.toggle("vis",$("#steps").classList.contains("vis"))).observe($("#steps"),{attributes:true});
$$("[data-n]").forEach(el=>{const n=+el.dataset.n;let k=0;const t=setInterval(()=>{el.textContent=++k;if(k>=n)clearInterval(t)},200)});
/* language */
const DD=[["Tell us about your property and our team will contact you. Listings are reviewed before they appear on the website.","আপনার প্রপার্টি সম্পর্কে জানান, আমাদের টিম যোগাযোগ করবে। ওয়েবসাইটে দেখানোর আগে তালিকা যাচাই করা হয়।"],["Listing for","তালিকার উদ্দেশ্য"],["Sell","বিক্রি"],["Rent out","ভাড়া দেওয়া"],["Property location","প্রপার্টির অবস্থান"],["Expected price (৳, optional)","প্রত্যাশিত দাম (৳, ঐচ্ছিক)"],["Area (sq ft, optional)","আয়তন (বর্গফুট, ঐচ্ছিক)"],["Submit property details","প্রপার্টির তথ্য জমা দিন"],["Thank you. Your property details have been received.","ধন্যবাদ। আপনার প্রপার্টির তথ্য পাওয়া গেছে।"],["We will contact you to discuss the listing.","তালিকা নিয়ে আলোচনার জন্য আমরা যোগাযোগ করব।"],["Enter the property location.","প্রপার্টির অবস্থান লিখুন।"],["Featured","বিশেষ"],["Sold","বিক্রিত"],["Show more","আরও দেখুন"],["Admin","অ্যাডমিন"],["Home","হোম"],["Services","সেবা"],["Properties","প্রপার্টি"],["Locations","এলাকা"],["How it works","কাজের ধাপ"],["Contact","যোগাযোগ"],["List your property","প্রপার্টি তালিকাভুক্ত করুন"],
["HONESTY · EFFICIENCY · TRUST","সততা · দক্ষতা · বিশ্বাস"],["Honesty · Efficiency · Trust","সততা · দক্ষতা · বিশ্বাস"],
["Property Decisions Made With Confidence.","আপনার মনের মতো একটি ঠিকানা খুঁজে নিন।"],
["From residential and commercial land to flats, joint-venture development, land-share construction and property management — Swapnajatra Properties Ltd. provides practical real-estate solutions with professionalism, transparency and trust.","স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড আপনাকে জমি, ফ্ল্যাট ও যৌথ উদ্যোগ প্রকল্প কেনা-বেচা ও নির্মাণে সাহায্য করে — স্বচ্ছ কাগজপত্র ও সৎ পরামর্শসহ।"],
["Explore properties","প্রপার্টি দেখুন"],["Our services","আমাদের সেবা সমূহ"],["Core services","মূল সেবা"],["Direct hotlines","সরাসরি হটলাইন"],["Office in Gulshan-1","গুলশান-১-এ অফিস"],
["Buy","কিনুন"],["Rent","ভাড়া"],["Location","এলাকা"],["Property type","প্রপার্টির ধরন"],["Max budget","সর্বোচ্চ বাজেট"],["Bedrooms","বেডরুম"],["Bathrooms","বাথরুম"],["Search","খুঁজুন"],
["All locations","সব এলাকা"],["All types","সব ধরন"],["Any amenity","যেকোনো সুবিধা"],["Any","যেকোনো"],["Any price","যেকোনো দাম"],["Up to","সর্বোচ্চ"],
["Everything around land, flats and buildings, in one trusted office.","জমি, ফ্ল্যাট ও ভবন সংক্রান্ত সব সেবা এক বিশ্বস্ত অফিসে।"],
["Help with buying and selling residential and commercial land, and new and resale flats","আবাসিক ও বাণিজ্যিক জমি এবং নতুন ও পুরাতন ফ্ল্যাট ক্রয়-বিক্রয়ে সহযোগিতা"],
["Building construction through joint ventures","যৌথ উদ্যোগে ভবন নির্মাণ"],["Building construction through land-share sales","ল্যান্ড শেয়ার বিক্রয়ের মাধ্যমে ভবন নির্মাণ"],
["Land management consultancy: ownership verification, registration and mutation","ভূমি ব্যবস্থাপনা (জমির মালিকানা স্বত্ব যাচাই, রেজিস্ট্রেশন, মিউটেশন) ইত্যাদি বিষয়ে কনসালটেন্সি সেবা"],
["Property management and all facility management services","প্রপার্টি ম্যানেজমেন্ট ও ফেসিলিটি ম্যানেজমেন্ট বিষয়ক সকল সেবা"],
["Featured properties","বিশেষ প্রপার্টি"],["Sample listings — replace with your real inventory. Filters below work live.","নমুনা তালিকা। নিচের ফিল্টার ব্যবহার করে খুঁজুন।"],
["Buy / Rent","কিনুন / ভাড়া"],["Type","ধরন"],["Amenity","সুবিধা"],["Sort by","সাজান"],["Featured","বিশেষ"],["Price: low to high","দাম: কম থেকে বেশি"],["Price: high to low","দাম: বেশি থেকে কম"],["Largest area","সবচেয়ে বড় আয়তন"],["Reset filters","ফিল্টার মুছুন"],
["Get directions","দিকনির্দেশনা পান"],["Gulshan-1","গুলশান-১"],["Our location","আমাদের অবস্থান"],["Tap the map to open directions in Google Maps.","গুগল ম্যাপে দিকনির্দেশনা খুলতে ম্যাপে ট্যাপ করুন।"],["Open in Google Maps","গুগল ম্যাপে খুলুন"],["Explore locations","এলাকা অনুযায়ী খুঁজুন"],["Choose an area to filter the listings above.","এলাকা বেছে নিলে উপরের তালিকা ফিল্টার হবে।"],
["How we work with you","আমরা যেভাবে কাজ করি"],["Verify","যাচাই"],["Connect","যোগাযোগ"],["Move in","হস্তান্তর"],
["Tell us the land, flat or project you need.","কোন জমি, ফ্ল্যাট বা প্রকল্প চান আমাদের জানান।"],["We check ownership, registration and mutation first.","আমরা আগে মালিকানা, রেজিস্ট্রেশন ও মিউটেশন যাচাই করি।"],["Talk directly with our team, on the phone or in Gulshan-1.","ফোনে বা গুলশান-১ অফিসে সরাসরি কথা বলুন।"],["Close the deal, then we can manage the property for you.","চুক্তি শেষে চাইলে আমরাই প্রপার্টি ম্যানেজ করব।"],
["Have land? Let’s build something valuable together.","আপনার জীবনযাত্রার সাথে মানানসই নকশা।"],["Explore a professional path from land discussion and documentation review to project planning, development and handover. Final terms depend on the specific project and agreement.","যৌথ উদ্যোগ বা ল্যান্ড শেয়ারের মাধ্যমে আমাদের সাথে ভবন নির্মাণ করুন — জমি থেকে হস্তান্তর পর্যন্ত আমরা পাশে আছি।"],["Discuss your land","প্রকল্প নিয়ে কথা বলুন"],
["Contact us","যোগাযোগ করুন"],["Contact:","যোগাযোগঃ"],["Kohinoor Tower-03, Road #7","কহিনূর টাওয়ার-০৩, রোড # ৭"],["House #7-SW(E), 3rd Floor","বাড়ী # ৭-এসডব্লিউ (ই), ৩য় তলা"],["Gulshan-1, Dhaka","গুলশান-১, ঢাকা।"],
["01310 094 907","০১৩১০ ০৯৪ ৯০৭"],["01726 191 921","০১৭২৬ ১৯১ ৯২১"],["01870 763 179","০১৮৭০ ৭৬৩ ১৭৯"],
["Your name","আপনার নাম"],["Phone number","ফোন নম্বর"],["How can we help?","আমরা কীভাবে সাহায্য করতে পারি?"],["Request a call back","কল ব্যাক চাই"],["e.g. I want to verify land ownership in Gulshan","যেমন: গুলশানে জমির মালিকানা যাচাই করতে চাই"],
["Swapnajatra Properties Ltd.","স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড"],["Explore","ঘুরে দেখুন"],["How we work","কাজের ধাপ"],["Visit us","আমাদের ঠিকানা"],["© 2026 Swapnajatra Properties Ltd. All rights reserved.","© ২০২৬ স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড। সর্বস্বত্ব সংরক্ষিত।"],
["Enter your name.","আপনার নাম লিখুন।"],["Enter a valid Bangladeshi mobile number, e.g. 01726 191 921.","সঠিক মোবাইল নম্বর দিন, যেমন ০১৭২৬ ১৯১ ৯২১।"],["Tell us a little more (10+ characters).","আরেকটু বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)।"],["Request sent. We will call you back soon.","অনুরোধ পাঠানো হয়েছে। আমরা শীঘ্রই কল করব।"],
["Gulshan","গুলশান"],["Banani","বনানী"],["Baridhara","বারিধারা"],["Bashundhara","বসুন্ধরা"],["Dhanmondi","ধানমন্ডি"],["Uttara","উত্তরা"],["Dhaka","ঢাকা"],
["Apartment","অ্যাপার্টমেন্ট"],["Villa","ভিলা"],["House","বাড়ি"],["Penthouse","পেন্টহাউস"],["Commercial","বাণিজ্যিক"],["Land","জমি"],
["Lift","লিফট"],["Parking","পার্কিং"],["Generator","জেনারেটর"],["Security","নিরাপত্তা"],["Rooftop","ছাদ"],["Gym","জিম"],
["beds","বেডরুম"],["baths","বাথরুম"],["sq ft","বর্গফুট"],["Office","অফিস"],["/month","/মাস"],["Cr","কোটি"],["Area","আয়তন"],
["View details","বিস্তারিত দেখুন"],["OFF","ছাড়"],["Save to favorites","পছন্দের তালিকায় রাখুন"],["For rent","ভাড়ার জন্য"],["For sale","বিক্রয়ের জন্য"],["Call our office","অফিসে কল করুন"],["Schedule a visit","ভিজিটের সময় নিন"],
["No properties match these filters","এই ফিল্টারে কোনো প্রপার্টি মেলেনি"],["Try a different location or type, or reset the filters.","অন্য এলাকা বা ধরন বেছে দেখুন, অথবা ফিল্টার মুছে ফেলুন।"],
["Gulshan Sky Residence","গুলশান স্কাই রেসিডেন্স"],["Banani Garden Flat","বনানী গার্ডেন ফ্ল্যাট"],["Baridhara Courtyard Villa","বারিধারা কোর্টইয়ার্ড ভিলা"],["Gulshan Crown Penthouse","গুলশান ক্রাউন পেন্টহাউস"],["Bashundhara Family Home","বসুন্ধরা ফ্যামিলি হোম"],["Dhanmondi Lake-View Flat","ধানমন্ডি লেক-ভিউ ফ্ল্যাট"],["Gulshan Avenue Office Floor","গুলশান অ্যাভিনিউ অফিস ফ্লোর"],["Banani Modern Apartment","বনানী মডার্ন অ্যাপার্টমেন্ট"],["Uttara Sector Flat","উত্তরা সেক্টর ফ্ল্যাট"],["Baridhara Garden House","বারিধারা গার্ডেন হাউস"],["Call","কল"],["Request visit","ভিজিটের অনুরোধ পাঠান"],["Email (optional)","ইমেইল (ঐচ্ছিক)"],["Preferred date","পছন্দের তারিখ"],["Preferred time","পছন্দের সময়"],["Morning (10am–1pm)","সকাল (১০টা–১টা)"],["Afternoon (2pm–5pm)","দুপুর (২টা–৫টা)"],["Evening (5pm–8pm)","সন্ধ্যা (৫টা–৮টা)"],["Visitors","দর্শনার্থী সংখ্যা"],["Message (optional)","বার্তা (ঐচ্ছিক)"],["Visit request received","ভিজিটের অনুরোধ পাওয়া গেছে"],["Close","বন্ধ করুন"],["Saved","সংরক্ষিত"],
["Home loan calculator","হোম লোন ক্যালকুলেটর"],["Estimate your monthly payment. The interest rate is an assumption — use your bank's actual rate.","আনুমানিক মাসিক কিস্তি দেখুন। সুদের হার একটি ধারণা মাত্র — ব্যাংকের আসল হার ব্যবহার করুন।"],["Property price (৳)","প্রপার্টির দাম (৳)"],["Down payment (৳)","ডাউন পেমেন্ট (৳)"],["Loan amount (৳)","ঋণের পরিমাণ (৳)"],["Interest rate (% per year)","সুদের হার (বার্ষিক %)"],["Loan duration (years)","ঋণের মেয়াদ (বছর)"],["Monthly EMI","মাসিক কিস্তি (EMI)"],["Total interest","মোট সুদ"],["Total payment","মোট পরিশোধ"],["Principal","মূল ঋণ"],["Interest","সুদ"],
["Enter a valid email address.","সঠিক ইমেইল ঠিকানা দিন।"],["Choose a date from today onwards.","আজ বা পরবর্তী কোনো তারিখ বেছে নিন।"],["Choose a time.","একটি সময় বেছে নিন।"]];
const E2B=Object.fromEntries(DD),orig=new WeakMap();let lang="en";
Object.assign(E2B,{"Projects":"প্রকল্প","About":"আমাদের সম্পর্কে","Our projects":"আমাদের প্রকল্পসমূহ","Rented":"ভাড়া হয়েছে","Sold":"বিক্রিত","Upcoming":"আসন্ন","Ongoing":"চলমান","Completed":"সম্পন্ন","Price on request":"দাম জানতে যোগাযোগ করুন","Loading properties…":"প্রপার্টি লোড হচ্ছে…","Properties are temporarily unavailable.":"প্রপার্টির তালিকা সাময়িকভাবে পাওয়া যাচ্ছে না।","Could not send your request. Please call us.":"অনুরোধ পাঠানো যায়নি। অনুগ্রহ করে আমাদের কল করুন।","Too many requests. Please try again later.":"অনেক বেশি অনুরোধ। অনুগ্রহ করে পরে চেষ্টা করুন।","Admin Login":"অ্যাডমিন লগইন","Properties":"প্রপার্টি"});
function walk(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentElement;if(!p||p.closest("script,style,#gd,#lg,#map,#md,#ts,.lt,#hp,#cnt,.err,[data-n],[data-cms-on]"))continue;if(!n.nodeValue.trim())continue;if(!orig.has(n))orig.set(n,n.nodeValue);const o=orig.get(n),k=o.trim();n.nodeValue=lang=="bn"&&E2B[k]?o.replace(k,E2B[k]):o}
$$("[placeholder]").forEach(e=>{if(!e.dataset.ph)e.dataset.ph=e.placeholder;e.placeholder=lang=="bn"&&E2B[e.dataset.ph]||e.dataset.ph})}
function setLang(l){lang=l;document.documentElement.lang=l;walk();$$(".lt").forEach(b=>b.textContent=l=="bn"?"English":"বাংলা");if(typeof renderDynamic==="function")renderDynamic();render();}
/* =========================
   API + DATA (replaces localStorage "database" and the fake admin login)
========================= */
const API=(window.SWP_API_BASE||"")+"/api";
async function api(path,opts){
  const r=await fetch(API+path,Object.assign({headers:{"Content-Type":"application/json"}},opts));
  let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const er=new Error((j&&j.error)||"Request failed");er.status=r.status;er.details=j&&j.details;throw er}
  return j}
const sendErr=x=>t(x&&x.status===429?"Too many requests. Please try again later.":"Could not send your request. Please call us.");
function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const clone=o=>JSON.parse(JSON.stringify(o));
/* Fallback values used only until/unless the API answers. The database is the source of truth. */
const DEFAULTS={company:{name:"SWAPNAJATRA PROPERTIES LTD.",tagline:"HONESTY • EFFICIENCY • TRUST",address:"Kohinoor Tower-03, Road #7\nHouse #7-SW(E), 3rd Floor\nGulshan-1, Dhaka",email:"",phone1:"01310 094 907",phone2:"01726 191 921",phone3:"01870 763 179",hours:""},
social:{whatsapp:"8801310094907",facebook:"",linkedin:"",youtube:"",maps:""},
brand:{title:"Swapnajatra Properties Ltd.",logo:"",favicon:"",defaultImage:""},
prefs:{lang:"en",theme:"light",showWa:true,showMenu:true},
prop:{listing:"buy",type:"",perPage:12,featured:true,sold:true,rented:true},
site:{status:"online",message:"Our website is under maintenance. Please check back soon."}};
let SET=clone(DEFAULTS),LOADED=false,loadFailed=false,SERVICES=[],PROJECTS=[],CONTENT={},visitPid=null;
const hue=id=>(id*47)%360;
function mapProp(r){const imgs=(r.images&&r.images.length)?r.images:(SET.brand.defaultImage?[SET.brand.defaultImage]:[]);
  const op=Number(r.price)||0,dc=Math.min(99,Math.max(0,Number(r.discount_percent)||0));
  return{id:r.id,t:r.title,l:r.location,y:r.property_type,m:r.listing_type,op,dc,p:dc?Math.round(op*(1-dc/100)):op,b:r.bedrooms||0,ba:r.bathrooms||0,a:r.area||0,am:r.features||[],h:hue(r.id),imgs,img:imgs[0]||"",ft:!!r.featured,st:r.status,d:r.description||"",demo:!!r.is_demo}}
function buildFilters(){
  LOC=[...new Set([...DEFLOC,...P.map(p=>p.l)].filter(Boolean))];TY=[...new Set([...DEFTY,...P.map(p=>p.y)].filter(Boolean))];AM=[...new Set([...DEFAM,...P.flatMap(p=>p.am)])];
  const ids=["#hl","#fl","#ht","#ft","#fa"],keep=ids.map(i=>$(i).value);
  ["#hl","#fl"].forEach(i=>fill(i,LOC,"All locations"));["#ht","#ft"].forEach(i=>fill(i,TY,"All types"));fill("#fa",AM,"Any amenity");
  ids.forEach((i,k)=>{$(i).value=keep[k]})}

/* =========================
   RENDER DYNAMIC SECTIONS (services, projects, CMS text, contact details)
========================= */
function renderDynamic(){renderServices();renderProjects();applyContent();applyContact();renderCompany()}
const SX_ICON=['<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>','<circle cx="12" cy="8" r="2.6"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M7.5 19c0-3 2-5 4.500-5s4.500 2 4.500 5"/><path d="M2 18c0-2 1.500-3.500 3.500-3.500M22 18c0-2-1.500-3.500-3.500-3.500"/>','<path d="M3 21h18"/><path d="M5 21V9l5-3v15"/><path d="M10 21V12h5v9"/><path d="M13 3h8M17 3v5M13 3l-3 3"/><path d="M7 12h1M7 15h1M7 18h1"/>','<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><circle cx="12" cy="14" r="2.600"/><path d="M14 16l2.500 2.500"/>','<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>'];
const SX_SKY=[["#f6d9a8","#e7a86a","#31496b"],["#9cc6ea","#cfe4f5","#27466e"],["#f4c48b","#d8845a","#2a3b5c"],["#efe5d1","#f7f1e4","#37506f"],["#a8d3ee","#d7ecf7","#2f6a55"]];
function sxKind(t,i){t=(t||"").toLowerCase();if(t.includes("land share"))return 2;if(t.includes("joint"))return 1;if(t.includes("buy"))return 0;if(t.includes("consult")||t.includes("land management"))return 3;if(t.includes("facility")||t.includes("property management"))return 4;return i%5}
function sxArt(k,i){const c=SX_SKY[k],id="sxg"+i;return `<svg class="sx-art" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="400" height="200" fill="url(#${id})"/><circle cx="318" cy="52" r="26" fill="#fff" opacity=".55"/><g fill="${c[2]}"><rect x="40" y="96" width="62" height="104" opacity=".55"/><rect x="112" y="64" width="74" height="136" opacity=".8"/><rect x="196" y="110" width="52" height="90" opacity=".6"/><rect x="258" y="80" width="68" height="120" opacity=".85"/><rect x="336" y="120" width="50" height="80" opacity=".5"/></g><g fill="#fff" opacity=".35"><rect x="122" y="76" width="10" height="8"/><rect x="142" y="76" width="10" height="8"/><rect x="122" y="96" width="10" height="8"/><rect x="142" y="96" width="10" height="8"/><rect x="268" y="92" width="10" height="8"/><rect x="288" y="92" width="10" height="8"/><rect x="268" y="112" width="10" height="8"/><rect x="288" y="112" width="10" height="8"/></g></svg>`}
function renderServices(){if(!LOADED)return;const g=$("#svGrid");g.dataset.cmsOn=1;g.className="sxg rv vis";$("#services").hidden=!SERVICES.length;const bn=lang==="bn",n=SERVICES.length,nh=Math.max(0,n-3);
  g.innerHTML=SERVICES.map((s,i)=>{const ti=bn&&s.title_bn||s.title,de=bn&&s.description_bn||s.description,cl=bn&&s.cta_label_bn||s.cta_label,k=sxKind(s.title,i),h=i>=3,wide=h&&nh%2===1&&i===n-1;
    const m=s.image?`<img src="${esc(s.image)}" alt="" loading="lazy" decoding="async">`:sxArt(k,i);
    const ic=s.icon?`<span class="sx-e">${esc(s.icon)}</span>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SX_ICON[k]}</svg>`;
    return `<article class="sx ${h?"sxh":"sxv"}${wide?" sxw":""} sxt${k}"><div class="sx-m">${m}</div><div class="sx-b"><span class="sx-i">${ic}</span><h3>${esc(ti)}</h3>${de?`<p>${esc(de)}</p>`:""}${cl?`<a href="${esc(s.cta_href||"#contact")}" class="sx-l"><span>${esc(cl)}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></i></a>`:""}</div></article>`}).join("")}
function renderProjects(){if(!LOADED)return;$("#projects").hidden=!PROJECTS.length;$$('[data-opt="projects"]').forEach(a=>a.hidden=!PROJECTS.length);const g=$("#prjGrid");g.dataset.cmsOn=1;
  g.innerHTML=PROJECTS.map(p=>`<article class="card" style="cursor:default"><div class="ph">${art(hue(p.id),0,(p.images||[])[0]||"")}<span class="bd">${esc(t(p.status))}</span></div><div class="cb"><h3>${esc(p.title)}</h3>${p.location?`<div class="lc">${esc(p.location)}</div>`:""}${p.project_type?`<div class="lc">${esc(p.project_type)}</div>`:""}${p.description?`<p class="sub" style="margin-top:8px;white-space:pre-line">${esc(p.description)}</p>`:""}</div></article>`).join("")}
const cv=k=>{const c=CONTENT[k];if(!c)return"";return lang==="bn"&&c.value_bn?c.value_bn:c.value};
function applyContent(){if(!LOADED)return;
  $$("[data-cms]").forEach(el=>{el.dataset.cmsOn=1;el.textContent=cv(el.dataset.cms)});
  const hi=cv("hero_image"),h=$("#top");h.classList.toggle("has-img",!!hi);h.style.backgroundImage=hi?`linear-gradient(180deg,rgba(200,230,248,.55),rgba(234,245,252,.8)),url("${encodeURI(hi)}")`:"";
  const ah=cv("about_heading"),ad=cv("about_description"),ai=cv("about_image"),on=!!(ah||ad||ai);
  $("#about").hidden=!on;$$('[data-opt="about"]').forEach(a=>a.hidden=!on);$("#abBox").classList.toggle("noimg",!ai);const im=$("#abImg");im.hidden=!ai;if(ai)im.src=ai;ownerCard();hcRender();landBg()}
function countTo(el,n){let k=0;const iv=setInterval(()=>{el.textContent=dg(++k);if(k>=n)clearInterval(iv)},200)}
function applyContact(){const c=SET.company,so=SET.social;
  $$(".ci > a[href^='tel:']").forEach((a,i)=>{const v=c["phone"+(i+1)]||"";a.hidden=!v;if(!v)return;const d=v.replace(/\D/g,"");a.href="tel:"+(d.startsWith("88")?"+"+d:"+88"+d);
    if(v!==DEFAULTS.company["phone"+(i+1)]||a.dataset.ch){a.dataset.ch=1;a.dataset.cmsOn=1;a.textContent=v}});
  const lines=c.address.split("\n").map(x=>x.trim()).filter(Boolean),changed=c.address!==DEFAULTS.company.address;
  const ad=$("#cAddr");if(ad&&(changed||ad.dataset.ch)){ad.dataset.ch=1;ad.innerHTML="<b>Contact:</b><br>"+lines.map(esc).join("<br>")}
  const ma=$("#mapAddr");if(ma&&(changed||ma.dataset.ch)){ma.dataset.ch=1;ma.innerHTML=lines.map(esc).join("<br>")}
  const fv=$("#ftVisit");if(fv&&(changed||c.email||fv.dataset.ch)){fv.dataset.ch=1;fv.innerHTML="<h4>Visit us</h4>"+lines.map(l=>`<a>${esc(l)}</a>`).join("")+(c.email?`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:"")}
  const ml=$("#mapLink");if(ml&&/^https?:\/\//.test(so.maps||""))ml.href=so.maps;
  let ex=$("#cExtra");if(!ex&&$(".ci")){ex=document.createElement("p");ex.id="cExtra";ex.className="cextra";ex.style.marginTop="10px";$(".ci").append(ex)}
  if(ex)ex.hidden=true,ex.innerHTML=[c.email&&"Email: "+esc(c.email),c.hours&&"Hours: "+esc(c.hours)].filter(Boolean).join("<br>"),ex.hidden=!ex.innerHTML;
  const eb=$(".hero .eb");if(eb&&c.tagline&&c.tagline!==DEFAULTS.company.tagline){eb.dataset.cmsOn=1;eb.textContent=c.tagline}}

/* =========================
   SETTINGS (from the database via /api/bootstrap)
========================= */
function applySettings(first){const c=SET.company,so=SET.social,b=SET.brand,pf=SET.prefs;
document.title=b.title||DEFAULTS.brand.title;
if(b.favicon){let fi=$("link[rel=icon]");if(!fi){fi=document.createElement("link");fi.rel="icon";document.head.append(fi)}fi.href=b.favicon}
const lg=$(".logo svg");if(lg){let im=$("#logoImg");if(b.logo){if(!im){im=document.createElement("img");im.id="logoImg";im.alt="Logo";im.style.cssText="height:36px;width:auto;display:block";lg.after(im)}im.src=b.logo;lg.style.display="none"}else{if(im)im.remove();lg.style.display=""}}
applyContact();
const fh=$(".ft h3");if(fh&&(c.name!==DEFAULTS.company.name||fh.dataset.ch)){fh.dataset.ch=1;fh.textContent=c.name}
let sc=$("#soc");if(!sc&&$(".ft")){sc=document.createElement("div");sc.id="soc";sc.className="soc";$(".ft .cp").before(sc)}
if(sc)sc.innerHTML=[["facebook","Facebook"],["linkedin","LinkedIn"],["youtube","YouTube"],["maps","Google Maps"]].filter(x=>/^https?:\/\//.test(so[x[0]]||"")).map(x=>`<a href="${esc(so[x[0]])}" target="_blank" rel="noopener">${x[1]}</a>`).join("");
let wf=$("#waf");if(!wf){wf=document.createElement("a");wf.id="waf";wf.className="waf";wf.target="_blank";wf.rel="noopener";wf.textContent="WhatsApp";document.body.append(wf)}
wf.href="https://wa.me/"+WAN();wf.hidden=!(pf.showWa&&WAN());
$(".dmenu").hidden=!pf.showMenu;
const mt=$("#maint");$("#maintMsg").textContent=SET.site.message;mt.classList.toggle("o",SET.site.status==="maintenance");
if(first){let has=false;try{has=!!localStorage.getItem("swp_theme")}catch(e){}if(!has)document.documentElement.dataset.theme=pf.theme;
mode=SET.prop.listing;$("#fm").value=mode;$$(".tg button").forEach(x=>x.classList.toggle("a",x.dataset.m===mode));$("#ft").value=TY.includes(SET.prop.type)?SET.prop.type:"";if(typeof bands==="function")bands();
if(pf.lang==="bn"&&typeof setLang==="function")setLang("bn")}
render()}

/* =========================
   HAMBURGER MENU (☰ → "Admin Login" → /admin/ where real authentication happens)
========================= */
const dBtn=$("#dBtn"),dPop=$("#dPop");
function closeDots(){dPop.hidden=true;dBtn.setAttribute("aria-expanded","false")}
dBtn.onclick=e=>{e.stopPropagation();const o=dPop.hidden;dPop.hidden=!o;dBtn.setAttribute("aria-expanded",String(o));if(o)$("#dAdmin").focus()};
dPop.onkeydown=e=>{if(e.key==="Escape"){closeDots();dBtn.focus()}};
document.addEventListener("click",e=>{if(!e.target.closest(".dmenu"))closeDots()});

/* =========================
   BOOT: one request loads everything from the database
========================= */
async function boot(){
  try{
    const d=await api("/bootstrap");
    SET=clone(DEFAULTS);for(const g in SET)Object.assign(SET[g],(d.settings||{})[g]||{});
    SERVICES=d.services||[];window.TEAM=d.team||[];PROJECTS=d.projects||[];CONTENT=d.content||{};P=(d.properties||[]).map(mapProp);LOADED=true;
  }catch(e){loadFailed=true;console.warn("API unavailable — showing static fallback content.",e)}
  buildFilters();applySettings(true);renderDynamic();
  if(LOADED){countTo($("#stSv"),SERVICES.length);countTo($("#stPh"),[SET.company.phone1,SET.company.phone2,SET.company.phone3].filter(Boolean).length)}
  walk()}

const WAN=()=>(SET.social.whatsapp||"").replace(/\D/g,"")||"8801310094907";
const TEL=()=>{const d=(SET.company.phone1||"").replace(/\D/g,"");return d?(d.startsWith("88")?"+"+d:"+88"+d):"+8801310094907"};
let pg=1,lastTotal=0,lastSig="";
function render(){const sig=[...$$("#fm,#fl,#ft,#fb,#fa,#fs,#hp")].map(e=>e.value).join("|")+onlySaved;if(sig!==lastSig){pg=1;lastSig=sig}
render0();const pp=Math.max(1,+SET.prop.perPage||12);if(lastTotal>pg*pp)$("#gd").insertAdjacentHTML("beforeend",`<button class="btn o" id="moreBtn" style="grid-column:1/-1;justify-self:center">${t("Show more")}</button>`)}
document.addEventListener("click",e=>{if(e.target.id==="moreBtn"){pg++;render()}});
buildLg();bands();render();pins();emi();if($("#md").classList.contains("o"))open(curId)
$$(".lt").forEach(b=>b.onclick=()=>setLang(lang=="en"?"bn":"en"));
function tick(){const v=new Date().toLocaleTimeString(lang=="bn"?"bn-BD":"en-GB",{timeZone:"Asia/Dhaka",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});$$(".tk").forEach(e=>e.textContent=v)}
tick();setInterval(tick,1000);
const TH=["system","light","dark"],TI={system:"◐",light:"☀",dark:"☾"};let th="system";try{th=localStorage.getItem("swp_theme")||"system"}catch(e){}
function setTh(x){th=x;const r=document.documentElement;x=="system"?r.removeAttribute("data-theme"):r.dataset.theme=x;$$(".tm").forEach(b=>{b.textContent=TI[x];b.title="Theme: "+x;b.setAttribute("aria-label","Theme: "+x)});try{localStorage.setItem("swp_theme",x)}catch(e){}}
$$(".tm").forEach(b=>b.onclick=()=>setTh(TH[(TH.indexOf(th)+1)%3]));setTh(th);
$("#sb").onclick=()=>{onlySaved=!onlySaved;render()};
function emi(){/*CALC-COMMA*/const cn=x=>+String($(x).value).replace(/,/g,"")||0,pr=cn("#ep"),dp=Math.min(cn("#ed"),pr),L=pr-dp,r=(+$("#er").value||0)/1200,n=Math.max(1,Math.round((+$("#ey").value||1)*12));
const m=r?L*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):L/n,tot=m*n;
$("#el").value=num(Math.round(L));$("#o1").textContent="৳"+num(Math.round(m));$("#o2").textContent="৳"+num(Math.round(tot-L));$("#o3").textContent="৳"+num(Math.round(tot));$("#dn").setAttribute("stroke-dasharray",(tot?289*L/tot:0)+" 289")}
$$("#ep,#ed,#er,#ey").forEach(e=>e.oninput=emi);
function openVisit(p){visitPid=p?p.id:null;$("#vf").hidden=false;$("#vd").hidden=true;$("#vf").reset();$$("#vf .err").forEach(e=>e.textContent="");$("#vp").textContent=p?t(p.t)+", "+t(p.l):"";$("#vdt").min=new Date().toISOString().slice(0,10);$("#vm").classList.add("o");$("#vn").focus()}
$("#vm").onclick=e=>{if(["vm","vx","vk"].includes(e.target.id))$("#vm").classList.remove("o")};
$("#vf").onsubmit=async e=>{e.preventDefault();let ok=true;const ck=(id,f,m)=>{const el=$(id),er=el.parentNode.querySelector(".err"),bad=!f(el.value.trim());er.textContent=bad?t(m):"";ok=ok&&!bad};
ck("#vn",v=>v.length>1,"Enter your name.");ck("#vph",v=>/^(\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g,"")),"Enter a valid Bangladeshi mobile number, e.g. 01726 191 921.");
ck("#vem",v=>!v||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),"Enter a valid email address.");ck("#vdt",v=>v&&v>=$("#vdt").min,"Choose a date from today onwards.");ck("#vtm",v=>v,"Choose a time.");
if(!ok)return;const d={name:$("#vn").value.trim(),phone:$("#vph").value.trim(),email:$("#vem").value.trim(),date:$("#vdt").value,time:$("#vtm").value,visitors:+$("#vv").value||1,message:$("#vms").value.trim(),property:$("#vp").textContent,createdAt:new Date().toISOString()};
const vb=$("#vf button[type=submit]");vb.disabled=true;try{await api("/visit-requests",{method:"POST",body:JSON.stringify({customer_name:d.name,phone:d.phone,email:d.email,preferred_date:d.date,preferred_time:d.time,visitors:d.visitors,message:d.message,property_title:d.property,property_id:visitPid,website:$("#vf .hp").value})})}catch(x){vb.disabled=false;toast(sendErr(x));return}vb.disabled=false;
$("#vc").textContent=lang=="bn"?`ধন্যবাদ, ${d.name}। ${d.date} (${d.time}) ভিজিট নিশ্চিত করতে আমরা ${d.phone} নম্বরে যোগাযোগ করব।`:`Thank you, ${d.name}. We will contact ${d.phone} to confirm your visit on ${d.date} (${d.time}).`;
$("#vf").hidden=true;$("#vd").hidden=false;$("#vk").focus()};
/* =========================
   LIST YOUR PROPERTY (sent to the backend as an enquiry)
========================= */
function openLP(){$("#dr").classList.remove("o");$("#lpf").hidden=false;$("#lpd").hidden=true;$("#lpf").reset();$$("#lpf .err").forEach(e=>e.textContent="");$("#lp").classList.add("o");setTimeout(()=>$("#lpn").focus(),50)}
const closeLP=()=>$("#lp").classList.remove("o");
document.addEventListener("click",e=>{const b=e.target.closest("[data-lp]");if(b){e.preventDefault();openLP()}});
$("#lp").onclick=e=>{if(["lp","lpx","lpk"].includes(e.target.id))closeLP()};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLP()});
$("#lpf").onsubmit=async e=>{e.preventDefault();let ok=true;const ck=(id,f,m)=>{const el=$(id),er=el.parentNode.querySelector(".err"),bad=!f(el.value.trim());er.textContent=bad?t(m):"";ok=ok&&!bad};
ck("#lpn",v=>v.length>1,"Enter your name.");ck("#lpp",v=>/^(\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g,"")),"Enter a valid Bangladeshi mobile number, e.g. 01726 191 921.");ck("#lpe",v=>!v||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),"Enter a valid email address.");ck("#lpl",v=>v.length>1,"Enter the property location.");
if(!ok)return;const pr=+$("#lpr").value,ar=+$("#lpa").value,note=$("#lpg").value.trim();
const msg="LIST PROPERTY — "+$("#lpm").value+" · "+$("#lpy").value+" · "+$("#lpl").value.trim()+(pr?" · ৳"+pr.toLocaleString("en-IN"):"")+(ar?" · "+ar+" sq ft":"")+(note?" — "+note:"");
const lb=$("#lpf button[type=submit]");lb.disabled=true;try{await api("/enquiries",{method:"POST",body:JSON.stringify({customer_name:$("#lpn").value.trim(),phone:$("#lpp").value.trim(),email:$("#lpe").value.trim(),subject:"List your property",source:"list_property",message:msg,website:$("#lpf .hp").value})})}catch(x){lb.disabled=false;toast(sendErr(x));return}lb.disabled=false;
$("#lpf").hidden=true;$("#lpd").hidden=false;$("#lpk").focus()};
addEventListener("scroll",()=>document.body.classList.toggle("scr",scrollY>40),{passive:true});document.body.classList.toggle("scr",scrollY>40);
boot();

/* owner v1 */
function ownerCard(){const c=$("#own");if(!c)return;const nm=cv("owner_name"),im=cv("owner_image");c.hidden=!nm;const i=$("#ownImg"),p=$("#ownPh");i.hidden=!im;if(im)i.src=im;p.toggleAttribute("hidden",!!im);ownerPos()}
function ownerPos(){const c=$("#own"),t=document.querySelector(".hero .in");if(!c||!t)return;if(innerWidth<=1240){c.style.removeProperty("--ow");c.style.removeProperty("--ol");return}const g=t.getBoundingClientRect().left,w=Math.max(240,Math.min(320,g-48));c.style.setProperty("--ow",w+"px");c.style.setProperty("--ol",Math.max(12,(g-w)/2)+"px")}
addEventListener("resize",ownerPos);addEventListener("load",ownerPos);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ownerPos);

/* board v1 */
Object.assign(E2B,{"OUR LEADERSHIP":"আমাদের নেতৃত্ব","Board of Directors":"পরিচালনা পর্ষদ"});
function renderCompany(){const g=$("#coTeam");if(!g)return;const bn=lang==="bn",L=window.TEAM||[];
  const ph='<svg viewBox="0 0 100 120" aria-hidden="true"><circle cx="50" cy="44" r="19" fill="#9db6d8"/><path d="M12 120c0-26 17-42 38-42s38 16 38 42z" fill="#9db6d8"/></svg>';
  g.dataset.cmsOn=1;
  g.innerHTML=L.map(m=>{const nm=bn&&m.name_bn||m.name,rl=bn&&m.role_bn||m.role;return '<div class="co-m"><div class="co-mp">'+(m.photo?'<img src="'+esc(m.photo)+'" alt="'+esc(nm)+'" loading="lazy">':ph)+'</div><b>'+esc(nm)+'</b><span>'+esc(rl)+'</span></div>'}).join("");
  if(LOADED){$("#board").hidden=!L.length}}

/* hero cred v1 */
Object.assign(E2B,{"Company Registration":"কোম্পানি নিবন্ধন","TIN Number":"টিআইএন নম্বর","Trade Licence":"ট্রেড লাইসেন্স","Date of Incorporation":"নিবন্ধনের তারিখ"});
function hcRender(){$$("#hCred>div[data-k]").forEach(d=>{d.hidden=!cv(d.dataset.k)})}

/* land banner v1 */
Object.assign(E2B,{"Trusted Process":"বিশ্বস্ত প্রক্রিয়া","Transparent & reliable":"স্বচ্ছ ও নির্ভরযোগ্য","Professional Team":"পেশাদার দল","From planning to handover":"পরিকল্পনা থেকে হস্তান্তর পর্যন্ত","Long-Term Value":"দীর্ঘমেয়াদি মূল্য","Built on trust":"বিশ্বাসের উপর প্রতিষ্ঠিত"});
function landBg(){const u=cv("land_image"),b=$("#lcBg");if(!b)return;const im=b.querySelector("img");if(u){if(im){im.src=u}else{b.querySelector("svg").hidden=true;b.insertAdjacentHTML("afterbegin",'<img alt="" loading="lazy" decoding="async" src="'+esc(u)+'">')}}else{if(im)im.remove();const s=b.querySelector("svg");if(s)s.hidden=false}}
