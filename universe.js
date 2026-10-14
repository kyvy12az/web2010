/* Perspective-projected 3D keepsake universe. No external graphics dependency. */
(() => {
  'use strict';
  const root = document.getElementById('cosmos');
  const canvas = document.getElementById('universeCanvas');
  const data = window.universeData;
  if (!root || !canvas || !data) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const picker = document.getElementById('planetPicker');
  const thumb = document.getElementById('universeThumb');
  const heading = document.getElementById('universeHeading');
  const description = document.getElementById('universeDescription');
  const open = document.getElementById('universeOpen');
  const pause = document.getElementById('cosmosPause');
  const palettes = [
    ['#ffc6cc', '#c7759e', '#442d67'], ['#ffe7af', '#caa777', '#554576'],
    ['#a7eced', '#5faabf', '#273c6d'], ['#f3b7f0', '#9c75c9', '#372b69'],
    ['#ffd9b7', '#d49183', '#634169'], ['#bfd2ff', '#758ac9', '#2a315e']
  ];
  const names = ['Nụ cười', 'Ngày đẹp', 'Bên nhau', 'Chuyến đi', 'Bình yên', 'Ngày mai'];
  const planets = palettes.map((colors, i) => ({
    i, colors, orbit: 170 + i * 68, radius: [24, 30, 26, 34, 29, 31][i],
    angle: [0.3, 2.1, 4.0, 5.3, 3.0, 1.25][i], speed: .10 / (1 + i * .3),
    position: [0, 0, 0], ring: i === 1 || i === 3
  }));
  let width = 1, height = 1, focal = 1, selected = -1, elapsed = 0;
  let paused = reduced.matches, visible = false, frameId = 0, last = 0;
  let yaw = -.12, pitch = .57, distance = 1120;
  let targetYaw = yaw, targetPitch = pitch, targetDistance = distance;
  let focus = [0, 0, 0], targetFocus = [0, 0, 0], hitTargets = [];
  let pointer = null, background = null, worldOpen = false, worldTimer = 0;
  let seed = 2010;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const stars = Array.from({ length: 480 }, () => ({
    position: [(random() - .5) * 3400, (random() - .5) * 2200, (random() - .5) * 1900],
    size: .5 + random() * 1.4, phase: random() * Math.PI * 2
  }));
  function schedule() {
    if (ctx && visible && !worldOpen && !document.hidden && !frameId) frameId = requestAnimationFrame(frame);
  }
  function project(point) {
    const x = point[0] - focus[0], y = point[1] - focus[1], z = point[2] - focus[2];
    const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
    const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + rz * Math.cos(pitch) + distance;
    if (depth < 65) return null;
    return { x: width / 2 + rx * focal / depth, y: height * .51 + ry * focal / depth, depth, scale: focal / depth };
  }
  function orbitPoint(planet, angle) {
    return [Math.cos(angle) * planet.orbit, Math.sin(angle * 2 + planet.i) * 15, Math.sin(angle) * planet.orbit];
  }
  function updatePositions() { planets.forEach(p => { p.position = orbitPoint(p, p.angle); }); }
  function backdrop() {
    background = document.createElement('canvas');
    background.width = Math.ceil(width); background.height = Math.ceil(height);
    const b = background.getContext('2d');
    b.fillStyle = '#090c1e'; b.fillRect(0, 0, width, height);
    const clouds = [[.2, .47, .52, '#65439c55'], [.73, .56, .46, '#4764aa44'], [.45, .68, .35, '#a8597840']];
    clouds.forEach(([x, y, radius, color]) => {
      const gradient = b.createRadialGradient(width*x,height*y,0,width*x,height*y,width*radius);
      gradient.addColorStop(0,color); gradient.addColorStop(1,'#090c1e00');
      b.fillStyle = gradient; b.fillRect(0,0,width,height);
    });
    // A cached veil of dust gives depth without per-frame blur filters.
    for(let i=0;i<180;i++){
      const x=random()*width,y=height*.55+Math.sin(x/width*5)*height*.15+(random()-.5)*height*.36;
      b.fillStyle='rgba(216,195,245,'+(.04+random()*.16)+')';b.beginPath();b.arc(x,y,random()*1.2+.3,0,Math.PI*2);b.fill();
    }
  }
  function resize() {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    focal = Math.min(width * .93, height * 1.3);
    if (ctx) { ctx.setTransform(dpr,0,0,dpr,0,0); backdrop(); schedule(); }
  }
  function ring(planet, front) {
    const center = project(planet.position); if (!center) return;
    ctx.strokeStyle = planet.i === selected ? '#ffe9ccaa' : planet.colors[0]+'80';
    ctx.lineWidth = Math.max(2, 7 * center.scale);
    ctx.beginPath(); let active = false;
    for(let j=0;j<=96;j++){
      const a=j/96*Math.PI*2,r=planet.radius*1.85;
      const p=project([planet.position[0]+Math.cos(a)*r,planet.position[1]+Math.sin(a)*r*.25,planet.position[2]+Math.sin(a)*r]);
      if (!p || (p.depth < center.depth) !== front) { active=false;continue; }
      if(active)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);active=true;
    }
    ctx.stroke();
  }
  function sphere(planet, point) {
    const radius = planet.radius * point.scale;
    if (radius < 1) return;
    if (planet.ring) ring(planet,false);
    if (planet.i === selected) {
      ctx.beginPath();ctx.arc(point.x,point.y,radius+10,0,Math.PI*2);
      ctx.strokeStyle='#ffe5ccaa';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([]);
    }
    const fill=ctx.createRadialGradient(point.x-radius*.35,point.y-radius*.4,radius*.03,point.x+radius*.3,point.y+radius*.2,radius*1.25);
    fill.addColorStop(0,planet.colors[0]);fill.addColorStop(.5,planet.colors[1]);fill.addColorStop(1,planet.colors[2]);
    ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
    ctx.save();ctx.clip();
    for(let stripe=0;stripe<4;stripe++){
      ctx.strokeStyle=planet.colors[0]+'24';ctx.lineWidth=radius*.14;
      ctx.beginPath();ctx.ellipse(point.x-radius*.1,point.y+radius*(stripe*.36-.65),radius*1.2,radius*.22,-.22,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
    if (planet.ring) ring(planet,true);
    ctx.textAlign='center';ctx.font='500 '+(width<500?10:11)+'px sans-serif';
    ctx.fillStyle='#eadcf3';ctx.fillText(String(planet.i+1).padStart(2,'0'),point.x,point.y+radius+18);
    hitTargets.push({i:planet.i,x:point.x,y:point.y,r:Math.max(24,radius+8),depth:point.depth});
  }
  function sun(point) {
    const r=58*point.scale;
    const halo=ctx.createRadialGradient(point.x,point.y,r*.6,point.x,point.y,r*3.6);
    halo.addColorStop(0,'#ffe0ba55');halo.addColorStop(.4,'#f1adbe25');halo.addColorStop(1,'#f1adbe00');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(point.x,point.y,r*3.6,0,Math.PI*2);ctx.fill();
    const fill=ctx.createRadialGradient(point.x-r*.25,point.y-r*.3,0,point.x,point.y,r);
    fill.addColorStop(0,'#fff2d5');fill.addColorStop(.65,'#f8bd9f');fill.addColorStop(1,'#ca7499');
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(point.x,point.y,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff5e7';ctx.font=Math.max(15,r*.82)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('♥',point.x,point.y+1);ctx.textBaseline='alphabetic';
  }
  function draw() {
    ctx.clearRect(0,0,width,height);if(background)ctx.drawImage(background,0,0,width,height);
    stars.forEach(star=>{
      const p=project(star.position);if(!p||p.x<0||p.x>width||p.y<0||p.y>height)return;
      const alpha=.35+.25*Math.sin(elapsed*.7+star.phase);
      ctx.fillStyle='rgba(232,222,255,'+alpha+')';ctx.beginPath();ctx.arc(p.x,p.y,Math.min(2.3,star.size*Math.sqrt(p.scale)),0,Math.PI*2);ctx.fill();
    });
    planets.forEach(planet=>{
      ctx.beginPath();let active=false;
      for(let j=0;j<=100;j++){
        const p=project(orbitPoint(planet,j/100*Math.PI*2));
        if(!p){active=false;continue;}if(active)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);active=true;
      }
      ctx.strokeStyle=planet.i===selected?'#edd4e044':'#c4a8e019';ctx.lineWidth=1;ctx.stroke();
    });
    hitTargets=[];
    const objects=planets.map(planet=>({planet,point:project(planet.position)}));
    objects.push({planet:null,point:project([0,0,0])});
    objects.filter(o=>o.point).sort((a,b)=>b.point.depth-a.point.depth).forEach(({planet,point})=>{if(planet)sphere(planet,point);else sun(point)});
  }
  function frame(now) {
    frameId=0;
    if(!visible||worldOpen||document.hidden)return;
    if(last && now-last<30){schedule();return;}
    const dt=last?Math.min(.06,(now-last)/1000):1/30;last=now;
    if(!paused){elapsed+=dt;if(selected<0){planets.forEach(p=>{p.angle+=p.speed*dt});if(!pointer)targetYaw+=dt*.018;}}
    updatePositions();
    const blend=reduced.matches?1:1-Math.exp(-dt*7);
    yaw+=(targetYaw-yaw)*blend;pitch+=(targetPitch-pitch)*blend;distance+=(targetDistance-distance)*blend;
    focus=focus.map((value,i)=>value+(targetFocus[i]-value)*blend);
    draw();
    const moving=Math.abs(targetYaw-yaw)+Math.abs(targetPitch-pitch)+Math.abs(targetDistance-distance)+focus.reduce((sum,value,i)=>sum+Math.abs(targetFocus[i]-value),0)>.02;
    if(!paused||moving||pointer)schedule();
  }
  function refresh() {
    picker.replaceChildren();
    planets.forEach(planet=>{
      const button=document.createElement('button');button.type='button';button.className='planet-chip';
      button.style.setProperty('--planet',planet.colors[1]);button.setAttribute('aria-pressed',String(selected===planet.i));
      const dot=document.createElement('i');dot.setAttribute('aria-hidden','true');button.append(dot,document.createTextNode(String(planet.i+1).padStart(2,'0')+' · '+names[planet.i]));
      button.classList.toggle('explored',Boolean(window.PlanetWorlds?.isExplored(planet.i)));
      button.setAttribute('aria-label',(window.PlanetWorlds?.has(planet.i)?'Bước vào thế giới ':'Khám phá ')+(names[planet.i]));
      button.addEventListener('click',()=>select(planet.i));picker.append(button);
    });
    if(selected>=0)showDetail(selected);
  }
  function showDetail(i) {
    const memory=data.getMemories()[i];if(!memory)return;
    heading.textContent=memory.caption;
    description.textContent='Một hành tinh nhỏ, giữ một khoảnh khắc của chúng mình.';
    thumb.hidden=!memory.src;if(memory.src){thumb.src=memory.src;thumb.alt=memory.caption;}
    open.hidden=!memory.src;
    if(!memory.src)description.textContent='Khoảnh khắc này đang chờ một tấm ảnh của chúng mình.';
    if(window.PlanetWorlds?.has(i)){open.hidden=false;open.textContent='Bước vào thế giới này ↗';description.textContent=i===0?'Khu vườn trên mây đang chờ những bông hoa nở.':'Ghé bãi biển hoàng hôn để tìm lời nhắn trong chai.';}else open.textContent='Mở ảnh kỷ niệm ↗';
  }
  function select(i) {
    selected=i;updatePositions();targetFocus=planets[i].position.slice();targetDistance=width<500?400:480;
    showDetail(i);[...picker.children].forEach((button,index)=>button.setAttribute('aria-pressed',String(index===i)));
    document.getElementById('cosmosStatus').textContent='HÀNH TINH '+String(i+1).padStart(2,'0');schedule();
    clearTimeout(worldTimer);if(window.PlanetWorlds?.has(i))worldTimer=setTimeout(()=>{if(selected===i&&!document.hidden)window.PlanetWorlds.open(i)},reduced.matches?0:500);
  }
  function reset() {
    clearTimeout(worldTimer);selected=-1;targetFocus=[0,0,0];targetDistance=1120;targetYaw=-.12;targetPitch=.57;
    heading.textContent='Cả một vũ trụ dành cho Linh';description.textContent='Chạm một hành tinh hoặc chọn kỷ niệm bên trên để khám phá.';
    thumb.hidden=true;open.hidden=true;document.getElementById('cosmosStatus').textContent='VŨ TRỤ CỦA CHÚNG MÌNH';
    [...picker.children].forEach(button=>button.setAttribute('aria-pressed','false'));schedule();
  }
  function setPaused(value) {paused=value;pause.textContent=paused?'Tiếp tục ↻':'Tạm dừng ⏸';pause.setAttribute('aria-pressed',String(paused));schedule();}
  open.addEventListener('click',()=>{clearTimeout(worldTimer);if(window.PlanetWorlds?.has(selected))window.PlanetWorlds.open(selected);else if(selected>=0)data.openMemory(selected)});
  window.addEventListener('planet-world-toggle',event=>{worldOpen=event.detail.open;if(worldOpen){cancelAnimationFrame(frameId);frameId=0;last=0;}else{refresh();schedule();}});
  window.addEventListener('planet-world-explored',refresh);
  thumb.addEventListener('error',()=>{thumb.hidden=true});
  document.getElementById('cosmosReset').addEventListener('click',reset);
  document.getElementById('cosmosIn').addEventListener('click',()=>{targetDistance=Math.max(400,targetDistance-140);schedule()});
  document.getElementById('cosmosOut').addEventListener('click',()=>{targetDistance=Math.min(1800,targetDistance+140);schedule()});
  pause.addEventListener('click',()=>setPaused(!paused));
  canvas.addEventListener('pointerdown',event=>{
    if(pointer||event.button>0)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:targetYaw,pitch:targetPitch,moved:false};canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.hypot(dx,dy)>7)pointer.moved=true;
    if(!pointer.moved)return;
    targetYaw=pointer.yaw+dx*.006;
    if(event.pointerType==='mouse')targetPitch=Math.max(.12,Math.min(1.25,pointer.pitch+dy*.004));
    schedule();
  });
  canvas.addEventListener('pointerup',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const tapped=!pointer.moved;pointer=null;
    if(tapped){const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
      const hit=hitTargets.filter(p=>Math.hypot(p.x-x,p.y-y)<p.r).sort((a,b)=>a.depth-b.depth)[0];if(hit)select(hit.i);
    }schedule();
  });
  ['pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{pointer=null;schedule()}));
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home',' '].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    if(event.key==='ArrowLeft')targetYaw-=.18;if(event.key==='ArrowRight')targetYaw+=.18;
    if(event.key==='ArrowUp')targetPitch=Math.min(1.25,targetPitch+.12);if(event.key==='ArrowDown')targetPitch=Math.max(.12,targetPitch-.12);
    if(event.key==='+'||event.key==='=')targetDistance=Math.max(400,targetDistance-140);if(event.key==='-')targetDistance=Math.min(1800,targetDistance+140);
    if(event.key==='Home')reset();if(event.key===' ')setPaused(!paused);schedule();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;last=0;}else schedule()});
  reduced.addEventListener('change',()=>setPaused(reduced.matches));
  window.refreshUniverse=refresh;refresh();setPaused(paused);updatePositions();
  if(!ctx){const fallback=document.createElement('p');fallback.className='cosmos-fallback';fallback.textContent='Chọn một kỷ niệm bên dưới để xem ảnh của chúng mình.';root.append(fallback);return;}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;schedule()}else{cancelAnimationFrame(frameId);frameId=0;last=0;}},{threshold:.05});observer.observe(root);
  new ResizeObserver(resize).observe(root);resize();
})();
