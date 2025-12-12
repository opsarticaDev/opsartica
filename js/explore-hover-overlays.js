// explore-hover-overlays.v2.js
(function(){
  function normalizeTag(raw){
    return (raw || '')
      .replace(/<br\s*\/?>|<\/?p>/gi, '\n')
      .replace(/\\n/g, '\n')
      .trim();
  }

  function addOverlayTo(tile){
    // Limit to Explore section, if present
    const inExplore = !!tile.closest('#explore');
    if (!inExplore) return;

    // Find the front face
    const front = tile.querySelector('.face.front');
    if (!front) {
      console.warn('[overlay] Missing .face.front for tile:', tile);
      return;
    }

    // Get tagline text
    const raw = tile.dataset.tagline || tile.getAttribute('aria-label') || tile.getAttribute('title') || '';
    const tag = normalizeTag(raw);
    if (!tag) return;

    // Remove any existing overlay to avoid duplicates
    front.querySelectorAll('.hover-overlay').forEach(n => n.remove());

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'hover-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.textContent = tag;

    // Safety: ensure it will sit above images even if CSS is missing z-index
    overlay.style.zIndex = '2';

    front.appendChild(overlay);
  }

  function init(){
    document.querySelectorAll('#explore .hex-tile').forEach(addOverlayTo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();