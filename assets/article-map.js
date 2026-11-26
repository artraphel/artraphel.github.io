/* Rafael · fluid map invitation on the original article cover · v2 */
(() => {
  'use strict';
  const script=document.currentScript;
  const assetURL=new URL('images/rafael-nebula-ribbons.png',script?.src||location.href);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const controllers=[];
  let texturePromise;
  function loadTexture() {
    if (!texturePromise) texturePromise=new Promise(resolve=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>resolve(null);
      image.src=assetURL.href;
    });
    return texturePromise;
  }
  function createFlow(photo,image) {
    const aura=photo.querySelector('.rf-map-aura');
    if (!aura) return null;
    const canvas=document.createElement('canvas');
    canvas.className='rf-map-flow';
    canvas.setAttribute('aria-hidden','true');
    const ctx=canvas.getContext('2d',{alpha:true});
    if (!ctx) return null;
    // Cache the texture at a modest size; no map SDK or GPU context is required.
    const sharp=document.createElement('canvas');
    sharp.width=768;sharp.height=384;
    const sharpContext=sharp.getContext('2d');
    if (!sharpContext) return null;
    sharpContext.drawImage(image,0,0,sharp.width,sharp.height);
    const soft=document.createElement('canvas');
    soft.width=768;soft.height=384;
    const softContext=soft.getContext('2d');
    if (!softContext) return null;
    softContext.filter='blur(4px)';
    softContext.drawImage(sharp,0,0);
    let resize=true,frame=0,previous=0,lastPaint=0,elapsed=0,playing=false;
    // Each narrow slice bends and stretches independently; a second, softer
    // current travels at another speed/direction, so the complete PNG never pans.
    function drawCurrent(texture,time,phase,opacity) {
      const w=canvas.width,h=canvas.height;
      const count=Math.min(96,Math.max(48,Math.ceil(w/6)));
      const source=texture.width;
      const sampleX=u=>Math.max(0,Math.min(1,u+.014*Math.sin(u*10+time*.27+phase)*Math.sin(Math.PI*u)))*source;
      ctx.globalAlpha=opacity;
      for(let i=0;i<count;i++) {
        const u=i/count,v=(i+1)/count,m=(u+v)*.5;
        const x=u*w,next=v*w;
        const a=sampleX(u),b=sampleX(v);
        const bend=(.034*Math.sin(m*9-time*.43+phase)
                   +.016*Math.sin(m*22+time*.31+phase))*h;
        const stretch=1+.045*Math.sin(m*12+time*.24+phase);
        const height=h*stretch;
        ctx.drawImage(texture,a,0,Math.max(.1,b-a),texture.height,
          x,bend+(h-height)*.5,next-x+.5,height);
      }
    }
    function draw() {
      if (resize) {
        const rect=aura.getBoundingClientRect();
        const ratio=Math.min(devicePixelRatio||1,1.25,520/Math.max(rect.width,1),720/Math.max(rect.height,1));
        canvas.width=Math.max(1,Math.round(rect.width*ratio));
        canvas.height=Math.max(1,Math.round(rect.height*ratio));
        resize=false;
      }
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawCurrent(soft,elapsed*.83+8.7,2.4,.36);
      drawCurrent(sharp,elapsed+5.2,0,.68);
      ctx.globalAlpha=1;
    }
    function tick(now) {
      frame=0;
      if(!playing||document.hidden||reduced.matches) { previous=0; return; }
      if(now-lastPaint>=1000/24) {
        if(previous) elapsed+=Math.min((now-previous)/1000,.12);
        previous=now;lastPaint=now;draw();
      }
      frame=requestAnimationFrame(tick);
    }
    const control={
      start() {
        if(playing) return;
        playing=true;previous=0;lastPaint=0;draw();
        if(!frame) frame=requestAnimationFrame(tick);
      },
      stop() { playing=false;previous=0;cancelAnimationFrame(frame);frame=0; }
    };
    aura.append(canvas);
    draw();photo.classList.add('rf-map-flow-ready');
    if('ResizeObserver' in window) new ResizeObserver(()=>{resize=true;if(playing)draw();}).observe(aura);
    else window.addEventListener('resize',()=>{resize=true;},{passive:true});
    return control;
  }
  function init() {
    for(const photo of document.querySelectorAll('.rf-map-photo')) {
      const link=photo.querySelector('.rf-map-link');
      if(link && !link.querySelector('.rf-map-unified-copy')) {
        const label=photo.querySelector('.rf-map-note strong')?.textContent?.trim() || '查看地點';
        const copy=document.createElement('span');copy.className='rf-map-unified-copy';
        const script=document.createElement('span');script.className='rf-map-script';script.textContent='Google Maps';
        const destination=document.createElement('span');destination.className='rf-map-destination';destination.textContent=label;
        copy.append(script,destination);
        const arrow=link.querySelector('.rf-map-arrow');
        if(arrow) link.replaceChildren(copy,arrow); else link.replaceChildren(copy);
        link.title=label+' · Google Maps';
      }
      let active=false,flow=null,pending=false;
      const stop=()=>{active=false;photo.classList.remove('rf-map-live');flow?.stop();};
      const play=async()=>{
        if(document.hidden||reduced.matches||!fine.matches) return;
        active=true;photo.classList.add('rf-map-live');
        if(flow) { flow.start(); return; }
        if(pending) return;
        pending=true;
        const image=await loadTexture();
        pending=false;
        if(!image||!active||reduced.matches||document.hidden) return;
        try { flow=createFlow(photo,image);flow?.start(); }
        catch(_) { /* The independent CSS mist remains as a fallback. */ }
      };
      photo.addEventListener('pointerenter',play);
      photo.addEventListener('pointerleave',stop);
      photo.addEventListener('focusin',play);
      photo.addEventListener('focusout',event=>{if(!photo.contains(event.relatedTarget))stop();});
      if('IntersectionObserver' in window) new IntersectionObserver(entries=>{
        if(!entries[0].isIntersecting)stop();
      }).observe(photo);
      controllers.push(stop);
    }
    const stopAll=()=>controllers.forEach(stop=>stop());
    reduced.addEventListener('change',stopAll);
    fine.addEventListener('change',stopAll);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
    window.addEventListener('pagehide',stopAll);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
