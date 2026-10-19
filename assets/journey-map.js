/* Rafael · interactive postcards and coastal voyages. No dependencies. */
(() => {
  'use strict';
  function init() {
    const section = document.querySelector('[data-journey-map]');
    if (!section || section.dataset.postcardsReady) return;
    const markers = [...section.querySelectorAll('.journey-marker')];
    const template = section.querySelector('.journey-story-card');
    const stage = section.querySelector('.journey-map-stage');
    if (!markers.length || !template || !stage) return;
    section.dataset.postcardsReady = 'true';
    section.classList.add('has-postcards', 'is-in-view');
    const journal = document.querySelector('.travel-journal');
    if (journal && journal.parentNode === section.parentNode) section.parentNode.insertBefore(section, journal);
    const compact = matchMedia('(max-width: 820px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const selectors = [...section.querySelectorAll('[data-city-target]')];
    const nativeNames = {lisbon:'Lisboa', porto:'Porto', venice:'Venezia', eze:'Èze', granada:'Granada'};
    const cityPoints = {lisbon:[236.7,557.9], porto:[244.3,530], venice:[556.9,478.3]};
    // Approaches stay at sea; the fine dotted connector leads to the city itself.
    const routes = {
      lisbon:[[95,520],[135,535],[170,552],[203,560]],
      porto:[[110,480],[145,487],[180,503],[212,522]],
      venice:[[615,515],[604,510],[580,497],[566,490]],
      eze:[[391,565],[418,551],[452,539],[480,526]],
      granada:[[416,607],[384,611],[352,610],[325,601]]
    };
    const deck = document.createElement('div');
    deck.className = 'postcard-deck'; deck.setAttribute('role','region');
    deck.setAttribute('aria-label','歐洲城市旅行明信片'); deck.setAttribute('aria-roledescription','輪播');
    const windowEl = document.createElement('div'); windowEl.className = 'postcard-window';
    const track = document.createElement('div'); track.className = 'postcard-track'; windowEl.append(track);
    const cards = markers.map((marker,index) => {
      const card = template.cloneNode(true);
      card.classList.remove('is-changing'); card.classList.add('postcard'); card.dataset.postcardCity = marker.dataset.city;
      card.removeAttribute('aria-live'); card.setAttribute('aria-label',`${index+1} / ${markers.length} · ${marker.dataset.cityLabel}`);
      const image = card.querySelector('.journey-story-card__image');
      image.src = marker.dataset.image; image.alt = marker.dataset.imageAlt; image.loading = index===0 ? 'eager':'lazy';
      card.querySelector('.journey-story-card__location').textContent = `${marker.dataset.country} · ${marker.dataset.cityLabel}`;
      card.querySelector('.journey-story-card__kicker').textContent = marker.dataset.kicker;
      card.querySelector('.journey-story-card__title').textContent = marker.dataset.title;
      card.querySelector('.journey-story-card__summary').textContent = marker.dataset.summary;
      const link = card.querySelector('.journey-story-card__action');
      if (marker.dataset.status==='published') {
        link.href = marker.dataset.url; link.textContent = '閱讀這站的故事 →';
        link.removeAttribute('aria-disabled'); link.classList.remove('is-disabled');
        const photoLink=document.createElement('a'); photoLink.className='postcard-photo-link';
        photoLink.href=marker.dataset.url; photoLink.setAttribute('aria-label',`閱讀${marker.dataset.title}`);
        card.querySelector('.journey-story-card__media').append(photoLink);
      } else { link.removeAttribute('href'); link.textContent='文章準備中'; link.setAttribute('aria-disabled','true'); }
      const script = document.createElement('p'); script.className='postcard-city-script'; script.setAttribute('aria-hidden','true');
      script.textContent=nativeNames[marker.dataset.city] || marker.dataset.cityLabel;
      card.querySelector('.journey-story-card__body').prepend(script);
      const stamp=document.createElement('span'); stamp.className='postcard-stamp'; stamp.setAttribute('aria-hidden','true');
      for (const [tag,text] of [['small','RAFAEL'],['b',marker.dataset.cityLabel],['small','TRAVEL NOTES']]) {
        const el=document.createElement(tag); el.textContent=text; stamp.append(el);
      }
      card.querySelector('.journey-story-card__media').append(stamp); track.append(card); return card;
    });
    const controls=document.createElement('div'); controls.className='postcard-controls';
    const previous=document.createElement('button'); previous.type='button'; previous.textContent='←'; previous.setAttribute('aria-label','上一個城市');
    const next=document.createElement('button'); next.type='button'; next.textContent='→'; next.setAttribute('aria-label','下一個城市');
    const counter=document.createElement('span'); counter.className='postcard-counter';
    const hint=document.createElement('span'); hint.className='postcard-hint';
    controls.append(previous,counter,next);
    const status=document.createElement('span'); status.className='postcard-sr-only'; status.setAttribute('aria-live','polite'); status.setAttribute('aria-atomic','true');
    deck.append(windowEl,controls,hint,status); template.replaceWith(deck);
    const svg=section.querySelector('.journey-nautical-routes');
    function svgNode(tag,name) { const el=document.createElementNS('http://www.w3.org/2000/svg',tag); el.setAttribute('class',name); return el; }
    let trace,echo,approach,port;
    if (svg) {
      svg.replaceChildren(); echo=svgNode('path','voyage-echo'); trace=svgNode('path','voyage-trace'); trace.setAttribute('pathLength','1');
      approach=svgNode('path','voyage-approach'); port=svgNode('circle','voyage-port'); port.setAttribute('r','2.8'); svg.append(echo,trace,approach,port);
    }
    const ship=section.querySelector('.journey-voyage-ship');
    const anchor=document.createElement('span'); anchor.className='voyage-vessel-anchor'; anchor.setAttribute('aria-hidden','true');
    if (ship) { ship.before(anchor); anchor.append(ship); }
    const caption=document.createElement('span'); caption.className='voyage-caption'; caption.textContent='海上示意航線 · 探索城市筆記'; stage.append(caption);
    let active=-1, frame=0, route=routes.lisbon, progress=1, stageVisible=false;
    let scrollTimer=0,scrollTarget=null,unlockTimer=0;
    function pointAt(t) {
      const u=1-t;
      return [0,1].map(a => u*u*u*route[0][a]+3*u*u*t*route[1][a]+3*u*t*t*route[2][a]+t*t*t*route[3][a]);
    }
    function placeShip() {
      if (!ship) return;
      const w=stage.clientWidth,h=stage.clientHeight,s=Math.min(w/1000,h/620),[x,y]=pointAt(progress);
      anchor.style.transform=`translate(${(w-1000*s)/2+x*s}px, ${(h-620*s)/2+y*s}px)`;
    }
    function finishVoyage() {
      cancelAnimationFrame(frame); frame=0; progress=1; if(trace)trace.style.strokeDashoffset='0';
      section.classList.remove('voyage-sailing'); placeShip();
    }
    function voyage(index,animate) {
      cancelAnimationFrame(frame); frame=0;
      const marker=markers[index]; route=routes[marker.dataset.city] || routes.lisbon;
      if(svg) {
        const d=`M${route[0].join(',')} C${route.slice(1).map(p=>p.join(',')).join(' ')}`;
        trace.setAttribute('d',d); echo.setAttribute('d',d);
        const [x,y]=route[3]; port.setAttribute('cx',x); port.setAttribute('cy',y);
        const [mx,my]=marker.dataset.mapX && marker.dataset.mapY
          ? [Number(marker.dataset.mapX),Number(marker.dataset.mapY)] : (cityPoints[marker.dataset.city] || []);
        approach.setAttribute('d',Number.isFinite(mx)&&Number.isFinite(my)?`M${x},${y} L${mx},${my}`:''); trace.style.strokeDasharray='1';
      }
      if(!animate || reduced.matches || !stageVisible || document.hidden) { finishVoyage(); return; }
      progress=0; placeShip(); if(trace)trace.style.strokeDashoffset='1'; section.classList.add('voyage-sailing');
      let started;
      function tick(now) {
        if(started===undefined)started=now;
        const t=Math.min(1,(now-started)/1450); progress=t*t*(3-2*t);
        if(trace)trace.style.strokeDashoffset=String(1-progress); placeShip();
        if(t<1)frame=requestAnimationFrame(tick); else { frame=0; section.classList.remove('voyage-sailing'); }
      }
      frame=requestAnimationFrame(tick);
    }
    function cardLeft(index) { return cards[index].offsetLeft-cards[0].offsetLeft; }
    function moveTrack(index,animate) {
      if(!compact.matches)return;
      const left=cardLeft(index); if(Math.abs(track.scrollLeft-left)<2)return;
      scrollTarget=index; clearTimeout(unlockTimer);
      track.scrollTo({left,behavior:animate&&!reduced.matches?'smooth':'instant'});
      unlockTimer=setTimeout(()=>{scrollTarget=null;},1100);
    }
    function select(index,{animate=true,scroll=true,announce=true}={}) {
      index=(index+markers.length)%markers.length;
      if(index===active) { if(scroll)moveTrack(index,animate); return; }
      active=index; const marker=markers[index];
      cards[index].querySelector('.journey-story-card__image').loading='eager';
      markers.forEach((el,i)=>{el.classList.toggle('is-active',i===index);el.setAttribute('aria-pressed',String(i===index));});
      selectors.forEach(el=>{const on=el.dataset.cityTarget===marker.dataset.city;el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',String(on));});
      section.querySelectorAll('[data-country-highlight]').forEach(el=>el.classList.toggle('is-active',el.dataset.countryHighlight===marker.dataset.country.toLowerCase()));
      cards.forEach((card,i)=>{card.hidden=!compact.matches&&i!==index;card.classList.toggle('is-current',i===index);card.classList.remove('postcard-arriving');});
      if(animate&&!reduced.matches&&!compact.matches) { void cards[index].offsetWidth; cards[index].classList.add('postcard-arriving'); }
      counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(markers.length).padStart(2,'0')}`;
      if(announce)status.textContent=`已選擇 ${marker.dataset.cityLabel}：${marker.dataset.title}`;
      if(scroll)moveTrack(index,animate); voyage(index,animate);
    }
    markers.forEach((marker,i)=>{marker.addEventListener('click',()=>select(i));marker.addEventListener('focus',()=>select(i));});
    selectors.forEach(el=>el.addEventListener('click',()=>{const i=markers.findIndex(m=>m.dataset.city===el.dataset.cityTarget);if(i>=0)select(i);}));
    previous.addEventListener('click',()=>select(active-1)); next.addEventListener('click',()=>select(active+1));
    deck.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(active+(event.key==='ArrowRight'?1:-1));}});
    function nearestCard() {
      const middle=track.scrollLeft+track.clientWidth/2; let best=0,distance=Infinity;
      cards.forEach((card,i)=>{const d=Math.abs(cardLeft(i)+card.offsetWidth/2-middle);if(d<distance){best=i;distance=d;}}); return best;
    }
    function settleScroll() {
      clearTimeout(scrollTimer); if(!compact.matches)return;
      const i=nearestCard(); if(scrollTarget!==null&&i!==scrollTarget)return;
      scrollTarget=null;clearTimeout(unlockTimer);select(i,{scroll:false});
    }
    track.addEventListener('scroll',()=>{if(!compact.matches)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(settleScroll,150);},{passive:true});
    track.addEventListener('scrollend',settleScroll);
    track.addEventListener('pointerdown',()=>{scrollTarget=null;clearTimeout(unlockTimer);},{passive:true});
    function updateLayout() {
      clearTimeout(scrollTimer);clearTimeout(unlockTimer);scrollTarget=null;
      cards.forEach((card,i)=>{card.hidden=!compact.matches&&i!==active;});
      hint.textContent=compact.matches?'左右滑動明信片，探索下一站':'點選地圖城市，或翻閱下一張明信片';
      if(compact.matches)moveTrack(Math.max(0,active),false);else track.scrollLeft=0;placeShip();
    }
    compact.addEventListener('change',updateLayout);
    reduced.addEventListener('change',()=>{if(reduced.matches)finishVoyage();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)finishVoyage();});
    if('ResizeObserver' in window)new ResizeObserver(()=>{placeShip();if(compact.matches&&active>=0&&scrollTarget===null)moveTrack(active,false);}).observe(stage);
    else window.addEventListener('resize',updateLayout,{passive:true});
    select(Math.max(0,markers.findIndex(m=>m.dataset.city==='lisbon')),{animate:false,announce:false});updateLayout();
    if('IntersectionObserver' in window) {
      let entered=false;
      new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;if(stageVisible&&!entered){entered=true;voyage(active,true);}else if(!stageVisible)finishVoyage();},{threshold:.08}).observe(stage);
    } else stageVisible=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
