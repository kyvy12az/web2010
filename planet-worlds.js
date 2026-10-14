/* Two explorable CSS 3D worlds; all personal images come from the existing album. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const messages=[
    'Anh thích nụ cười của Linh. Chỉ một khoảnh khắc nhỏ thôi cũng đủ làm ngày của anh sáng hơn.',
    'Có những tấm ảnh đẹp vì ánh sáng. Với anh, tấm này đẹp vì có Linh.',
    'Anh muốn giữ lại những phút giây giản dị như thế này, để sau này mình cùng nhìn lại.',
    'Mỗi lần cùng Linh đi đâu đó, anh lại có thêm một điều để nhớ.',
    'Chẳng cần một ngày thật đặc biệt. Được ở cạnh Linh đã là điều anh trân trọng.',
    'Mong những ngày phía trước, mình còn chụp thêm thật nhiều nụ cười như thế.'
  ];
  const letters=[
    {title:'Một chút nghỉ ngơi',text:'Nếu hôm nay mệt quá, Linh cứ nghỉ một chút nhé. Không cần phải làm mọi thứ thật hoàn hảo. Anh mong Linh cũng dịu dàng với chính mình.'},
    {title:'Linh không phải vội',text:'Có những ngày chỉ cần đi chậm lại, ăn một bữa ngon và hít thở thật sâu. Những điều chưa xong có thể đợi. Linh cũng xứng đáng được chăm sóc.'},
    {title:'Một nơi để trở về',text:'Khi muốn kể chuyện, anh mong mình sẽ là người Linh nghĩ đến. Chuyện vui hay một ngày không ổn cũng được. Anh muốn lắng nghe Linh.'}
  ];
  const scenes={0:{key:'smile',title:'Khu vườn của những nụ cười',subtitle:'Chạm vào từng bông hoa để hoa nở và tìm thấy một khoảnh khắc của chúng mình.',intro:'Những điều nhỏ làm anh vui',note:'Có sáu bông hoa đang chờ Linh. Mỗi bông giữ một tấm ảnh và một lời nhắn.',count:6},4:{key:'peace',title:'Một góc bình yên cho Linh',subtitle:'Để những con sóng mang ngày dài đi xa. Có ba chiếc chai đang chờ trên bờ cát.',intro:'Cứ ở đây một chút nhé',note:'Chạm vào một chiếc chai để đọc lời nhắn mà biển mang đến.',count:3}};
  let visited={smile:[],peace:[]};
  try{const saved=JSON.parse(localStorage.getItem('linh-planet-worlds-v1'));for(const key of ['smile','peace'])if(Array.isArray(saved?.[key]))visited[key]=saved[key].filter(i=>Number.isInteger(i)&&i>=0&&i<(key==='smile'?6:3));}catch{}
  const modal=document.createElement('dialog');modal.className='planet-world';modal.setAttribute('aria-labelledby','worldTitle');
  modal.innerHTML='<div class="world-shell"><div class="world-top"><button type="button" id="worldBack">← Về vũ trụ</button><div><button type="button" id="worldMotion">Dừng chuyển động</button> <button type="button" id="worldMusic">Nhạc</button></div></div><header class="world-heading"><small id="worldTag"></small><h2 id="worldTitle"></h2><p id="worldSubtitle"></p></header><div class="world-layout"><div class="world-stage" id="worldStage"><div class="world-diorama" id="worldDiorama"></div></div><aside class="world-panel"><img id="worldPhoto" alt="" hidden><div role="status" aria-live="polite"><small id="worldItemLabel">Một món quà nhỏ</small><h3 id="worldItemTitle"></h3><p id="worldMessage"></p></div><span class="world-progress" id="worldProgress"></span></aside></div><div class="world-object-list" id="worldObjectList" role="group" aria-label="Chọn món đồ để khám phá"></div></div>';
  document.body.append(modal);
  const $=id=>modal.querySelector('#'+id),diorama=$('worldDiorama'),list=$('worldObjectList'),photo=$('worldPhoto');
  let current=null,origin=null,oldOverflow='',motionPaused=reduced.matches;
  function progress(){const count=visited[current.key].length;$('worldProgress').textContent=count===current.count?'Linh đã tìm thấy tất cả lời nhắn ở đây ♡':`Đã khám phá ${count}/${current.count} ${current.key==='smile'?'bông hoa':'chiếc chai'}`;}
  function pick(i){
    if(!current)return;
    if(!visited[current.key].includes(i)){visited[current.key].push(i);try{localStorage.setItem('linh-planet-worlds-v1',JSON.stringify(visited))}catch{}}
    diorama.querySelectorAll('.world-object').forEach((button,j)=>{button.classList.toggle('opened',visited[current.key].includes(j));button.setAttribute('aria-pressed',String(i===j));});
    [...list.children].forEach((button,j)=>button.setAttribute('aria-pressed',String(i===j)));
    if(current.key==='smile'){
      const memory=window.universeData.getMemories()[i];photo.hidden=!memory?.src;if(memory?.src){photo.src=memory.src;photo.alt=memory.caption;}
      $('worldItemLabel').textContent='Bông hoa '+String(i+1).padStart(2,'0');$('worldItemTitle').textContent=memory?.caption||'Một nụ cười';$('worldMessage').textContent=messages[i];
    }else{photo.hidden=true;$('worldItemLabel').textContent='Lời nhắn từ biển · '+String(i+1).padStart(2,'0');$('worldItemTitle').textContent=letters[i].title;$('worldMessage').textContent=letters[i].text;}
    progress();window.dispatchEvent(new CustomEvent('planet-world-explored'));
  }
  function decoration(className){const node=document.createElement('div');node.className=className;node.setAttribute('aria-hidden','true');diorama.append(node);return node;}
  function build(){
    diorama.replaceChildren();list.replaceChildren();
    if(current.key==='smile'){decoration('cloud c1');decoration('cloud c2');decoration('sky-island');decoration('cloud c3');}
    else{decoration('world-sun');const sea=decoration('world-sea');for(let i=0;i<5;i++){const wave=document.createElement('i');wave.className='sea-wave';wave.style.cssText=`--wave:${i*20}%;--delay:${-i}s`;sea.append(wave)}decoration('world-sand');}
    const places=current.key==='smile'?[[24,41,-30],[48,35,-45],[73,43,-30],[27,65,30],[51,60,40],[73,65,20]]:[[25,72,25],[50,77,45],[76,70,10]];
    places.forEach(([x,y,z],i)=>{
      const button=document.createElement('button');button.type='button';button.className='world-object';button.style.cssText=`--left:${x}%;--top:${y}%;--depth:${z}px;--flower:${['#ed9db9','#d6a7e0','#ecc795','#d798b5','#c7b5e6','#efaeb0'][i]};--lean:${i%2?-12:14}deg`;
      const label=(current.key==='smile'?'Bông hoa ':'Chiếc chai ')+(i+1);button.setAttribute('aria-label','Mở '+label);button.setAttribute('aria-pressed','false');
      if(current.key==='smile'){button.innerHTML='<span class="flower-stem"></span><span class="flower-head" aria-hidden="true"></span>';for(let p=0;p<5;p++){const petal=document.createElement('i');petal.className='flower-petal';petal.style.setProperty('--petal',p);button.querySelector('.flower-head').append(petal)}}else button.innerHTML='<span class="glass-bottle" aria-hidden="true"></span>';
      const number=document.createElement('small');number.textContent=String(i+1).padStart(2,'0');button.append(number);button.classList.toggle('opened',visited[current.key].includes(i));button.addEventListener('click',()=>pick(i));diorama.append(button);
      const link=document.createElement('button');link.type='button';link.textContent=label;link.setAttribute('aria-pressed','false');link.addEventListener('click',()=>pick(i));list.append(link);
    });
  }
  function syncMusic(){const music=document.getElementById('backgroundMusic');$('worldMusic').hidden=!music?.getAttribute('src');$('worldMusic').textContent=music?.paused?'Bật nhạc ♫':'Tắt nhạc ♫';}
  function syncMotion(){modal.classList.toggle('world-paused',motionPaused);$('worldMotion').textContent=motionPaused?'Tiếp tục ↻':'Dừng chuyển động';$('worldMotion').setAttribute('aria-pressed',String(motionPaused));}
  function enter(id){
    if(!scenes[id]||modal.open)return;
    current=scenes[id];origin=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';modal.dataset.world=current.key;
    $('worldTag').textContent=id===0?'Hành tinh 01 · Nụ cười':'Hành tinh 05 · Bình yên';$('worldTitle').textContent=current.title;$('worldSubtitle').textContent=current.subtitle;
    photo.hidden=true;$('worldItemLabel').textContent='Dành riêng cho Linh';$('worldItemTitle').textContent=current.intro;$('worldMessage').textContent=current.note;
    motionPaused=reduced.matches;build();progress();syncMusic();syncMotion();diorama.style.setProperty('--world-x','0deg');diorama.style.setProperty('--world-y','0deg');
    modal.showModal();modal.scrollTop=0;$('worldBack').focus();window.dispatchEvent(new CustomEvent('planet-world-toggle',{detail:{open:true}}));
  }
  $('worldBack').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;modal.classList.add('world-paused');current=null;window.dispatchEvent(new CustomEvent('planet-world-toggle',{detail:{open:false}}));if(origin?.isConnected)origin.focus({preventScroll:true});});
  modal.addEventListener('keydown',event=>event.stopPropagation());
  $('worldMotion').addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion()});
  $('worldMusic').addEventListener('click',()=>{document.getElementById('soundChip')?.click();syncMusic()});
  document.getElementById('backgroundMusic')?.addEventListener('play',syncMusic);document.getElementById('backgroundMusic')?.addEventListener('pause',syncMusic);
  photo.addEventListener('error',()=>{photo.hidden=true});
  $('worldStage').addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||reduced.matches||motionPaused)return;const rect=$('worldStage').getBoundingClientRect();diorama.style.setProperty('--world-y',((event.clientX-rect.left)/rect.width-.5)*10+'deg');diorama.style.setProperty('--world-x',-((event.clientY-rect.top)/rect.height-.5)*5+'deg');});
  $('worldStage').addEventListener('pointerleave',()=>{diorama.style.setProperty('--world-y','0deg');diorama.style.setProperty('--world-x','0deg');});
  document.addEventListener('visibilitychange',()=>modal.classList.toggle('world-paused',document.hidden||motionPaused));
  window.PlanetWorlds={open:enter,has:id=>Boolean(scenes[id]),isExplored:id=>Boolean(scenes[id]&&visited[scenes[id].key].length)};
})();
