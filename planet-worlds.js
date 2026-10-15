/* Three.js cloud garden and beach; all personal images come from the existing album. */
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
  try{const saved=JSON.parse(localStorage.getItem('linh-planet-worlds-v1'));for(const key of ['smile','peace'])if(Array.isArray(saved?.[key]))visited[key]=[...new Set(saved[key].filter(i=>Number.isInteger(i)&&i>=0&&i<(key==='smile'?6:3)))];}catch{}
  const modal=document.createElement('dialog');modal.className='planet-world';modal.setAttribute('aria-labelledby','worldTitle');
  modal.innerHTML='<div class="world-shell"><div class="world-top"><button type="button" id="worldBack">← Về vũ trụ</button><div><button type="button" id="worldMotion">Dừng chuyển động</button> <button type="button" id="worldMusic">Nhạc</button></div></div><header class="world-heading"><small id="worldTag"></small><h2 id="worldTitle"></h2><p id="worldSubtitle"></p></header><div class="world-layout"><div class="world-stage" id="worldStage"><div class="world-diorama" id="worldDiorama"></div></div><aside class="world-panel"><img id="worldPhoto" alt="" hidden><div role="status" aria-live="polite"><small id="worldItemLabel">Một món quà nhỏ</small><h3 id="worldItemTitle"></h3><p id="worldMessage"></p></div><span class="world-progress" id="worldProgress"></span></aside></div><div class="world-object-list" id="worldObjectList" role="group" aria-label="Chọn món đồ để khám phá"></div></div>';
  document.body.append(modal);
  const $=id=>modal.querySelector('#'+id),diorama=$('worldDiorama'),list=$('worldObjectList'),photo=$('worldPhoto');
  let current=null,origin=null,oldOverflow='',motionPaused=reduced.matches,beach=null,beachToken=0,selectedBottle=-1,garden=null,gardenToken=0,selectedFlower=-1;
  function progress(){const count=visited[current.key].length;$('worldProgress').textContent=count===current.count?'Linh đã tìm thấy tất cả lời nhắn ở đây ♡':`Đã khám phá ${count}/${current.count} ${current.key==='smile'?'bông hoa':'chiếc chai'}`;}
  function pick(i){
    if(!current||!Number.isInteger(i)||i<0||i>=current.count)return;
    if(!visited[current.key].includes(i)){visited[current.key].push(i);try{localStorage.setItem('linh-planet-worlds-v1',JSON.stringify(visited))}catch{}}
    diorama.querySelectorAll('.world-object').forEach((button,j)=>{button.classList.toggle('opened',visited[current.key].includes(j));button.setAttribute('aria-pressed',String(i===j));});
    [...list.children].forEach((button,j)=>button.setAttribute('aria-pressed',String(i===j)));
    if(current.key==='smile'){
      modal.classList.add('world-reading');selectedFlower=i;garden?.select(i);syncGardenReward();
      const memory=window.universeData.getMemories()[i];photo.hidden=!memory?.src;if(memory?.src){photo.src=memory.src;photo.alt=memory.caption;}
      $('worldItemLabel').textContent='Bông hoa '+String(i+1).padStart(2,'0');$('worldItemTitle').textContent=memory?.caption||'Một nụ cười';$('worldMessage').textContent=messages[i];
    }else{modal.classList.add('world-reading');selectedBottle=i;beach?.select(i);photo.hidden=true;$('worldItemLabel').textContent='Lời nhắn từ biển · '+String(i+1).padStart(2,'0');$('worldItemTitle').textContent=letters[i].title;$('worldMessage').textContent=letters[i].text;}
    progress();window.dispatchEvent(new CustomEvent('planet-world-explored'));
  }
  function build(){
    diorama.replaceChildren();list.replaceChildren();
    for(let i=0;i<current.count;i++){const button=document.createElement('button');button.type='button';button.textContent=(current.key==='smile'?'Bông hoa ':'Chiếc chai ')+(i+1);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>pick(i));list.append(button)}
  }
  const reward=document.createElement('div');reward.className='garden-reward';reward.setAttribute('role','status');reward.hidden=true;reward.textContent='Sáu nụ cười đã thắp sáng khu vườn ♡ Mong Linh luôn có thật nhiều lý do để mỉm cười. Anh muốn cùng Linh tạo thêm những ngày đẹp như thế.';modal.querySelector('.world-shell').append(reward);
  function syncGardenReward(){reward.hidden=current?.key!=='smile'||visited.smile.length!==6;modal.classList.toggle('garden-complete',!reward.hidden);}
  async function startGarden(){
    const token=++gardenToken,stage=$('worldStage'),loading=document.createElement('div');loading.className='garden-loading';loading.setAttribute('role','status');loading.textContent='Đang mở khu vườn trên mây…';stage.append(loading);
    try{const module=await import('./garden-three.js');if(token!==gardenToken||!modal.open||current?.key!=='smile'){loading.remove();return}
      garden=module.createGarden(stage,{onSelect:pick,opened:visited.smile,paused:motionPaused});loading.remove();if(selectedFlower>=0)garden.select(selectedFlower);
    }catch(error){if(token!==gardenToken){loading.remove();return}loading.textContent='Chưa tải được khu vườn 3D. Linh vẫn có thể mở ảnh bằng sáu nút hoa bên dưới; thử vào lại vườn khi kết nối ổn định nhé.';console.error(error)}
  }
  function syncMusic(){const music=document.getElementById('backgroundMusic');$('worldMusic').hidden=!music?.getAttribute('src');$('worldMusic').textContent=music?.paused?'Bật nhạc ♫':'Tắt nhạc ♫';}
  function syncMotion(){garden?.setPaused(motionPaused);beach?.setPaused(motionPaused);modal.classList.toggle('world-paused',motionPaused);$('worldMotion').textContent=motionPaused?'Tiếp tục ↻':'Dừng chuyển động';$('worldMotion').setAttribute('aria-pressed',String(motionPaused));}
  async function startBeach(){
    const token=++beachToken,stage=$('worldStage'),loading=document.createElement('div');
    loading.className='beach-loading';loading.setAttribute('role','status');loading.textContent='Đang đưa Linh đến bờ biển…';stage.append(loading);
    try{const module=await import('./beach-three.js');if(token!==beachToken||!modal.open||current?.key!=='peace'){loading.remove();return}
      beach=module.createBeach(stage,{onSelect:pick,paused:motionPaused});loading.remove();if(selectedBottle>=0)beach.select(selectedBottle);
    }catch(error){if(token!==beachToken){loading.remove();return}loading.textContent='Chưa thể mở cảnh biển 3D. Linh thử tải lại trang và kiểm tra trình duyệt có bật WebGL nhé. Các lá thư vẫn mở được bằng nút bên dưới.';console.error(error)}
  }
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='beach-dismiss';dismiss.textContent='Tiếp tục ngắm biển';modal.querySelector('.world-panel').append(dismiss);
  dismiss.addEventListener('click',()=>{modal.classList.remove('world-reading');selectedBottle=-1;selectedFlower=-1;beach?.clearFocus();garden?.clearFocus()});
  $('worldStage').addEventListener('beach-context-lost',()=>{const notice=document.createElement('div');notice.className='beach-loading';notice.textContent='Cảnh biển đã tạm dừng. Linh quay về vũ trụ rồi mở lại nhé.';$('worldStage').append(notice)});
  function enter(id){
    if(!scenes[id]||modal.open)return;
    selectedFlower=-1;selectedBottle=-1;modal.classList.remove('world-reading');current=scenes[id];origin=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';modal.dataset.world=current.key;
    $('worldTag').textContent=id===0?'Hành tinh 01 · Nụ cười':'Hành tinh 05 · Bình yên';$('worldTitle').textContent=current.title;$('worldSubtitle').textContent=current.subtitle;
    photo.hidden=true;$('worldItemLabel').textContent='Dành riêng cho Linh';$('worldItemTitle').textContent=current.intro;$('worldMessage').textContent=current.note;
    dismiss.textContent=id===0?'Tiếp tục ngắm vườn':'Tiếp tục ngắm biển';syncGardenReward();motionPaused=reduced.matches;build();progress();syncMusic();syncMotion();diorama.style.setProperty('--world-x','0deg');diorama.style.setProperty('--world-y','0deg');
    modal.showModal();if(id===0)startGarden();if(id===4)startBeach();modal.scrollTop=0;$('worldBack').focus();window.dispatchEvent(new CustomEvent('planet-world-toggle',{detail:{open:true}}));
  }
  $('worldBack').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{gardenToken++;garden?.dispose();garden=null;reward.hidden=true;$('worldStage').querySelectorAll('.garden-loading').forEach(n=>n.remove());beachToken++;beach?.dispose();beach=null;$('worldStage').querySelectorAll('.beach-loading').forEach(n=>n.remove());document.body.style.overflow=oldOverflow;modal.classList.add('world-paused');current=null;window.dispatchEvent(new CustomEvent('planet-world-toggle',{detail:{open:false}}));if(origin?.isConnected)origin.focus({preventScroll:true});});
  modal.addEventListener('keydown',event=>event.stopPropagation());
  $('worldMotion').addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion()});
  $('worldMusic').addEventListener('click',()=>{document.getElementById('soundChip')?.click();syncMusic()});
  document.getElementById('backgroundMusic')?.addEventListener('play',syncMusic);document.getElementById('backgroundMusic')?.addEventListener('pause',syncMusic);
  photo.addEventListener('error',()=>{photo.hidden=true});
  $('worldStage').addEventListener('garden-context-lost',()=>{const notice=document.createElement('div');notice.className='garden-loading';notice.textContent='Khu vườn đã tạm dừng. Linh quay về vũ trụ rồi mở lại nhé.';$('worldStage').append(notice)});
  document.addEventListener('visibilitychange',()=>modal.classList.toggle('world-paused',document.hidden||motionPaused));
  window.PlanetWorlds={open:enter,has:id=>Boolean(scenes[id]),isExplored:id=>Boolean(scenes[id]&&visited[scenes[id].key].length)};
})();
