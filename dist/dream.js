'use strict';
const canvas=$('sky'),ctx=canvas.getContext('2d'),media=matchMedia('(prefers-reduced-motion: reduce)');
let width=innerWidth,height=innerHeight,points=[],clock=0,last=0,frame=0,scene='sleeping',opening=-1,pulse=-1,tint='#cbd3cc',paused=media.matches;
const mouse={x:.5,y:.5},camera={x:.5,y:.5},glyphs='01:/+−×=[]';
function setup(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);let seed=713;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};points=Array.from({length:Math.min(1400,Math.max(400,width*height/950))},()=>({x:rand()*2-1,y:rand()*2-1,z:.2+rand()*2.8,s:rand(),n:Math.floor(rand()*glyphs.length)}));draw(0);}
function setScene(s){scene=s;document.body.dataset.scene=s;}window.setDigitalScene=setScene;
function reveal(){setScene('prompt');$('main').inert=false;$('wakeSky').hidden=true;}
function wake(instant=false){if(scene!=='sleeping')return;if(instant||paused){reveal();return;}opening=clock;setScene('gathering');}
window.digitalPulse=color=>{tint=color;pulse=clock;};
function draw(dt){camera.x+=(mouse.x-camera.x)*Math.min(1,dt*.002);camera.y+=(mouse.y-camera.y)*Math.min(1,dt*.002);
 const t=opening<0?0:(clock-opening)/1700,transition=scene==='gathering'?Math.sin(Math.min(1,t)*Math.PI):0;
 const kick=pulse<0?0:Math.max(0,1-(clock-pulse)/1250);
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#040505';ctx.fillRect(0,0,width,height);
 const speed=scene==='context'?.000005:.000013;
 ctx.font='10px monospace';ctx.textBaseline='middle';
 for(const p of points){if(!paused){p.z-=dt*(speed+transition*.00038);if(p.z<.14)p.z=3;}
 const scale=1/(p.z+.22),dx=p.x*width*.58,dy=p.y*height*.58;
 let x=width/2+dx*scale-(camera.x-.5)*25*scale,y=height/2+dy*scale-(camera.y-.5)*15*scale;
 if(x<-25||x>width+25||y<-25||y>height+25)continue;
 const near=Math.max(0,1-Math.hypot(x-mouse.x*width,y-mouse.y*height)/180);
 const alpha=Math.min(.85,.06+p.s*.2+near*.3+transition*.22);
 ctx.globalAlpha=alpha;ctx.fillStyle=kick>0?tint:'#c9cfca';
 if(p.s>.66||transition>.2){ctx.fillText(glyphs[(p.n+Math.floor(clock/240+p.x*5))%glyphs.length]||'0',x,y);
 if(transition>.12){ctx.strokeStyle='#b8c7bc';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x+(x-width/2)*transition*.08,y+(y-height/2)*transition*.08);ctx.stroke();}}
 else{ctx.fillRect(Math.round(x),Math.round(y),1,1);}
 }
 // Data lanes move through the field, then collapse into a clean, untextured input.
 if(transition>0||kick>0){const energy=Math.max(transition,kick*.55);ctx.strokeStyle=tint;ctx.lineWidth=.5;
 for(let i=0;i<9;i++){const offset=(i-4)*height*.09*(1-transition*.65),y=height*.5+offset;ctx.globalAlpha=energy*.09;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width*.5,y-offset*.45);ctx.lineTo(width,y);ctx.stroke();}
 ctx.globalAlpha=energy*.16;ctx.fillStyle='#dae0da';const scan=(scene==='gathering'?Math.min(1,t):1-kick)*width;ctx.fillRect(scan,0,1,height);
 }
 ctx.globalAlpha=1;if(scene==='gathering'&&t>=1)reveal();
}
function animate(now){const dt=Math.min(40,last?now-last:16);last=now;clock+=dt;draw(dt);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
function motion(){cancelAnimationFrame(frame);last=0;if(paused&&scene==='gathering')reveal();$('motionButton').textContent=paused?'Resume motion':'Pause motion';$('motionButton').setAttribute('aria-pressed',String(paused));draw(0);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
document.addEventListener('pointermove',e=>{mouse.x=e.clientX/width;mouse.y=e.clientY/height;wake();},{passive:true});
$('wakeSky').addEventListener('pointerdown',()=>wake());$('wakeSky').onclick=()=>wake();
document.addEventListener('keydown',e=>{if(scene==='sleeping'&&(e.key==='Tab'||e.key==='Enter'||e.key===' ')){e.preventDefault();wake(true);input.focus();}});
$('motionButton').onclick=()=>{paused=!paused;motion();};media.addEventListener('change',e=>{paused=e.matches;motion();});document.addEventListener('visibilitychange',motion);window.addEventListener('resize',setup);setup();motion();if(paused)wake(true);
