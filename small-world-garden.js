/* Small World — Copyright (c) 2026 Paul Robello, MIT.
Source: https://github.com/paulrobello/small-world tree 0416bbcf7dbc58b2782f13698c74ac1dde459613
Extracted terrain falloff/height and butterfly builder; catalog dependency removed.
See vendor/small-world/LICENSE. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const EDGE_RIM_Y=0, RIM_LEVEL_START=.35;
export function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
export function islandFalloff(center, x, z) {
  const sh = center.shape || { kind: "round" };
  const dx = x - center.cx;
  const dz = z - center.cz;
  const r = center.visualRadius ?? center.radius;
  if (sh.kind === "oblong") {
    const co = Math.cos(sh.orient), si = Math.sin(sh.orient);
    const lx = co * dx + si * dz;
    const lz = -si * dx + co * dz;
    const d = Math.sqrt((lx / sh.stretch) ** 2 + lz * lz);
    return smoothstep(r, r * 0.45, d);
  }
  if (sh.kind === "kidney") {
    const co = Math.cos(sh.orient), si = Math.sin(sh.orient);
    const lx = co * dx + si * dz;
    const lz = -si * dx + co * dz;
    const d = Math.sqrt(lx * lx + lz * lz);
    const f = smoothstep(r, r * 0.45, d);
    const biteCx = r * 0.6;
    const biteR = r * 0.42;
    const biteD = Math.sqrt((lx - biteCx) ** 2 + lz * lz);
    const bite = smoothstep(biteR, biteR * 0.2, biteD);
    return f * (1 - bite * sh.strength);
  }
  const d = Math.sqrt(dx * dx + dz * dz);
  return smoothstep(r, r * 0.45, d);
}
export function makeHeightFn(noise2D, layout, amp = 3.0) {
  return (x, z) => {
    let falloff = 0;
    for (const c of layout.centers) {
      const f = islandFalloff(c, x, z);
      if (f > falloff) falloff = f;
    }
    let h = 0;
    h += noise2D(x * 0.06, z * 0.06) * amp;
    h += noise2D(x * 0.14, z * 0.14) * (amp * 0.45);
    h += noise2D(x * 0.32, z * 0.32) * (amp * 0.18);
    // Smooth falloff at the edges — terrain tapers to base-plane level (~0)
    // along the island boundary rather than plunging into the void.
    h *= falloff;
    // Rim leveling: as falloff drops below the threshold, blend toward a
    // uniform edge height so the perimeter is flat and the grass ring
    // (fixed-Y RingGeometry) always sits flush with the terrain edge.
    if (falloff < RIM_LEVEL_START) {
      const t = smoothstep(0, RIM_LEVEL_START, falloff);
      h = EDGE_RIM_Y + (h - EDGE_RIM_Y) * t;
    }
    return h;
  };
}
export function makeButterfly(palette, biome) {
  const group = new THREE.Group();


  const c1 = palette[Math.floor(Math.random() * palette.length)];
  let c2 = palette[Math.floor(Math.random() * palette.length)];
  if (palette.length > 1 && c2 === c1)
    c2 = palette[(palette.indexOf(c1) + 1) % palette.length];

  // tiny dark body
  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.04, 0),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      flatShading: true,
      roughness: 0.5,
    })
  );
  body.scale.set(0.7, 0.7, 1.8);
  body.castShadow = true;
  group.add(body);

  // wing materials — two-tone (front + back wing pairs)
  const wingMat1 = new THREE.MeshStandardMaterial({
    color: new THREE.Color(c1),
    flatShading: true,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  const wingMat2 = new THREE.MeshStandardMaterial({
    color: new THREE.Color(c2),
    flatShading: true,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });

  const frontGeo = new THREE.IcosahedronGeometry(0.13, 1);
  frontGeo.scale(1.0, 0.05, 1.25);
  const backGeo = new THREE.IcosahedronGeometry(0.09, 1);
  backGeo.scale(1.0, 0.05, 1.0);

  const wings = [];
  // front (forewing) pair — larger, on the +Z (motion-forward) side
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.01, 0.04);
    group.add(pivot);
    const w = new THREE.Mesh(frontGeo, wingMat1);
    w.position.set(side * 0.15, 0, 0.04);
    w.castShadow = true;
    pivot.add(w);
    wings.push({ pivot, side, isBack: false });
  }
  // back (hindwing) pair — smaller, on the -Z (trailing) side
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.005, -0.04);
    group.add(pivot);
    const w = new THREE.Mesh(backGeo, wingMat2);
    w.position.set(side * 0.10, 0, -0.05);
    w.castShadow = true;
    pivot.add(w);
    wings.push({ pivot, side, isBack: true });
  }

  // 25% smaller overall (then another 25% smaller per user request)
  group.scale.setScalar(0.5625);

  return {
    group,
    wings,
    target: new THREE.Vector3(),
    hasTarget: false,
    state: "cruising", // "cruising" → flying to flower, "hovering" → near it
    holdUntil: 0,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 2
    ),
    flapPhase: Math.random() * Math.PI * 2,
    flapSpeed: 28 + Math.random() * 18,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 4.5 + Math.random() * 3,
  };
}

