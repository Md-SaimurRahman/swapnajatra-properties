/* Phone layout switch: admin Settings -> "Phone view layout". flat = full width sections (default), boxed = previous card design. */
(function(){
var H=document.documentElement;
function flat(d){try{var v=(((d||{}).settings||{}).site||{}).phoneLayout;return v!=="boxed"}catch(e){return true}}
function apply(on){H.classList.toggle("swp-flat",!!on)}
try{apply(flat(JSON.parse(localStorage.getItem("swp-boot-v1")||"null")))}catch(e){apply(true)}
try{fetch((window.SWP_API_BASE||"")+"/api/bootstrap").then(function(r){return r.json()}).then(function(d){apply(flat(d))}).catch(function(){})}catch(e){}
})();
