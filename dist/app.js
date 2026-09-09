'use strict';
const $=id=>document.getElementById(id),input=$('emotionInput');
const STORAGE_KEY='afterglow.memories.v1';
let stage='launchPrompt',transitionTimer;let selected=null,memories=[],deviceStorage=false,pendingDelete=null,toastTimer,reflection='',busy=false;
function notify(text){$('status').textContent=text;$('status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').hidden=true,4500);}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(saved)){memories=saved.filter(m=>m&&typeof m.id==='string'&&typeof m.emotion==='string'&&m.emotion.length<=160&&typeof m.context==='string'&&Number.isFinite(Date.parse(m.at))).slice(0,500);deviceStorage=true;}}catch{notify('Device storage is unavailable. Entries will stay in this session.');}
function storageLabel(){$('rememberDevice').checked=deviceStorage;$('count').textContent=memories.length;}
function persist(next){if(deviceStorage){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{notify('Could not save on this device. Your changes have not been applied.');return false;}}memories=next;storageLabel();return true;}
const feelingCatalog=[{"name":"peaceful","color":"#d19db0","words":["peaceful","peace","at peace"]},{"name":"calm","color":"#8cb1d4","words":["calm","calmness"]},{"name":"relaxed","color":"#dccb8f","words":["relaxed","relaxation"]},{"name":"content","color":"#ac99ce","words":["content","contentment","contented"]},{"name":"relieved","color":"#d39fb2","words":["relieved","relief"]},{"name":"grateful","color":"#8eb3d6","words":["grateful","gratitude","thankful"]},{"name":"happy","color":"#decd91","words":["happy","happiness"]},{"name":"joyful","color":"#ae9bd0","words":["joyful","joy","joyous"]},{"name":"excited","color":"#d5a1b4","words":["excited","excitement"]},{"name":"hopeful","color":"#90b5d8","words":["hopeful","hope"]},{"name":"proud","color":"#e0cf93","words":["proud","pride"]},{"name":"confident","color":"#b09dd2","words":["confident","confidence"]},{"name":"loved","color":"#d7a3b6","words":["loved","love","loving"]},{"name":"affectionate","color":"#92b7da","words":["affectionate","affection"]},{"name":"connected","color":"#e2d195","words":["connected","connection"]},{"name":"amused","color":"#b29fd4","words":["amused","amusement"]},{"name":"curious","color":"#d9a5b8","words":["curious","curiosity","interested"]},{"name":"inspired","color":"#94b9dc","words":["inspired","inspiration"]},{"name":"awed","color":"#e4d397","words":["awed","awe","in awe"]},{"name":"nostalgic","color":"#b4a1d6","words":["nostalgic","nostalgia"]},{"name":"sad","color":"#dba7ba","words":["sad","sadness","unhappy"]},{"name":"lonely","color":"#96bbde","words":["lonely","loneliness","isolated"]},{"name":"disappointed","color":"#e6d599","words":["disappointed","disappointment"]},{"name":"grieving","color":"#b6a3d8","words":["grieving","grief","heartbroken"]},{"name":"hurt","color":"#dda9bc","words":["hurt","wounded"]},{"name":"guilty","color":"#98bde0","words":["guilty","guilt"]},{"name":"ashamed","color":"#e8d79b","words":["ashamed","shame"]},{"name":"embarrassed","color":"#b8a5da","words":["embarrassed","embarrassment"]},{"name":"anxious","color":"#dfabbe","words":["anxious","anxiety","uneasy"]},{"name":"worried","color":"#9abfe2","words":["worried","worry"]},{"name":"stressed","color":"#ead99d","words":["stressed","stress","under stress"]},{"name":"overwhelmed","color":"#baa7dc","words":["overwhelmed","overwhelm"]},{"name":"afraid","color":"#e1adc0","words":["afraid","fear","scared","fearful"]},{"name":"insecure","color":"#9cc1e4","words":["insecure","insecurity"]},{"name":"angry","color":"#ecdb9f","words":["angry","anger","mad"]},{"name":"furious","color":"#bca9de","words":["furious","fury","enraged"]},{"name":"annoyed","color":"#e3afc2","words":["annoyed","annoyance","irritated"]},{"name":"frustrated","color":"#9ec3e6","words":["frustrated","frustration"]},{"name":"jealous","color":"#eedda1","words":["jealous","jealousy","envious","envy"]},{"name":"disgusted","color":"#beabe0","words":["disgusted","disgust"]},{"name":"tired","color":"#a6b3d5","words":["tired","fatigued","fatigue","sleepy","low energy"]},{"name":"exhausted","color":"#a59cc6","words":["exhausted","drained","worn out","burnt out","burned out"]},{"name":"energized","color":"#e4d5a5","words":["energized","energised","energetic","high energy"]},{"name":"euphoric","color":"#c3a2d9","words":["euphoric","euphoria","elated"]}];
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
function topicFor(text){
 if(/\b(sleep|slept|insomnia|awake|bed|night)\b/i.test(text))return 'sleep';
 if(/\b(work|boss|deadline|job|exam|study|studying|workload)\b/i.test(text))return 'work';
 if(/\b(friend|partner|family|relationship|argument|breakup|colleague)\b/i.test(text))return 'relationship';
 return '';
}
function questionFor(){
 const names=recognizeFeelings(input.value).map(x=>x.name),has=(...items)=>items.some(x=>names.includes(x)),topic=topicFor(input.value);
 if(topic==='sleep')return 'How has your sleep been, and what feels different today?';
 if(topic==='work')return 'Which part of that responsibility is taking the most from you—or giving you energy?';
 if(topic==='relationship')return 'What happened between you, and what would you like them to understand?';
 if(has('tired','exhausted'))return 'Does this feel physical, mental, or both? What has been asking the most of you?';
 if(has('excited','energized','euphoric'))return 'What is giving you this energy, and how are sleep and rest fitting in?';
 if(has('anxious','worried','afraid','insecure'))return 'What are you anticipating, and which part is within your control?';
 if(has('stressed','overwhelmed'))return 'What feels like too much right now? What could wait?';
 if(has('lonely','disconnected'))return 'What kind of connection are you missing right now?';
 if(has('sad','grieving','disappointed'))return 'What feels lost or different, and what support would feel welcome?';
 if(has('angry','furious','annoyed','frustrated','hurt','jealous'))return 'What need or boundary feels overlooked?';
 if(has('guilty','ashamed','embarrassed'))return 'What are you telling yourself about what happened?';
 if(has('happy','joyful','peaceful','calm','relaxed','grateful','content','relieved','loved','connected'))return 'What made this possible, and what would you like to carry forward?';
 if(names.length)return 'What brought on this feeling, and what do you need from this moment?';
 return 'Where do you notice this in your body, and what happened just before it?';
}
$('launchPrompt').onclick=()=>{if(window.introReady)switchStage('feelingStep','emotionInput');};
function continueEntry(){if(busy||!window.introReady||!input.value.trim())return;selected={name:input.value.trim(),color:colorFor(input.value)};reflection='';$('questionPrompt').textContent=questionFor();animateFeeling();switchStage('questionStep','questionPrompt');}
$('continueButton').onclick=continueEntry;input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();continueEntry();}});
input.addEventListener('input',()=>{$('continueButton').disabled=!input.value.trim();});
function editContext(){$('context').placeholder=$('questionPrompt').textContent;$('contextLabel').textContent=$('questionPrompt').textContent;switchStage('contextStep','context');}
$('questionPrompt').onclick=editContext;$('editAnswer').onclick=editContext;
$('context').addEventListener('input',()=>{$('contextSubmit').disabled=!$('context').value.trim();});
function recommendationFor(){const names=recognizeFeelings(input.value).map(x=>x.name),topic=topicFor($('context').value);
 if(names.some(x=>['tired','exhausted'].includes(x)))return 'Make room for a short restorative break and choose one demand that can wait. Consider how sleep has been recently. If tiredness persists for weeks, has no clear cause, or affects daily life, speak with a healthcare professional.';
 if(names.some(x=>['excited','energized','euphoric'].includes(x)))return 'Enjoy what is giving you energy. Give one idea a manageable next step, and leave room for your usual meals, sleep, and breaks. You do not need to act on every idea today.';
 if(topic==='sleep')return 'Try making space for a familiar wind-down routine tonight. Write down one thought you want to return to tomorrow, then give yourself permission to leave it there for now.';
 if(topic==='work')return 'Write down the smallest useful next step. Choose one other demand to postpone or ask for help with, and leave space for a short break.';
 if(topic==='relationship')return 'When you feel ready, try putting your need into a simple sentence: “I felt … when …, and I would appreciate …”. You can write it privately first and decide later whether to share it.';
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
 resetMoment();notify(deviceStorage?'Moment saved on this device.':'Moment saved.');renderAnalytics();checkPatterns(true);};
