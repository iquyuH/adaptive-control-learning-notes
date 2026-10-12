'use strict';
(() => {
  const print = document.getElementById('print');
  print?.addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', () => document.querySelectorAll('details').forEach(d => { d.dataset.previousOpen = String(d.open); d.open = true; }));
  window.addEventListener('afterprint', () => document.querySelectorAll('details').forEach(d => { d.open = d.dataset.previousOpen === 'true'; }));
})();
