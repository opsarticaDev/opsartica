
// Auto-enhance CTAs: turn common call-to-action links into styled buttons
(function() {
  const CTA_WORDS = /\b(get started|contact|buy|download|sign up|sign in|learn more|request (a )?demo|schedule|book|start trial|join now)\b/i;
  const links = Array.from(document.querySelectorAll('a:not(.btn):not(.button):not(.cta)'));
  links.forEach(a => {
    const isCTA = a.getAttribute('rel')?.split(/\s+/).includes('button')
               || a.dataset.button !== undefined
               || CTA_WORDS.test(a.textContent || '');
    if (isCTA) {
      a.classList.add('btn','cta');
    }
  });
})();