function renderMemories(){const list=$('memoryList');list.replaceChildren();if(!memories.length){const e=document.createElement('div');e.className='empty-state';const h=document.createElement('h3');h.textContent='Your collection starts here.';const p=document.createElement('p');p.textContent='Saved moments will appear here.';e.append(h,p);list.append(e);return;}
 for(const m of memories){const card=document.createElement('article');card.className='memory-card';const head=document.createElement('div');head.className='memory-heading';const h=document.createElement('h3');h.textContent=m.emotion;const t=document.createElement('time');t.dateTime=m.at;t.textContent=new Date(m.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});head.append(h,t);const p=document.createElement('p');p.textContent=m.context||'No context added.';card.append(head,p);
 if(typeof m.reflection==='string'){const a=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent='Reflection';text.textContent=m.reflection;a.append(summary,text);card.append(a);}
 const b=document.createElement('button');b.className='memory-delete';b.textContent='Delete moment';b.onclick=()=>{pendingDelete=m.id;openDialog('deleteDialog');};card.append(b);list.append(card);}}
$('confirmDelete').onclick=()=>{if(persist(memories.filter(m=>m.id!==pendingDelete))){renderMemories();renderAnalytics();checkPatterns();$('deleteDialog').close();notify('Moment deleted.');pendingDelete=null;}};
$('rememberDevice').onchange=e=>{try{if(e.target.checked)localStorage.setItem(STORAGE_KEY,JSON.stringify(memories));else localStorage.removeItem(STORAGE_KEY);deviceStorage=e.target.checked;storageLabel();}catch{e.target.checked=deviceStorage;notify('Could not change device storage.');}};
storageLabel();

