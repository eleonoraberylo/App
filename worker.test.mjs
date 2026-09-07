import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
const request=(body,extra={})=>new Request('https://journal.test/api/reflect',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://journal.test','oai-authenticated-user-id':'test-user',...extra},body:JSON.stringify(body)});
const entry={feeling:'uncertain',context:'A difficult conversation.',correction:'',previous:'',consent:true};
test('entry page has a free-text input and no exposed emotion list',async()=>{const r=await worker.fetch(new Request('https://journal.test/'),{});const h=await r.text();assert.equal(r.status,200);assert.ok(h.includes('contextSubmit'));assert.ok(h.includes('placeholder="Today I’m feeling"'));assert.ok(!h.includes('placeholder="…"'));assert.ok(!h.includes('class="prompt"'));assert.ok(!h.includes('reflectButton'));assert.ok(!h.includes('emotionOptions'));assert.ok(!h.includes('Touch the words'));});
test('unauthenticated requests are rejected',async()=>{const r=await worker.fetch(request(entry,{'oai-authenticated-user-id':''}),{});assert.equal(r.status,401);});
test('cross-origin requests are rejected',async()=>{const r=await worker.fetch(request(entry,{origin:'https://elsewhere.test'}),{});assert.equal(r.status,403);});
test('consent is required',async()=>{const r=await worker.fetch(request({...entry,consent:false}),{});assert.equal(r.status,400);});
test('missing provider configuration is explicit',async()=>{const r=await worker.fetch(request(entry),{});assert.equal(r.status,503);});
test('overlong entries are rejected before model access',async()=>{const r=await worker.fetch(request({...entry,context:'x'.repeat(4001)}),{});assert.equal(r.status,400);});
test('model request is stateless and returns real provider text',async()=>{const original=globalThis.fetch;let sent;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');sent=JSON.parse(options.body);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Could this be uncertainty?'}]}]});};try{const r=await worker.fetch(request(entry),{OPENAI_API_KEY:'test-only',OPENAI_MODEL:'configured-model'});assert.equal(r.status,200);assert.equal((await r.json()).reflection,'Could this be uncertainty?');assert.equal(sent.store,false);assert.equal(sent.model,'configured-model');assert.equal(JSON.parse(sent.input).feeling,'uncertain');}finally{globalThis.fetch=original;}});

await import('./dist/intro-timing.js');
test('typing unlocks at 15 seconds, never before',()=>{for(const elapsed of [0,9500,13500,14999])assert.equal(IntroTiming.canType(elapsed),false);assert.equal(IntroTiming.canType(15000),true);assert.equal(IntroTiming.canType(90000),true);});
test('stars settle before the input fades in',()=>{assert.equal(IntroTiming.settle(9500),0);assert.equal(IntroTiming.settle(11500),.5);assert.equal(IntroTiming.settle(13500),1);});
