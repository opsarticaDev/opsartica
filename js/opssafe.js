// Smooth scrolling for in-page links
document.addEventListener('click', function(e){
  const link = e.target.closest('a[href^="#"]');
  if(!link) return;
  const id = link.getAttribute('href');
  if(id.length > 1){
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
    const nav = document.getElementById('site-nav');
    if(nav?.classList.contains('open')){
      nav.classList.remove('open');
      const btn = document.querySelector('.nav-toggle');
      if(btn) btn.setAttribute('aria-expanded','false');
    }
  }
});

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if(toggle && nav){
  toggle.addEventListener('click', ()=>{
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}