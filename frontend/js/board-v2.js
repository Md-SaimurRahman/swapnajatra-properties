/* board v2 */
(function(){
var S=document.getElementById("board");if(!S||S.dataset.v2)return;S.dataset.v2="1";S.classList.add("bd2");
var TM=[],CT={};
var T={en:{eb:"LEADERSHIP & VISION",h:"Board of <em>Directors</em>",s:"Guiding Swapnajatra Properties Ltd. with experience, integrity and a long-term vision for a better tomorrow."},
bn:{eb:"নেতৃত্ব ও দূরদৃষ্টি",h:"পরিচালনা <em>পর্ষদ</em>",s:"অভিজ্ঞতা, সততা ও দীর্ঘমেয়াদি দূরদৃষ্টি নিয়ে স্বপ্নযাত্রা প্রোপার্টিজ লিমিটেডকে এগিয়ে নিয়ে যাচ্ছেন।"}};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(){var l=typeof lang!=="undefined"?lang:document.documentElement.lang;return l==="bn"?"bn":"en"}
var SIL='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="40" r="17" fill="#a9bddb"/><path d="M14 100c4-30 22-38 36-38s32 8 36 38z" fill="#a9bddb"/></svg>';
function render(){var l=L(),t=T[l];S.hidden=!TM.length;if(!TM.length)return;
var bg=(CT.board_image&&CT.board_image.value)||(CT.hero_image&&CT.hero_image.value);
var cards=TM.map(function(m){var nm=(l==="bn"&&m.name_bn)||m.name||"",rl=(l==="bn"&&m.role_bn)||m.role||"";
var ph=m.photo?'<img src="'+esc(encodeURI(m.photo))+'" alt="'+esc(nm)+'" loading="lazy">':SIL;
return '<div class="bd2c"><div class="bd2p">'+ph+'</div><h4>'+esc(nm)+'</h4><i></i><p>'+esc(rl)+'</p></div>'}).join("");
S.innerHTML='<div class="bd2b"'+(bg?' style="background-image:url(\''+esc(encodeURI(bg))+'\')"':"")+'><div class="bd2t"><div class="bd2e">'+t.eb+'</div><h2>'+t.h+'</h2>'+(function(o){var v=o&&o.set?(L()==="bn"&&o.value_bn?o.value_bn:(o.value||"")):((L()==="bn"&&o&&o.value_bn?o.value_bn:(o&&o.value))||t.s);return v?'<p>'+esc(v)+'</p>':''})(CT.board_subtitle)+'</div></div><div class="bd2g">'+cards+'</div>'}
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
fetch(((window.SWP_API_BASE||"")+"/api/bootstrap")).then(function(r){return r.json()}).then(function(d){TM=(d.team||[]).filter(function(m){return !m.status||m.status==="active"});CT=d.content||{};render()}).catch(function(){});
})();
