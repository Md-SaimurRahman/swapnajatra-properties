/* plays the slide-in only once per page open (language/theme switches do not replay it) */
document.addEventListener('animationend',function(e){if(e.animationName==='swpBarIn')document.documentElement.setAttribute('data-bar-done','1')},true);
