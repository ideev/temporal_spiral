const nasa = (id, file) => `https://images-assets.nasa.gov/image/${id}/${file || id}~orig.jpg`;
const photo = (url, caption, source = url.startsWith('assets/') ? nasa(url.split('/').pop().replace('.jpg','')) : url) => ({url, caption, source});
const moon = photo('assets/as11-40-5903.jpg', 'Базз Олдрин на поверхности Луны. Фотография Нила Армстронга, Apollo 11 / NASA.');
const earth = photo('assets/as08-14-2383.jpg', '«Восход Земли»: снимок Уильяма Андерса с борта Apollo 8, 24 декабря 1968 года. NASA.');
const webb = photo('https://stsci-opo.org/STScI-01G7DCWB7137MYJ05CSH1Q5Z1Z.png', 'Первое глубокое поле телескопа «Джеймс Уэбб»: скопление SMACS 0723. NASA, ESA, CSA, STScI.','https://webbtelescope.org/contents/media/images/2022/035/01G7DCWB7137MYJ05CSH1Q5Z1Z');
const wall = photo('https://commons.wikimedia.org/wiki/Special:FilePath/BerlinWall-BrandenburgGate.jpg','Люди на Берлинской стене у Бранденбургских ворот, ноябрь 1989 года. Lear 21 / Wikimedia Commons, CC BY-SA 3.0.','https://commons.wikimedia.org/wiki/File:BerlinWall-BrandenburgGate.jpg');
const hubble = photo('assets/PIA03606.jpg', 'Крабовидная туманность, остаток взрыва сверхновой. NASA / ESA / JPL / Arizona State University, 2005 год.');
const curiosity = photo('assets/PIA16239.jpg', 'Автопортрет марсохода Curiosity на поверхности Марса, 2012 год. NASA / JPL-Caltech / MSSS.');
const DATA = [
 {year:1968,description:'Впервые увидеть свой дом со стороны. Год, когда Земля стала маленькой голубой точкой.',events:[{title:'Восход Земли',date:'24 декабря',tags:['Apollo 8','Земля','новый взгляд'],photos:[earth]}]},
 {year:1969,description:'Один маленький шаг меняет всё. Человечество впервые оставляет след на другом мире.',events:[{title:'Первый шаг на Луне',date:'20 июля',tags:['Apollo 11','Луна','исследования'],photos:[moon,photo('assets/as11-40-5875.jpg','Базз Олдрин у лунного модуля Eagle. Apollo 11 / NASA.')]},{title:'Земля с лунной орбиты',date:'июль',tags:['Apollo 11','планета Земля'],photos:[photo('assets/as11-44-6552.jpg','Земля над лунным горизонтом. Apollo 11 / NASA.')]}]},
 {year:1989,description:'Границы открываются. Ночь, ставшая символом перемен для целого поколения.',events:[{title:'Падение Берлинской стены',date:'9 ноября',tags:['Берлин','свобода','люди'],photos:[wall]}]},
 {year:2005,description:'Космос становится ближе. Телескоп Hubble показывает остаток взрыва сверхновой в невероятных подробностях.',events:[{title:'Крабовидная туманность',date:'1 декабря',tags:['Hubble','сверхновая'],photos:[hubble]}]},
 {year:2012,description:'Любопытство ведёт дальше. Новый робот-исследователь начинает путешествие по Марсу.',events:[{title:'Curiosity на Марсе',date:'6 августа',tags:['Марс','Curiosity','открытия'],photos:[curiosity]}]},
 {year:2022,description:'Взгляд сквозь миллиарды лет. Первые изображения «Уэбба» открывают новую главу астрономии.',events:[{title:'Самый глубокий взгляд',date:'12 июля',tags:['James Webb','галактики','космос'],photos:[webb]}]}
];
const $ = (selector) => document.querySelector(selector);
const svg = $('#spiral');
const ns = 'http://www.w3.org/2000/svg';
function element(tag, attrs){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;}
const turns = Math.PI * 5.1;
const yearTime = index => 2.7 + (turns - 3.1) * index / (DATA.length - 1);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stage = $('.orbit-stage');
const history = [];
let selectedYear = 1969;
let focusIndex = null;
let pose = { focus: 0, time: yearTime(1) };
let frame = 0;
let transitionId = 0;
const segments = [];
const nodes = [];
const photoNodes = [];

