/* Volumetric cloud passage. The ray marcher is standalone WebGL so it can cover
   the destination while Three.js and its world module are still downloading. */
(() => {
  'use strict';
  const worlds=window.PlanetWorlds;
  const themes={0:{name:'Khu vườn Nụ cười',light:[1,.85,.92],shade:[.48,.55,.74]},1:{name:'Rạp kỷ niệm',light:[1,.85,.62],shade:[.31,.25,.47]},4:{name:'Bờ biển Bình yên',light:[1,.78,.53],shade:[.48,.35,.55]},5:{name:'Cây điều ước',light:[.65,.72,1],shade:[.12,.16,.36]}};
  const modules={0:'./garden-three.js',1:'./cinema-three.js',4:'./beach-three.js',5:'./wish-tree-three.js'};
  const overlay=document.createElement('dialog');overlay.className='cloud-flight';overlay.setAttribute('aria-label','Đang bay qua tầng mây');
  overlay.innerHTML='<div class="cloud-fallback" aria-hidden="true"><i></i><i></i><i></i></div><canvas aria-hidden="true"></canvas><div class="cloud-caption"><small>MỘT THẾ GIỚI DÀNH CHO LINH</small><p role="status" aria-live="polite"></p></div><button type="button" class="cloud-skip">Bỏ qua chuyển cảnh →</button>';
  document.body.append(overlay);const canvas=overlay.querySelector('canvas'),caption=overlay.querySelector('p'),skip=overlay.querySelector('button');
  let flight=null;
  function makeClouds(theme){
    const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return null;
    const shaders=[],program=gl.createProgram(),buffer=gl.createBuffer();
    function dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}
    try{
      const mobile=innerWidth<700;
      const vs='attribute vec2 a;varying vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
      const fs=`precision mediump float;
        varying vec2 uv;uniform vec2 resolution;uniform float time,cover;uniform vec3 lightColor,shadeColor;
        float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
        float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
        float fbm(vec3 p){return noise(p)*.58+noise(p*2.03+7.1)*.28+noise(p*4.11+19.3)*.14;}
        float density(vec3 p){float n=fbm(p*.65);float tunnel=exp(-dot(p.xy,p.xy)*.3)*(1.-cover)*.36;return smoothstep(.39,.72,n+cover*.18-tunnel);}
        void main(){vec2 q=(uv-.5)*vec2(resolution.x/resolution.y,1.);vec3 ray=normalize(vec3(q*1.65,-1.));
          vec3 origin=vec3(sin(time*.35)*.18,cos(time*.21)*.12,-time*3.2);vec4 sum=vec4(0.);
          float jitter=hash(vec3(gl_FragCoord.xy,0.));float depth=.15+jitter*.24;
          for(int i=0;i<${mobile?32:48};i++){vec3 p=origin+ray*depth;float d=density(p);float illumination=clamp((d-density(p+vec3(-.4,.65,.15)))*2.+.55,.18,1.);
            vec3 c=mix(shadeColor,lightColor,illumination);c+=lightColor*pow(max(dot(ray,normalize(vec3(-.5,.4,-1.))),0.),18.)*.2;
            float alpha=(1.-exp(-d*.25))*smoothstep(0.,.2,cover);sum.rgb+=(1.-sum.a)*alpha*c;sum.a+=(1.-sum.a)*alpha;depth+=.24;if(sum.a>.985)break;}
          float veil=smoothstep(.7,1.,cover);vec3 fog=mix(shadeColor,lightColor,.68);sum.rgb+=(1.-sum.a)*veil*fog;sum.a+=(1.-sum.a)*veil;
          gl_FragColor=vec4(sum.rgb/max(sum.a,.001),sum.a);
        }`;
      for(const [type,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);}
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      const u=Object.fromEntries(['resolution','time','cover','lightColor','shadeColor'].map(n=>[n,gl.getUniformLocation(program,n)]));gl.uniform3fv(u.lightColor,theme.light);gl.uniform3fv(u.shadeColor,theme.shade);
      function resize(){const scale=Math.min(1,Math.sqrt((mobile?220000:600000)/(innerWidth*innerHeight)));canvas.width=Math.max(1,Math.round(innerWidth*scale));canvas.height=Math.max(1,Math.round(innerHeight*scale));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(u.resolution,canvas.width,canvas.height);}
      resize();return {resize,draw(t,c){gl.uniform1f(u.time,t);gl.uniform1f(u.cover,c);gl.drawArrays(gl.TRIANGLES,0,6);},dispose};
    }catch(error){console.warn('Cloud transition fallback:',error);dispose();return null;}
  }
  function enter(f){if(f.entered)return;f.entered=true;
    // Reopen the transition last in the top layer, above the destination dialog.
    // All three operations happen in one task: no uncovered frame is painted.
    overlay.close();if(f.origin?.isConnected)f.origin.focus({preventScroll:true});
    try{const ready=worlds.open(f.id);if(flight===f){overlay.showModal();skip.focus({preventScroll:true});}
      Promise.resolve(ready).catch(console.error).finally(()=>{if(flight===f)f.ready=true;});
    }catch(error){console.error(error);f.ready=true;}
  }
  function finish(){const f=flight;if(!f)return;enter(f);flight=null;cancelAnimationFrame(f.raf);clearTimeout(f.watchdog);f.clouds?.dispose();overlay.close();overlay.classList.remove('cloud-active');overlay.style.opacity='';
    const destination=document.querySelector('.planet-world[open],.memory-cinema[open],.wish-world[open]');destination?.querySelector('button')?.focus({preventScroll:true});f.resolve();
  }
  function open(id){if(!worlds.has(id)||!themes[id])return worlds.open(id);if(flight)return flight.promise;if(document.querySelector('.planet-world[open],.memory-cinema[open],.wish-world[open]'))return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return worlds.open(id);
    // Warm only the selected world's module, never instantiate an extra scene.
    import(modules[id]).catch(()=>{});
    const theme=themes[id];let resolve;const promise=new Promise(r=>resolve=r);const f={id,promise,resolve,origin:document.activeElement,entered:false,ready:false,t:0,last:0,exit:null,raf:0,clouds:null};flight=f;
    overlay.style.setProperty('--cloud-tint',`rgb(${theme.light.map(v=>Math.round(v*255)).join(',')})`);caption.textContent=theme.name;overlay.classList.add('cloud-active');overlay.style.opacity='0';overlay.showModal();skip.focus({preventScroll:true});
    f.clouds=makeClouds(theme);overlay.classList.toggle('cloud-webgl',Boolean(f.clouds));
    f.watchdog=setTimeout(finish,10000);
    function frame(now){if(flight!==f)return;const dt=f.last?Math.min(.08,(now-f.last)/1000):.016;f.last=now;f.t+=dt;
      if(f.t>=1.35&&!f.entered)enter(f);
      if(f.entered&&f.ready&&f.t>=2.05&&f.exit===null)f.exit=f.t;
      if(f.t>6.5&&f.exit===null){f.exit=f.t;caption.textContent='Sắp đến nơi…';}
      const out=f.exit===null?0:Math.min(1,(f.t-f.exit)/1.4);const smooth=x=>x*x*(3-2*x);const cover=f.exit===null?smooth(Math.min(1,f.t/1.25)):1-smooth(out);
      overlay.style.opacity=String(Math.min(1,f.t/.4)*(1-smooth(out)));overlay.style.setProperty('--cloud-cover',String(cover));f.clouds?.draw(f.t,cover);
      if(out>=1){finish();return;}f.raf=requestAnimationFrame(frame);
    }
    f.raf=requestAnimationFrame(frame);return promise;
  }
  skip.addEventListener('click',finish);overlay.addEventListener('cancel',e=>{e.preventDefault();finish();});
  window.addEventListener('resize',()=>flight?.clouds?.resize());document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();finish();});
  window.PlanetWorlds={has:id=>worlds.has(id),isExplored:id=>worlds.isExplored(id),open};
})();
