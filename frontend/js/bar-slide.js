/* plays each slide-in only once per page open (language/theme switches do not replay them) */
document.addEventListener('animationend',function(e){
  if(e.animationName==='swpBarIn')document.documentElement.setAttribute('data-bar-done','1');
  if(e.animationName==='swpChIn')document.documentElement.setAttribute('data-ch-done','1');
},true);
