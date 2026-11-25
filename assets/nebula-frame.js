/* Progressive enhancement; no dependencies and no changes to page content. */
(() => {
  'use strict';
  const script = document.currentScript;
  // Resolve relative to this file, including when the site is in a subdirectory.
  const assetURL = script?.dataset.nebulaImage
    ? new URL(script.dataset.nebulaImage, location.href)
    : new URL('images/rafael-nebula-ribbons.png', script?.src || location.href);
  const svgNS = 'http://www.w3.org/2000/svg';
  const route = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const countryRoute = /\/(italy|portugal|spain|france|monaco)$/.test(route);
  let sequence = 0;

  function svgElement(name, attributes) {
    const element = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes || {})) element.setAttribute(key, value);
    return element;
  }

  function makeFilaments() {
    const id = `rf-nebula-${++sequence}`;
    const svg = svgElement('svg', {
      class: 'rf-nebula-filaments', viewBox: '0 0 1000 400',
      preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false'
    });
    const defs = svgElement('defs');
    const gradient = svgElement('linearGradient', { id, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%','#9aaebe'],['34%','#d1b783'],['66%','#a67b86'],['100%','#d7c498']].forEach(([offset,color]) => {
      gradient.append(svgElement('stop', { offset, 'stop-color': color }));
    });
    defs.append(gradient);
    svg.append(defs);
    const paths = [
      'M30 78 C118 5 226 50 362 31 S637 56 783 32 S966 14 977 92 C989 159 965 233 978 303 C989 379 839 352 706 372 S435 352 283 372 S23 397 22 315 C8 237 40 160 30 78 Z',
      'M19 109 C6 33 168 25 283 47 S564 14 736 45 S974 23 980 116 C987 202 969 259 972 307 C971 387 814 369 651 354 S378 391 223 354 S24 372 20 289 C9 215 36 171 19 109 Z',
      'M42 61 C168 57 201 13 370 43 S642 20 788 49 S948 19 957 102 C966 195 947 262 960 323 C974 375 798 338 655 369 S358 336 202 366 S53 363 42 294 C29 205 57 125 42 61 Z'
    ];
    svg.append(svgElement('path', { d: paths[0], stroke: `url(#${id})`, class: 'rf-nebula-thread' }));
    paths.forEach((d, i) => {
      svg.append(svgElement('path', {
        d, pathLength: '1000', stroke: i === 0 ? `url(#${id})` : i === 1 ? '#8ba1b5' : '#aa7d88',
        class: `rf-nebula-current${i === 1 ? ' rf-nebula-current--blue' : i === 2 ? ' rf-nebula-current--wine' : ''}`
      }));
    });
    return svg;
  }

  function enhance(host) {
    if (host.querySelector(':scope > .rf-nebula-layer')) return;
    host.classList.add('rf-nebula-host');
    if (countryRoute) host.classList.add('rf-nebula-country');
    const layer = document.createElement('div');
    layer.className = 'rf-nebula-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--rf-nebula-image', `url("${assetURL.href}")`);
    for (const part of ['halo', 'mist mist--top', 'mist mist--bottom', 'mist mist--echo']) {
      const item = document.createElement('div');
      item.className = part.split(' ').map(name => `rf-nebula-${name}`).join(' ');
      layer.append(item);
    }
    layer.append(makeFilaments());
    // Deterministic positions: gold dust on the two edges and the four corners.
    for (let i = 0; i < 20; i++) {
      const dust = document.createElement('span');
      dust.className = 'rf-nebula-dust';
      const side = i % 4;
      const step = Math.floor(i / 4);
      const x = side < 2 ? 7 + step * 21 : side === 2 ? 3 + (step % 2) : 96 - (step % 2);
      const y = side === 0 ? 7 + (step % 3) * 3 : side === 1 ? 88 + (step % 3) * 2 : 16 + step * 16;
      dust.style.cssText = `--rf-dust-x:${x}%;--rf-dust-y:${y}%;--rf-dust-size:${i % 5 === 0 ? 2.6 : 1.4}px;--rf-dust-delay:${-i * 1.7}s;--rf-dust-duration:${18 + i % 7}s`;
      layer.append(dust);
    }
    host.prepend(layer);
    return host;
  }

  function init() {
    const selector = countryRoute ? '.spain-head, .portugal-head, .france-head' : '.literary-signature';
    const hosts = [...document.querySelectorAll(selector)].map(enhance).filter(Boolean);
    if (!hosts.length) return;
    const visible = new Set();
    const update = () => hosts.forEach(host => host.classList.toggle('rf-nebula-active', visible.has(host) && !document.hidden));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
        update();
      }, { rootMargin: '40px', threshold: 0 });
      hosts.forEach(host => observer.observe(host));
    } else {
      hosts.forEach(host => visible.add(host));
      update();
    }
    document.addEventListener('visibilitychange', update);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
