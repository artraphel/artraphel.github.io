/* Device-local clock, not geolocation or an astronomical sunrise forecast. */
(()=>{'use strict';function init(){
const root=document.querySelector('[data-journey-map]'),stage=root?.querySelector('.journey-map-stage'),heading=root?.querySelector('.europe-journey__heading');
if(!root||!stage||!heading||root.dataset.daylightReady)return;root.dataset.daylightReady='true';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');let mode='auto',current='',riseTimer,sceneAnimations=[];
const skies=['morning','day','evening','night'];const labels={morning:'晨光',day:'日光',evening:'暮色',night:'月夜'};
const controls=document.createElement('div');controls.className='jm-light-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','航海地圖光景');
const kicker=document.createElement('span');kicker.className='jm-light-kicker';kicker.lang='en';kicker.textContent='The changing light of Europe';controls.append(kicker);
for(const [key,label]of [['auto','隨此刻'],...skies.map(k=>[k,labels[k]])]){const b=document.createElement('button');b.type='button';b.dataset.light=key;const en=document.createElement('span');en.className='jm-light-en';en.lang='en';en.textContent={auto:'This Moment',morning:'Morning Mist',day:'Golden Noon',evening:'Golden Hour',night:'Moonlit Night'}[key];const zh=document.createElement('span');zh.className='jm-light-zh';zh.textContent=label;b.append(en,zh);b.setAttribute('aria-pressed',String(key==='auto'));b.addEventListener('click',()=>{mode=key;paint(true,true);});controls.append(b);}
const status=document.createElement('p');status.className='jm-light-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');controls.append(status);heading.append(controls);
const sky=document.createElement('div');sky.className='jm-sky';sky.setAttribute('aria-hidden','true');sky.innerHTML='<div class="jm-fog"><span></span><span></span><span></span></div><div class="jm-sunset-glow"></div><div class="jm-gulls"></div><div class="jm-stars"></div><div class="jm-celestial"><svg class="jm-sun" viewBox="0 0 60 60"><circle class="jm-solar-core" cx="30" cy="30" r="12"/><g class="jm-solar-flames"></g><g class="jm-sun-engraving"><circle cx="30" cy="30" r="17" stroke-dasharray="1 4"/><path d="M30 2v8m0 40v8M2 30h8m40 0h8M10 10l6 6m28 28 6 6M10 50l6-6m28-28 6-6"/></g></svg><svg class="jm-moon" viewBox="0 0 60 60"><path d="M41 8a22 22 0 1 0 11 35A23 23 0 0 1 41 8Z" fill="currentColor" fill-opacity=".15"/><path d="m14 8 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></svg></div>';

const svgNS='http://www.w3.org/2000/svg';
for(let n=0;n<12;n++){const flame=document.createElementNS(svgNS,'path');flame.setAttribute('d','M30 14C24 11 26 5 30 1C29 7 37 9 30 14Z');flame.setAttribute('transform',`rotate(${n*30} 30 30)`);sky.querySelector('.jm-solar-flames').append(flame);}
for(let n=0;n<3;n++){
 const bird=document.createElementNS(svgNS,'svg');bird.setAttribute('viewBox','0 0 72 32');
 bird.innerHTML='<g class="jm-gull-silhouette"><path d="M35 19C26 7 15 8 2 13C16 3 29 3 36 14C43 5 57 2 70 9C56 6 45 10 38 20L42 23L36 22L32 24Z" fill="currentColor" stroke="none"/><path d="M34 18Q37 15 40 17L44 18L40 19L37 22Z" fill="currentColor" stroke="none"/></g>';
 sky.querySelector('.jm-gulls').append(bird);
}
const landscape=document.createElement('div');landscape.className='jm-landscapes';
landscape.innerHTML=`
<svg class="jm-dawn-scene" viewBox="0 0 400 230" focusable="false">
 <defs>
  <radialGradient id="jm-dawn-halo"><stop stop-color="#efcd82" stop-opacity=".68"/><stop offset="1" stop-color="#f4dfac" stop-opacity="0"/></radialGradient>
  <radialGradient id="jm-dawn-disc" cx="38%" cy="30%" r="75%"><stop stop-color="#fff3c8"/><stop offset=".6" stop-color="#e9c17b"/><stop offset="1" stop-color="#c89b55"/></radialGradient>
  <linearGradient id="jm-mountain" x2="0" y2="1"><stop stop-color="#c5b28e"/><stop offset="1" stop-color="#eee5d2"/></linearGradient>
  <linearGradient id="jm-forest" x2="0" y2="1"><stop stop-color="#a7aa8f"/><stop offset="1" stop-color="#d9d3b8"/></linearGradient>
  <linearGradient id="jm-land-fade" x2="0" y2="1"><stop offset=".58" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
  <mask id="jm-land-mask"><rect width="400" height="230" fill="url(#jm-land-fade)"/></mask>
  <linearGradient id="jm-mist-white"><stop stop-color="#fffcf2" stop-opacity="0"/><stop offset=".38" stop-color="#fffcf2" stop-opacity=".95"/><stop offset=".65" stop-color="#fffcf2" stop-opacity=".8"/><stop offset="1" stop-color="#fffcf2" stop-opacity="0"/></linearGradient>
 </defs>
 <g mask="url(#jm-land-mask)">
  <g class="jm-dawn-sun"><circle cx="255" cy="89" r="85" fill="url(#jm-dawn-halo)"/><circle cx="255" cy="89" r="28" fill="url(#jm-dawn-disc)"/><path d="M239 72Q251 63 266 72Q250 66 239 72" fill="#fff8dc" opacity=".7"/></g>
  <path d="M0 178L48 145L83 158L129 118L172 143L215 102L265 143L300 121L345 151L400 137V230H0Z" fill="#d8ccb3"/>
  <path d="M0 188L55 168L102 137L146 164L213 124L255 157L309 139L359 172L400 158V230H0Z" fill="url(#jm-mountain)"/>
  <path d="M167 153L213 124L235 143L212 132L202 143L196 141Z" fill="#f4ead5" opacity=".8"/>
  <path d="M0 204Q95 173 164 187T295 177T400 187V230H0Z" fill="#b7b99d"/>
  <g class="jm-pines" fill="url(#jm-forest)"></g>
  <g class="jm-valley-mist jm-valley-mist--left" fill="url(#jm-mist-white)"><ellipse cx="178" cy="154" rx="190" ry="19"/><ellipse cx="225" cy="187" rx="200" ry="17"/></g>
  <g class="jm-valley-mist jm-valley-mist--right" fill="url(#jm-mist-white)"><ellipse cx="250" cy="164" rx="192" ry="23"/><ellipse cx="160" cy="201" rx="200" ry="16"/></g>
 </g>
</svg>
<svg class="jm-dusk-scene" viewBox="0 0 400 230" focusable="false">
 <defs>
  <radialGradient id="jm-dusk-halo"><stop stop-color="#eab469" stop-opacity=".8"/><stop offset=".5" stop-color="#e6a170" stop-opacity=".35"/><stop offset="1" stop-color="#da9d7d" stop-opacity="0"/></radialGradient>
  <linearGradient id="jm-dusk-disc" x2="0" y2="1"><stop stop-color="#f8dda0"/><stop offset=".55" stop-color="#e8ac69"/><stop offset="1" stop-color="#cc8059"/></linearGradient>
  <linearGradient id="jm-sea-colour" x2="0" y2="1"><stop stop-color="#bbafa0"/><stop offset="1" stop-color="#e7ded0" stop-opacity="0"/></linearGradient>
  <linearGradient id="jm-sea-mask" x2="1" y2="0"><stop stop-color="black"/><stop offset=".15" stop-color="white"/><stop offset=".85" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
  <mask id="jm-sea-edge"><rect width="400" height="230" fill="url(#jm-sea-mask)"/></mask>
  <clipPath id="jm-above-horizon"><rect width="400" height="149"/></clipPath>
 </defs>
 <circle class="jm-dusk-aureole" cx="252" cy="130" r="115" fill="url(#jm-dusk-halo)"/>
 <g clip-path="url(#jm-above-horizon)"><g class="jm-dusk-sun"><circle cx="252" cy="96" r="33" fill="url(#jm-dusk-disc)"/><path d="M234 75Q249 67 265 76Q249 70 234 75" fill="#fff0c3" opacity=".55"/></g></g>
 <g mask="url(#jm-sea-edge)">
  <path d="M0 149Q100 147 200 149T400 149V230H0Z" fill="url(#jm-sea-colour)"/>
  <path d="M13 149Q105 148 199 149T387 149" fill="none" stroke="#aa9479" stroke-width=".8" opacity=".5"/>
  <g class="jm-sea-reflection" fill="#f8d99a"><path d="M237 153Q253 151 270 154L265 157Q251 156 239 158Z"/><path d="M229 162Q251 159 277 163L269 166L237 165Z" opacity=".8"/><path d="M221 173Q252 168 284 174L276 177Q254 174 231 178Z" opacity=".6"/><path d="M211 186Q250 180 292 187L280 191Q251 187 224 192Z" opacity=".4"/><path d="M203 202Q251 196 302 205L282 208Q250 203 218 208Z" opacity=".2"/></g>
  <g class="jm-sea-ripples" fill="none" stroke="#b4a88f" stroke-width=".8" opacity=".45"><path d="M50 165q31-3 61 0m30 13q32-3 64 0m107-13q26-2 54 0M84 199q35-3 70 0m158-4q25-3 53 0"/></g>
 </g>
</svg>`;
sky.prepend(landscape);
for(const [x,y,h] of [[34,195,22],[58,188,28],[79,190,20],[107,185,32],[133,191,25],[164,190,19],[285,188,25],[307,184,34],[331,187,26],[350,192,22],[375,193,30]]){
 const tree=document.createElementNS(svgNS,'path');const w=h*.36;
 tree.setAttribute('d',`M${x} ${y-h}L${x-w*.64} ${y-h*.53}H${x-w*.34}L${x-w} ${y-h*.15}H${x-1}V${y+2}H${x+1}V${y-h*.15}H${x+w}L${x+w*.34} ${y-h*.53}H${x+w*.64}Z`);
 sky.querySelector('.jm-pines').append(tree);
}
function syncScenePlayback(){const visible=root.classList.contains('jm-motion-visible')&&!document.hidden;sceneAnimations.forEach(a=>{if(a.playState!=='finished')visible?a.play():a.pause();});}
function sceneMotion(next){
 sceneAnimations.forEach(a=>a.cancel());sceneAnimations=[];
 if(reduce.matches||!Element.prototype.animate)return;
 const play=(selector,frames,options)=>{const a=sky.querySelector(selector).animate(frames,{fill:'forwards',easing:'cubic-bezier(.25,.55,.25,1)',...options});sceneAnimations.push(a);};
 if(next==='morning'){
  play('.jm-dawn-sun',[{transform:'translateY(105px)',opacity:.4},{transform:'translateY(0)',opacity:1}],{duration:14000});
  play('.jm-valley-mist--left',[{transform:'translateX(16px)',opacity:1},{transform:'translateX(-115px)',opacity:.12}],{duration:16000});
  play('.jm-valley-mist--right',[{transform:'translateX(-12px)',opacity:1},{transform:'translateX(115px)',opacity:.08}],{duration:18000});
  play('.jm-fog',[{opacity:1},{opacity:.7,offset:.35},{opacity:.18}],{duration:18000});
 }
 if(next==='evening'){
  play('.jm-dusk-sun',[{transform:'translateY(-22px)'},{transform:'translateY(88px)'}],{duration:20000,easing:'cubic-bezier(.3,.1,.65,1)'});
  play('.jm-sea-reflection',[{opacity:.9},{opacity:.65,offset:.7},{opacity:.12}],{duration:20000});
  play('.jm-sunset-glow',[{opacity:.55},{opacity:1}],{duration:17000});
  play('.jm-dusk-aureole',[{opacity:.5},{opacity:1,offset:.7},{opacity:.6}],{duration:20000});
 }
 syncScenePlayback();
}
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{entries.forEach(e=>root.classList.toggle('jm-motion-visible',e.isIntersecting));syncScenePlayback();},{threshold:0}).observe(stage);}else root.classList.add('jm-motion-visible');