const fatigueNames=['tired','exhausted'],energyNames=['excited','energized','euphoric'];
let remindersEnabled=false,lastReminder=0;
function summarizeMoments(items,days,now=Date.now()){
 const cutoff=now-days*86400000,entries=items.filter(m=>Date.parse(m.at)>=cutoff&&Date.parse(m.at)<=now),counts={};let tired=0,energy=0,unmatched=0;
 for(const m of entries){const names=recognizeFeelings(m.emotion).map(x=>x.name);if(!names.length)unmatched++;for(const n of names)counts[n]=(counts[n]||0)+1;if(names.some(n=>fatigueNames.includes(n)))tired++;if(names.some(n=>energyNames.includes(n)))energy++;}
 return {entries,counts,tired,energy,unmatched};
}
function patternMessage(){const s=summarizeMoments(memories,7);const messages=[];
 if(s.tired>=3)messages.push('You named tiredness in '+s.tired+' saved moments this week. Would a break or a lighter plan help today?');
 if(s.energy>=3)messages.push('You named high energy in '+s.energy+' saved moments this week. How are your sleep, meals, and breaks fitting in? Excitement itself is not a problem.');
 return messages.join(' ');
}
function renderAnalytics(){
 const s=summarizeMoments(memories,Number($('analyticsRange').value)||7);
 $('analyticsSummary').textContent=s.entries.length? s.entries.length+' saved moments · '+s.tired+' mentioning tiredness · '+s.energy+' mentioning high energy' : 'Your pattern starts with your first saved moment.';
 const list=$('emotionStats');list.replaceChildren();
 for(const [name,count] of Object.entries(s.counts).sort((a,b)=>b[1]-a[1])){const row=document.createElement('div');row.className='stat-row';const label=document.createElement('span');label.textContent=name;const bar=document.createElement('meter');bar.min=0;bar.max=s.entries.length;bar.value=count;bar.setAttribute('aria-label',name+' in '+count+' of '+s.entries.length+' moments');bar.style.setProperty('--feeling',feelingCatalog.find(x=>x.name===name).color);const value=document.createElement('span');value.textContent=count;row.append(label,bar,value);list.append(row);}
 $('unmatchedStats').textContent=s.unmatched?s.unmatched+' moments use words outside the current palette. They remain in your memories.':'';
 $('patternNote').textContent=patternMessage()||'There is no repeated tiredness or high-energy pattern in the last 7 days.';
 $('analyticsStorage').textContent=deviceStorage?'Using memories saved in this browser.':'Using this session’s memories. To build a history across visits, turn on “Keep memories on this device” in Memories.';
}
function checkPatterns(send=false){const message=patternMessage();$('patternNudge').hidden=!message;$('patternNudge').textContent=message?'A pattern to explore ↗':'';
 if(send&&message&&remindersEnabled&&Date.now()-lastReminder>86400000&&'Notification' in window&&Notification.permission==='granted'){try{const n=new Notification('A moment for yourself',{body:'There is a new pattern to explore in Afterglow.',tag:'afterglow-pattern'});n.onclick=()=>{window.focus();renderAnalytics();openDialog('analyticsDialog');n.close();};lastReminder=Date.now();}catch{$('notificationStatus').textContent='This browser cannot show notifications here. Patterns remain available in this view.';}}
}
$('analyticsButton').onclick=$('patternNudge').onclick=()=>{renderAnalytics();openDialog('analyticsDialog');};
$('analyticsRange').onchange=renderAnalytics;
$('enableReminders').onclick=async()=>{
 if(remindersEnabled){remindersEnabled=false;$('enableReminders').textContent='Enable browser reminders';$('notificationStatus').textContent='Reminders are off.';return;}
 if(!('Notification' in window)){$('notificationStatus').textContent='Notifications are not supported in this browser. You can still view patterns here.';return;}
 try{const permission=await Notification.requestPermission();remindersEnabled=permission==='granted';$('enableReminders').textContent=remindersEnabled?'Turn off browser reminders':'Enable browser reminders';$('notificationStatus').textContent=remindersEnabled?'Enabled for this visit. At most one reminder per day, after saving a moment while this page is open.':'Permission was not granted. You can change this in your browser settings.';}catch{$('notificationStatus').textContent='Notifications are unavailable. Your patterns still appear here.';}
};
renderAnalytics();checkPatterns();
