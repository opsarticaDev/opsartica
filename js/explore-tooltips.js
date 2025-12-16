/* =============================
   OpsArtica — Explore Tooltips
   ============================= */
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.createElement("div");
  tooltip.className = "oa-tooltip";
  document.body.appendChild(tooltip);

  function place(a, side){
    const text = a.dataset.tagline || a.getAttribute('title') || '';
    if (!text) return;
    tooltip.textContent = text;
    tooltip.className = `oa-tooltip ${side} show`;

    // off-screen first to measure
    tooltip.style.left = "-9999px"; tooltip.style.top = "-9999px";
    const r = a.getBoundingClientRect();
    const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
    const gap = 12;
    let left = (side === 'left') ? (r.left - w - gap) : (r.right + gap);
    let top  = r.top + r.height/2 - h/2;

    const pad = 8;
    top  = Math.max(pad, Math.min(window.innerHeight - h - pad, top));
    left = Math.max(pad, Math.min(window.innerWidth  - w - pad, left));
    tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
  }
  function hide(){ tooltip.classList.remove('show'); }

  document.querySelectorAll('#explore .hex-tile .links a').forEach(a => {
    const tile = a.closest('.hex-tile');
    const side = tile && tile.classList.contains('consult') ? 'left' : 'right';
    a.addEventListener('mouseenter', () => place(a, side));
    a.addEventListener('focus',      () => place(a, side));
    a.addEventListener('mouseleave', hide);
    a.addEventListener('blur',       hide);
    a.addEventListener('touchstart', () => place(a, side), {passive:true});
  });
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('#explore .hex-tile .links a')) hide();
  }, {passive:true});
});