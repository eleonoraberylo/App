'use strict';
const $=id=>document.getElementById(id),input=$('emotionInput');
const STORAGE_KEY='afterglow.memories.v1';
let stage='launchPrompt',transitionTimer;let selected=null,memories=[],deviceStorage=false,pendingDelete=null,toastTimer,reflection='',busy=false;
function notify(text){$('status').textContent=text;$('status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').hidden=true,4500);}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(saved)){memories=saved.filter(m=>m&&typeof m.id==='string'&&typeof m.emotion==='string'&&m.emotion.length<=160&&typeof m.context==='string'&&Number.isFinite(Date.parse(m.at))).slice(0,500);deviceStorage=true;}}catch{notify('Device storage is unavailable. Entries will stay in this session.');}
function storageLabel(){$('rememberDevice').checked=deviceStorage;$('count').textContent=memories.length;}
function persist(next){if(deviceStorage){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{notify('Could not save on this device. Your changes have not been applied.');return false;}}memories=next;storageLabel();return true;}
const feelingCatalog=[{"name":"peaceful","color":"#8adfb7","words":["peaceful","peace","at peace"]},{"name":"calm","color":"#7cdbc9","words":["calm","calmness"]},{"name":"relaxed","color":"#a4db95","words":["relaxed","relaxation"]},{"name":"content","color":"#cce288","words":["content","contentment","contented"]},{"name":"relieved","color":"#88e5c2","words":["relieved","relief"]},{"name":"grateful","color":"#e6ca72","words":["grateful","gratitude","thankful"]},{"name":"happy","color":"#e6d16d","words":["happy","happiness"]},{"name":"joyful","color":"#e6b455","words":["joyful","joy","joyous"]},{"name":"excited","color":"#e69b57","words":["excited","excitement"]},{"name":"hopeful","color":"#ab8de6","words":["hopeful","hope"]},{"name":"proud","color":"#c586e0","words":["proud","pride"]},{"name":"confident","color":"#85b4e4","words":["confident","confidence"]},{"name":"loved","color":"#e090c2","words":["loved","love","loving"]},{"name":"affectionate","color":"#e692ad","words":["affectionate","affection"]},{"name":"connected","color":"#adc6a1","words":["connected","connection"]},{"name":"amused","color":"#e6aa82","words":["amused","amusement"]},{"name":"curious","color":"#90c9e5","words":["curious","curiosity","interested"]},{"name":"inspired","color":"#a192e6","words":["inspired","inspiration"]},{"name":"awed","color":"#918ce1","words":["awed","awe","in awe"]},{"name":"nostalgic","color":"#c297ba","words":["nostalgic","nostalgia"]},{"name":"sad","color":"#7fb9e6","words":["sad","sadness","unhappy"]},{"name":"lonely","color":"#7da7de","words":["lonely","loneliness","isolated"]},{"name":"disappointed","color":"#9893ca","words":["disappointed","disappointment"]},{"name":"grieving","color":"#7d96cd","words":["grieving","grief","heartbroken"]},{"name":"hurt","color":"#c28db8","words":["hurt","wounded"]},{"name":"guilty","color":"#c8af82","words":["guilty","guilt"]},{"name":"ashamed","color":"#b98ca5","words":["ashamed","shame"]},{"name":"embarrassed","color":"#de8b9f","words":["embarrassed","embarrassment"]},{"name":"anxious","color":"#e1ca8e","words":["anxious","anxiety","uneasy"]},{"name":"worried","color":"#e6cb67","words":["worried","worry"]},{"name":"stressed","color":"#e6d770","words":["stressed","stress","under stress"]},{"name":"overwhelmed","color":"#c5a0b9","words":["overwhelmed","overwhelm"]},{"name":"afraid","color":"#9e97d0","words":["afraid","fear","scared","fearful"]},{"name":"insecure","color":"#93a7d2","words":["insecure","insecurity"]},{"name":"angry","color":"#e5837e","words":["angry","anger","mad"]},{"name":"furious","color":"#e66b81","words":["furious","fury","enraged"]},{"name":"annoyed","color":"#e6a770","words":["annoyed","annoyance","irritated"]},{"name":"frustrated","color":"#e6995f","words":["frustrated","frustration"]},{"name":"jealous","color":"#bfc980","words":["jealous","jealousy","envious","envy"]},{"name":"disgusted","color":"#abc188","words":["disgusted","disgust"]}];
function recognizeFeelings(text){
 const clauses=text.toLowerCase().replace(/[’]/g,"'").split(/[,;.!?]|\b(?:but|however)\b/);
 const found=[];
 for(const clause of clauses){const words=clause.match(/[a-z']+/g)||[];let negated=false;
  for(let i=0;i<words.length;i++){
   if(['not','never','neither',"don't","isn't","aren't","wasn't","weren't",'without'].includes(words[i])){if(words[i+1]!=='only')negated=true;continue;}
   for(const item of feelingCatalog)for(const alias of item.words){const tokens=alias.split(' ');if(tokens.every((w,k)=>words[i+k]===w)&&!negated&&!found.some(x=>x.name===item.name)){found.push(item);break;}}
  }
 }return found.slice(0,7);
}
function colorsFor(text){return recognizeFeelings(text).map(x=>x.color);}
function colorFor(text){return colorsFor(text)[0]||'#b9c4df';}
function animateFeeling(){const colors=colorsFor(input.value);window.digitalPulse?.(colors.length?colors:['#b9c4df','#d7bed0']);}
function switchStage(id,focusId){const surface=$('flowSurface');for(const key of ['launchPrompt','feelingStep','questionStep','contextStep','resultStep'])$(key).hidden=key!==id;stage=id;surface.inert=false;busy=false;if(focusId)$(focusId).focus();if(!['feelingStep','contextStep'].includes(id)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)$(id).animate?.([{opacity:.45},{opacity:1}],{duration:220,easing:'ease-out'});}
function questionFor(){const names=recognizeFeelings(input.value).map(x=>x.name);if(names.some(x=>['happy','joyful','peaceful','grateful','content','relieved'].includes(x)))return 'What helped you feel this way?';if(names.some(x=>['angry','furious','annoyed','frustrated','hurt'].includes(x)))return 'What happened before this feeling showed up?';return 'What feels most important about this moment?';}
$('launchPrompt').onclick=()=>{if(window.introReady)switchStage('feelingStep','emotionInput');};
function continueEntry(){if(busy||!window.introReady||!input.value.trim())return;selected={name:input.value.trim(),color:colorFor(input.value)};reflection='';$('questionPrompt').textContent=questionFor();animateFeeling();switchStage('questionStep','questionPrompt');}
$('continueButton').onclick=continueEntry;input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();continueEntry();}});
input.addEventListener('input',()=>{$('continueButton').disabled=!input.value.trim();});
function editContext(){$('context').placeholder=$('questionPrompt').textContent;$('contextLabel').textContent=$('questionPrompt').textContent;switchStage('contextStep','context');}
$('questionPrompt').onclick=editContext;$('editAnswer').onclick=editContext;
$('context').addEventListener('input',()=>{$('contextSubmit').disabled=!$('context').value.trim();});
function recommendationFor(){const names=recognizeFeelings(input.value).map(x=>x.name);
 if(names.some(x=>['anxious','worried','stressed','overwhelmed','afraid'].includes(x)))return 'Take a short pause. Feel the support of the floor or chair, then gently notice a few things you can see and hear. When you are ready, choose one small action you can take next.';
 if(names.some(x=>['angry','furious','annoyed','frustrated','jealous'].includes(x)))return 'Give yourself a little space before deciding what to do. Notice what matters to you in this situation, then choose a small response that reflects how you want to treat yourself and others.';
 if(names.some(x=>['sad','lonely','grieving','hurt','ashamed','guilty'].includes(x)))return 'Try putting into words what you would say to someone you care about in this situation. Choose one small act of care for yourself, or reach out to someone you trust.';
 return 'Choose one thing that matters to you in what you wrote. Give it a small, concrete place in your day: a conversation, a few minutes of attention, or one manageable action.';
}
function submitContext(){if(busy||!$('context').value.trim())return;reflection=recommendationFor();$('recommendation').textContent=reflection;animateFeeling();switchStage('resultStep','recommendation');}
$('contextSubmit').onclick=submitContext;$('context').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submitContext();}});
function resetMoment(){if(busy)return;input.value='';$('context').value='';reflection='';selected=null;$('continueButton').disabled=true;$('contextSubmit').disabled=true;switchStage('launchPrompt','launchPrompt');}
$('newMoment').onclick=resetMoment;
function openDialog(id){$(id).showModal();}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('accountButton').onclick=()=>openDialog('accountDialog');$('aboutButton').onclick=()=>openDialog('aboutDialog');
document.querySelector('.brand').onclick=e=>{e.preventDefault();document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(window.introReady)$(stage==='feelingStep'?'emotionInput':stage==='contextStep'?'context':stage==='questionStep'?'questionPrompt':stage==='resultStep'?'recommendation':'launchPrompt').focus();};
$('memoriesButton').onclick=()=>{renderMemories();openDialog('memoriesDialog');};
$('saveMemory').onclick=()=>{if(busy)return;if(!input.value.trim()){input.focus();return;}if(memories.length>=500){notify('Delete a moment before adding another. This prototype holds 500.');return;}
 const m={id:crypto.randomUUID(),emotion:input.value.trim(),context:$('context').value.trim(),at:new Date().toISOString()};
 if(reflection)m.reflection=reflection;
 if(!persist([m,...memories]))return;
 resetMoment();notify(deviceStorage?'Moment saved on this device.':'Moment saved.');};
