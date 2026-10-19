/* Rafael · gilded travel journal. Additive homepage decoration, no dependencies. */
(() => {
  'use strict';
  function init() {
    const sections = [...document.querySelectorAll('main > .europe-journey, main > .travel-journal')];
    if (!sections.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let serial = 0;
    function ornament(kind) {
      const id = `rafael-gilt-${++serial}`;
      const el = document.createElement('span');
      el.className = `journal-gilt journal-gilt--${kind}`;
      el.setAttribute('aria-hidden', 'true');
      // Acanthus scrolls and small palmettes, drawn in the site's own gold palette.
      el.innerHTML = `<svg viewBox="0 0 100 350" focusable="false" aria-hidden="true">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".8">
          <stop stop-color="#936747"/><stop offset=".26" stop-color="#c8a779"/>
          <stop offset=".47" stop-color="#f1dfb5"/><stop offset=".65" stop-color="#b78270"/>
          <stop offset=".84" stop-color="#d4b77d"/><stop offset="1" stop-color="#997454"/>
        </linearGradient></defs>
        <g fill="none" stroke="url(#${id})" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round">
          <path d="M50 8C36 33 59 55 48 83S27 127 46 151C60 166 61 184 46 199C27 223 36 239 48 267S36 317 50 342"/>
          <path d="M50 26C17 28 5 49 17 65C27 79 44 70 38 59C34 51 24 54 27 61M48 82C78 66 96 92 81 112C70 127 53 118 58 107C62 98 73 102 68 109"/>
          <path d="M42 116C12 105 2 137 21 148C36 157 45 143 35 139M50 150C77 131 95 150 84 166C75 179 61 170 66 163"/>
          <path d="M50 324C17 322 5 301 17 285C27 271 44 280 38 291C34 299 24 296 27 289M48 268C78 284 96 258 81 238C70 223 53 232 58 243C62 252 73 248 68 241"/>
          <path d="M42 234C12 245 2 213 21 202C36 193 45 207 35 211M50 200C77 219 95 200 84 184C75 171 61 180 66 187"/>
          <path d="M49 83C40 59 60 43 68 41C65 62 60 73 49 83ZM47 93C23 93 19 80 18 75C35 75 43 83 47 93Z" fill="url(#${id})" fill-opacity=".26"/>
          <path d="M43 133C53 124 55 112 51 103C40 111 37 125 43 133ZM48 149C28 146 24 157 24 165C38 164 45 157 48 149Z" fill="url(#${id})" fill-opacity=".3"/>
          <path d="M49 267C40 291 60 307 68 309C65 288 60 277 49 267ZM47 257C23 257 19 270 18 275C35 275 43 267 47 257Z" fill="url(#${id})" fill-opacity=".26"/>
          <path d="M43 217C53 226 55 238 51 247C40 239 37 225 43 217ZM48 201C28 204 24 193 24 185C38 186 45 193 48 201Z" fill="url(#${id})" fill-opacity=".3"/>
          <path d="M49 160C45 165 43 169 43 175C43 181 45 185 49 190C53 185 55 181 55 175C55 169 53 165 49 160Z"/>
          <path d="M43 175H27M55 175H73M50 8V1M50 342V349"/>
          <circle cx="22" cy="175" r="2"/><circle cx="78" cy="175" r="2"/>
          <path d="M50 16L46 22L50 28L54 22ZM50 322L46 328L50 334L54 328Z" fill="url(#${id})"/>
          <path d="M58 32C78 34 86 46 80 59M58 318C78 316 86 304 80 291" stroke-width=".55"/>
        </g></svg>`;
      return el;
    }
    sections.forEach(section => {
      if (section.dataset.giltReady) return;
      section.dataset.giltReady = 'true';
      section.classList.add('journal-embellished');
      section.append(ornament('left'), ornament('right'));
    });
    const canvas = document.querySelector('.europe-journey__canvas');
    if (canvas && !canvas.querySelector('.chart-corner')) {
      ['tl', 'tr', 'bl', 'br'].forEach(corner => {
        const el = document.createElement('span');
        el.className = `chart-corner chart-corner--${corner}`;
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = `<svg viewBox="0 0 110 110" focusable="false" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 100V22Q7 7 22 7H100" stroke-width=".65"/><path d="M17 89V31Q17 17 31 17H89" stroke-width=".45" opacity=".6"/><path d="M14 63C39 53 48 35 39 26C31 18 21 26 26 33C29 37 35 33 32 30M63 14C53 39 35 48 26 39C18 31 26 21 33 26"/><path d="M16 58C15 38 37 37 42 42C37 48 27 53 16 58ZM58 16C38 15 37 37 42 42C48 37 53 27 58 16Z" fill="currentColor" fill-opacity=".14"/><path d="M24 76C46 65 60 47 55 36M76 24C65 46 47 60 36 55" stroke-width=".6"/><path d="M10 10L14 22L22 14ZM45 68C58 54 68 45 77 43M68 45C79 48 84 43 86 37C78 36 72 39 68 45Z"/><circle cx="7" cy="100" r="1.4"/><circle cx="100" cy="7" r="1.4"/></g></svg>`;
        canvas.append(el);
      });
    }
    const shipSVG = document.querySelector('.journey-voyage-ship svg');
    if (shipSVG && !shipSVG.querySelector('.ship-vessel')) {
      const ns = 'http://www.w3.org/2000/svg';
      const vessel = document.createElementNS(ns, 'g');
      vessel.setAttribute('class', 'ship-vessel');
      [...shipSVG.children].filter(node => !node.classList.contains('ship-wave')).forEach(node => vessel.append(node));
      shipSVG.append(vessel);
      [148, 156].forEach((y, i) => {
        const wave = document.createElementNS(ns, 'path');
        wave.setAttribute('class', `ship-wave ship-wave--echo ship-wave--${i}`);
        wave.setAttribute('d', `M${24+i*13} ${y}q18 -5 36 0t36 0t36 0t36 0t36 0`);
        shipSVG.append(wave);
      });
      document.querySelector('.journey-voyage-ship').classList.add('has-tides');
    }
    // Observe the ornaments themselves: a tall article section need not be 20% visible.
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('gilt-visible', entry.isIntersecting));
    }, {threshold: .08, rootMargin: '0px 0px -18px 0px'}) : null;
    document.querySelectorAll('.journal-gilt').forEach(el => {
      if (observer) observer.observe(el);
      else el.classList.add('gilt-visible');
    });
    const stage = document.querySelector('.journey-map-stage');
    if (stage) {
      const motionObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
        stage.classList.toggle('tides-visible', entries[0].isIntersecting && !document.hidden);
      }) : null;
      if (motionObserver) motionObserver.observe(stage);
      else stage.classList.add('tides-visible');
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stage.classList.remove('tides-visible');
        else { const r = stage.getBoundingClientRect(); stage.classList.toggle('tides-visible', r.bottom > 0 && r.top < innerHeight); }
      });
    }
    // A single soft gold highlight when each decorated section first appears.
    const shineObserver = !reduced.matches && 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('gilt-arrived'); shineObserver.unobserve(entry.target); } });
    }, {threshold: .08}) : null;
    if (shineObserver) sections.forEach(section => shineObserver.observe(section));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