const points=[[8,12],[23,20],[45,8],[63,16],[79,9],[90,29],[16,35],[37,28],[56,35],[70,42],[86,48],[10,60],[30,56],[49,52],[73,65],[91,73],[58,80],[21,83]];
for(const [left,top]of points){const star=document.createElement('i');star.style.left=left+'%';star.style.top=top+'%';sky.querySelector('.jm-stars').append(star);}stage.append(sky);
function period(hour){return hour>=6&&hour<9?'morning':hour>=9&&hour<17?'day':hour>=17&&hour<19?'evening':'night';}
function paint(animate=false,replay=false){const next=mode==='auto'?period(new Date().getHours()):mode;const changed=current!==next;root.classList.remove(...skies.map(s=>'jm-'+s));root.classList.add('jm-'+next);current=next;if(changed||replay)sceneMotion(next);controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.light===mode)));status.textContent=mode==='auto'?`此刻是${labels[next]} · 依你的裝置時間變換光景。`:next==='morning'?'晨光 · 再點一次，重看日出與霧散。':next==='evening'?'暮色 · 再點一次，重看海上日落。':`${labels[next]} · 留在這一刻，慢慢探索城市。`;
if(changed&&animate&&!reduce.matches&&next!=='morning'&&next!=='evening'){const body=sky.querySelector('.jm-celestial');clearTimeout(riseTimer);body.classList.remove('is-rising');void body.offsetWidth;body.classList.add('is-rising');riseTimer=setTimeout(()=>body.classList.remove('is-rising'),1150);}}
paint();setInterval(()=>{if(mode==='auto'&&!document.hidden)paint(true);},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='auto')paint(false);syncScenePlayback();});reduce.addEventListener?.('change',()=>sceneMotion(current));
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();
