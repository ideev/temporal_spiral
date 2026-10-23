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
const turns= Math.PI*5.1;
function point(t){const r=25+240*t/turns; const angle=t-1.8;return [350+r*Math.cos(angle),305+r*Math.sin(angle)];}
const points=Array.from({length:650},(_,i)=>point(i/649*turns));
const path=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
[86,164,245].forEach(r=>svg.append(element('circle',{cx:350,cy:305,r,class:'orbit-guide'})));
svg.append(element('path',{d:path,class:'spiral-line'}));
const highlight=element('path',{d:path,class:'spiral-glow','stroke-dasharray':'0 9999'});svg.append(highlight);
const tabs=$('#year-tabs');
DATA.forEach((item,i)=>{const t=2.7+(turns-3.1)*i/(DATA.length-1);const [x,y]=point(t);const g=element('g',{class:'year-node',tabindex:0,role:'button','aria-label':`Открыть ${item.year} год`,transform:`translate(${x},${y})`});g.dataset.year=item.year;g.append(element('circle',{r:24,class:'halo'}),element('circle',{r:7,class:'dot'}));const text=element('text',{x:x>350?17:-17,y:5,'text-anchor':x>350?'start':'end'});text.textContent=item.year;g.append(text);g.addEventListener('click',()=>selectYear(item.year,true));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectYear(item.year,true);}});svg.append(g);const b=document.createElement('button');b.className='year-tab';b.textContent=item.year;b.dataset.year=item.year;b.addEventListener('click',()=>selectYear(item.year,true));tabs.append(b);});
let selectedYear=1969;
function selectYear(year,animate=false){selectedYear=year;const item=DATA.find(x=>x.year===year);$('#year').textContent=year;$('#year-description').textContent=item.description;$('#counter').textContent=`${String(DATA.indexOf(item)+1).padStart(2,'0')} / 06`;document.querySelectorAll('[data-year]').forEach(el=>{const active=+el.dataset.year===year;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});$('#events').replaceChildren();item.events.forEach(event=>{const card=document.createElement('button');card.className='event-card';card.innerHTML=`<div class="event-image"><img alt="${event.title}" src="${event.photos[0].url}"><span class="event-badge">${event.photos.length} ${event.photos.length===1?'фотография':'фотографии'}</span><span class="event-arrow">↗</span></div><div class="event-info"><h3>${event.title}</h3><span>${event.date}</span></div><div class="event-tags">${event.tags.map(t=>'#'+t).join(' · ')}</div>`;card.addEventListener('click',()=>openEvent(event));attachImageFallback(card.querySelector('img'));$('#events').append(card);});const index=DATA.indexOf(item);const length=highlight.getTotalLength();highlight.setAttribute('stroke-dasharray',`${length*(.18+.82*index/5)} ${length}`);if(animate){const [x,y]=point(2.7+(turns-3.1)*index/5);svg.style.transform=`translate(${(350-x)*.09}px,${(305-y)*.09}px) scale(1.08)`;}}
function attachImageFallback(img){img.addEventListener('error',()=>{img.hidden=true;const message=document.createElement('span');message.className='image-error';message.textContent='Фотография недоступна. Откройте источник ↗';message.style.cssText='display:grid;place-items:center;min-height:140px;padding:20px;font-size:12px;color:#a7b29d';img.parentNode.append(message);});}
let currentEvent=null,photoIndex=0;
function openEvent(event){currentEvent=event;photoIndex=0;$('#gallery-title').textContent=event.title;$('#gallery-meta').textContent=`${selectedYear} / ${event.date}`;$('#tags').textContent=event.tags.map(t=>'#'+t).join('  ');showPhoto();$('#gallery').showModal();}
function showPhoto(){const p=currentEvent.photos[photoIndex];const img=$('#full-photo');img.hidden=false;img.parentNode.querySelector('.image-error')?.remove();img.src=p.url;img.alt=p.caption;$('#caption').textContent=p.caption;$('#source').href=p.source;$('#photo-count').textContent=`${photoIndex+1} / ${currentEvent.photos.length}`;$('#previous').hidden=$('#next').hidden=currentEvent.photos.length<2;}
attachImageFallback($('#full-photo'));
function movePhoto(step){photoIndex=(photoIndex+step+currentEvent.photos.length)%currentEvent.photos.length;showPhoto();}
$('#previous').onclick=()=>movePhoto(-1);$('#next').onclick=()=>movePhoto(1);
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
document.addEventListener('keydown',e=>{if($('#gallery').open&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();movePhoto(e.key==='ArrowRight'?1:-1);}});
$('#about').onclick=()=>$('#about-dialog').showModal();$('#reset').onclick=()=>{svg.style.transform='';selectYear(1969);};selectYear(1969);
