'use strict';
const $=id=>document.getElementById(id),input=$('emotionInput');
const STORAGE_KEY='afterglow.memories.v1';
let selected=null,memories=[],deviceStorage=false,pendingDelete=null,toastTimer,reflection='',busy=false;
function notify(text){$('status').textContent=text;$('status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').hidden=true,4500);}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(saved)){memories=saved.filter(m=>m&&typeof m.id==='string'&&typeof m.emotion==='string'&&m.emotion.length<=160&&typeof m.context==='string'&&Number.isFinite(Date.parse(m.at))).slice(0,500);deviceStorage=true;}}catch{notify('Device storage is unavailable. Entries will stay in this session.');}
function storageLabel(){$('storageLabel').textContent=deviceStorage?'Saved on this device':'Session only';$('rememberDevice').checked=deviceStorage;$('count').textContent=memories.length;}
function persist(next){if(deviceStorage){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{notify('Could not save on this device. Your changes have not been applied.');return false;}}memories=next;storageLabel();return true;}
function colorFor(name){const colors={peaceful:'#87bfa0',calm:'#87bfa0',stressed:'#c9bd7d',furious:'#b47373',angry:'#b47373',annoyed:'#c5a17e',sad:'#8fa6ba',hopeful:'#b0a9bb',affectionate:'#ba9eae'};return colors[name.toLowerCase().trim()]||'#b6c0b8';}
function continueEntry(){if(busy||!window.introReady||!input.value.trim())return;selected={name:input.value.trim(),color:colorFor(input.value)};document.documentElement.style.setProperty('--accent',selected.color);$('contextStep').hidden=false;$('stepLabel').textContent='02 / CONTEXT';window.setDigitalScene?.('context');window.digitalPulse?.(selected.color);$('reflectionPanel').hidden=false;askAI();}
$('continueButton').onclick=continueEntry;input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();continueEntry();}});
input.addEventListener('input',()=>{$('continueButton').hidden=!input.value.trim();if(selected)selected={name:input.value.trim(),color:colorFor(input.value)};clearReflection();});
function clearReflection(){reflection='';$('aiOutput').textContent='';$('feedbackActions').hidden=true;$('correctionBlock').hidden=true;$('correction').value='';}
$('context').addEventListener('input',clearReflection);
function openDialog(id){$(id).showModal();}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('accountButton').onclick=()=>openDialog('accountDialog');$('aboutButton').onclick=()=>openDialog('aboutDialog');
document.querySelector('.brand').onclick=e=>{e.preventDefault();document.querySelectorAll('dialog[open]').forEach(d=>d.close());input.focus();};
$('memoriesButton').onclick=()=>{renderMemories();openDialog('memoriesDialog');};
$('saveMemory').onclick=()=>{if(busy)return;if(!input.value.trim()){input.focus();return;}if(memories.length>=500){notify('Delete a moment before adding another. This prototype holds 500.');return;}
 const m={id:crypto.randomUUID(),emotion:input.value.trim(),context:$('context').value.trim(),at:new Date().toISOString()};
 if(reflection)m.reflection=reflection;
 if(!persist([m,...memories]))return;
 window.digitalPulse?.(selected?.color||'#b6c0b8');input.value='';$('context').value='';selected=null;$('contextStep').hidden=true;$('reflectionPanel').hidden=true;$('continueButton').hidden=true;clearReflection();$('stepLabel').textContent='01 / CHECK IN';window.setDigitalScene?.('prompt');notify(deviceStorage?'Moment saved on this device.':'Moment saved for this session.');input.focus();};
function renderMemories(){const list=$('memoryList');list.replaceChildren();if(!memories.length){const e=document.createElement('div');e.className='empty-state';const h=document.createElement('h3');h.textContent='Your collection starts here.';const p=document.createElement('p');p.textContent='Saved moments will appear here.';e.append(h,p);list.append(e);return;}
 for(const m of memories){const card=document.createElement('article');card.className='memory-card';const head=document.createElement('div');head.className='memory-heading';const h=document.createElement('h3');h.textContent=m.emotion;const t=document.createElement('time');t.dateTime=m.at;t.textContent=new Date(m.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});head.append(h,t);const p=document.createElement('p');p.textContent=m.context||'No context added.';card.append(head,p);
 if(typeof m.reflection==='string'){const a=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent='AI reflection';text.textContent=m.reflection;a.append(summary,text);card.append(a);}
 const b=document.createElement('button');b.className='memory-delete';b.textContent='Delete moment';b.onclick=()=>{pendingDelete=m.id;openDialog('deleteDialog');};card.append(b);list.append(card);}}
$('confirmDelete').onclick=()=>{if(persist(memories.filter(m=>m.id!==pendingDelete))){renderMemories();$('deleteDialog').close();notify('Moment deleted.');pendingDelete=null;}};
$('rememberDevice').onchange=e=>{try{if(e.target.checked)localStorage.setItem(STORAGE_KEY,JSON.stringify(memories));else localStorage.removeItem(STORAGE_KEY);deviceStorage=e.target.checked;storageLabel();}catch{e.target.checked=deviceStorage;notify('Could not change device storage.');}};
$('closeReflection').onclick=()=>{$('reflectionPanel').hidden=true;};
function setBusy(v){busy=v;for(const id of ['continueButton','contextSubmit','reviseAI','saveMemory','emotionInput','context','correction'])$(id).disabled=v;}
async function askAI(revise=false){if(busy||!window.introReady)return;
 const feeling=input.value.trim(),context=$('context').value.trim(),correction=revise?$('correction').value.trim():'';
 if(!feeling){input.focus();return;}if(revise&&!correction){$('correction').focus();return;}
 $('reflectionPanel').hidden=false;setBusy(true);$('aiAvailability').textContent='Reflecting…';$('feedbackActions').hidden=true;
 try{const r=await fetch('/api/reflect',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({feeling,context,correction,previous:revise?reflection:'',consent:true}),signal:AbortSignal.timeout(35000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Reflection unavailable.');
 if(typeof d.reflection!=='string'||!d.reflection.trim())throw Error('No reflection was returned. Try again.');
 reflection=d.reflection;$('aiOutput').textContent=reflection;$('aiAvailability').textContent='';$('feedbackActions').hidden=false;$('correctionBlock').hidden=true;window.digitalPulse?.(selected?.color||'#b6c0b8');
 }catch(e){$('aiAvailability').textContent=e.name==='TimeoutError'?'The request timed out. You can try again.':e.message||'AI reflection unavailable. Try again.';}finally{setBusy(false);}}
$('contextSubmit').onclick=()=>askAI();$('context').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();askAI();}});$('reviseAI').onclick=()=>askAI(true);
$('fits').onclick=()=>{$('feedbackActions').hidden=true;notify('Reflection kept with this entry. Save the moment when you’re ready.');};
$('notQuite').onclick=()=>{$('correctionBlock').hidden=false;$('correction').focus();};
storageLabel();
