// OpsArtica — flip cards + keyboard support
(function(){
  const tiles = document.querySelectorAll('.hex-tile');
  const flipOf = t => t.querySelector('.flip-inner');
  const flip = (t, force) => {
    const inner = flipOf(t); if (!inner) return;
    const should = (typeof force === 'boolean') ? force : !inner.classList.contains('is-flipped');
    inner.classList.toggle('is-flipped', should);
  };

  tiles.forEach(tile => {
    tile.addEventListener('click', e => { if (e.target.closest('a')) return; flip(tile); });
    tile.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(tile); }
      if (e.key === 'Escape') { flip(tile, false); tile.blur(); }
    });
  });

  // Click outside to close
  document.addEventListener('click', e => {
    tiles.forEach(t => { if (!t.contains(e.target)) { const i=flipOf(t); if (i) i.classList.remove('is-flipped'); } });
  });
})();