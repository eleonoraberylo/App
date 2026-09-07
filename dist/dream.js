'use strict';
const canvas=$('sky'),ctx=canvas.getContext('2d'),media=matchMedia('(prefers-reduced-motion: reduce)');
const startedAt=performance.now();
let width=innerWidth,height=innerHeight,points=[],targets=[],textLayer=null,clock=0,last=0,frame=0,scene='gathering',pulse=-1,tint='#cbd3cc',paused=media.matches;
const mouse={x:.5,y:.5},camera={x:.5,y:.5};
window.introReady=false;
function setup(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);
 let seed=713;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 points=Array.from({length:Math.min(2400,Math.max(1200,Math.floor(width*height/450)))},()=>({x:rand()*2-1,y:rand()*2-1,z:.3+rand()*2.7,s:rand(),phase:rand()*7}));
 makeTargets();draw(0);
}
function makeTargets(){
 const layer=document.createElement('canvas');layer.width=width;layer.height=height;const g=layer.getContext('2d'),r=input.getBoundingClientRect(),s=getComputedStyle(input);
 g.font=s.fontWeight+' '+s.fontSize+' '+s.fontFamily;g.letterSpacing=s.letterSpacing;g.textBaseline='alphabetic';g.fillStyle=getComputedStyle(input,'::placeholder').color;
 const metrics=g.measureText('Mg'),line=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2;
 const baseline=r.top+parseFloat(s.paddingTop)+(line+metrics.fontBoundingBoxAscent-metrics.fontBoundingBoxDescent)/2;
 g.fillText(input.placeholder,r.left+parseFloat(s.paddingLeft),Number.isFinite(baseline)?baseline:r.top+parseFloat(s.paddingTop)+parseFloat(s.fontSize));
 textLayer=layer;
 const pixels=g.getImageData(0,0,width,height).data;targets=[];
 for(let y=Math.max(0,Math.floor(r.top));y<Math.min(height,r.bottom);y+=2)for(let x=Math.max(0,Math.floor(r.left));x<Math.min(width,r.right);x+=2)if(pixels[(y*width+x)*4+3]>100)targets.push({x,y});
 let seed=917;for(let i=targets.length-1;i>0;i--){seed=seed*16807%2147483647;const j=seed%(i+1);[targets[i],targets[j]]=[targets[j],targets[i]];}
 targets=targets.slice(0,points.length);
}
function setScene(s){if(!window.introReady)return;scene=s;document.body.dataset.scene=s;}window.setDigitalScene=setScene;
function unlock(){
 const elapsed=performance.now()-startedAt;
 if(!IntroTiming.canType(elapsed)){setTimeout(unlock,IntroTiming.durationMs-elapsed);return;}
 window.introReady=true;scene='prompt';document.body.dataset.scene=scene;$('main').inert=false;$('wakeSky').hidden=true;$('introStatus').textContent='Ready. You can now type your entry.';
 draw(0);
}
window.digitalPulse=color=>{tint=color;pulse=clock;};
function draw(dt){
 const elapsed=(performance.now()-startedAt)*1.4,settle=IntroTiming.settle(elapsed),smooth=settle*settle*(3-2*settle);
 camera.x+=(mouse.x-camera.x)*Math.min(1,dt*.001);camera.y+=(mouse.y-camera.y)*Math.min(1,dt*.001);
 const kick=pulse<0?0:Math.max(0,1-(clock-pulse)/1800);
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#040505';ctx.fillRect(0,0,width,height);
 const seconds=elapsed*IntroTiming.speed/1000;
 const flight=paused?0:Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,seconds/19))),3);
 const angle=paused?0:Math.sin(Math.min(seconds,24)/24*Math.PI)*.65;
 const ca=Math.cos(angle),sa=Math.sin(angle);
 for(let j=0;j<points.length;j++){
  const p=points[j];
  if(!paused){p.z-=dt*1.4*IntroTiming.speed*(scene==='context'?.000003:.000009+flight*.00016)*(1-smooth*.85);if(p.z<.18)p.z=3;}
  const scale=1/(p.z+.22),rx=p.x*ca-p.y*sa,ry=p.x*sa+p.y*ca;
  const baseX=width/2+rx*width*.58*scale-(camera.x-.5)*38*scale,baseY=height/2+ry*height*.58*scale-(camera.y-.5)*24*scale;
  let x=baseX,y=baseY;
  const target=targets[j],forming=target&&!paused&&elapsed<15000;
  const progress=forming?Math.min(1,Math.max(0,(elapsed-5500-p.s*900)/6100)):0;
  const gather=progress*progress*(3-2*progress),arc=Math.sin(gather*Math.PI);
  if(forming){x=baseX+(target.x-baseX)*gather+Math.sin(p.phase+elapsed*.0003)*width*.075*arc;y=baseY+(target.y-baseY)*gather+Math.cos(p.phase+elapsed*.0003)*height*.055*arc;}
  const near=Math.max(0,1-Math.hypot(baseX-mouse.x*width,baseY-mouse.y*height)/170);
  let alpha=.24+Math.pow(p.s,2)*.58+near*.16;
  alpha*=1-smooth*.35;
  if(forming)alpha=Math.min(.28,alpha)*(1-gather)*(1-Math.min(1,Math.max(0,(elapsed-13000)/2000)));
  if(forming&&progress>0&&progress<1&&Number.isFinite(p.px)){
   ctx.globalAlpha=alpha*.32;ctx.strokeStyle='#555b58';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(x,y);ctx.stroke();
  }
  p.px=x;p.py=y;
  if(x<0||x>width||y<0||y>height)continue;
  if(flight>.015&&!paused&&progress<.1){
   const trail=flight*(.012+.032*scale)*(1-smooth);
   ctx.globalAlpha=Math.min(1,alpha*.85);ctx.strokeStyle='#cbd9d4';ctx.lineWidth=.45+Math.pow(p.s,8)*.4;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-(baseX-width/2)*trail,y-(baseY-height/2)*trail);ctx.stroke();
  }
  ctx.globalAlpha=Math.min(1,alpha);ctx.fillStyle=forming?'#555b58':kick>0?tint:'#f3fff8';
  const size=forming?.95:.85+Math.pow(p.s,6)*.8;
  if(forming){ctx.beginPath();ctx.arc(x,y,size*.5,0,Math.PI*2);ctx.fill();}else ctx.fillRect(x,y,size,size);
 }
 if(textLayer&&!paused&&elapsed<15000){
  const reveal=Math.min(1,Math.max(0,(elapsed-6500)/6500));
  const fade=1-Math.min(1,Math.max(0,(elapsed-13000)/2000));
  ctx.globalAlpha=(reveal*reveal*(3-2*reveal))*fade;ctx.drawImage(textLayer,0,0);
 }
 if(kick>0){ctx.globalAlpha=kick*.11;ctx.fillStyle=tint;ctx.fillRect(width*(1-kick),0,.7,height);}
 ctx.globalAlpha=1;
}
function animate(now){const dt=Math.min(40,last?now-last:16);last=now;clock+=dt;draw(dt);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
function motion(){cancelAnimationFrame(frame);last=0;$('motionButton').textContent=paused?'Resume motion':'Pause motion';$('motionButton').setAttribute('aria-pressed',String(paused));draw(0);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
document.body.dataset.scene='gathering';
document.addEventListener('pointermove',e=>{mouse.x=e.clientX/width;mouse.y=e.clientY/height;},{passive:true});
$('wakeSky').onclick=()=>{};
$('motionButton').onclick=()=>{paused=!paused;motion();};
media.addEventListener('change',e=>{paused=e.matches;motion();});
document.addEventListener('visibilitychange',()=>{if(!window.introReady&&IntroTiming.canType(performance.now()-startedAt))unlock();motion();});
window.addEventListener('resize',setup);setup();motion();
document.fonts?.ready.then(makeTargets);
setTimeout(unlock,IntroTiming.durationMs);
