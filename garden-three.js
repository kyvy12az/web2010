import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { makeHeightFn, makeButterfly } from './small-world-garden.js';

export function createGarden(host, { onSelect, opened = [], paused = false } = {}) {
  const mobile = host.clientWidth < 700, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement; canvas.className = 'garden-canvas'; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Đảo vườn của Linh. Kéo để xoay, chạm bông hoa để mở ảnh; phím mũi tên để xoay và Home để về toàn cảnh.'); host.append(canvas);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#b6c7e2'); scene.fog = new THREE.Fog('#cbd1e6', 33, 100);
  const camera = new THREE.PerspectiveCamera(44, 1, .1, 180);
  const island = new THREE.Group(); scene.add(island);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(110, 24, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, vertexShader: 'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 v;void main(){float h=normalize(v).y;vec3 c=mix(vec3(.96,.79,.83),vec3(.47,.67,.87),smoothstep(-.1,.75,h));gl_FragColor=vec4(c,1.);}' })); scene.add(sky);
  scene.add(new THREE.HemisphereLight('#fff1ef', '#626a8c', 2.3));
  const sunlight = new THREE.DirectionalLight('#ffe8c8', 3); sunlight.position.set(-9, 16, 8); sunlight.castShadow = true; sunlight.shadow.mapSize.set(1024, 1024); Object.assign(sunlight.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 45 }); sunlight.shadow.normalBias = .04; scene.add(sunlight);
  let seed = 2010; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const height = makeHeightFn((x,z) => Math.sin(x * 2.1 + .5) * Math.cos(z * 1.8) * .55, { centers: [{ cx: 0, cz: 0, radius: 7 }] }, .9);
  const topGeo = new THREE.CircleGeometry(7, 96); // replaced by concentric terrain rings below
  const pos = [0, height(0,0), 0], indices = [], colors = [];
  const rings = 24, sides = 96;
  for(let r=1;r<=rings;r++)for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2,x=Math.cos(a)*r/rings*7,z=Math.sin(a)*r/rings*7;pos.push(x,height(x,z),z);}
  for(let j=0;j<sides;j++)indices.push(0,1+(j+1)%sides,1+j);
  for(let r=1;r<rings;r++)for(let j=0;j<sides;j++){const a=1+(r-1)*sides+j,b=1+(r-1)*sides+(j+1)%sides,c=a+sides,d=b+sides;indices.push(a,b,c,b,d,c);}
  for(let i=0;i<pos.length;i+=3){const c=new THREE.Color('#9cb88b').lerp(new THREE.Color('#d2d5a3'),random()*.42);colors.push(c.r,c.g,c.b);}
  topGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));topGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));topGeo.deleteAttribute('uv');topGeo.setIndex(indices);topGeo.computeVertexNormals();
  const turf = new THREE.Mesh(topGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));turf.receiveShadow=true;island.add(turf);
  const underside = new THREE.CylinderGeometry(7,.7,5.8,48,5,false);underside.translate(0,-2.96,0);
  const rockColors=[];const rp=underside.attributes.position;
  for(let i=0;i<rp.count;i++){const y=rp.getY(i);if(y<-.2){const scale=1+Math.sin(rp.getX(i)*3+rp.getZ(i)*2)*.07;rp.setX(i,rp.getX(i)*scale);rp.setZ(i,rp.getZ(i)*scale);}const c=new THREE.Color('#736582').lerp(new THREE.Color('#c7a8ae'),Math.max(0,1+y/6));rockColors.push(c.r,c.g,c.b);}
  underside.setAttribute('color',new THREE.Float32BufferAttribute(rockColors,3));underside.computeVertexNormals();const rock=new THREE.Mesh(underside,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));rock.castShadow=true;island.add(rock);
  const dummy=new THREE.Object3D();
  const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.045,.28,3),new THREE.MeshStandardMaterial({color:'#829f74',roughness:1}),650);
  for(let i=0;i<650;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*6.8,x=Math.cos(a)*r,z=Math.sin(a)*r;dummy.position.set(x,height(x,z)+.11,z);dummy.rotation.set(0,random()*6,.15);dummy.scale.setScalar(.6+random());dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}island.add(grass);
  function mesh(geo,mat,parent=island){const m=new THREE.Mesh(geo,mat);parent.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
  const wood=new THREE.MeshStandardMaterial({color:'#886276',roughness:.9});
  function branch(a,b,r1,r2,parent=island){const direction=new THREE.Vector3().subVectors(b,a),m=mesh(new THREE.CylinderGeometry(r2,r1,direction.length(),9),wood,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return m;}
  const tree=new THREE.Group();tree.position.set(0,height(0,-1),-1);island.add(tree);
  branch(new THREE.Vector3(0,0,0),new THREE.Vector3(.2,3.1,0),.42,.16,tree);
  const crownMat=new THREE.MeshStandardMaterial({color:'#efabc9',roughness:.86,emissive:'#ec8fb5',emissiveIntensity:0});
  const blossoms=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.62,1),crownMat,85);tree.add(blossoms);
  for(let j=0;j<7;j++){const a=j/7*Math.PI*2;branch(new THREE.Vector3(.1,1.7,0),new THREE.Vector3(Math.cos(a)*1.85,3.4+random()*.7,Math.sin(a)*1.65),.16,.05,tree);}
  for(let i=0;i<85;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*2.5;dummy.position.set(Math.cos(a)*r,3.3+Math.sqrt(Math.max(0,1-r*r/7))*1.55+random()*.45,Math.sin(a)*r*.8);dummy.rotation.set(random(),random(),random());dummy.scale.set(.7+random()*.65,.65+random()*.5,.7+random()*.6);dummy.updateMatrix();blossoms.setMatrixAt(i,dummy.matrix);blossoms.setColorAt(i,new THREE.Color().setHSL(.93+random()*.04,.45,.69+random()*.15));}blossoms.castShadow=true;
  const treeLight=new THREE.PointLight('#ffc6de',0,14,2);treeLight.position.set(0,3,-1);island.add(treeLight);
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const hx=haloCanvas.getContext('2d'),gradient=hx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'#ffe8ba');gradient.addColorStop(.25,'#ffbbd788');gradient.addColorStop(1,'#ffbbd700');hx.fillStyle=gradient;hx.fillRect(0,0,128,128);
  const haloTexture=new THREE.CanvasTexture(haloCanvas);const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(0,4,-1);halo.scale.set(10,10,1);island.add(halo);
  // Two suspended seats share a rose-gold A-frame.
  const swing=new THREE.Group();swing.position.set(3.7,height(3.7,-1.1),-1.1);swing.rotation.y=-.35;island.add(swing);
  for(const x of [-1.15,1.15])for(const z of [-.65,.65])branch(new THREE.Vector3(x,0,z),new THREE.Vector3(x,2.5,0),.065,.065,swing);
  branch(new THREE.Vector3(-1.35,2.5,0),new THREE.Vector3(1.35,2.5,0),.08,.08,swing);
  const seats=[],rope=new THREE.MeshStandardMaterial({color:'#f4d9bd'});
  for(const x of [-.55,.55]){const pivot=new THREE.Group();pivot.position.set(x,2.45,0);swing.add(pivot);for(const side of [-1,1]){const cord=mesh(new THREE.CylinderGeometry(.016,.016,1.8,5),rope,pivot);cord.position.set(side*.35,-.9,0);}const seat=mesh(new THREE.BoxGeometry(.85,.1,.5),wood,pivot);seat.position.y=-1.8;seats.push(pivot);}
  const stoneMat=new THREE.MeshStandardMaterial({color:'#ded2c4',roughness:1});
  for(let i=0;i<15;i++){const z=5.8-i*.43,x=Math.sin(i*.25)*.6;const stone=mesh(new THREE.CylinderGeometry(.34,.4,.11,7),stoneMat);stone.position.set(x,height(x,z)+.05,z);stone.rotation.y=i;stone.scale.z=.72;}
  const flowerSpots=[[-4.6,2.4],[-2.8,4.4],[-.9,5.2],[1.8,4.8],[4.2,3],[ -4.8,-1.3 ]];
  const flowers=[],pickables=[],openedSet=new Set(opened.filter(i=>Number.isInteger(i)&&i>=0&&i<6));
  const petalGeo=new THREE.SphereGeometry(1,12,8),stemMat=new THREE.MeshStandardMaterial({color:'#66845e',roughness:1});
  flowerSpots.forEach(([x,z],i)=>{const group=new THREE.Group();group.position.set(x,height(x,z),z);island.add(group);const stem=mesh(new THREE.CylinderGeometry(.035,.055,.9,7),stemMat,group);stem.position.y=.45;
    const head=new THREE.Group();head.position.y=1;group.add(head);const petals=[];const mat=new THREE.MeshStandardMaterial({color:['#ef9fc1','#c4a7e8','#f6d392','#e7a4d4','#b5c9f0','#f3b5a1'][i],roughness:.65});
    for(let j=0;j<7;j++){const pivot=new THREE.Group();pivot.rotation.y=j/7*Math.PI*2;head.add(pivot);const petal=mesh(petalGeo,mat,pivot);petal.scale.set(.19,.09,.39);petal.position.z=.33;petals.push(pivot);}
    const center=mesh(new THREE.SphereGeometry(.15,12,8),new THREE.MeshStandardMaterial({color:'#ffe2a2',emissive:'#ffd79a',emissiveIntensity:.25}),head);center.position.y=.08;
    const hit=new THREE.Mesh(new THREE.SphereGeometry(.65,10,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1;hit.userData.flower=i;group.add(hit);pickables.push(hit);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=labelCanvas.height=128;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#fff7ed';ctx.beginPath();ctx.arc(64,64,46,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8b5375';ctx.font='40px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('0'+(i+1),64,66);const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));label.position.y=1.9;label.scale.set(.48,.48,1);label.userData.flower=i;group.add(label);pickables.push(label);
    flowers.push({group,petals,bloom:openedSet.has(i)?1:0});
  });
  const butterflies=Array.from({length:7},(_,i)=>{const b=makeButterfly(['#ffcf99','#efafdd','#e4d7ff'],{id:'linh-garden'});b.group.scale.setScalar(1.4);island.add(b.group);return b;});
  const petals=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),new THREE.MeshStandardMaterial({color:'#f6bed7',roughness:.8}),mobile?45:85);island.add(petals);
  const petalSeeds=Array.from({length:petals.count},()=>({x:(random()-.5)*5,z:(random()-.5)*4-1,y:random()*6,phase:random()*7}));
  const cloudGroup=new THREE.Group();scene.add(cloudGroup);const clouds=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:'#f4eafa',roughness:1}),150);cloudGroup.add(clouds);
  for(let i=0;i<150;i++){const a=random()*Math.PI*2,r=9+random()*45;dummy.position.set(Math.cos(a)*r,-7.5+random()*2,Math.sin(a)*r);dummy.rotation.set(0,0,0);dummy.scale.set(3+random()*5,1+random()*1.7,2+random()*4);dummy.updateMatrix();clouds.setMatrixAt(i,dummy.matrix);}
  let active=true,stopped=paused,time=0,last=0,raf=0,pointer=null,angle=.12,elevation=.47,distance=23,targetDistance=23,glow=openedSet.size===6?1:0;
  const ray=new THREE.Raycaster(),events=[];const listen=(node,key,fn)=>{node.addEventListener(key,fn);events.push(()=>node.removeEventListener(key,fn));};
  function schedule(){if(active&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();targetDistance=Math.max(23,8.4/(Math.tan(THREE.MathUtils.degToRad(22))*camera.aspect));distance=targetDistance;schedule();}
  function frame(now){raf=0;if(!active||document.hidden)return;if(last&&now-last<32){schedule();return}const dt=last?Math.min(.06,(now-last)/1000):.033;last=now;if(!stopped)time+=dt;const blend=reduced?1:1-Math.exp(-dt*6);let moving=false;
    distance+=(targetDistance-distance)*blend;camera.position.set(Math.sin(angle)*distance,Math.sin(elevation)*distance+1,Math.cos(angle)*Math.cos(elevation)*distance);camera.lookAt(0,1,0);
    flowers.forEach((f,i)=>{const target=openedSet.has(i)?1:0;f.bloom+=(target-f.bloom)*blend;moving ||= Math.abs(target-f.bloom)>.002;f.petals.forEach(p=>{p.rotation.x=-1.15*(1-f.bloom);});});
    const goal=openedSet.size===6?1:0;glow+=(goal-glow)*blend;moving ||= Math.abs(goal-glow)>.002;crownMat.emissiveIntensity=glow*.65;treeLight.intensity=glow*16;halo.material.opacity=glow*.5;
    seats.forEach((s,i)=>s.rotation.x=Math.sin(time*.8+i*.7)*.12);cloudGroup.rotation.y=time*.006;
    butterflies.forEach((b,i)=>{const a=time*.18+i*2.4,r=2.8+i*.32;b.group.position.set(Math.cos(a)*r,1.8+Math.sin(time*.6+i)*.65,Math.sin(a)*r);b.group.rotation.y=-a;b.wings.forEach(w=>w.pivot.rotation.z=w.side*(.35+Math.sin(time*b.flapSpeed+b.flapPhase+(w.isBack?.35:0))*.95));});
    petalSeeds.forEach((p,i)=>{dummy.position.set(p.x+Math.sin(time*.5+p.phase)*.7,5.7-((time*.32+p.y)%5.6),p.z+Math.cos(time*.3+p.phase)*.5);dummy.rotation.set(time*.4+p.phase,time*.3,p.phase);dummy.scale.set(.07,.018,.13);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);});petals.instanceMatrix.needsUpdate=true;
    renderer.render(scene,camera);if(!stopped||moving||Math.abs(targetDistance-distance)>.005||pointer)schedule();
  }
  function select(i){if(!Number.isInteger(i)||i<0||i>=6)return;openedSet.add(i);schedule();}
  listen(canvas,'pointerdown',e=>{if(pointer||e.button>0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
  listen(canvas,'pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>6)pointer.moved=true;if(pointer.moved){angle-=(e.clientX-pointer.lx)*.005;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.ly)*.002,.2,.85);schedule();}pointer.lx=e.clientX;pointer.ly=e.clientY;});
  listen(canvas,'pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const tap=!pointer.moved;pointer=null;if(tap){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit)onSelect?.(hit.object.userData.flower);}schedule();});
  for(const key of ['pointercancel','lostpointercapture'])listen(canvas,key,()=>{pointer=null;});
  listen(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){angle=.12;elevation=.47;}else{angle+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;elevation=THREE.MathUtils.clamp(elevation+(e.key==='ArrowUp'?.06:e.key==='ArrowDown'?-.06:0),.2,.85);}schedule();});
  listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}last=0;schedule();});
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);host.dispatchEvent(new CustomEvent('garden-context-lost'));});
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  return {select,setPaused(value){stopped=value;last=0;schedule();},clearFocus(){angle=.12;elevation=.47;schedule();},dispose(){active=false;cancelAnimationFrame(raf);observer.disconnect();events.forEach(off=>off());const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});ms.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)ts.add(v);});m.dispose();});gs.forEach(g=>g.dispose());ts.forEach(t=>t.dispose());sunlight.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
