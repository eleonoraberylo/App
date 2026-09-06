'use strict';
// Original cinematic motion study. Perspective and lensing are expressive, not a physical simulation.
const canvas=$('sky'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,w=innerWidth,h=innerHeight,raf=0,previous=0,clock=0;
let stars=[],letters=[],dust=[],orbits=[],scene='sleeping',gatherStart=null;
let revealTimer=0,finishTimer=0,currentTint='#c9d2df',lastTrail=0;
const pointer={x:-1000,y:-1000},camera={x:0,y:0,z:0},sprites=new Map();
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const ease=t=>t*t*t*(t*(t*6-15)+10);
const mix=(a,b,t)=>a+(b-a)*t;
function sprite(color){
 if(sprites.has(color))return sprites.get(color);
 const c=document.createElement('canvas');c.width=c.height=64;
 const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'#f5f2ea');r.addColorStop(.04,color+'dd');r.addColorStop(.18,color+'22');r.addColorStop(1,color+'00');
 g.fillStyle=r;g.fillRect(0,0,64,64);sprites.set(color,c);return c;
}
function setScene(s){scene=s;document.body.dataset.scene=s;}
function project(s){
 const depth=Math.max(.3,s.z-camera.z);
 return {x:w*.5+(s.x-camera.x)*w*.72/depth,y:h*.5+(s.y-camera.y)*w*.72/depth,depth};
}
function size(){
 w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);
 canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);
 let seed=44017;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 stars=Array.from({length:Math.min(1900,Math.max(430,Math.floor(w*h/800)))},()=>{
  const z=.75+rand()*3.5,m=Math.pow(rand(),3.9);
  return {x:(rand()*1.24-.62)*z/.72,y:(rand()*1.24-.62)*h/w*z/.72,z,m,r:.2+m*.8,phase:rand()*7,glow:0,color:rand()>.82?'#d8cbbb':rand()>.62?'#b8cadd':'#d7dce2'};
 });
 if(scene==='gathering')makeLetters();
 paint(0);
}
function makeLetters(){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 const font=getComputedStyle(document.querySelector('.feeling-line label'));
 g.font='400 '+font.fontSize+' '+font.fontFamily;g.textAlign='center';g.textBaseline='middle';g.fillStyle='white';
 g.fillText('Today I’m feeling …',w*.5,h*.5-12);
 const pixels=g.getImageData(0,0,w,h).data,points=[];
 for(let y=Math.max(0,Math.floor(h*.5-65));y<Math.min(h,h*.5+65);y+=3)
  for(let x=0;x<w;x+=3)if(pixels[(y*w+x)*4+3]>70)points.push({x,y});
 const stride=Math.max(1,Math.ceil(points.length/1100));
 letters=points.filter((_,i)=>i%stride===0).map((p,i)=>{
  const star=stars[(i*13)%stars.length],start=project(star),side=start.x<w/2?-1:1;
  return {sx:start.x,sy:start.y,tx:p.x,ty:p.y,
   c1x:w/2+side*w*.45,c1y:h/2+(start.y<h/2?-1:1)*h*.32,
   c2x:p.x-side*w*.1,c2y:p.y-side*45,
   delay:(i%19)*.007,r:.35+Math.random()*.45};
 });
}
function reveal(){
 clearTimeout(revealTimer);$('main').inert=false;$('wakeSky').hidden=true;
 if(scene==='gathering'||scene==='sleeping')setScene('prompt');
}
function wake(instant=false){
 if(scene!=='sleeping')return;
 if(instant||paused){reveal();paint(0);return;}
 setScene('gathering');gatherStart=clock;makeLetters();
 orbits.push({start:clock,duration:3500,color:'#c9d2df',strength:.65,opening:true});
 revealTimer=setTimeout(reveal,2800);
 finishTimer=setTimeout(()=>{letters=[];gatherStart=null;},3800);
}
function burst(x,y,color){
 currentTint=color;
 if(paused){paint(0);return;}
 orbits.push({start:clock,duration:3800,color,strength:1,opening:false});
 if(orbits.length>3)orbits.shift();
 // A coherent current carries the light away, without a radial explosion.
 for(let i=0;i<32;i++){
  const offset=(i-16)*2;
  dust.push({x:x+offset,y:y+Math.sin(i*.4)*6,px:x+offset,py:y,color,life:.7,
   vx:.25+i*.012,vy:-.13,age:0});
 }
 if(dust.length>160)dust.splice(0,dust.length-160);
}
function move(e){
 const old={...pointer};pointer.x=e.clientX;pointer.y=e.clientY;wake();
 if(paused||document.querySelector('dialog[open]')||!selected||clock-lastTrail<25)return;
 const dist=Math.hypot(pointer.x-old.x,pointer.y-old.y);lastTrail=clock;
 if(dist>2&&dist<350)dust.push({x:pointer.x,y:pointer.y,px:old.x,py:old.y,color:selected.color,life:.4,vx:.1,vy:-.07,age:0});
 if(dust.length>160)dust.shift();
}
function bezier(p,t){
 const q=1-t;
 return {x:q*q*q*p.sx+3*q*q*t*p.c1x+3*q*t*t*p.c2x+t*t*t*p.tx,
 y:q*q*q*p.sy+3*q*q*t*p.c1y+3*q*t*t*p.c2y+t*t*t*p.ty};
}
function orbitalPoint(angle,radius,tilt,rotation){
 const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius*tilt;
 return {x:w*.5+x*Math.cos(rotation)-y*Math.sin(rotation),
 y:h*.51+x*Math.sin(rotation)+y*Math.cos(rotation),front:(Math.sin(angle)+1)*.5};
}
function drawOrbit(o){
 const p=clamp((clock-o.start)/o.duration),envelope=Math.pow(Math.sin(p*Math.PI),1.6);
 if(envelope<=0)return;
 const radius=Math.min(w*.43,h*.38)*(1-.16*ease(p));
 const rotation=-.19+Math.sin(p*Math.PI)*.06;
 // Narrow filaments orbit in an inclined plane. The forward edge receives more light.
 for(let strand=0;strand<7;strand++){
  const phase=p*2.8+strand*.19,span=2.1+strand*.08;
  let prior=null;
  for(let j=0;j<64;j++){
   const f=j/63,a=phase+f*span+strand*.53;
   const pt=orbitalPoint(a,radius+strand*1.5,.22,rotation);
   if(prior){
    ctx.globalAlpha=envelope*o.strength*Math.sin(f*Math.PI)*(.025+pt.front*.11)*(1-strand*.08);
    ctx.strokeStyle=o.color;ctx.lineWidth=strand===0?.8:.45;
    ctx.beginPath();ctx.moveTo(prior.x,prior.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
   }
   prior=pt;
  }
 }
 // Short lensed arc lifts behind the focal plane and fades as the words settle.
 for(let j=0;j<70;j++){
  const a=Math.PI+(j/70)*Math.PI;
  const x=w/2+Math.cos(a)*radius*.48,y=h*.51+Math.sin(a)*radius*.46;
  ctx.globalAlpha=envelope*.065*o.strength*Math.pow(Math.sin(j/70*Math.PI),2);
  ctx.fillStyle=o.color;ctx.fillRect(x,y,.7,.7);
 }
}
function paint(dt){
 const focus=scene==='context'?.24:1;
 const presence=pointer.x<0?0:1;
 const targetX=presence*(pointer.x/w-.5)*.022*focus;
 const targetY=presence*(pointer.y/h-.5)*.012*focus;
 const response=paused?0:1-Math.exp(-dt/1050);
 camera.x=mix(camera.x,targetX,response);camera.y=mix(camera.y,targetY,response);
 let pulse=0;
 for(const o of orbits)pulse=Math.max(pulse,Math.sin(clamp((clock-o.start)/o.duration)*Math.PI));
 const targetZ=paused?0:.025*Math.sin(clock*.000055)+pulse*.035;
 camera.z=mix(camera.z,targetZ,response);
 ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
 const haze=ctx.createRadialGradient(w*.5,h*.54,0,w*.5,h*.54,w*.65);
 haze.addColorStop(0,'#3440520b');haze.addColorStop(.65,'#20283504');haze.addColorStop(1,'#00000000');
 ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
 for(const s of stars){
  const p=project(s);let x=p.x,y=p.y;
  // A weak moving lens bends peripheral light during transitions.
  if(pulse>.001){const dx=x-w/2,dy=y-h*.51,r=Math.hypot(dx,dy),band=Math.exp(-Math.pow((r-Math.min(w,h)*.25)/80,2));x+=dx*band*pulse*.018;y+=dy*band*pulse*.018;}
  if(x<0||x>w||y<0||y>h)continue;
  const near=Math.max(0,1-Math.hypot(x-pointer.x,y-pointer.y)/135);
  s.glow=mix(s.glow,near,paused?0:1-Math.exp(-dt/300));
  const tw=paused?1:1+.035*Math.sin(clock*.0007+s.phase);
  ctx.globalAlpha=clamp((.08+s.m*.69)*tw+s.glow*.15);
  ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(x,y,s.r*(.9+.12/p.depth),0,Math.PI*2);ctx.fill();
  if(s.m>.88){ctx.globalAlpha=.055+s.glow*.025;const r=4+s.m;ctx.drawImage(sprite(s.color),x-r,y-r,r*2,r*2);}
 }
 for(const o of orbits)drawOrbit(o);
 orbits=orbits.filter(o=>clock-o.start<o.duration);
 if(letters.length&&gatherStart!==null){
  const elapsed=clock-gatherStart,progress=clamp((elapsed-180)/2350);
  for(const p of letters){
   const t=ease(clamp((progress-p.delay)/(1-p.delay))),point=bezier(p,t);
   const fade=clamp(elapsed/550)*clamp(1-(elapsed-2600)/800);
   ctx.globalAlpha=fade*(.24+.5*t);ctx.fillStyle='#d8dfe8';
   ctx.beginPath();ctx.arc(point.x,point.y,p.r,0,Math.PI*2);ctx.fill();
   if(t>.03&&t<.95){
    const tail=bezier(p,Math.max(0,t-.012));
    ctx.globalAlpha=fade*.055;ctx.strokeStyle='#c3d0df';ctx.lineWidth=.45;
    ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(point.x,point.y);ctx.stroke();
   }
  }
 }
 for(const p of dust){
  ctx.globalAlpha=Math.max(0,p.life)*.28;ctx.strokeStyle=p.color;ctx.lineWidth=.5;
  ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.stroke();
  ctx.drawImage(sprite(p.color),p.x-2,p.y-2,4,4);
  if(dt){p.px=p.x;p.py=p.y;p.age+=dt;p.x+=p.vx*dt*.06;p.y+=(p.vy+Math.sin(p.age*.0008)*.1)*dt*.06;p.life-=dt*.00022;}
 }
 dust=dust.filter(p=>p.life>0);
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function animate(now){
 const dt=Math.min(40,previous?now-previous:16);previous=now;clock+=dt;
 paint(dt);if(!paused&&!document.hidden)raf=requestAnimationFrame(animate);
}
function syncMotion(){
 cancelAnimationFrame(raf);previous=0;
 $('motionButton').setAttribute('aria-pressed',String(paused));
 $('motionButton').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';
 if(paused&&scene==='gathering'){letters=[];gatherStart=null;clearTimeout(finishTimer);reveal();}
 paint(0);if(!paused&&!document.hidden)raf=requestAnimationFrame(animate);
}
document.addEventListener('pointermove',move,{passive:true});
document.addEventListener('pointerleave',()=>{pointer.x=-1000;pointer.y=-1000;});
$('wakeSky').addEventListener('pointerdown',e=>{pointer.x=e.clientX;pointer.y=e.clientY;wake();});
$('wakeSky').onclick=()=>wake();
document.addEventListener('keydown',e=>{if(scene==='sleeping'&&(e.key==='Tab'||e.key==='Enter'||e.key===' ')){e.preventDefault();wake(true);input.focus();}});
document.querySelector('.feeling-line').addEventListener('click',e=>{if(e.target!==input){input.focus();openPicker();}});
const observer=new MutationObserver(()=>{
 if(scene==='sleeping'||scene==='gathering')return;
 const next=!$('contextStep').hidden?'context':!picker.hidden?'choosing':'prompt';
 if(next!==scene){setScene(next);if(next==='choosing')burst(w/2,h*.46,'#c5ceda');}
 options.querySelectorAll('li').forEach((li,i)=>li.style.setProperty('--i',i));
});
observer.observe(picker,{attributes:true,attributeFilter:['hidden']});
observer.observe($('contextStep'),{attributes:true,attributeFilter:['hidden']});
observer.observe(options,{childList:true});
$('motionButton').onclick=()=>{paused=!paused;syncMotion();};
reduced.addEventListener('change',e=>{paused=e.matches;syncMotion();});
document.addEventListener('visibilitychange',syncMotion);
window.addEventListener('resize',size);size();syncMotion();
if(paused)wake(true);
