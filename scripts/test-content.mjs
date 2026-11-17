// Isolated route tests: in-memory SQLite and object storage; no network or production writes.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {validEventDate,getEventDates,lastEventDate} from '../lib/event-dates.ts';
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(readFileSync('drizzle/0000_confused_prima.sql','utf8'));
sqlite.exec(readFileSync('drizzle/0002_freezing_blackheart.sql','utf8'));
const db={prepare(sql){return {bind(...args){return {async first(){return sqlite.prepare(sql).get(...args)||null;},async run(){return sqlite.prepare(sql).run(...args);}};}};}};
const objects=new Map();let authorized=false;
globalThis.testContentDeps={validEventDate,isAdmin:async()=>authorized,contentDb:()=>db,contentBucket:()=>({put:async(key,bytes)=>objects.set(key,bytes),delete:async(key)=>objects.delete(key)}),listContent:async()=>sqlite.prepare('SELECT * FROM site_content ORDER BY date,created').all()};
let source=readFileSync('app/api/content/route.ts','utf8').replace(/^import .*;\n/gm,'');
source='const {validEventDate,isAdmin,contentDb,contentBucket,listContent}=globalThis.testContentDeps;\n'+source;
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const route=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const origin='https://level-up.test';
function request(data,method='POST',requestOrigin=origin){return new Request(origin+'/api/content',{method,headers:{origin:requestOrigin,...(method==='DELETE'?{'Content-Type':'application/json'}:{})},body:method==='DELETE'?JSON.stringify(data):data});}
function form(overrides={},image=true){const f=new FormData();for(const [k,v] of Object.entries({id:'test-event',kind:'event',title:'Test race',location:'Test venue',city:'Test city',dates:'2027-02-01',...overrides}))f.set(k,v);if(image)f.set('image',new File([new Uint8Array([255,216,255,0])],'test.jpg',{type:'image/jpeg'}));return f;}
assert.equal((await route.GET()).status,403);
assert.equal((await route.POST(request(form()))).status,403);
assert.equal((await route.DELETE(request({id:'test-event'},'DELETE'))).status,403);
authorized=true;
assert.equal((await route.POST(request(form(),'POST','https://untrusted.test'))).status,403);
for(const bad of [{location:''},{city:''},{dates:''},{dates:'2027-02-30'},{title:''}])assert.equal((await route.POST(request(form(bad)))).status,400);
assert.equal((await route.POST(request(form({},false)))).status,400);
const invalid=form();invalid.set('image',new File(['<svg/>'],'bad.svg',{type:'image/svg+xml'}));assert.equal((await route.POST(request(invalid))).status,400);
const multi=form();multi.append('dates','2027-02-03');multi.append('dates','2027-02-01');assert.equal((await route.POST(request(multi))).status,200);assert.equal(objects.size,1);
const saved=sqlite.prepare('SELECT * FROM site_content WHERE id=?').get('test-event');assert.equal(saved.city,'Test city');assert.deepEqual(getEventDates(saved),['2027-02-01','2027-02-03']);assert.equal(lastEventDate(saved),'2027-02-03');
assert.deepEqual(getEventDates({date:'2026-09-17',dates:'[]'}),['2026-09-17']);
let rows=await (await route.GET()).json();assert.equal(rows.length,1);const imageKey=rows[0].image;
assert.equal((await route.POST(request(form({location:'Updated venue'},false)))).status,200);
rows=await (await route.GET()).json();assert.equal(rows[0].location,'Updated venue');assert.equal(rows[0].image,imageKey);
assert.equal((await route.POST(request(form({id:'test-brand',kind:'brand',title:'Test brand',location:'',date:''})))).status,200);
assert.equal((await (await route.GET()).json()).length,2);
assert.equal((await route.DELETE(request({id:'test-event'},'DELETE'))).status,200);assert.equal(objects.has(imageKey),false);
assert.equal((await (await route.GET()).json()).length,1);
sqlite.close();delete globalThis.testContentDeps;
console.log('Passed: admin authorization, cross-origin rejection, required fields, real dates, image validation, create/edit/list/remove, image retention and cleanup.');
