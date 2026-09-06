import fs from 'node:fs';
const files = {'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/styles.css':['styles.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/dream.js':['dream.js','text/javascript; charset=utf-8'],'/intro-timing.js':['intro-timing.js','text/javascript; charset=utf-8']};
const assets=Object.fromEntries(Object.entries(files).map(([url,[file,type]])=>[url,{body:fs.readFileSync('dist/'+file,'utf8'),type}]));
fs.mkdirSync('dist/server',{recursive:true});
fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+fs.readFileSync('worker.mjs','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
