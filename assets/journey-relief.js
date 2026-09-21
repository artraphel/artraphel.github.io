/* Additive enhancement: keep journey-map.js and all existing article data. */
(() => {
  'use strict';
  const scriptURL = document.currentScript && document.currentScript.src;
  const reliefURL = new URL('europe-relief-map.svg?v=20260920-relief1', scriptURL || new URL('/assets/journey-relief.js', location.href));
  function init() {
    const section = document.querySelector('[data-journey-map]');
    if (!section || section.dataset.reliefReady) return;
    section.dataset.reliefReady = 'true';
    const map = section.querySelector('.journey-map-stage__map');
    const stage = section.querySelector('.journey-map-stage');
    const journal = document.querySelector('.travel-journal');
    if (journal && journal.parentNode === section.parentNode) section.parentNode.insertBefore(section, journal);
    // Same drawing coordinates on every overlay, independent of viewport width.
    section.querySelectorAll('.journey-country-highlights, .journey-nautical-routes').forEach(svg => {
      svg.setAttribute('viewBox', '0 0 1000 620');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    });
    const points = { lisbon: [236.7,557.9], porto: [244.3,530], venice: [556.9,478.3] };
    function placeMarkers() {
      if (!stage) return;
      const width = stage.clientWidth, height = stage.clientHeight;
      if (!width || !height) return;
      const scale = Math.min(width / 1000, height / 620);
      const left = (width - 1000 * scale) / 2, top = (height - 620 * scale) / 2;
      section.querySelectorAll('.journey-marker').forEach(marker => {
        const point = points[marker.dataset.city];
        if (!point) return;
        marker.style.setProperty('--marker-x', `${(left + point[0]*scale)/width*100}%`);
        marker.style.setProperty('--marker-y', `${(top + point[1]*scale)/height*100}%`);
      });
    }
    placeMarkers();
    if (stage && 'ResizeObserver' in window) new ResizeObserver(placeMarkers).observe(stage);
    else window.addEventListener('resize', placeMarkers, {passive:true});
    // Swap only after successful loading; a missing upload leaves the old map usable.
    if (map) {
      const preload = new Image();
      preload.onload = () => {
        map.src = reliefURL.href;
        map.alt = '奶油米色歐洲淺浮雕海圖，標示里斯本、波多與威尼斯；地形為裝飾性示意';
        section.classList.add('has-relief');
      };
      preload.src = reliefURL.href;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
