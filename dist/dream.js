'use strict';
const canvas=$('sky'),ctx=canvas.getContext('2d'),media=matchMedia('(prefers-reduced-motion: reduce)');
const startedAt=performance.now();
let width=innerWidth,height=innerHeight,points=[],targets=[],clock=0,last=0,frame=0,scene='gathering',pulse=-1,tint='#cbd3cc',paused=media.matches;
const mouse={x:.5,y:.5},camera={x:.5,y:.5};
window.introReady=false;
function setup(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);
 let seed=713;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 points=Array.from({length:Math.min(2400,Math.max(1200,Math.floor(width*height/450)))},()=>({x:rand()*2-1,y:rand()*2-1,z:.3+rand()*2.7,s:rand(),phase:rand()*7}));
 makeTargets();draw(0);
}
function makeTargets(){
 const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');
 const label=document.querySelector('.prompt'),r=label.getBoundingClientRect(),style=getComputedStyle(label);
 g.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;g.textAlign='left';g.textBaseline='top';g.fillStyle='white';
 g.fillText(label.textContent,r.left,r.top);
 const i=input.getBoundingClientRect(),is=getComputedStyle(input);g.font=is.fontSize+' '+is.fontFamily;g.fillText('…',i.left,i.top+5);
 const pixels=g.getImageData(0,0,width,height).data;targets=[];
 const top=Math.max(0,Math.floor(r.top)-8),bottom=Math.min(height,Math.ceil(i.bottom)+8);
 for(let y=top;y<bottom;y+=2)for(let x=0;x<width;x+=2)if(pixels[(y*width+x)*4+3]>90)targets.push({x,y});
 if(targets.length>points.length){const stride=targets.length/points.length;targets=points.map((_,i)=>targets[Math.floor(i*stride)]);}
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
 const elapsed=performance.now()-startedAt,morph=window.introReady?1:IntroTiming.morph(elapsed),smooth=morph*morph*(3-2*morph);
 camera.x+=(mouse.x-camera.x)*Math.min(1,dt*.001);camera.y+=(mouse.y-camera.y)*Math.min(1,dt*.001);
 const kick=pulse<0?0:Math.max(0,1-(clock-pulse)/1800);
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#040505';ctx.fillRect(0,0,width,height);
 const intro=!window.introReady,seconds=elapsed/1000;
 const flight=paused?0:Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,seconds/19))),3);
 const handoff=window.introReady?Math.max(0,1-(elapsed-IntroTiming.durationMs)/1400):1;
 const angle=paused?0:Math.sin(Math.min(seconds,18)/18*Math.PI)*.22;
 const ca=Math.cos(angle),sa=Math.sin(angle);
 for(let j=0;j<points.length;j++){
  const p=points[j];
  if(!paused){p.z-=dt*(scene==='context'?.000003:.000009+flight*.00016)*(1-smooth*.85);if(p.z<.18)p.z=3;}
  const scale=1/(p.z+.22),rx=p.x*ca-p.y*sa,ry=p.x*sa+p.y*ca;
  const baseX=width/2+rx*width*.58*scale-(camera.x-.5)*38*scale,baseY=height/2+ry*height*.58*scale-(camera.y-.5)*24*scale;
  const target=targets[j];let x=baseX,y=baseY;
  const near=Math.max(0,1-Math.hypot(baseX-mouse.x*width,baseY-mouse.y*height)/170);
  let alpha=.09+Math.pow(p.s,3)*.42+near*.16;
  if((intro||handoff>0)&&target&&!paused){
   const curve=Math.sin(smooth*Math.PI);
   x=baseX+(target.x-baseX)*smooth+Math.sin(p.phase)*curve*width*.07;
   y=baseY+(target.y-baseY)*smooth+Math.cos(p.phase)*curve*height*.04;
   alpha=(alpha*(1-smooth)+smooth*.85)*handoff;
   if(morph>.015&&morph<.94){ctx.globalAlpha=.06*curve;ctx.strokeStyle='#bcc6bd';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(target.x-x)*.012,y+(target.y-y)*.012);ctx.stroke();}
  }
  if(x<0||x>width||y<0||y>height)continue;
  if(flight>.015&&!paused){
   const trail=flight*(.012+.032*scale)*(1-smooth);
   ctx.globalAlpha=alpha*.55;ctx.strokeStyle='#cbd9d4';ctx.lineWidth=.45+Math.pow(p.s,8)*.4;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-(baseX-width/2)*trail,y-(baseY-height/2)*trail);ctx.stroke();
  }
  ctx.globalAlpha=alpha;ctx.fillStyle=kick>0?tint:'#d8ded8';
  const size=intro&&target?.65:.6+Math.pow(p.s,6)*.65;
  ctx.fillRect(x,y,size,size);
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
document.fonts?.ready.then(()=>{if(!window.introReady)makeTargets();});
setTimeout(unlock,IntroTiming.durationMs);
