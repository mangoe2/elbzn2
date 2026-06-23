(function(){
  var page=document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav]').forEach(function(a){if(a.dataset.nav===page)a.classList.add('active')});
  var toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',function(){var open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false')})}
  var topBtn=document.querySelector('.back-top');
  window.addEventListener('scroll',function(){if(topBtn)topBtn.style.display=window.scrollY>360?'block':'none'});
  if(topBtn)topBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
  var form=document.querySelector('#demandForm');
  if(form){form.addEventListener('submit',function(e){e.preventDefault();alert('需求已记录，请通过电话或微信进一步沟通');form.reset();})}
})();
