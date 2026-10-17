import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { buildSeatGeometry, buildSeats } from './vantage-geometry.js';

// Room, projection and playback are local additions. Chair geometry/rows come from Vantage.
export function createCinema(host, { memories = [], onSeat = () => {}, onEnd = () => {} } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: host.clientWidth > 700 });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, host.clientWidth < 700 ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const canvas = renderer.domElement; canvas.className = 'cinema-canvas'; canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Rạp kỷ niệm 3D. Kéo để nhìn quanh, chạm ghế để đổi chỗ.'); host.append(canvas);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#09070c');
  const camera = new THREE.PerspectiveCamera(55, 1, .08, 100);
  const cfg = { seed: 2010, firstRowZ: -1.5, rowSpacing: 1.5, rise: .32, gapX: .83, curve: .35, defaultSeat: 'D-5', rows: Array.from({ length: 6 }, (_, i) => ({ r: 'ABCDEF'[i], blocks: [2, 6, 2], cat: 'memory' })) };
  const { seats, zScreen } = buildSeats(cfg);
  const chairGeometry = buildSeatGeometry();
  const chairs = new THREE.InstancedMesh(chairGeometry, new THREE.MeshStandardMaterial({ color: '#a43b56', vertexColors: true, roughness: .88 }), seats.length);
  const dummy = new THREE.Object3D();
  seats.forEach((s, i) => { dummy.position.copy(s.pos); dummy.rotation.set(0, s.yaw, 0); dummy.updateMatrix(); chairs.setMatrixAt(i, dummy.matrix); chairs.setColorAt(i, new THREE.Color(s.id === 'D-5' || s.id === 'D-6' ? '#ffdea2' : '#ffffff')); });
  scene.add(chairs);
  function box(w, h, d, x, y, z, color, glow = false) {
    const material = glow ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color, roughness: .85 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); scene.add(mesh); return mesh;
  }
  const wall = '#241923', gold = '#e8ad72';
  box(16, .2, 21, 0, -.2, 1, '#21131d');
  for (let r = 0; r < 6; r++) {
    const z = cfg.firstRowZ + r * cfg.rowSpacing, y = r * cfg.rise;
    box(16, .18 + y, 1.5, 0, y / 2 - .09, z + .1, r % 2 ? '#34202a' : '#281923');
    for (const x of [-cfg._aisleX, cfg._aisleX]) {
      for (let k = 0; k < 3; k++) { const sy = y - .32 + (k + 1) * .32 / 3; if (sy < 0) continue; box(1.1, .11, .3, x, sy - .06, z - .65 + k * .3, '#3e2831'); box(1.03, .018, .035, x, sy, z - .79 + k * .3, gold, true); }
    }
  }
  box(.25, 8, 20, -8, 3.8, 1, wall); box(.25, 8, 20, 8, 3.8, 1, wall);
  box(16, 8, .25, 0, 3.8, 10, wall); box(16, 8, .25, 0, 3.8, -9, '#120f17'); box(16, .2, 20, 0, 7.7, 1, '#12121b');
  for (const sign of [-1, 1]) {
    box(.045, .045, 18, sign * 7.7, 7.3, .5, gold, true);
    for (let i = 0; i < 7; i++) { const z = -6.5 + i * 2.3; box(.16, 4.5, 1.3, sign * 7.78, 3.4, z, '#462635'); box(.2, .65, .05, sign * 7.62, 3.6, z, gold, true); }
  }
  box(11.7, 5.8, .3, 0, 3.4, zScreen - .18, '#080709');
  box(12, .25, .8, 0, .45, zScreen + .2, '#4e2935');
  const ambient = new THREE.HemisphereLight('#c7c3ef', '#46252c', 1.2); scene.add(ambient);
  const screenLight = new THREE.PointLight('#ffe5c6', 70, 24, 2); screenLight.position.set(0, 4.8, zScreen + 2); scene.add(screenLight);
  for (const x of [-6, 6]) { const light = new THREE.PointLight('#ffb475', 35, 17, 2); light.position.set(x, 5, 2); scene.add(light); }
  const projection = document.createElement('canvas'); projection.width = 1600; projection.height = 900;
  const ctx = projection.getContext('2d'); const screenTexture = new THREE.CanvasTexture(projection); screenTexture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 6.075), new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })); screen.position.set(0, 3.6, zScreen + .02); scene.add(screen);
  // Pleated side-parting velvet, with pivots at the proscenium edges.
  const curtains = [];
  const velvet = new THREE.MeshStandardMaterial({ color: '#65162e', roughness: .95 });
  const foldGeometry = new THREE.CylinderGeometry(.23, .25, 6.5, 10);
  for (const sign of [-1, 1]) { const panel = new THREE.Group(); panel.position.set(sign * 5.85, 3.55, zScreen + .36); for (let k = 0; k <= 16; k++) { const fold = new THREE.Mesh(foldGeometry, velvet); fold.position.x = -sign * k * .37; panel.add(fold); } scene.add(panel); curtains.push(panel); }
  box(12.3, .45, .5, 0, 7, zScreen + .35, '#652438');
  const stars = new THREE.BufferGeometry(), points = []; for (let i = 0; i < 95; i++) points.push(Math.sin(i * 79.3) * 7.2, 7.54, Math.sin(i * 33.1) * 8 + .5);
  stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#ffe8ca', size: .035 })));
  let disposed = false, raf = 0, last = 0, elapsed = 0, duration = 52, playing = false, started = false, ended = false, pointer = null, yaw = 0, pitch = 0, lastSlide = -2;
  const images = memories.map(m => { const img = new Image(); img.onload = () => { lastSlide = -2; schedule(); }; img.onerror = () => { lastSlide = -2; schedule(); }; img.src = m.src || ''; return img; });
  const target = new THREE.Vector3(0, 4.4, 9), aim = new THREE.Vector3(0, 3.5, zScreen);
  camera.position.copy(target); camera.lookAt(aim);
  function title(text, y, size = 64, color = '#f6dfbe') { ctx.fillStyle = color; ctx.font = `${size}px Quicksand, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(text, 800, y, 1450); }
  function drawScreen() {
    const contentStart = 5, contentEnd = duration - 7;
    const slide = !started || elapsed < contentStart ? -1 : elapsed >= contentEnd ? images.length : Math.min(images.length - 1, Math.floor((elapsed - contentStart) / (contentEnd - contentStart) * images.length));
    if (slide === lastSlide) return; lastSlide = slide;
    ctx.fillStyle = '#120d17'; ctx.fillRect(0, 0, 1600, 900); ctx.strokeStyle = '#a87552'; ctx.lineWidth = 2; ctx.strokeRect(45, 45, 1510, 810);
    if (slide === -1) { title('RẠP KỶ NIỆM', 265, 36); title('Những ngày đẹp có Linh', 445, 83); title('Một suất chiếu chỉ dành cho chúng mình · 20/10', 570, 30); }
    else if (slide >= images.length) { title('Câu chuyện của chúng mình', 330, 67); title('vẫn đang tiếp tục…', 440, 76); title('Chúc Linh một ngày 20/10 thật dịu dàng ♡', 590, 35); }
    else { const img = images[slide]; if (img.complete && img.naturalWidth) { const scale = Math.min(1480 / img.naturalWidth, 690 / img.naturalHeight); const w = img.naturalWidth * scale, h = img.naturalHeight * scale; ctx.drawImage(img, (1600 - w) / 2, 65 + (690 - h) / 2, w, h); } else title('Một khoảnh khắc của chúng mình', 410, 58); title(memories[slide]?.caption || 'Một ngày đẹp có Linh', 814, 35); }
    screenTexture.needsUpdate = true;
  }
  function schedule() { if (!disposed && !document.hidden && !raf) raf = requestAnimationFrame(frame); }
  function frame(now) { raf = 0; if (disposed || document.hidden) return; const dt = last ? Math.min(.06, (now - last) / 1000) : 0; last = now;
    if (playing) { elapsed = Math.min(duration, elapsed + dt); if (elapsed >= duration && !ended) { playing = false; ended = true; onEnd(); } }
    const b = reduced ? 1 : 1 - Math.exp(-dt * 3); camera.position.lerp(target, b);
    camera.lookAt(aim.x + Math.sin(yaw) * 12, aim.y + pitch * 8, aim.z);
    const opening = started ? (reduced ? 1 : Math.min(1, elapsed / 3)) : 0;
    curtains.forEach(c => { c.scale.x = 1 - opening * .94; }); ambient.intensity = 1.2 - opening * .55;
    drawScreen(); renderer.render(scene, camera);
    if (playing || camera.position.distanceTo(target) > .005 || pointer) schedule();
  }
  function fitProjection() { camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan(6.3 / (Math.max(6, target.z - zScreen) * camera.aspect))), 55, 115); camera.updateProjectionMatrix(); }
  function seat(index) { const s = seats[index]; if (!s) return; target.set(s.pos.x, s.pos.y + 1.12, s.pos.z + .05); fitProjection(); yaw = pitch = 0; onSeat(s.id); schedule(); }
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; fitProjection(); schedule(); }
  const events = []; const listen = (node, name, fn) => { node.addEventListener(name, fn); events.push(() => node.removeEventListener(name, fn)); };
  const ray = new THREE.Raycaster();
  listen(canvas, 'pointerdown', e => { if (pointer || e.button > 0) return; pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); });
  listen(canvas, 'pointermove', e => { if (!pointer || pointer.id !== e.pointerId) return; if (Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 6) pointer.moved = true; if (pointer.moved) { yaw = THREE.MathUtils.clamp(yaw - (e.clientX - pointer.lx) * .005, -.9, .9); pitch = THREE.MathUtils.clamp(pitch + (e.clientY - pointer.ly) * .003, -.5, .5); schedule(); } pointer.lx = e.clientX; pointer.ly = e.clientY; });
  listen(canvas, 'pointerup', e => { if (!pointer || pointer.id !== e.pointerId) return; const tap = !pointer.moved; pointer = null; if (tap) { const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera); const hit = ray.intersectObject(chairs)[0]; if (hit) seat(hit.instanceId); } });
  for (const event of ['pointercancel', 'lostpointercapture']) listen(canvas, event, () => { pointer = null; });
  listen(canvas, 'keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return; e.preventDefault(); if (e.key === 'Home') yaw = pitch = 0; else { yaw = THREE.MathUtils.clamp(yaw + (e.key === 'ArrowLeft' ? -.08 : e.key === 'ArrowRight' ? .08 : 0), -.9, .9); pitch = THREE.MathUtils.clamp(pitch + (e.key === 'ArrowUp' ? .06 : e.key === 'ArrowDown' ? -.06 : 0), -.5, .5); } schedule(); });
  listen(document, 'visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } last = 0; schedule(); });
  listen(canvas, 'webglcontextlost', e => { e.preventDefault(); playing = false; host.dispatchEvent(new CustomEvent('cinema-context-lost')); });
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  return {
    setDuration(seconds) { if (Number.isFinite(seconds)) duration = Math.max(45, seconds); },
    start(seconds = 52) { duration = Math.max(45, seconds); elapsed = 0; started = true; ended = false; playing = true; lastSlide = -2; seat(34); schedule(); },
    pause(value) { playing = !value && started && !ended; last = 0; schedule(); },
    seat, overview() { target.set(0, 4.4, 9); fitProjection(); yaw = pitch = 0; schedule(); },
    dispose() { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); events.forEach(off => off()); images.forEach(img => { img.onload = img.onerror = null; }); const gs = new Set(), ms = new Set(); scene.traverse(o => { if (o.geometry) gs.add(o.geometry); if (o.material) ms.add(o.material); }); gs.forEach(g => g.dispose()); ms.forEach(m => m.dispose()); screenTexture.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); }
  };
}
