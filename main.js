/*!
 * Nischal Sadashivaiah — Portfolio
 * Copyright (c) 2026 Nischal Sadashivaiah. Released under the MIT License.
 */
/* Background clips, in order of preference. If none can play, a procedural 3D network is drawn instead. */
const VIDEO_SRC = ['video/portfolio-background.mp4','video/portfolio-background.webm'];

(function(){
document.documentElement.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

/* ---------- Lenis smooth scroll ---------- */
let lenis=null;
try{ if(window.Lenis && !reduce){ lenis=new Lenis({lerp:.09,smoothWheel:true}); (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now()); } }catch(e){lenis=null}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href');const el=id==='#top'?document.body:document.querySelector(id);if(!el)return;
  e.preventDefault();closeDrawer();
  if(lenis)lenis.scrollTo(id==='#top'?0:el,{offset:-10});else (id==='#top'?scrollTo({top:0,behavior:'smooth'}):el.scrollIntoView({behavior:'smooth'}));
}));

/* ---------- pointer state ---------- */
let px=.5,py=.5,cx=innerWidth*.6,cy=innerHeight*.4;
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;cx=e.clientX;cy=e.clientY;px=cx/innerWidth;py=cy/innerHeight},{passive:true});

/* =====================================================
   CINEMATIC CURSOR & SCROLL ENGINE
   target time = cursor X + scroll progress, LERP 0.10
   ===================================================== */
const inner=document.getElementById('stageInner'),glow=document.getElementById('cine-glow'),prog=document.getElementById('progress'),knob=document.getElementById('knob');
const cv=document.getElementById('stage-canvas'),ctx=cv.getContext('2d'),video=document.getElementById('stage-video');
const DUR=10; let target=0,current=0,readyVideo=false,useVideo=false;
let dxS=0,dyS=0;
if(VIDEO_SRC&&VIDEO_SRC.length){
  useVideo=true;video.style.display='block';cv.style.display='none';
  const ready=()=>{if(readyVideo)return;readyVideo=true;try{video.pause();video.currentTime=0}catch(e){}lastDrawn=-1};
  video.addEventListener('loadedmetadata',ready);video.addEventListener('canplay',ready);
  let si=0;const srcs=VIDEO_SRC.filter(u=>video.canPlayType(u.endsWith('.webm')?'video/webm; codecs="vp9"':'video/mp4; codecs="avc1.64001F"'));
  const next=()=>{if(si<srcs.length){video.src=srcs[si++];video.load()}else{useVideo=false;video.style.display='none';cv.style.display='block';lastDrawn=-1}};
  video.addEventListener('error',next);next();
}
function scrollP(){const h=document.documentElement.scrollHeight-innerHeight;return h>0?clamp(scrollY/h,0,1):0}

