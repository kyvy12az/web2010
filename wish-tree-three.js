import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { Tree } from './vendor/ez-tree/tree.js';
import { oakPreset } from './vendor/ez-tree/preset.js';
import { addWishFlowers } from './wish-flowers.js';

export function createWishTree(host, { opened = [], wishes = [], paused = false, onSelect, onWishSelect } = {}) {
  const mobile=host.clientWidth<700,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({antialias:!mobile});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.className='wish-canvas';canvas.tabIndex=0;canvas.setAttribute('aria-label','Cây điều ước 3D. Kéo để nhìn quanh, chạm đèn lồng để đọc lời nhắn. Phím mũi tên xoay; Home về toàn cảnh.');host.append(canvas);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#080e24');scene.fog=new THREE.FogExp2('#11182e',.012);
  const camera=new THREE.PerspectiveCamera(48,1,.1,200);const target=new THREE.Vector3(),look=new THREE.Vector3(0,5,0),targetLook=look.clone();
  scene.add(new THREE.HemisphereLight('#a6b7ff','#29203b',1.1));
  const moonlight=new THREE.DirectionalLight('#b7ccff',2.6);moonlight.position.set(-12,22,4);moonlight.castShadow=true;moonlight.shadow.mapSize.set(1024,1024);Object.assign(moonlight.shadow.camera,{left:-12,right:12,top:15,bottom:-12,near:1,far:60});moonlight.shadow.normalBias=.04;scene.add(moonlight);
  const hillHeight=(x,z)=>1.3*Math.exp(-(x*x+z*z)/80)-.1;
  const groundGeo=new THREE.PlaneGeometry(120,120,80,80);groundGeo.rotateX(-Math.PI/2);const gp=groundGeo.attributes.position;for(let i=0;i<gp.count;i++)gp.setY(i,hillHeight(gp.getX(i),gp.getZ(i)));groundGeo.computeVertexNormals();const ground=new THREE.Mesh(groundGeo,new THREE.MeshStandardMaterial({color:'#273e40',roughness:1}));ground.receiveShadow=true;scene.add(ground);
  const meadow=addWishFlowers(scene,hillHeight,mobile);
  // EZ Tree's full branch/leaf generator; local procedural leaf alpha replaces external texture files.
  const leafCanvas=document.createElement('canvas');leafCanvas.width=leafCanvas.height=128;const lc=leafCanvas.getContext('2d');lc.clearRect(0,0,128,128);lc.fillStyle='#d4e1ed';lc.beginPath();lc.moveTo(64,5);lc.bezierCurveTo(118,35,118,95,64,124);lc.bezierCurveTo(10,95,10,35,64,5);lc.fill();lc.strokeStyle='#728eb0';lc.lineWidth=3;lc.beginPath();lc.moveTo(64,12);lc.lineTo(64,119);lc.stroke();
  const leafTexture=new THREE.CanvasTexture(leafCanvas);leafTexture.colorSpace=THREE.SRGBColorSpace;
  const tree=new Tree();const config=structuredClone(oakPreset);config.leaves.tint=0x8796d0;config.leaves.count=mobile?12:18;config.bark.tint=0x928390;config.bark.textured=false;tree.options.copy(config);tree.options.leaves.map=leafTexture;tree.generate();tree.scale.setScalar(.12);tree.position.y=hillHeight(0,0);tree.branchesMesh.castShadow=true;tree.leavesMesh.castShadow=!mobile;scene.add(tree);tree.updateMatrixWorld(true);
  // Add a low violet fill so the canopy reads blue-purple under moonlight.
  const fill=new THREE.PointLight('#ad79df',35,18,2);fill.position.set(3,5,-3);scene.add(fill);
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const hc=haloCanvas.getContext('2d'),g=hc.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff8d9');g.addColorStop(.16,'#ffd99ab0');g.addColorStop(1,'#ffc47900');hc.fillStyle=g;hc.fillRect(0,0,128,128);const haloTexture=new THREE.CanvasTexture(haloCanvas);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(2,24,16),new THREE.MeshBasicMaterial({color:'#e2e5ff',fog:false}));moon.position.set(-17,25,-40);scene.add(moon);
  const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,color:'#bbceff',transparent:true,opacity:.32,depthWrite:false,fog:false}));moonHalo.position.copy(moon.position);moonHalo.scale.set(10,10,1);scene.add(moonHalo);
  let seed=2010;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const starGeo=new THREE.BufferGeometry(),starPos=[];for(let i=0;i<850;i++){const a=random()*Math.PI*2,h=random()*.88+.1,r=65;starPos.push(Math.cos(a)*Math.sqrt(1-h*h)*r,h*r,Math.sin(a)*Math.sqrt(1-h*h)*r);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#d8dcff',size:.12,transparent:true,opacity:.8,fog:false}));scene.add(stars);
  const gold=new THREE.MeshStandardMaterial({color:'#b78c53',metalness:.5,roughness:.4});
  const lanternGeo=new THREE.SphereGeometry(.3,18,12);lanternGeo.scale(1,1.4,1);
  const capGeo=new THREE.CylinderGeometry(.17,.21,.07,12),ribGeo=new THREE.TorusGeometry(.3,.009,4,24);
  const pickables=[],lanterns=[],seen=new Set(opened.filter(i=>Number.isInteger(i)&&i>=0&&i<6));
  function lantern(id){const group=new THREE.Group();const paper=new THREE.MeshStandardMaterial({color:'#ffe3a2',emissive:'#ffba55',emissiveIntensity:1.1,roughness:.8});const body=new THREE.Mesh(lanternGeo,paper);body.userData.lantern=id;group.add(body);for(const y of [-.4,.4]){const cap=new THREE.Mesh(capGeo,gold);cap.position.y=y;group.add(cap);}for(const y of [-.22,0,.22]){const rib=new THREE.Mesh(ribGeo,gold);rib.rotation.x=Math.PI/2;rib.position.y=y;rib.scale.setScalar(Math.sqrt(1-y*y/.18));group.add(rib);}
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));glow.scale.set(1.8,1.8,1);group.add(glow);return {group,paper,glow,body};}
  const candidates=tree.skeleton.branches.flatMap(b=>b.sections.slice(1).map(s=>tree.localToWorld(s.origin.clone()))).filter(p=>p.y>3.5&&p.y<8&&Math.hypot(p.x,p.z)>1);
  const chosen=[];const desired=[[-2.2,5,1.3],[2,5,1.3],[-1.8,7,1],[1.6,7,1],[-.6,6,2],[.7,8,0]];
  desired.forEach(([x,y,z],i)=>{const eligible=candidates.filter(p=>chosen.every(c=>c.distanceTo(p)>.8));const anchor=(eligible.length?eligible:candidates).reduce((best,p)=>{const score=p.distanceToSquared(new THREE.Vector3(x,y,z));return !best||score<best.score?{p,score}:best},null)?.p.clone()||new THREE.Vector3(x,y,z);chosen.push(anchor);
    const item=lantern(i);item.group.position.copy(anchor).add(new THREE.Vector3(0,-.95,0));item.base=item.group.position.clone();scene.add(item.group);const string=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.55,5),gold);string.position.copy(anchor).add(new THREE.Vector3(0,-.275,0));scene.add(string);item.value=seen.has(i)?1:0;lanterns.push(item);pickables.push(item.body);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=labelCanvas.height=128;const c=labelCanvas.getContext('2d');c.fillStyle='#ffe8b5';c.font='bold 42px Quicksand, sans-serif';c.textAlign='center';c.fillText('0'+(i+1),64,80);const texture=new THREE.CanvasTexture(labelCanvas);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));label.position.y=-.7;label.scale.set(.65,.65,1);label.userData.lantern=i;item.group.add(label);pickables.push(label);
  });
  const heartPoints=[];for(let i=0;i<=80;i++){const t=i/80*Math.PI*2;heartPoints.push(new THREE.Vector3(16*Math.sin(t)**3*.22,14+(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.22,-8));}
  const heartGeo=new THREE.BufferGeometry().setFromPoints(heartPoints);heartGeo.setDrawRange(0,0);const heart=new THREE.Line(heartGeo,new THREE.LineBasicMaterial({color:'#f7c5dc',transparent:true,opacity:.85,fog:false}));scene.add(heart);
  const heartStars=new THREE.Points(new THREE.BufferGeometry().setFromPoints(heartPoints.filter((_,i)=>i%4===0)),new THREE.PointsMaterial({color:'#ffe2d6',size:.15,transparent:true,opacity:0,fog:false}));scene.add(heartStars);
  const fireGeo=new THREE.BufferGeometry(),firePos=new Float32Array(55*3),fireSeeds=Array.from({length:55},()=>({x:(random()-.5)*18,y:random()*2+.5,z:(random()-.5)*16,p:random()*7}));fireGeo.setAttribute('position',new THREE.BufferAttribute(firePos,3));scene.add(new THREE.Points(fireGeo,new THREE.PointsMaterial({map:haloTexture,color:'#e8edaa',size:.18,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
  const meteor=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(3,1,0)]),new THREE.LineBasicMaterial({color:'#e0d4ff',transparent:true,opacity:0,fog:false}));scene.add(meteor);

  // Three staggered bursts, bounded particle count, no full-screen flash.
  const fireworks=[];
  function clearFireworks(){
    for(const f of fireworks){scene.remove(f.points);f.points.geometry.dispose();f.points.material.dispose();}
    fireworks.length=0;
  }
  function celebrateWish(){
    if(reduced||stopped)return;
    clearFireworks();
    const palette=['#ffd89b','#ffb7d5','#b8caff'];
    for(let k=0;k<3;k++){
      const count=mobile?85:150,positions=new Float32Array(count*3*3),velocities=[];
      for(let i=0;i<count;i++){
        const y=1-2*(i+.5)/count,a=i*2.3999632297,r=Math.sqrt(1-y*y),speed=1.7+random()*1.4;
        velocities.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiplyScalar(speed));
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const material=new THREE.PointsMaterial({map:haloTexture,color:palette[k],size:mobile?.2:.17,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
      const points=new THREE.Points(geo,material);points.name='wish-fireworks';points.frustumCulled=false;
      // Place bursts on the far side of the tree relative to the current orbit.
      const side=(k-1)*4.2;
      const center=new THREE.Vector3(Math.cos(angle)*side-Math.sin(angle)*3,12.5+(k===1?1:0),-Math.sin(angle)*side-Math.cos(angle)*3);
      points.position.copy(center);scene.add(points);
      fireworks.push({points,positions,velocities,age:-k*.65});
    }
  }
  function updateFireworks(dt){
    for(let n=fireworks.length-1;n>=0;n--){
      const f=fireworks[n];if(!stopped)f.age+=dt;
      if(f.age<0)continue;
      if(f.age>4.6){scene.remove(f.points);f.points.geometry.dispose();f.points.material.dispose();fireworks.splice(n,1);continue;}
      const burst=f.age-.7;
      f.points.material.opacity=burst<0?.75:Math.min(1,Math.max(0,(3.9-burst)/2.4));
      for(let i=0;i<f.velocities.length;i++)for(let trail=0;trail<3;trail++){
        const offset=(i*3+trail)*3;
        if(burst<0){
          f.positions[offset]=0;f.positions[offset+1]=-6+f.age/.7*6-trail*.14;f.positions[offset+2]=0;
        }else{
          const t=Math.max(0,burst-trail*.055),drag=(1-Math.exp(-t*.75))/.75,v=f.velocities[i];
          f.positions[offset]=v.x*drag;f.positions[offset+1]=v.y*drag-.48*t*t;f.positions[offset+2]=v.z*drag;
        }
      }
      f.points.geometry.attributes.position.needsUpdate=true;
    }
  }

  const attachedWishes=[];let active=true,stopped=paused,time=0,last=0,raf=0,angle=0,selected=-1,heartProgress=seen.size===6?1:0,pointer=null,homeDistance=25;
  function home(){selected=-1;target.set(Math.sin(angle)*homeDistance,7,Math.cos(angle)*homeDistance);targetLook.set(0,6,0);schedule();}
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();homeDistance=Math.max(25,7/(Math.tan(THREE.MathUtils.degToRad(24))*camera.aspect));if(selected<0){home();camera.position.copy(target);look.copy(targetLook);}schedule();}
  function schedule(){if(active&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function frame(now){raf=0;if(!active||document.hidden)return;if(last&&now-last<32){schedule();return}const dt=last?Math.min(.06,(now-last)/1000):.033;last=now;if(!stopped)time+=dt;const blend=reduced?1:1-Math.exp(-dt*4);camera.position.lerp(target,blend);look.lerp(targetLook,blend);camera.lookAt(look);let moving=camera.position.distanceTo(target)+look.distanceTo(targetLook)>.003;
    tree.update(time*.25);meadow.update(time);lanterns.forEach((l,i)=>{const goal=seen.has(i)?1:0;l.value+=(goal-l.value)*blend;moving ||= Math.abs(goal-l.value)>.002;l.paper.emissiveIntensity=1.1+l.value*.8+(selected===i?.8:0);l.glow.material.opacity=.3+l.value*.25;l.group.rotation.z=Math.sin(time*.65+i)*.035;});
    if(seen.size===6&&heartProgress<1){heartProgress=reduced?1:Math.min(1,heartProgress+dt*.3);moving=true;}heartGeo.setDrawRange(0,Math.floor(heartProgress*81));heartStars.material.opacity=heartProgress*.9;
    fireSeeds.forEach((s,i)=>{firePos[i*3]=s.x+Math.sin(time*.4+s.p)*.65;firePos[i*3+1]=s.y+Math.sin(time*.7+s.p)*.3;firePos[i*3+2]=s.z+Math.cos(time*.3+s.p)*.5;});fireGeo.attributes.position.needsUpdate=true;stars.material.opacity=.7+Math.sin(time*.4)*.12;
    const mt=time%17;meteor.material.opacity=mt<1.3?Math.sin(mt/1.3*Math.PI)*.7:0;meteor.position.set(12-mt*9,23-mt*4,-28);
    attachedWishes.forEach(f=>{
      if(!f.landed){
        if(!stopped)f.age=Math.min(3,f.age+dt);
        const u=f.age/3,t=u*u*(3-2*u);
        f.item.group.position.copy(f.start).lerp(f.end,t);
        f.item.group.position.y+=Math.sin(Math.PI*t)*1.5;
        f.item.group.position.x+=Math.sin(Math.PI*t)*.6;
        if(u>=1){f.landed=true;f.string.visible=true;f.item.group.position.copy(f.end);}
      }
      f.item.group.rotation.z=Math.sin(time*.65+f.phase)*.035;
      f.item.glow.material.opacity=.5;
    });
    updateFireworks(dt);
    renderer.render(scene,camera);if(!stopped||moving||pointer)schedule();
  }
  function select(i){if(!Number.isInteger(i)||i<0||i>=6)return;seen.add(i);selected=i;const p=lanterns[i].base;target.copy(p).add(new THREE.Vector3(.7,.4,Math.max(4,2.3/camera.aspect)));targetLook.copy(p);schedule();}
  const ray=new THREE.Raycaster(),events=[];const listen=(n,k,f)=>{n.addEventListener(k,f);events.push(()=>n.removeEventListener(k,f));};
  listen(canvas,'pointerdown',e=>{if(pointer||e.button>0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,moved:false};canvas.setPointerCapture(e.pointerId);});
  listen(canvas,'pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>6)pointer.moved=true;if(pointer.moved){angle-=(e.clientX-pointer.lx)*.005;home();}pointer.lx=e.clientX;});
  listen(canvas,'pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const tap=!pointer.moved;pointer=null;if(tap){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(pickables)[0];if(hit){const wish=hit.object.userData.wish;if(wish!==undefined){const f=attachedWishes.find(w=>w.item.body===hit.object);if(f){selected=6;target.copy(f.item.group.position).add(new THREE.Vector3(.7,.4,Math.max(4,2.3/camera.aspect)));targetLook.copy(f.item.group.position);schedule();onWishSelect?.(wish);}}else onSelect?.(hit.object.userData.lantern);}}schedule();});
  for(const key of ['pointercancel','lostpointercapture'])listen(canvas,key,()=>{pointer=null;});
  listen(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();angle=e.key==='Home'?0:angle+(e.key==='ArrowLeft'?-.15:.15);home();});
  listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}last=0;schedule();});
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);host.dispatchEvent(new CustomEvent('wish-context-lost'));});
  function attachWish(text,restore=false){
    if(typeof text!=='string'||!text.trim())return;
    // Keep the same thirty wishes as storage; remove only the oldest when full.
    if(attachedWishes.length>=30){
      const old=attachedWishes.shift();scene.remove(old.item.group,old.string);
      const index=pickables.indexOf(old.item.body);if(index>=0)pickables.splice(index,1);
      old.item.paper.dispose();old.item.glow.material.dispose();old.string.geometry.dispose();
    }
    const occupied=[...chosen,...attachedWishes.map(f=>f.anchor)];
    const anchor=candidates.reduce((best,p)=>{
      const spacing=Math.min(...occupied.map(q=>p.distanceTo(q)));
      // Prefer well-separated real branch points, with a slight bias to the front.
      const score=spacing+Math.max(-2,Math.min(2,p.z))*.035;
      return !best||score>best.score?{p,score}:best;
    },null)?.p.clone()||new THREE.Vector3(0,6,0);
    const item=lantern(-1);item.body.userData.wish=text;
    item.paper.color.set('#ffd4c4');item.paper.emissive.set('#ffad7a');
    const end=anchor.clone().add(new THREE.Vector3(0,-.95,0)),start=new THREE.Vector3(0,2,3);
    const landed=restore||reduced||stopped;
    item.group.position.copy(landed?end:start);scene.add(item.group);pickables.push(item.body);
    const string=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.55,5),gold);
    string.position.copy(anchor).add(new THREE.Vector3(0,-.275,0));string.visible=landed;scene.add(string);
    attachedWishes.push({item,string,anchor,start,end,landed,age:landed?3:0,phase:attachedWishes.length*1.7});
  }
  wishes.slice(-30).forEach(text=>attachWish(text,true));
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  return {select,home,setPaused(value){stopped=value;last=0;schedule();},release(text){if(typeof text!=='string'||!text.trim())return;attachWish(text);home();celebrateWish();schedule();},dispose(){active=false;cancelAnimationFrame(raf);observer.disconnect();events.forEach(off=>off());const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});ms.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)ts.add(v)});m.dispose();});gs.forEach(g=>g.dispose());ts.forEach(t=>t.dispose());moonlight.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
