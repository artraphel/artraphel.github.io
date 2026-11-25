/* Rafael nebula v4: locally advected mist and drifting dust; no orbiting paths. */
(() => {
  'use strict';
  const script = document.currentScript;
  // Resolve relative to this file, including when the site is in a subdirectory.
  const assetURL = script?.dataset.nebulaImage
    ? new URL(script.dataset.nebulaImage, location.href)
    : new URL('images/rafael-nebula-ribbons.png', script?.src || location.href);
  const route = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const countryRoute = /\/(italy|portugal|spain|france|monaco)$/.test(route);

  // Local texture advection: every part of the mist follows its own current.
  // The PNG is a colour/texture source, not a rigid moving panel.
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 vUV;
    uniform sampler2D uImage;
    uniform float uTime;
    uniform float uRows;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                 mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    float fbm(vec2 p) {
      float value = 0., amplitude = .5;
      for(int i=0; i<3; i++) {
        value += amplitude*noise(p);
        p = mat2(.8,-.6,.6,.8)*p*2.03 + 7.1;
        amplitude *= .5;
      }
      return value;
    }
    vec4 sampleMist(vec2 uv) {
      float edge = smoothstep(0.,.04,uv.x)*smoothstep(0.,.04,1.-uv.x)
                 * smoothstep(0.,.035,uv.y)*smoothstep(0.,.035,1.-uv.y);
      vec4 texel = texture2D(uImage,clamp(uv,vec2(.001),vec2(.999)));
      return vec4(texel.rgb,texel.a*edge);
    }
    void main() {
      vec2 uv = vec2(vUV.x, fract(vUV.y*uRows));
      float band = floor(vUV.y*uRows);
      float t = uTime + band*3.7;
      if (mod(band,2.) > .5) uv.x = 1.-uv.x;
      uv.x += sin(band*2.4)*.035;
      // Counter-currents above/below the title; no common translation.
      float direction = mix(-1.,1.,smoothstep(.35,.65,uv.y));
      vec2 p = uv*vec2(5.5,3.1) + vec2(-t*.065*direction,t*.018);
      vec2 eddy = vec2(fbm(p+vec2(0.,t*.022)),fbm(p+vec2(8.3,-t*.027)));
      float flow = fbm(p+eddy*2.1);
      vec2 displacement = vec2(
        .016*sin(uv.y*14.+t*.23+eddy.y*5.),
        .033*sin(uv.x*17.-t*.30*direction+eddy.x*4.)
        +.018*sin(uv.x*31.+t*.21+flow*3.));
      vec2 warped = uv + displacement;
      vec4 fine = sampleMist(warped);
      vec2 otherUV = uv + vec2(-displacement.x*.8,displacement.y*.65)
                       +vec2(.008*sin(t*.13+uv.y*11.),.012*cos(t*.17+uv.x*13.));
      vec4 soft = sampleMist(otherUV);
      // Independently unfurling fine dust and diffuse mist, blended in premultiplied colour.
      float a = fine.a*(.57+.26*flow);
      float b = soft.a*.22*(.65+eddy.y);
      vec3 rgb = fine.rgb*a + soft.rgb*b*(1.-a);
      float alpha = a+b*(1.-a);
      // Very translucent colour vapour catches in local eddies.
      float edges = 1.-smoothstep(.10,.43,min(uv.y,1.-uv.y));
      float fog = smoothstep(.33,.77,flow)*edges*.07;
      vec3 blue = vec3(.49,.59,.67), gold = vec3(.81,.71,.53), wine = vec3(.60,.39,.47);
      vec3 tint = mix(blue,gold,smoothstep(.3,.7,eddy.x));
      tint = mix(tint,wine,smoothstep(.53,.82,eddy.y)*.5);
      rgb += tint*fog*(1.-alpha);
      alpha += fog*(1.-alpha);
      // A wider, translucent blue-grey envelope; the detailed dust stays fine.
      float spread = (sampleMist(warped+vec2(0.,.025)).a
                    +sampleMist(warped-vec2(0.,.025)).a)*.065;
      spread *= .66+.34*flow;
      rgb += blue*spread*(1.-alpha);
      alpha += spread*(1.-alpha);
      float seam = smoothstep(0.,.055,uv.y)*smoothstep(0.,.055,1.-uv.y);
      gl_FragColor = vec4(rgb*seam,alpha*seam);
    }
  `;
  const vertexSource = `attribute vec2 aPosition; varying vec2 vUV;
    void main(){ vUV = aPosition*.5+.5; gl_Position=vec4(aPosition,0.,1.); }`;
  const fluidRenderers = [];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let frameRequest = 0;
  let hiddenPage = false;
  function awake(renderer) {
    return !hiddenPage && !document.hidden && renderer.valid &&
      renderer.host.classList.contains('rf-nebula-active');
  }
  function animateFluid(now) {
    frameRequest = 0;
    let running = false;
    for (const r of fluidRenderers) {
      if (!awake(r)) { r.previous = 0; continue; }
      if (motionPreference.matches) { r.previous = 0; continue; }
      running = true;
      if (now-r.lastFrame < r.interval) continue;
      if (r.previous) r.time += Math.min((now-r.previous)/1000,.1);
      r.previous = now;
      r.lastFrame = now;
      r.draw();
    }
    if (running) frameRequest = requestAnimationFrame(animateFluid);
  }
  function wakeFluid() {
    if (!frameRequest && !motionPreference.matches && fluidRenderers.some(awake)) {
      frameRequest = requestAnimationFrame(animateFluid);
    }
  }
  function addFluid(host, image) {
    const layer = host.querySelector(':scope > .rf-nebula-layer');
    const canvas = document.createElement('canvas');
    canvas.className = 'rf-nebula-fluid';
    canvas.setAttribute('aria-hidden','true');
    const gl = canvas.getContext('webgl', {
      alpha:true, premultipliedAlpha:true, antialias:false, depth:false,
      stencil:false, preserveDrawingBuffer:false, powerPreference:'low-power'
    });
    if (!gl) return; // Existing CSS mist remains available without WebGL.
    let program, buffer, texture;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader,source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
        gl.deleteShader(shader); throw new Error('Nebula shader unavailable');
      }
      return shader;
    }
    try {
      const vertex=compile(gl.VERTEX_SHADER,vertexSource);
      const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
      program=gl.createProgram(); gl.attachShader(program,vertex); gl.attachShader(program,fragment);
      gl.linkProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Nebula shader unavailable');
      gl.useProgram(program);
      buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'aPosition');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      gl.uniform1i(gl.getUniformLocation(program,'uImage'),0);
      const time=gl.getUniformLocation(program,'uTime');
      const rows=gl.getUniformLocation(program,'uRows');
      const gallery=host.classList.contains('rf-nebula-gallery');
      let resize=true;
      const renderer={host,valid:true,time:7.3,previous:0,lastFrame:0,
        interval:gallery||matchMedia('(max-width: 680px)').matches?1000/24:1000/30,
        draw(){
          if (resize) {
            const box=layer.getBoundingClientRect();
            const pixelBudget=gallery?540000:400000;
            const ratio=Math.min(devicePixelRatio||1,1.25,1000/Math.max(box.width,1),
              2048/Math.max(box.height,1),Math.sqrt(pixelBudget/Math.max(box.width*box.height,1)));
            canvas.width=Math.max(1,Math.round(box.width*ratio));
            canvas.height=Math.max(1,Math.round(box.height*ratio));
            gl.viewport(0,0,canvas.width,canvas.height);
            gl.uniform1f(rows,gallery?Math.max(1,Math.min(12,box.height/440)):1);
            resize=false;
          }
          gl.uniform1f(time,renderer.time); gl.drawArrays(gl.TRIANGLES,0,6);
        }
      };
      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault(); renderer.valid=false;
        host.classList.remove('rf-nebula-fluid-ready'); canvas.remove();
      });
      layer.prepend(canvas);
      renderer.draw();
      host.classList.add('rf-nebula-fluid-ready');
      fluidRenderers.push(renderer);
      if ('ResizeObserver' in window) {
        new ResizeObserver(()=>{resize=true;renderer.draw();}).observe(layer);
      } else window.addEventListener('resize',()=>{resize=true;renderer.draw();},{passive:true});
      wakeFluid();
    } catch (_) {
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      canvas.remove(); // Keep the CSS fallback if shader setup is unsupported.
    }
  }
  motionPreference.addEventListener('change',()=>{
    fluidRenderers.forEach(r=>{r.previous=0;}); wakeFluid();
  });
  window.addEventListener('pagehide',()=>{
    hiddenPage=true; cancelAnimationFrame(frameRequest); frameRequest=0;
  });
  window.addEventListener('pageshow',()=>{hiddenPage=false;wakeFluid();});

  function enhance(host) {
    if (host.querySelector(':scope > .rf-nebula-layer')) return;
    host.classList.add('rf-nebula-host');
    if (countryRoute) host.classList.add('rf-nebula-country');
    const gallery=host.matches('#latest.travel-journal');
    if (gallery) host.classList.add('rf-nebula-gallery');
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
      const x = gallery ? (i%2 ? 86+(i%5)*2 : 4+(i%5)*2) : side < 2 ? 5 + step * 11 : side === 2 ? 3 + (step % 2) : 96 - (step % 2);
      const y = gallery ? 3+i*2.65 : side === 0 ? 7 + (step % 3) * 3 : side === 1 ? 88 + (step % 3) * 2 : 10 + step * 9;
      dust.style.cssText = `--rf-dust-x:${x}%;--rf-dust-y:${y}%;--rf-dust-size:${i % 5 === 0 ? 2.6 : 1.4}px;--rf-dust-delay:${-i * 1.7}s;--rf-dust-duration:${10 + i % 9}s`;
      layer.append(dust);
    }
    host.prepend(layer);
    return host;
  }

  function init() {
    const selector = countryRoute ? '.spain-head, .portugal-head, .france-head' : '.literary-signature, #latest.travel-journal';
    const hosts = [...document.querySelectorAll(selector)].map(enhance).filter(Boolean);
    if (!hosts.length) return;
    const visible = new Set();
    const update = () => {
      hosts.forEach(host => host.classList.toggle('rf-nebula-active', visible.has(host) && !document.hidden));
      wakeFluid();
    };
    const textureImage = new Image();
    textureImage.onload = () => hosts.forEach(host => addFluid(host, textureImage));
    textureImage.src = assetURL.href;
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
