'use strict';
const $=id=>document.getElementById(id),input=$('emotionInput');
const STORAGE_KEY='afterglow.memories.v1';
let stage='launchPrompt',transitionTimer;let selected=null,memories=[],deviceStorage=false,pendingDelete=null,toastTimer,reflection='',busy=false;
function notify(text){$('status').textContent=text;$('status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').hidden=true,4500);}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(saved)){memories=saved.filter(m=>m&&typeof m.id==='string'&&typeof m.emotion==='string'&&m.emotion.length<=160&&typeof m.context==='string'&&Number.isFinite(Date.parse(m.at))).slice(0,500);deviceStorage=true;}}catch{notify('Device storage is unavailable. Entries will stay in this session.');}
function storageLabel(){$('rememberDevice').checked=deviceStorage;$('count').textContent=memories.length;}
function persist(next){if(deviceStorage){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{notify('Could not save on this device. Your changes have not been applied.');return false;}}memories=next;storageLabel();return true;}
const feelingCatalog=[{"name":"peaceful","color":"#b4d6c6","words":["peaceful","peace","at peace"]},{"name":"calm","color":"#a9cfc8","words":["calm","calmness"]},{"name":"relaxed","color":"#c1d7bb","words":["relaxed","relaxation"]},{"name":"content","color":"#cfd8b4","words":["content","contentment","contented"]},{"name":"relieved","color":"#b5dacc","words":["relieved","relief"]},{"name":"grateful","color":"#d9cba8","words":["grateful","gratitude","thankful"]},{"name":"happy","color":"#e0d0a8","words":["happy","happiness"]},{"name":"joyful","color":"#e6c39d","words":["joyful","joy","joyous"]},{"name":"excited","color":"#e6b99e","words":["excited","excitement"]},{"name":"hopeful","color":"#c6badf","words":["hopeful","hope"]},{"name":"proud","color":"#cbb2d6","words":["proud","pride"]},{"name":"confident","color":"#b2c5d8","words":["confident","confidence"]},{"name":"loved","color":"#d9b9cd","words":["loved","love","loving"]},{"name":"affectionate","color":"#e0bdc8","words":["affectionate","affection"]},{"name":"connected","color":"#c2ccbd","words":["connected","connection"]},{"name":"amused","color":"#e0c4b4","words":["amused","amusement"]},{"name":"curious","color":"#bad1dc","words":["curious","curiosity","interested"]},{"name":"inspired","color":"#c4bee2","words":["inspired","inspiration"]},{"name":"awed","color":"#b8b6d8","words":["awed","awe","in awe"]},{"name":"nostalgic","color":"#c6b5c3","words":["nostalgic","nostalgia"]},{"name":"sad","color":"#b2c9df","words":["sad","sadness","unhappy"]},{"name":"lonely","color":"#abbcd2","words":["lonely","loneliness","isolated"]},{"name":"disappointed","color":"#b6b4ca","words":["disappointed","disappointment"]},{"name":"grieving","color":"#a6b0c6","words":["grieving","grief","heartbroken"]},{"name":"hurt","color":"#c3aebf","words":["hurt","wounded"]},{"name":"guilty","color":"#c4baa8","words":["guilty","guilt"]},{"name":"ashamed","color":"#bcaab4","words":["ashamed","shame"]},{"name":"embarrassed","color":"#d6b5bd","words":["embarrassed","embarrassment"]},{"name":"anxious","color":"#d9d0b8","words":["anxious","anxiety","uneasy"]},{"name":"worried","color":"#d3c79f","words":["worried","worry"]},{"name":"stressed","color":"#ded2a9","words":["stressed","stress","under stress"]},{"name":"overwhelmed","color":"#cbbcc6","words":["overwhelmed","overwhelm"]},{"name":"afraid","color":"#bcb9d0","words":["afraid","fear","scared","fearful"]},{"name":"insecure","color":"#b7bfd0","words":["insecure","insecurity"]},{"name":"angry","color":"#d7b0ae","words":["angry","anger","mad"]},{"name":"furious","color":"#d5a2ab","words":["furious","fury","enraged"]},{"name":"annoyed","color":"#dfbfa9","words":["annoyed","annoyance","irritated"]},{"name":"frustrated","color":"#d9b49d","words":["frustrated","frustration"]},{"name":"jealous","color":"#c0c4a7","words":["jealous","jealousy","envious","envy"]},{"name":"disgusted","color":"#b8c1aa","words":["disgusted","disgust"]}];
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
