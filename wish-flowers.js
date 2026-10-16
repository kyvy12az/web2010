import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// Shared geometry batches keep a dense moonlit meadow inexpensive on phones.
export function addWishFlowers(scene, heightAt, mobile) {
  let seed=201020;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const count=mobile?320:560,clock={value:0};
  function material(options){const mat=new THREE.MeshStandardMaterial(options);
    mat.onBeforeCompile=shader=>{shader.uniforms.flowerTime=clock;shader.vertexShader='uniform float flowerTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`vec4 flowerWorld = instanceMatrix * vec4(transformed, 1.0);
      float flowerHeight = max(0.0, flowerWorld.y - (1.3 * exp(-dot(flowerWorld.xz, flowerWorld.xz) / 80.0) - 0.1));
      flowerWorld.x += sin(flowerTime * 0.65 + flowerWorld.x * 0.55 + flowerWorld.z * 0.4) * 0.055 * flowerHeight;
      flowerWorld.z += cos(flowerTime * 0.5 + flowerWorld.z * 0.6) * 0.035 * flowerHeight;
      vec4 mvPosition = modelViewMatrix * flowerWorld;
      gl_Position = projectionMatrix * mvPosition;`);};
    mat.customProgramCacheKey=()=> 'wish-meadow-v1';return mat;
  }
  const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.02,1,5),material({color:'#7caa91',roughness:1}),count);
  const leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),material({color:'#83ad9a',roughness:.9}),count*2);
  const petals=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,5),material({color:'#ffffff',roughness:.72,emissive:'#827095',emissiveIntensity:.2}),count*7);
  const centers=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,5),material({color:'#ffe5aa',roughness:.8,emissive:'#d8a05b',emissiveIntensity:.3}),count);
  const palettes=['#f8b5d4','#c0a5ef','#f9eaf5','#9cb9ef','#e3b4ed','#f0c5aa'];
  const clusters=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,r=3.2+random()*5;return {x:Math.cos(a)*r,z:Math.sin(a)*r};});
  const object=new THREE.Object3D();
  function place(batch,i,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){object.position.set(x,y,z);object.scale.set(sx,sy,sz);object.rotation.set(rx,ry,rz);object.updateMatrix();batch.setMatrixAt(i,object.matrix);}
  for(let i=0;i<count;i++){
    const cluster=clusters[i%clusters.length],a=random()*Math.PI*2,r=Math.sqrt(random())*2.4;
    let x=cluster.x+Math.cos(a)*r,z=cluster.z+Math.sin(a)*r;
    // Leave a small winding approach beneath the tree and keep its trunk clear.
    if(Math.hypot(x,z)<1.4)x+=x<0?-1.7:1.7;
    if(z>0&&Math.abs(x-Math.sin(z*.45)*.6)<.7)x+=x<0?-1.2:1.2;
    const y=heightAt(x,z)+.045,h=.35+random()*.55,size=.65+random()*.55,type=i%3;
    place(stems,i,x,y+h/2,z,1,h,1);
    for(let j=0;j<2;j++){const sign=j?1:-1;place(leaves,i*2+j,x+sign*.09,y+h*(.32+j*.2),z,.14*size,.025,.055,0,sign*.8,sign*.4);}
    const color=new THREE.Color(palettes[Math.floor(random()*palettes.length)]),turn=random()*6.28;
    for(let j=0;j<7;j++){const angle=j/7*Math.PI*2+turn,reach=(type===0?.14:.19)*size;place(petals,i*7+j,x+Math.cos(angle)*reach,y+h+(type===2?.025:0),z+Math.sin(angle)*reach,(type===0?.145:.19)*size,.035*size,(type===1?.07:.09)*size,0,-angle,type===2?.15:0);petals.setColorAt(i*7+j,color);}
    place(centers,i,x,y+h+.025,z,.07*size,.045*size,.07*size);
  }
  for(const [name,batch] of [['stems',stems],['leaves',leaves],['petals',petals],['centers',centers]]){batch.name='wish-flowers-'+name;batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);}
  return {update(time){clock.value=time;}};
}