/* ---- procedural renderer: a 3D "edge network" core scrubbed like a 10s clip ---- */
let W=0,H=0,DPR=1;
const smoke=document.createElement('canvas');
function buildSmoke(){const s=smoke;s.width=512;s.height=288;const g=s.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,512,288);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<70;i++){const x=rnd()*512,y=rnd()*288,r=30+rnd()*120,a=.03+rnd()*.07;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${150+rnd()*80|0},0,${20+rnd()*20|0},${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);buildSmoke()}
resize();addEventListener('resize',resize);
// points on a sphere (fibonacci) + inner ring of "devices"
const PTS=[];const NP=260;
for(let i=0;i<NP;i++){const y=1-(i/(NP-1))*2,r=Math.sqrt(1-y*y),th=i*2.39996;PTS.push([Math.cos(th)*r,y,Math.sin(th)*r,0])}
for(let i=0;i<48;i++){const th=i/48*Math.PI*2;PTS.push([Math.cos(th)*1.45,Math.sin(th*3)*.08,Math.sin(th)*1.45,1])}
const EDGES=[];for(let i=0;i<NP;i++)for(let j=i+1;j<NP;j++){const a=PTS[i],b=PTS[j];const d=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(d<.045)EDGES.push([i,j])}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
function renderFrame(time){
  const t=time/DUR;const narrow=W<900;
  ctx.fillStyle='#030303';ctx.fillRect(0,0,W,H);
  const sx=-t*120;ctx.globalAlpha=.9;ctx.drawImage(smoke,sx,0,W*1.3,H);ctx.drawImage(smoke,sx+W*1.3,0,W*1.3,H);ctx.globalAlpha=1;
  const push=ease(seg(t,0,.2))*.1,turnL=ease(seg(t,.2,.4)),turnB=ease(seg(t,.4,.6)),close=ease(seg(t,.6,.8)),hold=ease(seg(t,.8,1));
  const yaw=-.6+t*4.2+(turnL-turnB)*.9, pitch=.35-close*.25;
  const R=Math.min(W,H)*(narrow?.3:.34)*(1+push+close*.7+hold*.05);
  const cx0=W*(narrow?.6:.7)-close*W*.05,cy0=H*.5;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const P=PTS.map(p=>{let x=p[0]*cy-p[2]*sy,z=p[0]*sy+p[2]*cy,y=p[1];const y2=y*cp-z*sp,z2=y*sp+z*cp;const k=3/(3+z2);return[cx0+x*R*k,cy0+y2*R*k,z2,p[3]]});
  const bl=ctx.createRadialGradient(cx0,cy0,0,cx0,cy0,R*1.6);bl.addColorStop(0,`rgba(224,0,42,${.28+.14*hold})`);bl.addColorStop(.5,'rgba(120,0,20,.1)');bl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bl;ctx.fillRect(0,0,W,H);
  ctx.lineWidth=1;
  for(const [i,j] of EDGES){const a=P[i],b=P[j];const z=(a[2]+b[2])/2;ctx.strokeStyle=`rgba(255,59,92,${(.08+.32*(1-(z+1)/2)).toFixed(3)})`;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  // data pulses traveling along edges
  for(let e=0;e<EDGES.length;e+=9){const [i,j]=EDGES[e];const f=((time*.9+e*.013)%1);const a=P[i],b=P[j];if(a[2]>.3)continue;ctx.fillStyle='rgba(255,220,228,.85)';ctx.fillRect(a[0]+(b[0]-a[0])*f-1,a[1]+(b[1]-a[1])*f-1,2,2)}
  for(const p of P){const front=1-(p[2]+1)/2;if(p[3]){ctx.fillStyle=`rgba(255,255,255,${.25+.6*front})`;ctx.fillRect(p[0]-2,p[1]-2,4,4)}else{ctx.fillStyle=`rgba(${200+55*front|0},${20+60*front|0},${50+40*front|0},${.3+.7*front})`;ctx.beginPath();ctx.arc(p[0],p[1],.8+1.8*front,0,6.283);ctx.fill()}}
  // core
  const cg=ctx.createRadialGradient(cx0,cy0,0,cx0,cy0,R*.35);cg.addColorStop(0,`rgba(255,120,140,${.5+.3*hold})`);cg.addColorStop(1,'rgba(224,0,42,0)');ctx.globalCompositeOperation='screen';ctx.fillStyle=cg;ctx.fillRect(cx0-R,cy0-R,R*2,R*2);
  const f=Math.sin(Math.PI*seg(t,.82,1));if(f>0){ctx.fillStyle=`rgba(255,59,92,${.55*f})`;ctx.fillRect(cx0-R*1.8,cy0-1,R*3.6,2);}
  ctx.globalCompositeOperation='source-over';
}
let lastDrawn=-1;
function engine(){
  const sp=scrollP();
  target=clamp(sp*.72+px*.28,0,1)*DUR;
  current+=(target-current)*.10;
  if(Math.abs(current-lastDrawn)>.001){
    if(useVideo){ if(readyVideo&&video.duration){try{video.currentTime=current/DUR*video.duration}catch(e){}} }
    else renderFrame(current);
    lastDrawn=current;
  }
  const dx=px-.5,dy=py-.5;dxS+=(dx-dxS)*.08;dyS+=(dy-dyS)*.08;
  inner.style.transform=`scale(1.03) translate3d(${dxS*-15}px,${dyS*-15}px,0) rotateX(${dyS*-2}deg) rotateY(${dxS*2}deg)`;
  prog.style.transform=`scaleX(${sp})`;
  if(knob)knob.style.left=(current/DUR*112)+'px';
  requestAnimationFrame(engine);
}
addEventListener('pointermove',e=>{glow.style.background=`radial-gradient(circle 420px at ${(e.clientX/innerWidth*100).toFixed(1)}% ${(e.clientY/innerHeight*100).toFixed(1)}%, rgba(196,0,36,.18), transparent 70%)`},{passive:true});
if(reduce){if(useVideo){video.addEventListener('loadeddata',()=>{try{video.currentTime=2}catch(e){}})}else renderFrame(0)}
else requestAnimationFrame(engine);
if(reduce)addEventListener('scroll',()=>prog.style.transform=`scaleX(${scrollP()})`,{passive:true});

/* ---------- custom cursor ---------- */
if(fine&&!reduce){
  document.body.classList.add('has-cursor');
  const dot=document.getElementById('curDot'),ring=document.getElementById('curRing');let rx=cx,ry=cy;
  (function c(){rx+=(cx-rx)*.16;ry+=(cy-ry)*.16;dot.style.transform=`translate(${cx}px,${cy}px)`;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(c)})();
  document.querySelectorAll('[data-magnetic], .cred, .pcard, input, textarea, .filters button, .dots button, .spin-btn').forEach(el=>{
    el.addEventListener('pointerenter',()=>ring.classList.add('hot'));el.addEventListener('pointerleave',()=>ring.classList.remove('hot'))});
  // magnetic pull
  document.querySelectorAll('.btn[data-magnetic], .nav-cta, .copy').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.25}px,${y*.35}px)`});
    el.addEventListener('pointerleave',()=>{el.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';el.style.transform='';setTimeout(()=>el.style.transition='',500)});
  });
}

/* ---------- nav: active pill + drawer ---------- */
const links=[...document.querySelectorAll('#links a')],pill=document.getElementById('pill');
function movePill(a){if(!a){pill.style.opacity=0;return}pill.style.opacity=1;pill.style.left=a.offsetLeft+'px';pill.style.width=a.offsetWidth+'px'}
const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
function activeSec(){let cur=null;const mid=innerHeight*.35;secs.forEach((s,i)=>{const r=s.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)cur=i});
  links.forEach((a,i)=>a.classList.toggle('active',i===cur));movePill(cur==null?null:links[cur])}
addEventListener('scroll',activeSec,{passive:true});addEventListener('resize',activeSec);activeSec();
const nav=document.getElementById('nav'),burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
function closeDrawer(){nav.classList.remove('open');drawer.classList.remove('open');burger.setAttribute('aria-expanded','false')}
burger.addEventListener('click',()=>{const o=!drawer.classList.contains('open');nav.classList.toggle('open',o);drawer.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o))});

/* ---------- reveal + counters ---------- */
const rev=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window&&!reduce){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});rev.forEach(el=>io.observe(el))}else rev.forEach(el=>el.classList.add('in'));
document.querySelectorAll('[data-count]').forEach(el=>{const n=+el.dataset.count;if(reduce){el.textContent=String(n).padStart(2,'0');return}
  const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/1400);el.textContent=String(Math.round(n*(1-Math.pow(1-k,3)))).padStart(2,'0');if(k<1)requestAnimationFrame(s)})(t0)});

/* ---------- project tilt cards ---------- */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduce)return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    card.style.setProperty('--mx',x*100+'%');card.style.setProperty('--my',y*100+'%');card.style.transform=`rotateX(${(.5-y)*10}deg) rotateY(${(x-.5)*12}deg)`});
  card.addEventListener('pointerleave',()=>{card.style.transition='transform .6s cubic-bezier(.16,1,.3,1),border-color .4s';card.style.transform='';setTimeout(()=>card.style.transition='',600)});
});

/* =====================================================
   3D DRAGGABLE CREDENTIAL RING
   ===================================================== */
const CREDS=[
  {code:'CGU',issuer:'Chang Gung University',title:'M.S. Artificial Intelligence',date:'2026 — present',desc:'Graduate study in the AI department, focusing on AI/ML and AIoT.',tags:['AI/ML','AIoT','In progress']},
  {code:'JN',issuer:'JNACS',title:'AI-Powered NIDS',date:'April 2026',desc:'Co-authored paper "AI-Powered Network Intrusion Detection System", Journal of Networking and Communication Systems, Vol 9, No 2.',tags:['Publication','Co-author','Security']},
  {code:'BEL',issuer:'Bharat Electronics Ltd.',title:'GAPP Traineeship',date:'Dec 2025 — Apr 2026',desc:'Graduate apprenticeship at Bharat Electronics Limited, Bengaluru.',tags:['Defence electronics','Industry']},
  {code:'HN',issuer:'Handshake Networking LLP',title:'Embedded Systems Internship',date:'Feb — May 2025',desc:'Embedded systems engineering internship in Bengaluru.',tags:['Embedded','Hardware']},
  {code:'VV',issuer:'Vidyavahini College',title:'Project Coordination',date:'May — Jul 2026',desc:'Project Coordinator at Vidyavahini College, Tumkur.',tags:['Coordination','Delivery']},
  {code:'PES',issuer:'PESITM Shivamogga',title:'B.E. Electronics & Comm.',date:'Undergraduate',desc:'Bachelor of Engineering in Electronics and Communication, PES Institute of Technology and Management, Shivamogga, Karnataka.',tags:['ECE','Signals','Embedded']}
];
const ring=document.getElementById('ring'),stageEl=document.getElementById('ringStage'),dotsEl=document.getElementById('dots'),spinBtn=document.getElementById('spinBtn');
const N=CREDS.length,STEP=360/N;
const cards=CREDS.map((c,i)=>{const el=document.createElement('div');el.className='cred';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',c.title);
  el.innerHTML=`<span class="beam"></span><span class="issuer"><i>${c.code}</i>${c.issuer}</span><h4>${c.title}</h4><p>${c.date}</p><div class="code">${c.tags.map(t=>`<span class="chip">${t}</span>`).join('')}</div>`;
  ring.appendChild(el);const d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Show '+c.title);dotsEl.appendChild(d);d.addEventListener('click',()=>spinTo(i));return el});
const dots=[...dotsEl.children];
let R=480,angle=0,vel=0,auto=!reduce,dragging=false,idleT=0,snapTo=null;
function radius(){return innerWidth<620?275:innerWidth<1000?380:480}
function layoutRing(){R=radius();const cw=cards[0].offsetWidth,ch=cards[0].offsetHeight;
  cards.forEach((el,i)=>{el.style.transform=`translate(-50%,-50%) rotateY(${i*STEP}deg) translateZ(${R}px)`;el.style.marginLeft=0});
  cards.forEach(el=>{el.style.left='0';el.style.top='0'});}
layoutRing();addEventListener('resize',layoutRing);
function frontIndex(){return ((Math.round(-angle/STEP)%N)+N)%N}
function renderRing(){
  ring.style.transform=`translateZ(${-R}px) rotateY(${angle}deg)`;
  const fi=frontIndex();
  cards.forEach((el,i)=>{const phi=(i*STEP+angle)*Math.PI/180;const c=Math.cos(phi);el.style.visibility=c<0?'hidden':'visible';el.style.opacity=(.35+.65*c).toFixed(3);el.classList.toggle('front',i===fi)});
  dots.forEach((d,i)=>d.classList.toggle('on',i===fi));
}
function shortest(from,to){let d=(to-from)%360;if(d>180)d-=360;if(d<-180)d+=360;return d}
function spinTo(i){snapTo=angle+shortest(angle,-i*STEP);vel=0;idleT=performance.now()}
let samples=[],lastX=0;
stageEl.addEventListener('pointerdown',e=>{dragging=true;snapTo=null;vel=0;lastX=e.clientX;samples=[{x:e.clientX,t:performance.now()}];stageEl.setPointerCapture(e.pointerId);stageEl._moved=0});
stageEl.addEventListener('pointermove',e=>{if(!dragging)return;const d=e.clientX-lastX;lastX=e.clientX;stageEl._moved+=Math.abs(d);angle+=d*.25;samples.push({x:e.clientX,t:performance.now()});if(samples.length>6)samples.shift()});
function endDrag(){if(!dragging)return;dragging=false;idleT=performance.now();const a=samples[0],b=samples[samples.length-1];if(a&&b&&b.t>a.t)vel=clamp((b.x-a.x)/(b.t-a.t)*16*.25,-14,14)}
stageEl.addEventListener('pointerup',endDrag);stageEl.addEventListener('pointercancel',endDrag);
cards.forEach((el,i)=>{const open=()=>{if(stageEl._moved>6)return;if(i===frontIndex()&&snapTo===null)openModal(i);else spinTo(i)};el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();stageEl._moved=0;open()}})});
spinBtn.addEventListener('click',()=>{auto=!auto;spinBtn.textContent=auto?'[AUTO-SPIN ON]':'[AUTO-SPIN PAUSED]'});
if(reduce)spinBtn.textContent='[AUTO-SPIN PAUSED]';
(function ringLoop(){
  if(!dragging){
    if(snapTo!==null){const d=snapTo-angle;angle+=d*.12;if(Math.abs(d)<.05){angle=snapTo;snapTo=null;idleT=performance.now()}}
    else if(Math.abs(vel)>.02){angle+=vel;vel*=.945;idleT=performance.now()}
    else if(auto&&performance.now()-idleT>1800&&!modal.classList.contains('open'))angle-=.06;
  }
  renderRing();requestAnimationFrame(ringLoop)})();

/* ---------- modal ---------- */
const modal=document.getElementById('modal'),mBody=document.getElementById('mBody');
function openModal(i){const c=CREDS[i];
  mBody.innerHTML=`<span class="eyebrow">${c.code} / ${c.issuer}</span><h4 id="mTitle">${c.title}</h4><p>${c.desc}</p>
  <div class="row"><span>Issuer</span><span>${c.issuer}</span></div><div class="row"><span>Date</span><span>${c.date}</span></div><div class="row"><span>Areas</span><span>${c.tags.join(' · ')}</span></div>`;
  modal.classList.add('open');document.getElementById('mClose').focus()}
function closeModal(){modal.classList.remove('open')}
document.getElementById('mClose').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDrawer()}});

/* ---------- timeline filters + laser spine ---------- */
const ms=[...document.querySelectorAll('.ms')];
document.querySelectorAll('#filters button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#filters button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;ms.forEach(m=>m.classList.toggle('hide',!(f==='all'||m.classList.contains(f))));
  // keep alternation on visible items
  let k=0;ms.forEach(m=>{if(m.classList.contains('hide'))return;const side=k%2;k++;const node=m.querySelector('.node');
    if(innerWidth>760){m.style.marginLeft=side?'50%':'0';m.style.padding=side?'0 0 46px 46px':'0 46px 46px 0';node.style.left=side?'-9px':'auto';node.style.right=side?'auto':'-9px'}
    else{m.style.marginLeft='';m.style.padding='';node.style.left='';node.style.right=''}});
  spine()}));
const sw=document.getElementById('spineWrap'),sf=document.getElementById('spineFill');
function spine(){const r=sw.getBoundingClientRect();const p=clamp((innerHeight*.65-r.top)/r.height,0,1);sf.style.height=(p*r.height)+'px'}
addEventListener('scroll',spine,{passive:true});spine();

/* ---------- contact ---------- */
const email=document.getElementById('email').textContent.trim();
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){return false}}
const copyBtn=document.getElementById('copyBtn');
copyBtn.addEventListener('click',async()=>{if(await copyText(email)){copyBtn.textContent='Copied ✓';setTimeout(()=>copyBtn.textContent='Copy email',1800)}else{const s=getSelection(),r=document.createRange();r.selectNodeContents(document.getElementById('email'));s.removeAllRanges();s.addRange(r);copyBtn.textContent='Selected, press Ctrl+C'}});
const form=document.getElementById('cform'),note=document.getElementById('note');
form.addEventListener('submit',async e=>{e.preventDefault();const n=form.elements.name.value.trim(),o=form.elements.org.value.trim(),m=form.elements.msg.value.trim();
  if(!n||!m){note.classList.remove('ok');note.textContent='Add your name and a message first.';return}
  const text=`To: ${email}\n\nHi Nischal,\n\n${m}\n\n${n}${o?'\n'+o:''}`;
  if(await copyText(text)){note.classList.add('ok');note.textContent=`Copied. Paste it into a new email to ${email}.`}else{note.classList.remove('ok');note.textContent=`Copy didn't work here. Please email ${email} directly.`}});
})();
