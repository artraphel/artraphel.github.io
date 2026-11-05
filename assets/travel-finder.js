/* Search the existing home cards. No API, account, or additional article list. */
(() => {
  'use strict';
  const init = () => {
    const root = document.querySelector('[data-travel-finder]');
    const section = root?.closest('#latest');
    const originalGrid=section?.querySelector('.travel-card-grid');
    const dialog=root?.closest('dialog');
    if(!root||!originalGrid||!dialog)return;
    const grid=originalGrid.cloneNode(true);
    dialog.querySelector('[data-tf-dialog-results]').append(grid);
    const input = root.querySelector('input[type="search"]');
    const status = section.querySelector('.tf-results-count');
    const reset = section.querySelector('.tf-reset');
    const empty = section.querySelector('.tf-empty');
    const countries = [...root.querySelectorAll('[data-tf-country]')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countryInfo = {
      italy: ['義大利 意大利 義大利自由行 italy italian italia', '義大利', 'ITALIA'],
      spain: ['西班牙 spain spanish españa espana', '西班牙', 'ESPAÑA'],
      france: ['法國 南法 蔚藍海岸 france french côte d’azur cote azur', '法國', 'FRANCE'],
      portugal: ['葡萄牙 portugal portuguese', '葡萄牙', 'PORTUGAL']
    };
    // Optional city aliases and editorial captions. New cards still work without them.
    const cityInfo = {
      rome: ['羅馬 roma rome 永恆之城 梵蒂岡 競技場 特雷維 噴泉 萬神殿', 'Roma', '在永恆之城，遇見日常的浪漫。'],
      seville: ['塞維亞 塞維利亞 賽維亞 seville sevilla 西班牙廣場 王宮 都市陽傘', 'Sevilla', '把安達魯西亞的陽光，收進記憶。'],
      eze: ['埃茲 艾茲 埃兹 eze èze 尼斯 nice 熱帶花園 異國花園 中世紀 石巷 地中海 尼采', 'Èze', '石巷盡頭，是整片地中海。'],
      granada: ['格拉納達 格拉那達 格拉娜達 格拉娜答 granada 阿爾罕布拉宮 alhambra 阿罕布拉 獅子庭院 宮殿 門票 塞維亞', 'Granada', '沿著光影，走進宮殿深處。'],
      venice: ['威尼斯 venice venezia 水都 貢多拉 大運河 聖母安康聖殿', 'Venezia', '在水巷之間，收藏一個慢下來的午後。'],
      lisbon: ['里斯本 lisbon lisboa 蛋塔 蛋撻 葡式蛋塔 pastel nata 美食 甜點', 'Lisboa', '從一口蛋塔，認識里斯本的溫度。'],
      porto: ['波多 波爾圖 porto oporto taylor taylors taylor’s 酒莊 酒窖 波特酒 port wine 品酒 品飲 杜羅河', 'Porto', '讓杜羅河的風，陪一杯波特酒。']
    };
    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[’‘']/g, '').replace(/\s+/g, ' ').trim();
    const markers = [...document.querySelectorAll('.journey-marker[data-url]')];
    const cards = [...grid.querySelectorAll('.travel-card')].map((el, index) => {
      const link = el.querySelector('a[href]');
      if (!link) return null;
      const url = new URL(link.getAttribute('href'), location.href);
      const parts = url.pathname.split('/').filter(Boolean);
      const country = parts[0];
      const city = Object.keys(cityInfo).find(key => (parts[1] || '').startsWith(key)) || '';
      const marker = markers.find(item => new URL(item.dataset.url, location.href).pathname === url.pathname);
      const title = el.querySelector('h3')?.textContent.trim() || link.textContent.trim();
      const image = el.querySelector('img');
      const caption = cityInfo[city] || [parts[1] || '', marker?.dataset.cityLabel || title.split('｜')[0], '在旅途中，遇見值得記錄的風景。'];
      const meta = countryInfo[country] || ['', country, country.toUpperCase()];
      return { el, index, country, city, title, href: link.getAttribute('href'), image: image?.getAttribute('src'), alt: image?.alt || title, label: caption[1], note: caption[2], search: normalize([title, el.textContent, image?.alt, caption[0], meta[0], marker?.dataset.summary, el.dataset.search].filter(Boolean).join(' ')) };
    }).filter(Boolean);
    if (!cards.length) return;
    let country='all', mood='', visible=cards, lastFeatured=cards.find(i=>i.city==='eze')||cards[0], inputTimer, composing=false;
    let remaining=[], flightTimer;
    const moods={rome:['stone','taste'],seville:['stone'],eze:['sea','stone'],granada:['stone'],venice:['sea','stone'],lisbon:['taste'],porto:['sea','taste']};
    const letters={rome:'跟著噴泉的水聲走進羅馬，把廣場、古蹟與一口甜點，收進同一天的記憶。',seville:'在廣場與庭園之間，留一點時間給塞維亞的光，也留給老城緩慢的日常。',eze:'沿著中世紀石巷往上走。石牆之間，地中海的藍正等著與你相遇。',granada:'從庭院倒影走向雕花拱窗，讓格拉納達的流水與光，慢慢留在記憶裡。',venice:'轉過一條水巷，風景便換了模樣。在威尼斯，偶爾迷路也是旅行的一部分。',lisbon:'從一顆蛋塔開始認識里斯本，酥皮與奶香之間，也藏著城市的生活節奏。',porto:'走過酒窖，再坐進花園。把波多的午後，留給杯中的波特酒與遠處的城市。'};
    const art=root.querySelector('.tf-art'), flip=root.querySelector('.tf-flip'), delivery=root.querySelector('.tf-delivery');
    const surprise=root.querySelector('.tf-surprise'), again=root.querySelector('.tf-again');
    const moodButtons=[...root.querySelectorAll('[data-tf-mood]')];
    function setFlip(back){flip.setAttribute('aria-pressed',String(back));flip.querySelector('.tf-front').setAttribute('aria-hidden',String(back));flip.querySelector('.tf-back').setAttribute('aria-hidden',String(!back));flip.setAttribute('aria-label',`${back?'翻回照片':'翻面閱讀'} ${lastFeatured.label} 的旅行短箋`);}
    function feature(item,animate=false){
      if(!item)return;root.querySelector('.tf-share-status').textContent='';root.querySelector('.tf-share-fallback').hidden=true;root.querySelector('.tf-share').disabled=false;lastFeatured=item;setFlip(false);art.classList.remove('is-empty');
      const img=art.querySelector('.tf-feature-image');img.src=item.image;img.alt=item.alt;
      art.querySelector('.tf-feature-city').textContent=item.label;art.querySelector('.tf-back-city').textContent=item.label;
      art.querySelector('.tf-feature-country').textContent=countryInfo[item.country]?.[2]||item.country.toUpperCase();
      art.querySelector('.tf-feature-note').textContent=item.note;art.querySelector('.tf-letter-note').textContent=letters[item.city]||item.note;
      art.querySelector('.tf-feature-number').textContent=String(item.index+1).padStart(2,'0');
      const link=art.querySelector('.tf-read');link.href=item.href;link.setAttribute('aria-label',`閱讀${item.title}`);
      const postcard=art.querySelector('.tf-postcard');postcard.classList.remove('is-delivered');
      if(animate&&!reduce){void postcard.offsetWidth;postcard.classList.add('is-delivered');}
    }
    function render(animate=true){
      const tokens=normalize(input.value).split(' ').filter(Boolean);
      visible=cards.filter(card=>(country==='all'||card.country===country)&&(!mood||(moods[card.city]||[]).includes(mood))&&tokens.every(t=>card.search.includes(t)));
      const found=new Set(visible);cards.forEach(card=>{card.el.hidden=!found.has(card);card.el.classList.remove('tf-enter');});
      if(animate&&!reduce)requestAnimationFrame(()=>visible.forEach((card,i)=>{card.el.style.setProperty('--tf-delay',`${Math.min(i,5)*35}ms`);card.el.classList.add('tf-enter');}));
      countries.forEach(b=>{const active=b.dataset.tfCountry===country;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
      moodButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tfMood===mood)));
      const context=[country==='all'?'':countryInfo[country]?.[1],mood?root.querySelector(`[data-tf-mood="${mood}"]`).textContent:'',input.value.trim()?`「${input.value.trim()}」`:''].filter(Boolean).join(' · ');
      status.textContent=`${context?context+' · ':''}${visible.length} 篇旅行筆記，等你翻閱`;
      reset.hidden=country==='all'&&!mood&&!tokens.length;empty.hidden=visible.length>0;
      root.querySelector('.tf-share').disabled=!visible.length;root.querySelector('.tf-share-fallback').hidden=true;root.querySelector('.tf-share-status').textContent='';
      surprise.disabled=again.disabled=!visible.length;remaining=[];
      if(visible.length){art.classList.remove('is-empty');if(!visible.includes(lastFeatured))feature(visible[0]);delivery.textContent='也許，下一段喜歡的風景就在這裡。';}
      else{art.classList.add('is-empty');delivery.textContent='這次沒有找到風景，換個條件再寄一張。';}
    }
    function draw(){
      clearTimeout(inputTimer); // Always apply the latest text before drawing.
      const before=visible.map(i=>i.index).join(',');
      const tokens=normalize(input.value).split(' ').filter(Boolean);
      const after=cards.filter(card=>(country==='all'||card.country===country)&&(!mood||(moods[card.city]||[]).includes(mood))&&tokens.every(t=>card.search.includes(t)));
      if(before!==after.map(i=>i.index).join(','))render();
      if(!visible.length)return;
      if(!remaining.length)remaining=[...visible];
      let choices=remaining.filter(i=>i!==lastFeatured);if(!choices.length)choices=remaining;
      const item=choices[Math.floor(Math.random()*choices.length)];remaining=remaining.filter(i=>i!==item);
      surprise.classList.remove('is-sending','is-orbiting');clearTimeout(flightTimer);
      orbit();
      feature(item,true);delivery.textContent=`明信片已寄達：${item.label}。輕點照片，翻看背面的故事。`;
    }
    function clear(){clearTimeout(inputTimer);country='all';mood='';input.value='';render();}
    countries.forEach(b=>{const count=b.dataset.tfCountry==='all'?cards.length:cards.filter(c=>c.country===b.dataset.tfCountry).length;b.querySelector('.tf-country-count').textContent=count;b.disabled=!count;b.addEventListener('click',()=>{clearTimeout(inputTimer);country=b.dataset.tfCountry;render();if(visible.length)feature(visible[0],true);});});
    moodButtons.forEach(b=>b.addEventListener('click',()=>{clearTimeout(inputTimer);mood=mood===b.dataset.tfMood?'':b.dataset.tfMood;render();}));
    input.addEventListener('input',()=>{clearTimeout(inputTimer);if(!composing)inputTimer=setTimeout(render,120);});
    input.addEventListener('compositionstart',()=>{composing=true;clearTimeout(inputTimer);});input.addEventListener('compositionend',()=>{composing=false;clearTimeout(inputTimer);render();});
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){clear();input.focus();}});
    root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(composing)return;clearTimeout(inputTimer);render();section.querySelector('.tf-results-bar').scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});});
    flip.addEventListener('click',()=>setFlip(flip.getAttribute('aria-pressed')!=='true'));
    surprise.addEventListener('click',draw);again.addEventListener('click',draw);reset.addEventListener('click',clear);
    section.querySelector('.tf-empty-reset').addEventListener('click',()=>{clear();input.focus();});
    // Motion remains local and finite; content is always visible without support.
    const sceneTargets=[document.querySelector('.europe-journey__canvas')].filter(Boolean);
    requestAnimationFrame(()=>{if(!reduce&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('tf-scene-pending');entry.target.classList.add('tf-scene-visible');observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -35px 0px'});
      sceneTargets.forEach(el=>{if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('tf-scene-pending');observer.observe(el);}});
    }
    });
    let orbitTimer;
    function orbit(){if(reduce||surprise.disabled)return;clearTimeout(orbitTimer);clearTimeout(flightTimer);surprise.classList.remove('is-sending','is-orbiting');void surprise.offsetWidth;surprise.classList.add('is-orbiting');orbitTimer=setTimeout(()=>surprise.classList.remove('is-orbiting'),1700);}
    surprise.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')orbit();});
    surprise.addEventListener('focus',orbit);
    const shareButton=root.querySelector('.tf-share'),shareStatus=root.querySelector('.tf-share-status'),shareFallback=root.querySelector('.tf-share-fallback'),shareInput=root.querySelector('.tf-share-url');
    function shareData(){return {title:lastFeatured.title,text:`和你分享一段${lastFeatured.label}的旅行風景。`,url:new URL(lastFeatured.href,'https://artraphel.github.io/').href};}
    function showShareFallback(data){shareFallback.hidden=false;shareInput.value=data.url;shareInput.focus();shareInput.select();shareStatus.textContent='選取連結即可複製，傳給一起旅行的朋友。';}
    async function copyArticle(){const data=shareData();try{if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(data.url);shareStatus.textContent=`已複製 ${lastFeatured.label} 文章連結。`;shareFallback.hidden=true;}catch{showShareFallback(data);}}
    shareButton.addEventListener('click',async()=>{const data=shareData();if(navigator.share){try{await navigator.share(data);shareStatus.textContent='已交給系統分享。';return;}catch(error){if(error.name==='AbortError')return;}}await copyArticle();});
    root.querySelector('.tf-copy-link').addEventListener('click',copyArticle);

    grid.id='travel-article-grid';render(false);feature(lastFeatured);root.hidden=false;
    section.querySelector('.tf-results-bar').hidden=false;
    const trigger=document.querySelector('[data-tf-open]'),closeButton=dialog.querySelector('.tf-dialog-close');
    const hoverCapable=window.matchMedia('(hover: hover) and (pointer: fine)');
    let returnFocus,hoverTimer,hoverPausedUntil=0;
    function openCabinet(event){
      if(!dialog.showModal||dialog.open)return;
      event?.preventDefault();clearTimeout(hoverTimer);returnFocus=trigger;
      dialog.showModal();document.body.classList.add('tf-dialog-open');dialog.scrollTop=0;
      draw();closeButton.focus({preventScroll:true});
    }
    trigger?.addEventListener('click',openCabinet);
    trigger?.addEventListener('pointerenter',event=>{
      if(event.pointerType!=='mouse'||!hoverCapable.matches||Date.now()<hoverPausedUntil||dialog.open)return;
      clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(trigger.matches(':hover')&&!dialog.open&&Date.now()>=hoverPausedUntil)openCabinet();},220);
    });
    trigger?.addEventListener('pointerleave',()=>clearTimeout(hoverTimer));
    closeButton.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{clearTimeout(hoverTimer);hoverPausedUntil=Date.now()+900;document.body.classList.remove('tf-dialog-open');returnFocus?.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
    window.addEventListener('blur',()=>clearTimeout(hoverTimer));
    if(trigger){trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',dialog.id);}


  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
