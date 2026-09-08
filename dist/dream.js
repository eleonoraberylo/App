'use strict';
const canvas=$('sky'),ctx=canvas.getContext('2d'),media=matchMedia('(prefers-reduced-motion: reduce)');
const startedAt=performance.now();
let width=innerWidth,height=innerHeight,points=[],targets=[],textLayer=null,clock=0,last=0,frame=0,scene='gathering',pulse=-1,tint='#cbd3cc',paused=media.matches,palette=['#b9c4df','#d7bed0','#b8d4cb'],colored=false,currentColors=Array.from({length:7},(_,i)=>['#b9c4df','#d7bed0','#b8d4cb'][i%3]),previousColors=[];
const mouse={x:.5,y:.5},camera={x:.5,y:.5};
window.introReady=false;
function setup(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);
 let seed=713;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 points=Array.from({length:Math.min(2400,Math.max(1200,Math.floor(width*height/450)))},()=>({x:rand()*2-1,y:rand()*2-1,z:.3+rand()*2.7,s:rand(),phase:rand()*7,lane:Math.floor(rand()*7),offset:(rand()-.5),travel:rand()}));
 makeTargets();draw(0);
}
function makeTargets(){
 const layer=document.createElement('canvas');layer.width=width;layer.height=height;const g=layer.getContext('2d'),r=$('launchPrompt').getBoundingClientRect(),s=getComputedStyle($('launchPrompt'));
 g.font=s.fontWeight+' '+s.fontSize+' '+s.fontFamily;g.letterSpacing=s.letterSpacing;g.textBaseline='alphabetic';g.fillStyle=s.color;
 const metrics=g.measureText('Mg'),line=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2;
 const baseline=r.top+parseFloat(s.paddingTop)+(line+metrics.fontBoundingBoxAscent-metrics.fontBoundingBoxDescent)/2;
 g.fillText($('launchPrompt').textContent,r.left+parseFloat(s.paddingLeft),Number.isFinite(baseline)?baseline:r.top+parseFloat(s.paddingTop)+parseFloat(s.fontSize));
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
 window.introReady=true;scene='prompt';document.body.dataset.scene=scene;$('main').inert=false;$('wakeSky').hidden=true;$('introStatus').textContent='Ready. Select Today I’m feeling to begin.';
 draw(0);
}
window.digitalPulse=colors=>{if(!colors||Array.isArray(colors)&&!colors.length)return;previousColors=[...currentColors];palette=Array.isArray(colors)?colors:[colors];tint=palette[0];colored=true;pulse=clock;draw(0);};
const laneHeights=[.17,.27,.36,.57,.69,.79,.88];
function laneY(i,x=width*.5){const age=pulse<0?99999:clock-pulse;const envelope=paused?0:Math.sin(Math.PI*Math.min(1,age/6000));const wave=Math.sin(x/width*Math.PI*2.3-clock*.0005+i*.7)*height*.018;const beat=Math.sin(age*.006-x/width*7+i*.4)*Math.pow(Math.max(0,Math.sin(age*.003)),3)*height*.045*envelope;return height*laneHeights[i]+wave+beat-(camera.y-.5)*(6+i*2);}
function blendColor(a,b,t){const channels=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0'));return '#'+channels.join('');}
function lightBand(x,y,w,h,color,strength){
 ctx.save();ctx.translate(x,y);ctx.scale(w,h);
 const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color+'b0');g.addColorStop(.12,color+'70');g.addColorStop(.42,color+'24');g.addColorStop(1,color+'00');
 ctx.globalAlpha=strength;ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function draw(dt){
 const elapsed=(performance.now()-startedAt)*1.875;
 camera.x+=(mouse.x-camera.x)*Math.min(1,dt*.001);camera.y+=(mouse.y-camera.y)*Math.min(1,dt*.001);
 const age=pulse<0?99999:clock-pulse,kick=paused?0:Math.sin(Math.PI*Math.min(1,age/6000));
 for(let i=0;i<7;i++)currentColors[i]=blendColor(previousColors[i]||currentColors[i],palette[i%palette.length],paused?1:Math.min(1,age/1400));
 ctx.globalAlpha=1;ctx.fillStyle='#040506';ctx.fillRect(0,0,width,height);
 const arrival=paused?1:Math.min(1,(performance.now()-startedAt)/1800);
 // Each star and its optical trail share a horizontal layer and velocity.
 for(let i=0;i<7;i++){
  const y=laneY(i),color=currentColors[i],sweep=Math.sin(clock*.00007+i*2);
  const x=width*(.5+sweep*.23+kick*Math.sin(age*.0018+i*.45)*.3)-(camera.x-.5)*18;
  const dim=i===2||i===3?.52:1;
  ctx.beginPath();for(let px=-30;px<=width+30;px+=12){const py=laneY(i,px);if(px===-30)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
  const ribbon=ctx.createLinearGradient(0,0,width,0);ribbon.addColorStop(0,color+'00');ribbon.addColorStop(.25,color+'90');ribbon.addColorStop(.65,color+'b0');ribbon.addColorStop(1,color+'00');ctx.strokeStyle=ribbon;
  ctx.globalAlpha=arrival*dim*(.07+kick*.07);ctx.lineWidth=16;ctx.stroke();
  ctx.globalAlpha=arrival*dim*(.15+kick*.1);ctx.lineWidth=4;ctx.stroke();
  ctx.globalAlpha=arrival*dim*(.32+kick*.2);ctx.lineWidth=.8;ctx.stroke();

 }
 for(let j=0;j<points.length;j++){
  const p=points[j],layer=p.lane,depth=.35+p.s*.8;
  if(!paused)p.travel=(p.travel+dt*(.000006+depth*.000009)*(1+kick*3))%1;
  const x0=p.travel*(width+160)-80-(camera.x-.5)*22*depth;
  const inBand=j%3!==0;
  const y0=inBand?laneY(layer,x0)+p.offset*height*.06:height*(p.y+1)/2;
  let x=x0,y=y0;
  const target=targets[j],forming=target&&!paused&&elapsed<15000;
  const progress=forming?Math.min(1,Math.max(0,(elapsed-4000-p.s*600)/6500)):0;
  const gather=progress*progress*(3-2*progress);
  if(forming){x=x0+(target.x-x0)*gather;y=y0+(target.y-y0)*gather;}
  const color=currentColors[layer];
  let alpha=(inBand?.12:.05)+Math.pow(p.s,4)*.42;
  if(forming)alpha=Math.min(.22,alpha)*(1-gather);
  else if(target&&!paused)alpha*=Math.min(1,Math.max(0,(elapsed-15000)/2200));
  alpha*=arrival;
  if(x<0||x>width||y<0||y>height)continue;
  if(inBand&&p.s>.82&&progress<.08){
   const reach=(22+p.s*90)*depth*(1+kick*1.8),tail=ctx.createLinearGradient(x-reach,y,x+reach*.12,y);
   tail.addColorStop(0,color+'00');tail.addColorStop(.84,color+'75');tail.addColorStop(.9,color+'b0');tail.addColorStop(1,color+'00');
   ctx.strokeStyle=tail;ctx.lineWidth=.5;ctx.globalAlpha=alpha*.7;ctx.beginPath();ctx.moveTo(x-reach,laneY(layer,x-reach)+p.offset*height*.06);ctx.quadraticCurveTo(x-reach*.3,y,x,y);ctx.stroke();
  }
  ctx.globalAlpha=alpha;ctx.fillStyle=forming?'#555b58':inBand?color:'#bac2cb';
  ctx.beginPath();ctx.arc(x,y,forming?.45:.35+p.s*.45,0,Math.PI*2);ctx.fill();
 }
 if(textLayer&&!paused&&elapsed<15000){
  const reveal=Math.min(1,Math.max(0,(elapsed-5000)/6250)),fade=1-Math.min(1,Math.max(0,(elapsed-11250)/3750));
  ctx.globalAlpha=reveal*reveal*(3-2*reveal)*fade;ctx.drawImage(textLayer,0,0);
 }
 ctx.globalAlpha=1;
}
function animate(now){const dt=Math.min(40,last?now-last:16);last=now;clock+=dt;draw(dt);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
function motion(){cancelAnimationFrame(frame);last=0;$('reduceMotion').checked=paused;draw(0);if(!paused&&!document.hidden)frame=requestAnimationFrame(animate);}
document.body.dataset.scene='gathering';
document.addEventListener('pointermove',e=>{mouse.x=e.clientX/width;mouse.y=e.clientY/height;},{passive:true});
$('wakeSky').onclick=()=>{};
$('reduceMotion').onchange=e=>{paused=e.target.checked;motion();};
media.addEventListener('change',e=>{paused=e.matches;motion();});
document.addEventListener('visibilitychange',()=>{if(!window.introReady&&IntroTiming.canType(performance.now()-startedAt))unlock();motion();});
window.addEventListener('resize',setup);setup();motion();
document.fonts?.ready.then(makeTargets);
setTimeout(unlock,IntroTiming.durationMs);
