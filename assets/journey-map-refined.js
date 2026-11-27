/* Only map positioning; original journey-daylight.js is loaded unchanged. */
(()=>{'use strict';function init(){const root=document.querySelector('[data-journey-map]');if(!root||root.dataset.refinedReady)return;root.dataset.refinedReady='true';
const stage=root.querySelector('.journey-map-stage'),journal=document.querySelector('.travel-journal');if(journal&&journal.parentNode===root.parentNode)root.parentNode.insertBefore(root,journal);
root.querySelectorAll('.journey-country-highlights,.journey-nautical-routes').forEach(el=>el.setAttribute('viewBox','0 0 1000 750'));
function place(){root.querySelectorAll('.journey-marker').forEach(m=>{m.style.setProperty('--marker-x',Number(m.dataset.iconX)/10+'%');m.style.setProperty('--marker-y',Number(m.dataset.iconY)/7.5+'%')})}place();
if('ResizeObserver'in window)new ResizeObserver(place).observe(stage);
// Context illustrations join the original corrected map plane after daylight initialization.
queueMicrotask(()=>{const plane=stage.querySelector('.jm-atlas-plane');const art=stage.querySelector('.journey-map-illustrations');if(plane&&art)plane.append(art)});
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()})();