function position(t, camera = pose) {
  const baseRadius = 25 + 240 * t / turns;
  const focusedRadius = 152 * Math.exp((t - camera.time) * .21);
  const radius = baseRadius + (focusedRadius - baseRadius) * camera.focus;
  // Reduce the angular distance between memories as the chosen turn unwinds.
  const angle = (t - 1.8) * (1 - camera.focus)
    + ((t - camera.time) * .62 - .6) * camera.focus;
  return [350 + radius * Math.cos(angle), 305 + radius * Math.sin(angle)];
}
function visibility(t, x, y) {
  const edge = Math.min(x - 25, 675 - x, y - 65, 545 - y);
  const peripheral = Math.max(0, Math.min(1, (edge + 40) / 85));
  const future = Math.exp(-Math.max(0, t - pose.time - .25) * pose.focus * .45);
  return peripheral * future;
}
function activate(el, callback) {
  el.addEventListener('click', callback);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); callback(); }
  });
}
const defs = element('defs', {});
const clip = element('clipPath', {id:'orbit-photo-clip'});
clip.append(element('rect', {width:108,height:72,rx:6}));
defs.append(clip); svg.append(defs);
for (let i = 0; i < 90; i++) {
  const line = element('path', {class:'time-segment', 'vector-effect':'non-scaling-stroke'});
  svg.append(line); segments.push(line);
}
const tabs = $('#year-tabs');
DATA.forEach((item, index) => {
  const node = element('g', {class:'year-node', tabindex:0, role:'button',
    'aria-label':`Приблизить ${item.year} год`});
  node.dataset.year = item.year;
  node.append(element('circle', {r:24,class:'halo'}), element('circle',{r:7,class:'dot'}));
  const label = element('text', {x:16,y:5}); label.textContent=item.year; node.append(label);
  activate(node, () => selectYear(item.year));
  nodes.push(node);
  item.events.forEach((event, eventIndex) => {
    const tile = element('g', {class:'orbit-photo', tabindex:0,role:'button',
      'aria-label':`${item.year}: ${event.title}`});
    tile.append(element('rect',{width:108,height:72,rx:6,class:'orbit-photo-bg'}));
    const image = element('image',{href:event.photos[0].url,width:108,height:72,
      preserveAspectRatio:'xMidYMid slice','clip-path':'url(#orbit-photo-clip)'});
    tile.append(image);
    const caption = element('text',{x:7,y:65,class:'orbit-photo-label'});
    caption.textContent=String(item.year);tile.append(caption);
    // Keep the year/title card usable even if a remote image cannot load.
    activate(tile, () => {
      if (focusIndex !== index) selectYear(item.year);
      else openEvent(event);
    });
    svg.append(tile); photoNodes.push({tile,index,eventIndex});
  });
  svg.append(node);
  const tab = document.createElement('button');
  tab.className='year-tab';tab.textContent=item.year;tab.dataset.year=item.year;
  tab.onclick=()=>selectYear(item.year);tabs.append(tab);
});
function draw() {
  segments.forEach((line,index) => {
    const a=turns*index/segments.length, b=turns*(index+1)/segments.length;
    let d='';
    for(let step=0;step<=8;step++){
      const [x,y]=position(a+(b-a)*step/8);d+=`${step?'L':'M'}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    line.setAttribute('d',d);
    const middle=(a+b)/2;
    line.style.opacity=String(.65*Math.exp(-Math.max(0,middle-pose.time)*pose.focus*.4));
    line.classList.toggle('lit',Math.abs(middle-pose.time)<1.4 && pose.focus>.1);
  });
  nodes.forEach((node,index)=>{
    const t=yearTime(index), [x,y]=position(t), opacity=visibility(t,x,y);
    node.setAttribute('transform',`translate(${x},${y})`);
    node.style.opacity=String(opacity);
    node.style.pointerEvents=opacity<.12?'none':'';
    node.setAttribute('tabindex',opacity<.12?'-1':'0');
    node.setAttribute('aria-hidden',String(opacity<.12));
  });
  photoNodes.forEach(({tile,index,eventIndex})=>{
    const t=yearTime(index),[x,y]=position(t);
    const chosen=Math.exp(-Math.abs(t-pose.time)*1.4)*pose.focus;
    const scale=.54+chosen*.64;
    const tx=x+18,ty=y+18+eventIndex*(46+chosen*45);
    const opacity=visibility(t,tx+54*scale,ty+36*scale);
    tile.setAttribute('transform',`translate(${tx},${ty}) scale(${scale})`);
    tile.style.opacity=String(opacity*(.52+.48*chosen));
    tile.style.pointerEvents=opacity<.12?'none':'';
    tile.setAttribute('tabindex',opacity<.12?'-1':'0');
    tile.setAttribute('aria-hidden',String(opacity<.12));
  });
  $('.center-label').style.opacity=String(1-pose.focus);
  svg.dataset.focus=pose.focus.toFixed(3);
}
function animateTo(target) {
  cancelAnimationFrame(frame);
  const id=++transitionId;
  const from={...pose},start=performance.now(),duration=reduceMotion.matches?0:2100;
  stage.classList.add('travelling');
  function tick(now) {
    if(id!==transitionId)return;
    const fraction=duration?Math.min(1,(now-start)/duration):1;
    const ease=fraction*fraction*(3-2*fraction);
    pose={focus:from.focus+(target.focus-from.focus)*ease,
      time:from.time+(target.time-from.time)*ease};
    draw();
    if(fraction<1)frame=requestAnimationFrame(tick);
    else stage.classList.remove('travelling');
  }
  frame=requestAnimationFrame(tick);
}
function renderEvents() {
  const item=DATA.find(x=>x.year===selectedYear);
  $('#year').textContent=item.year;
  $('#year-description').textContent=item.description;
  $('#counter').textContent=`${String(DATA.indexOf(item)+1).padStart(2,'0')} / ${String(DATA.length).padStart(2,'0')}`;
  document.querySelectorAll('[data-year]').forEach(el=>{
    const active=+el.dataset.year===selectedYear;
    el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
  });
  $('#events').replaceChildren();
  item.events.forEach(event=>{
    const card=document.createElement('button');card.className='event-card';
    card.innerHTML=`<div class="event-image"><img alt="${event.title}" src="${event.photos[0].url}"><span class="event-badge">${event.photos.length} ${event.photos.length===1?'фотография':'фотографии'}</span><span class="event-arrow">↗</span></div><div class="event-info"><h3>${event.title}</h3><span>${event.date}</span></div><div class="event-tags">${event.tags.map(t=>'#'+t).join(' · ')}</div>`;
    card.onclick=()=>openEvent(event);attachImageFallback(card.querySelector('img'));$('#events').append(card);
  });
  $('#back').disabled=history.length===0;
  $('#view-status').textContent=focusIndex===null?'Вся история · выберите год':`${selectedYear} · более позднее время за краем`;
  $('#orbit-hint').textContent=focusIndex===null?'Выберите год, чтобы приблизить виток':'Нажмите на фото · вернуться можно кнопкой «Назад»';
  stage.classList.toggle('focused',focusIndex!==null);
}
function selectYear(year) {
  const index=DATA.findIndex(item=>item.year===year);
  if(focusIndex===index)return;
  history.push({year:selectedYear,index:focusIndex});
  selectedYear=year;focusIndex=index;
  renderEvents();animateTo({focus:1,time:yearTime(index)});
}
$('#back').onclick=()=>{
  const previous=history.pop();if(!previous)return;
  selectedYear=previous.year;focusIndex=previous.index;
  renderEvents();animateTo({focus:focusIndex===null?0:1,time:yearTime(focusIndex??1)});
};
$('#reset').onclick=()=>{
  history.length=0;selectedYear=1969;focusIndex=null;
  renderEvents();animateTo({focus:0,time:yearTime(1)});
};
renderEvents();draw();
function attachImageFallback(img){img.addEventListener('error',()=>{img.hidden=true;const message=document.createElement('span');message.className='image-error';message.textContent='Фотография недоступна. Откройте источник ↗';message.style.cssText='display:grid;place-items:center;min-height:140px;padding:20px;font-size:12px;color:#a7b29d';img.parentNode.append(message);});}
let currentEvent=null,photoIndex=0;
function openEvent(event){currentEvent=event;photoIndex=0;$('#gallery-title').textContent=event.title;$('#gallery-meta').textContent=`${selectedYear} / ${event.date}`;$('#tags').textContent=event.tags.map(t=>'#'+t).join('  ');showPhoto();$('#gallery').showModal();}
function showPhoto(){const p=currentEvent.photos[photoIndex];const img=$('#full-photo');img.hidden=false;img.parentNode.querySelector('.image-error')?.remove();img.src=p.url;img.alt=p.caption;$('#caption').textContent=p.caption;$('#source').href=p.source;$('#photo-count').textContent=`${photoIndex+1} / ${currentEvent.photos.length}`;$('#previous').hidden=$('#next').hidden=currentEvent.photos.length<2;}
attachImageFallback($('#full-photo'));
function movePhoto(step){photoIndex=(photoIndex+step+currentEvent.photos.length)%currentEvent.photos.length;showPhoto();}
$('#previous').onclick=()=>movePhoto(-1);$('#next').onclick=()=>movePhoto(1);
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
document.addEventListener('keydown',e=>{if($('#gallery').open&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();movePhoto(e.key==='ArrowRight'?1:-1);}});
$('#about').onclick=()=>$('#about-dialog').showModal();