function renderMemories(){const list=$('memoryList');list.replaceChildren();if(!memories.length){const e=document.createElement('div');e.className='empty-state';const h=document.createElement('h3');h.textContent='Your collection starts here.';const p=document.createElement('p');p.textContent='Saved moments will appear here.';e.append(h,p);list.append(e);return;}
 for(const m of memories){const card=document.createElement('article');card.className='memory-card';const head=document.createElement('div');head.className='memory-heading';const h=document.createElement('h3');h.textContent=m.emotion;const t=document.createElement('time');t.dateTime=m.at;t.textContent=new Date(m.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});head.append(h,t);const p=document.createElement('p');p.textContent=m.context||'No context added.';card.append(head,p);
 if(typeof m.reflection==='string'){const a=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent='Reflection';text.textContent=m.reflection;a.append(summary,text);card.append(a);}
 const b=document.createElement('button');b.className='memory-delete';b.textContent='Delete moment';b.onclick=()=>{pendingDelete=m.id;openDialog('deleteDialog');};card.append(b);list.append(card);}}
$('confirmDelete').onclick=()=>{if(persist(memories.filter(m=>m.id!==pendingDelete))){renderMemories();$('deleteDialog').close();notify('Moment deleted.');pendingDelete=null;}};
$('rememberDevice').onchange=e=>{try{if(e.target.checked)localStorage.setItem(STORAGE_KEY,JSON.stringify(memories));else localStorage.removeItem(STORAGE_KEY);deviceStorage=e.target.checked;storageLabel();}catch{e.target.checked=deviceStorage;notify('Could not change device storage.');}};
storageLabel();
