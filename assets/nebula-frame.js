/* Rafael nebula v2: diffuse clouds and drifting dust; no orbiting paths. */
(() => {
  'use strict';
  const script = document.currentScript;
  // Resolve relative to this file, including when the site is in a subdirectory.
  const assetURL = script?.dataset.nebulaImage
    ? new URL(script.dataset.nebulaImage, location.href)
    : new URL('images/rafael-nebula-ribbons.png', script?.src || location.href);
  const route = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const countryRoute = /\/(italy|portugal|spain|france|monaco)$/.test(route);

  function enhance(host) {
    if (host.querySelector(':scope > .rf-nebula-layer')) return;
    host.classList.add('rf-nebula-host');
    if (countryRoute) host.classList.add('rf-nebula-country');
    const layer = document.createElement('div');
    layer.className = 'rf-nebula-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--rf-nebula-image', `url("${assetURL.href}")`);
    for (const part of ['halo', 'cloud cloud--blue', 'cloud cloud--gold', 'cloud cloud--wine', 'mist mist--top', 'mist mist--bottom', 'mist mist--echo', 'mist mist--veil']) {
      const item = document.createElement('div');
      item.className = part.split(' ').map(name => `rf-nebula-${name}`).join(' ');
      layer.append(item);
    }
    // Deterministic positions: gold dust on the two edges and the four corners.
    for (let i = 0; i < 36; i++) {
      const dust = document.createElement('span');
      dust.className = 'rf-nebula-dust';
      const side = i % 4;
      const step = Math.floor(i / 4);
      const x = side < 2 ? 5 + step * 11 : side === 2 ? 3 + (step % 2) : 96 - (step % 2);
      const y = side === 0 ? 7 + (step % 3) * 3 : side === 1 ? 88 + (step % 3) * 2 : 10 + step * 9;
      dust.style.cssText = `--rf-dust-x:${x}%;--rf-dust-y:${y}%;--rf-dust-size:${i % 5 === 0 ? 2.6 : 1.4}px;--rf-dust-delay:${-i * 1.7}s;--rf-dust-duration:${10 + i % 9}s`;
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
