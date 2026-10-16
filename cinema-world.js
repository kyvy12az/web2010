/* Ngày đẹp: a private screening for Linh. Loaded after PlanetWorlds, before Universe. */
(() => {
  'use strict';
  const worlds = window.PlanetWorlds;
  const dialog = document.createElement('dialog'); dialog.className = 'memory-cinema'; dialog.setAttribute('aria-labelledby', 'cinemaTitle');
  dialog.innerHTML = `<div class="cinema-stage"></div><header class="cinema-top"><button type="button" data-action="back">← Về vũ trụ</button><div><small>HÀNH TINH 02 · NGÀY ĐẸP</small><h2 id="cinemaTitle">Rạp kỷ niệm</h2></div><button type="button" data-action="view">Toàn cảnh</button></header><div class="cinema-ticket"><span>SUẤT CHIẾU ĐẶC BIỆT · 20/10</span><h3>Những ngày đẹp<br>có Linh</h3><p>Hai chiếc ghế cạnh nhau.<br>Một bộ phim mang tên chúng mình.</p><div class="cinema-ticket-stub"><span>KHÁN GIẢ<br><b>Linh & anh</b></span><span>HÀNG GHẾ<br><b>D · 05 / 06</b></span></div><button type="button" data-action="start" disabled>Đang chuẩn bị rạp…</button></div><p class="cinema-status" role="status" aria-live="polite">Đang mở cửa rạp…</p><footer class="cinema-controls" hidden><div><button type="button" data-action="play">Tạm dừng</button><button type="button" data-action="voice" aria-pressed="true">Lời nhắn ♫</button><button type="button" data-action="restart">Chiếu lại ↻</button></div><div class="cinema-seats" role="group" aria-label="Chọn góc ngồi"><button type="button" data-seat="34">Ghế của Linh</button><button type="button" data-seat="35">Ghế cạnh bên</button><button type="button" data-seat="54">Hàng cuối</button></div><small>Kéo để nhìn quanh · Chạm ghế để đổi chỗ</small></footer>`;
  document.body.append(dialog);
  const $ = s => dialog.querySelector(s), stage = $('.cinema-stage'), status = $('.cinema-status'), ticket = $('.cinema-ticket'), controls = $('.cinema-controls');
  const button = action => $(`[data-action="${action}"]`);
  let scene = null, token = 0, origin = null, overflow = '', voice = null, music = null, resumeMusic = false, started = false, paused = false, voiceEnabled = true, ended = false;
  let explored = false; try { explored = localStorage.getItem('linh-cinema-seen') === '1'; } catch {}
  function pause(value) { paused = value; scene?.pause(value); button('play').textContent = value ? 'Tiếp tục' : 'Tạm dừng'; if (value) voice?.pause(); else if (voiceEnabled && !ended) playVoice(); }
  function playVoice() { if (!voice || voice.ended) return; voice.play().catch(() => { if (dialog.open) status.textContent = 'Chạm “Lời nhắn” để bật âm thanh; ảnh vẫn tiếp tục chiếu.'; }); }
  function finish() { ended = true; paused = true; voice?.pause(); button('play').textContent = 'Đã hết phim'; button('play').disabled = true; status.textContent = 'Câu chuyện của chúng mình vẫn đang tiếp tục… ♡'; explored = true; try { localStorage.setItem('linh-cinema-seen', '1'); } catch {} window.dispatchEvent(new CustomEvent('planet-world-explored')); }
  function start() { if (!scene) return; started = true; ended = false; paused = false; ticket.hidden = true; controls.hidden = false; button('play').disabled = false; button('play').textContent = 'Tạm dừng'; voice.currentTime = 0; if (voiceEnabled) playVoice(); scene.start(Number.isFinite(voice.duration) ? voice.duration + 10 : 65); status.textContent = 'Suất chiếu dành riêng cho Linh'; }
  async function enter() {
    if (dialog.open || document.querySelector('.planet-world[open]')) return;
    const mine = ++token; origin = document.activeElement; overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    started = paused = ended = false; ticket.hidden = false; controls.hidden = true; button('start').disabled = true; button('start').textContent = 'Đang chuẩn bị rạp…'; status.textContent = 'Đang mở cửa rạp…';
    voiceEnabled = true; button('voice').setAttribute('aria-pressed', 'true'); button('voice').textContent = 'Lời nhắn ♫';
    music = document.getElementById('backgroundMusic'); resumeMusic = Boolean(music && !music.paused); music?.pause();
    voice = new Audio('personals/voice.mp3'); voice.preload = 'auto'; voice.addEventListener('error', () => { if (mine === token && dialog.open) status.textContent = 'Chưa tải được lời ghi âm. Linh vẫn có thể xem ảnh kỷ niệm nhé.'; }); voice.load();
    voice.addEventListener('loadedmetadata', () => { if (mine === token && started) scene?.setDuration(voice.duration + 10); });
    dialog.showModal(); button('back').focus(); window.dispatchEvent(new CustomEvent('planet-world-toggle', { detail: { open: true } }));
    try { const module = await import('./cinema-three.js'); if (mine !== token || !dialog.open) return;
      scene = module.createCinema(stage, { memories: window.universeData?.getMemories() || [], onSeat: id => { status.textContent = 'Đang ngồi ghế ' + id; }, onEnd: finish });
      button('start').disabled = false; button('start').textContent = 'Mời Linh vào rạp →'; status.textContent = 'Vé của Linh đã sẵn sàng';
    } catch (error) { if (mine !== token) return; console.error(error); button('start').textContent = 'Thử mở lại rạp'; button('start').disabled = true; status.textContent = 'Chưa tải được rạp 3D. Linh quay về vũ trụ rồi thử lại; trình duyệt cần hỗ trợ WebGL và kết nối mạng.'; }
  }
  button('back').addEventListener('click', () => dialog.close()); button('start').addEventListener('click', start); button('restart').addEventListener('click', start);
  button('play').addEventListener('click', () => { if (!ended) pause(!paused); });
  button('voice').addEventListener('click', () => { if (!voice) return; if (voiceEnabled && !voice.paused) { voiceEnabled = false; voice.pause(); } else { voiceEnabled = true; if (!paused && !ended) playVoice(); } button('voice').setAttribute('aria-pressed', String(voiceEnabled)); button('voice').textContent = voiceEnabled ? 'Lời nhắn ♫' : 'Lời nhắn đã tắt'; });
  button('view').addEventListener('click', () => scene?.overview());
  dialog.querySelectorAll('[data-seat]').forEach(b => b.addEventListener('click', () => scene?.seat(Number(b.dataset.seat))));
  dialog.addEventListener('keydown', e => e.stopPropagation());
  stage.addEventListener('cinema-context-lost', () => { pause(true); status.textContent = 'Rạp đã tạm dừng. Linh quay về vũ trụ rồi mở lại nhé.'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dialog.open && started && !ended) pause(true); });
  dialog.addEventListener('close', () => { token++; scene?.dispose(); scene = null; stage.replaceChildren(); voice?.pause(); if (voice) { voice.removeAttribute('src'); voice.load(); } voice = null; document.body.style.overflow = overflow; if (resumeMusic) music?.play().catch(() => {}); window.dispatchEvent(new CustomEvent('planet-world-toggle', { detail: { open: false } })); if (origin?.isConnected) origin.focus({ preventScroll: true }); });
  window.PlanetWorlds = { has: id => id === 1 || worlds.has(id), isExplored: id => id === 1 ? explored : worlds.isExplored(id), open: id => { if (id === 1) return enter(); else if (!dialog.open) return worlds.open(id); } };
})();
