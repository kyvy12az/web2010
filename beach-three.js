import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// A real WebGL scene: displaced ocean, textured terrain and raycastable glass bottles.
export function createBeach(container, { onSelect, paused = false } = {}) {
  const mobile = container.clientWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement; canvas.className = 'beach-canvas';canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Bãi biển 3D. Kéo để nhìn quanh, chạm chai để mở thư. Các nút chọn chai ở dưới màn hình.');
  container.append(canvas);
  const scene = new THREE.Scene();scene.fog = new THREE.FogExp2('#d6b5a2', .0032);
  const camera = new THREE.PerspectiveCamera(mobile ? 67 : 57, 1, .08, 2300);
  const home = new THREE.Vector3(0, 2.7, 13.5), homeLook = new THREE.Vector3(0, .7, -9);
  camera.position.copy(home);const look = homeLook.clone(), targetPosition = home.clone(), targetLook = homeLook.clone();
  const sunDirection = new THREE.Vector3(-.42, .16, -1).normalize();
  const skyMaterial = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    uniforms: { sunDirection: { value: sunDirection } },
    vertexShader: 'varying vec3 vSky; void main(){vSky=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `varying vec3 vSky;uniform vec3 sunDirection;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec3 d=normalize(vSky);float h=max(d.y,0.);float alignment=max(dot(d,sunDirection),0.);
      vec3 col=mix(vec3(.88,.57,.39),vec3(.18,.30,.46),pow(h,.45));
      col+=vec3(1.,.49,.18)*pow(alignment,18.)*.45;
      col+=vec3(1.,.80,.48)*smoothstep(.99965,.99986,alignment)*5.;
      vec2 uv=d.xz/max(.08,d.y)*.65;float cloud=noise(uv)*.55+noise(uv*2.3)*.28+noise(uv*5.)*.17;
      float mask=smoothstep(.56,.78,cloud)*smoothstep(.025,.16,d.y)*(1.-smoothstep(.45,.8,d.y));
      col=mix(col,vec3(.85,.66,.57),mask*.55);gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500,32,16),skyMaterial);scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentScene = new THREE.Scene();const environmentSky = new THREE.Mesh(new THREE.SphereGeometry(20,24,12),skyMaterial);environmentScene.add(environmentSky);
  const environment = pmrem.fromScene(environmentScene, .04, .1, 100);scene.environment=environment.texture;environmentSky.geometry.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#c4d7e3','#a88b63',1.6));
  const sunlight = new THREE.DirectionalLight('#ffd3a0',3.1);sunlight.position.copy(sunDirection).multiplyScalar(70);sunlight.castShadow=true;
  sunlight.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sunlight.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:.1,far:150});sunlight.shadow.bias=-.0003;sunlight.shadow.normalBias=.03;scene.add(sunlight);
  let seed=2010;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  function sandTexture(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');const image=x.createImageData(512,512);for(let y=0;y<512;y++)for(let i=0;i<512;i++){const n=(random()-.5)*35+Math.sin(y*.14+Math.sin(i*.025)*2)*7;const k=(y*512+i)*4;image.data[k]=190+n;image.data[k+1]=165+n;image.data[k+2]=127+n;image.data[k+3]=255}x.putImageData(image,0,0);const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(55,55);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;}
  const sand=sandTexture();
  const shore=x=>-5+Math.sin(x*.09)*1.3+Math.sin(x*.035)*1.8;
  const groundHeight=(x,z)=>{const inland=z-shore(x);return inland*.055+Math.sin(x*.8+z*.3)*.025+Math.sin(z*.6)*.02;};
  const groundGeometry=new THREE.PlaneGeometry(280,260,150,140);groundGeometry.rotateX(-Math.PI/2);groundGeometry.translate(0,0,40);
  const positions=groundGeometry.attributes.position;const colors=[];
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,groundHeight(x,z));const wet=THREE.MathUtils.smoothstep(z-shore(x),-1,5);const c=new THREE.Color().lerpColors(new THREE.Color('#8a8171'),new THREE.Color('#fff0d0'),wet);colors.push(c.r,c.g,c.b)}
  groundGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));groundGeometry.computeVertexNormals();
  const ground=new THREE.Mesh(groundGeometry,new THREE.MeshStandardMaterial({map:sand,bumpMap:sand,bumpScale:.055,vertexColors:true,roughness:.97}));ground.receiveShadow=true;scene.add(ground);
  const oceanMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},sunDirection:{value:sunDirection}},
    vertexShader:`uniform float time;varying vec3 vWorld;
      float coast(float x){return -5.+sin(x*.09)*1.3+sin(x*.035)*1.8;}
      void main(){vec3 p=position;float depth=coast(p.x)-p.z;float amount=smoothstep(0.,16.,depth);p.y=(sin(p.x*.24+p.z*.32-time*.85)*.13+sin(p.x*.61-p.z*.2-time*1.1)*.07)*amount;vWorld=p;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float time;uniform vec3 sunDirection;varying vec3 vWorld;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){float shore=-5.+sin(vWorld.x*.09)*1.3+sin(vWorld.x*.035)*1.8;float tide=sin(time*.48)*.7+sin(vWorld.x*.5+time*.6)*.17;float depth=shore-vWorld.z+tide;if(depth<0.)discard;
      float nx=cos(vWorld.x*.24+vWorld.z*.32-time*.85)*.031+cos(vWorld.x*.61-vWorld.z*.2-time*1.1)*.043;
      float nz=cos(vWorld.x*.24+vWorld.z*.32-time*.85)*.042-cos(vWorld.x*.61-vWorld.z*.2-time*1.1)*.014;
      nx+=(noise(vWorld.xz*2.3+time*.13)-.5)*.11;nz+=(noise(vWorld.zx*2.7-time*.1)-.5)*.11;
      vec3 n=normalize(vec3(-nx,1.,-nz)),v=normalize(cameraPosition-vWorld);float fresnel=pow(1.-max(dot(v,n),0.),4.);
      vec3 shallow=vec3(.26,.43,.40),deep=vec3(.025,.16,.21);vec3 water=mix(shallow,deep,smoothstep(0.,28.,depth));
      vec3 reflection=mix(vec3(.48,.40,.38),vec3(.18,.28,.36),max(reflect(-v,n).y,0.));water=mix(water,reflection,.22+fresnel*.65);
      vec3 halfway=normalize(v+sunDirection);float spec=pow(max(dot(n,halfway),0.),200.);water+=vec3(1.,.68,.34)*spec*2.8;
      float grain=noise(vWorld.xz*4.);float edge=1.-smoothstep(.1,1.25,depth);float breaker=pow(max(0.,sin(depth*1.1-time*.6)),18.)*(1.-smoothstep(0.,10.,depth));float foam=(edge*.85+breaker*.28)*smoothstep(.2,.65,grain);water=mix(water,vec3(.92,.87,.75),clamp(foam,0.,1.));
      float haze=1.-exp(-length(cameraPosition-vWorld)*.0015);water=mix(water,vec3(.65,.52,.43),haze);gl_FragColor=vec4(water,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
  });
  const oceanGeometry=new THREE.PlaneGeometry(2400,2400,mobile?160:260,mobile?160:260);oceanGeometry.rotateX(-Math.PI/2);
  const ocean=new THREE.Mesh(oceanGeometry,oceanMaterial);ocean.frustumCulled=false;scene.add(ocean);
  const stoneMaterial=new THREE.MeshStandardMaterial({color:'#867e75',roughness:.94});
  for(let i=0;i<28;i++){const x=(random()-.5)*65,z=random()*25-3;if(Math.abs(x)<5&&z>3)continue;const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.15+random()*.7,1),stoneMaterial);rock.position.set(x,groundHeight(x,z),z);rock.scale.set(1.5,.6+random()*.7,1);rock.rotation.set(random(),random()*6,random());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);}
  const cliffMat=new THREE.MeshStandardMaterial({color:'#716d73',roughness:1});
  for(let i=0;i<7;i++){const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),cliffMat);rock.position.set(-100-i*22,5,-170-i*22);rock.scale.set(27,10+random()*14,20);scene.add(rock)}
  // Curved palm trunks and individually modelled fronds frame the shore.
  const bark=new THREE.MeshStandardMaterial({color:'#715844',roughness:1});const leafMat=new THREE.MeshStandardMaterial({color:'#344a32',roughness:.9,side:THREE.DoubleSide});const leafMatrices=[];
  function palm(x,z,height){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,groundHeight(x,z),z),new THREE.Vector3(x+.6,height*.45,z),new THREE.Vector3(x+1.5,height,z-.6)]);const trunk=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.16,7,false),bark);trunk.castShadow=true;scene.add(trunk);const top=curve.getPoint(1);
    for(let f=0;f<9;f++){const a=f/9*Math.PI*2;for(let j=0;j<10;j++){const u=j/10,r=.25+u*3.1,y=.25+Math.sin(u*Math.PI)*.6-u*u*1.2;for(const side of [-1,1]){const leaf=new THREE.Object3D();leaf.position.set(top.x+Math.cos(a)*r,top.y+y,top.z+Math.sin(a)*r);leaf.rotation.set(-.7,a+side*.7,side*.5);leaf.scale.y=1-u*.65;leaf.updateMatrix();leafMatrices.push(leaf.matrix.clone())}}}}
  palm(-10,1,7);palm(-15,8,9);palm(17,-1,8);
  const foliage=new THREE.InstancedMesh(new THREE.PlaneGeometry(.18,1.1),leafMat,leafMatrices.length);leafMatrices.forEach((matrix,i)=>foliage.setMatrixAt(i,matrix));foliage.castShadow=!mobile;scene.add(foliage);
  const bottles=[],pickables=[];
  const glass=new THREE.MeshPhysicalMaterial({color:'#b2d3bc',metalness:0,roughness:.13,transmission:.8,thickness:.16,ior:1.45,envMapIntensity:1.4,transparent:true,opacity:.92});
  const corkMaterial=new THREE.MeshStandardMaterial({color:'#97714e',roughness:1});
  const paperMaterial=new THREE.MeshStandardMaterial({color:'#f7dfb4',roughness:.85});
  const shape=[[0,0],[.18,0],[.24,.06],[.25,.67],[.23,.82],[.12,.95],[.105,1.18],[.13,1.2],[.13,1.27],[.09,1.27],[.085,1.17],[.085,.96],[.19,.8],[.21,.1],[0,.1]].map(([x,y])=>new THREE.Vector2(x,y));
  [[-3.1,5.5],[0,3.7],[3,5.7]].forEach(([x,z],i)=>{
    const group=new THREE.Group();group.position.set(x,groundHeight(x,z)+.015,z);group.rotation.z=[-.12,.06,.16][i];
    const body=new THREE.Mesh(new THREE.LatheGeometry(shape,32),glass);body.castShadow=true;body.userData.bottle=i;group.add(body);pickables.push(body);
    const cork=new THREE.Mesh(new THREE.CylinderGeometry(.087,.09,.18,12),corkMaterial);cork.position.y=1.29;group.add(cork);
    const paper=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.58,16),paperMaterial);paper.position.y=.44;paper.rotation.z=.16;group.add(paper);
    const tagCanvas=document.createElement('canvas');tagCanvas.width=tagCanvas.height=128;const tx=tagCanvas.getContext('2d');tx.fillStyle='rgba(255,241,215,.92)';tx.beginPath();tx.arc(64,64,44,0,Math.PI*2);tx.fill();tx.fillStyle='#685242';tx.textAlign='center';tx.textBaseline='middle';tx.font='500 38px sans-serif';tx.fillText('0'+(i+1),64,66);
    const texture=new THREE.CanvasTexture(tagCanvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));label.position.y=1.8;label.scale.set(.55,.55,1);label.userData.bottle=i;group.add(label);pickables.push(label);
    scene.add(group);bottles.push({group,cork,paper,selected:false});
  });
  let active=true,stopped=paused,raf=0,last=0,time=0,selected=-1,pointer=null,yaw=0,pitch=0;
  const raycaster=new THREE.Raycaster();const listeners=[];
  function listen(node,event,fn,options){node.addEventListener(event,fn,options);listeners.push(()=>node.removeEventListener(event,fn,options));}
  function schedule(){if(active&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();schedule();}
  function frame(now){raf=0;if(!active||document.hidden)return;if(last&&now-last<30){schedule();return;}const dt=last?Math.min(.05,(now-last)/1000):.033;last=now;if(!stopped)time+=dt;oceanMaterial.uniforms.time.value=time;
    const blend=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-dt*5);camera.position.lerp(targetPosition,blend);look.lerp(targetLook,blend);camera.lookAt(look);
    let moving=camera.position.distanceTo(targetPosition)+look.distanceTo(targetLook)>.002;
    bottles.forEach((b,i)=>{const target=i===selected?1.78:1.29;const diff=target-b.cork.position.y;b.cork.position.y+=diff*blend;b.cork.rotation.z=i===selected?.35:0;b.paper.position.y+=(i===selected?.83-b.paper.position.y:.44-b.paper.position.y)*blend;moving=moving||Math.abs(diff)>.002;});
    renderer.render(scene,camera);if(!stopped||moving||pointer)schedule();
  }
  function select(i){selected=i;const b=bottles[i];if(!b)return;const p=b.group.position;targetPosition.set(p.x+1.1,p.y+2.1,p.z+4.5);targetLook.set(p.x,p.y+.8,p.z);schedule();}
  function clearFocus(){selected=-1;targetPosition.copy(home);targetLook.copy(homeLook);yaw=pitch=0;schedule();}
  function lookAround(dx,dy){selected=-1;yaw=THREE.MathUtils.clamp(yaw+dx,-.95,.95);pitch=THREE.MathUtils.clamp(pitch+dy,-.25,.32);targetPosition.copy(home);targetLook.set(Math.sin(yaw)*22,homeLook.y+pitch*16,home.z-Math.cos(yaw)*22);schedule();}
  listen(canvas,'pointerdown',e=>{if(pointer||e.button>0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
  listen(canvas,'pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>6)pointer.moved=true;if(pointer.moved)lookAround(-(e.clientX-pointer.lastX)*.003,(e.clientY-pointer.lastY)*.002);pointer.lastX=e.clientX;pointer.lastY=e.clientY;});
  listen(canvas,'pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const tapped=!pointer.moved;pointer=null;if(tapped){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=raycaster.intersectObjects(pickables,false)[0];if(hit)onSelect?.(hit.object.userData.bottle)}schedule()});
  listen(canvas,'pointercancel',()=>{pointer=null});listen(canvas,'lostpointercapture',()=>{pointer=null});
  listen(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key==='Home')clearFocus();else lookAround(e.key==='ArrowLeft'?-.08:e.key==='ArrowRight'?.08:0,e.key==='ArrowUp'?.04:e.key==='ArrowDown'?-.04:0)});
  listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else schedule()});
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);container.dispatchEvent(new CustomEvent('beach-context-lost'))});
  const observer=new ResizeObserver(resize);observer.observe(container);resize();schedule();
  return {select,clearFocus,setPaused(value){stopped=value;schedule()},dispose(){active=false;cancelAnimationFrame(raf);observer.disconnect();listeners.forEach(fn=>fn());const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)for(const m of Array.isArray(obj.material)?obj.material:[obj.material])materials.add(m)});for(const material of materials){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose()}geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());environment.dispose();sunlight.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
