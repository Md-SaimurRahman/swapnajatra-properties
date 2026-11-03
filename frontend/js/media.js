/* News & Media pages: ?t=news|notices|photos|videos   (&id=N for the detail page) */
(function(){
var $=function(i){return document.getElementById(i)};
var Q=new URLSearchParams(location.search),TYPE=Q.get("t"),ID=Number(Q.get("id"))||0;
var KEYS=["news","notices","photos","videos"];if(KEYS.indexOf(TYPE)<0)TYPE="news";
var CT={},MD=null,PF={},lang="en",th="system",tries=0,LB=[],LI=0;
var TX={
en:{eb:"NEWS & MEDIA",home:"← Home",back:"Back to home",lt:"বাংলা",more:"Read more →",open:"Open document ↗",watch:"Watch video ↗",loading:"Loading…",photos:"photos",
 news:{n:"News",h:"Latest <em>News</em>",s:"Updates and announcements from Swapnajatra Properties Ltd.",e:"No news has been published yet.",b:"← All news"},
 notices:{n:"Notices",h:"Official <em>Notices</em>",s:"Important notices for our clients, landowners and partners.",e:"No notices have been published yet.",b:"← All notices"},
 photos:{n:"Photo Gallery",h:"Photo <em>Gallery</em>",s:"Moments from our projects, events and sites.",e:"No photos have been added yet.",b:"← All albums"},
 videos:{n:"Video Gallery",h:"Video <em>Gallery</em>",s:"Watch our projects, events and messages.",e:"No videos have been added yet.",b:"← All videos"}},
bn:{eb:"সংবাদ ও মিডিয়া",home:"← হোম",back:"হোমে ফিরুন",lt:"English",more:"বিস্তারিত পড়ুন →",open:"ডকুমেন্ট খুলুন ↗",watch:"ভিডিও দেখুন ↗",loading:"লোড হচ্ছে…",photos:"টি ছবি",
 news:{n:"সংবাদ",h:"সর্বশেষ <em>সংবাদ</em>",s:"স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেডের হালনাগাদ ও ঘোষণা।",e:"এখনো কোনো সংবাদ প্রকাশ করা হয়নি।",b:"← সব সংবাদ"},
 notices:{n:"নোটিশ",h:"অফিসিয়াল <em>নোটিশ</em>",s:"আমাদের ক্লায়েন্ট, ভূমি মালিক ও অংশীদারদের জন্য গুরুত্বপূর্ণ নোটিশ।",e:"এখনো কোনো নোটিশ প্রকাশ করা হয়নি।",b:"← সব নোটিশ"},
 photos:{n:"ফটো গ্যালারি",h:"ফটো <em>গ্যালারি</em>",s:"আমাদের প্রকল্প, অনুষ্ঠান ও সাইটের মুহূর্ত।",e:"এখনো কোনো ছবি যোগ করা হয়নি।",b:"← সব অ্যালবাম"},
 videos:{n:"ভিডিও গ্যালারি",h:"ভিডিও <em>গ্যালারি</em>",s:"আমাদের প্রকল্প, অনুষ্ঠান ও বার্তা দেখুন।",e:"এখনো কোনো ভিডিও যোগ করা হয়নি।",b:"← সব ভিডিও"}}};
var TI={system:"◐",light:"☀",dark:"☾"};
var PH='<svg class="ph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>';
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function pick(o,k){return(lang==="bn"&&o[k+"_bn"])?o[k+"_bn"]:(o[k]||"")}
function cv(k){var o=CT[k];if(!o)return"";return(lang==="bn"&&o.value_bn)?o.value_bn:(o.value||"")}
function src(u){return esc(encodeURI(u))}
function fdate(d){if(!d)return"";var t=new Date(d+"T00:00:00");if(isNaN(t))return d;try{return t.toLocaleDateString(lang==="bn"?"bn-BD":"en-GB",{day:"numeric",month:"long",year:"numeric"})}catch(e){return d}}
function parts(d){var t=new Date(d+"T00:00:00");if(!d||isNaN(t))return["",""];try{var l=lang==="bn"?"bn-BD":"en-GB";return[t.toLocaleDateString(l,{day:"numeric"}),t.toLocaleDateString(l,{month:"short",year:"numeric"})]}catch(e){return["",d]}}
function href(t,id){return"media.html?t="+t+(id?"&id="+id:"")}
function cover(it){return it.image||(it.images&&it.images[0])||(TYPE==="videos"?ytThumb(it.url):"")||""}
function vid(u){u=String(u||"");var m;
if(m=/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/.exec(u))return{yt:m[1]};
if(m=/vimeo\.com\/(?:video\/)?(\d+)/.exec(u))return{src:"https://player.vimeo.com/video/"+m[1]};
if(/facebook\.com|fb\.watch/.test(u))return{src:"https://www.facebook.com/plugins/video.php?show_text=false&href="+encodeURIComponent(u)};
return null}
function ytThumb(u){var v=vid(u);return v&&v.yt?"https://i.ytimg.com/vi/"+v.yt+"/hqdefault.jpg":""}
function paras(s){s=esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');return s.split(/\n{2,}/).map(function(p){return"<p>"+p.replace(/\n/g,"<br>")+"</p>"}).join("")}
function tabs(){var t=TX[lang];$("nmTabs").innerHTML=KEYS.map(function(k){return'<a href="'+href(k)+'"'+(k===TYPE?' class="on" aria-current="page"':"")+">"+esc(t[k].n)+"</a>"}).join("")}
function list(items){var t=TX[lang];
if(!items.length)return'<div class="nmempty">'+esc(t[TYPE].e)+"</div>";
if(TYPE==="notices")return'<div class="nml">'+items.map(function(it){var p=parts(it.date);return'<a class="nmn" href="'+href(TYPE,it.id)+'"><div class="nmdt2"><b>'+esc(p[0])+"</b><span>"+esc(p[1])+'</span></div><div><h3>'+esc(pick(it,"title"))+"</h3>"+(pick(it,"summary")?"<p>"+esc(pick(it,"summary"))+"</p>":"")+'</div><span class="ar">→</span></a>'}).join("")+"</div>";
return'<div class="nmg">'+items.map(function(it){var c=cover(it),n=(it.images||[]).length;
return'<a class="nmc" href="'+href(TYPE,it.id)+'"><div class="nmi">'+(c?'<img src="'+src(c)+'" alt="'+esc(pick(it,"title"))+'" loading="lazy">':PH)+(TYPE==="videos"?'<span class="nmplay"><i></i></span>':"")+(TYPE==="photos"&&n?'<span class="nmbadge">'+(lang==="bn"?n+" "+t.photos:n+" "+t.photos)+"</span>":"")+'</div><div class="nmbd"><time>'+esc(fdate(it.date))+"</time><h3>"+esc(pick(it,"title"))+"</h3>"+(pick(it,"summary")?"<p>"+esc(pick(it,"summary"))+"</p>":"")+(TYPE==="news"?'<span class="nmmore">'+esc(t.more)+"</span>":"")+"</div></a>"}).join("")+"</div>"}
function detail(it){var t=TX[lang],h='<a class="nmback" href="'+href(TYPE)+'">'+esc(t[TYPE].b)+'</a><article class="nmart"><div class="nmd2">'+esc(fdate(it.date))+"</div><h2>"+esc(pick(it,"title"))+"</h2>";
LB=[];
if(TYPE==="videos"){var v=vid(it.url);
if(v&&v.yt)h+='<div class="nmvid"><iframe src="https://www.youtube.com/embed/'+v.yt+'" title="'+esc(pick(it,"title"))+'" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
else if(v)h+='<div class="nmvid"><iframe src="'+esc(v.src)+'" title="'+esc(pick(it,"title"))+'" allowfullscreen loading="lazy"></iframe></div>';
var body=pick(it,"summary")||pick(it,"body");if(body)h+='<div class="nmtx">'+paras(body)+"</div>";
if(it.url&&!v)h+='<a class="nmbtn" href="'+esc(it.url)+'" target="_blank" rel="noopener">'+esc(t.watch)+"</a>"}
else{
var cov=TYPE==="news"?it.image:"";
if(cov){LB.push(cov);h+='<img class="nmcov" data-lb="0" src="'+src(cov)+'" alt="'+esc(pick(it,"title"))+'">'}
var txt=TYPE==="photos"?(pick(it,"summary")||pick(it,"body")):(pick(it,"body")||pick(it,"summary"));
if(txt)h+='<div class="nmtx">'+paras(txt)+"</div>";
var im=it.images||[];if(im.length){var b=LB.length;im.forEach(function(u){LB.push(u)});h+='<div class="nmph">'+im.map(function(u,i){return'<button type="button" data-lb="'+(b+i)+'"><img src="'+src(u)+'" alt="" loading="lazy"></button>'}).join("")+"</div>"}
if(it.url)h+='<a class="nmbtn" href="'+esc(it.url)+'" target="_blank" rel="noopener">'+esc(t.open)+"</a>"}
return h+"</article>"}
function render(){var t=TX[lang],T=t[TYPE];
document.documentElement.lang=lang;document.documentElement.toggleAttribute("data-bnui",lang==="bn");
$("abEye").textContent=t.eb;$("abHome").textContent=t.home;$("abBack").textContent=t.back;$("abLg").textContent=t.lt;
$("abTitle").innerHTML=T.h;$("abSub").textContent=T.s;
var bg=(CT.board_image&&CT.board_image.value)||(CT.hero_image&&CT.hero_image.value),hd=$("abHead");
if(bg){hd.style.backgroundImage='url("'+encodeURI(bg)+'")';hd.classList.add("img")}else{hd.style.backgroundImage="";hd.classList.remove("img")}
var cp=cv("footer_copyright");$("abCopy").textContent=cp||"© Swapnajatra Properties Ltd.";
document.title=T.n+" — "+(lang==="bn"?"স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেড":"Swapnajatra Properties Ltd.");
tabs();var box=$("nmBody");
if(!MD){box.innerHTML='<div class="nmempty">'+esc(t.loading)+"</div>";return}
var items=MD[TYPE]||[];
if(ID){var it=items.filter(function(x){return x.id===ID})[0];
if(it){box.innerHTML=detail(it);document.title=pick(it,"title")+" — "+T.n;return}}
box.innerHTML=list(items)}
function setTh(x){th=x;var r=document.documentElement;x==="system"?r.removeAttribute("data-theme"):r.setAttribute("data-theme",x);$("abTh").textContent=TI[x];$("abTh").title="Theme: "+x;try{localStorage.setItem("swp_theme",x)}catch(e){}}
try{th=localStorage.getItem("swp_theme")||"system"}catch(e){}
setTh(th);
$("abTh").onclick=function(){var o=["system","light","dark"];setTh(o[(o.indexOf(th)+1)%3])};
$("abLg").onclick=function(){lang=lang==="en"?"bn":"en";try{sessionStorage.setItem("swp_lang",lang)}catch(e){}render()};
/* lightbox */
var lb=$("nmLb"),li=$("nmLi");
function show(i){if(!LB.length)return;LI=(i+LB.length)%LB.length;li.src=encodeURI(LB[LI]);$("nmLc").textContent=(LI+1)+" / "+LB.length;lb.hidden=false;$("nmLp").hidden=$("nmLn").hidden=LB.length<2}
function hide(){lb.hidden=true;li.removeAttribute("src")}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-lb]");if(b){e.preventDefault();show(+b.getAttribute("data-lb"))}});
$("nmLx").onclick=hide;$("nmLp").onclick=function(){show(LI-1)};$("nmLn").onclick=function(){show(LI+1)};
lb.addEventListener("click",function(e){if(e.target===lb)hide()});
document.addEventListener("keydown",function(e){if(lb.hidden)return;if(e.key==="Escape")hide();else if(e.key==="ArrowLeft")show(LI-1);else if(e.key==="ArrowRight")show(LI+1)});
try{lang=sessionStorage.getItem("swp_lang")||""}catch(e){lang=""}
var haveLang=!!lang;lang=lang||"en";render();
function load(){fetch((window.SWP_API_BASE||"")+"/api/bootstrap").then(function(r){return r.json()}).then(function(d){
CT=d.content||{};PF=(d.settings&&d.settings.prefs)||{};MD=d.media||null;
var lt=false;try{lt=!!localStorage.getItem("swp_theme")}catch(e){}if(!lt&&PF.theme&&th==="system")setTh(PF.theme);
if(!haveLang&&PF.lang==="bn")lang="bn";
if(!MD&&tries++<10){render();setTimeout(load,800);return}
if(!MD)MD={news:[],notices:[],photos:[],videos:[]};
render()}).catch(function(){if(tries++<4)setTimeout(load,1000);else{MD={news:[],notices:[],photos:[],videos:[]};render()}})}
load();
})();
