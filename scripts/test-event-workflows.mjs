// In-memory integration checks. Never reads or writes production data.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
import {parseResults,eventHasHappened} from '../lib/results-validation.ts';
import {lastEventDate,validEventDate} from '../lib/event-dates.ts';
import {ageCategory} from '../lib/event-state.ts';
import {registrationSelect} from '../lib/registrations.ts';
import {json,sameOrigin,csvCell} from '../lib/http.ts';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+name,'utf8'));
function prepare(query,args=[]){return {bind(...values){return prepare(query,values)},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}}}}}
const db={prepare,async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}};
let user=null,admin=false;
globalThis.workflowDeps={getChatGPTUser:async()=>user,isAdmin:async()=>admin,contentDb:()=>db,contentBucket:()=>({put:async()=>{},delete:async()=>{}}),listContent:async()=>[],json,sameOrigin,csvCell,parseResults,eventHasHappened,lastEventDate,validEventDate,ageCategory,registrationSelect};
async function route(path){let source=readFileSync(path,'utf8').replace(/import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?/g,'');source='const {'+Object.keys(globalThis.workflowDeps).filter(k=>!new RegExp('(?:const|function) '+k+'[ =(]').test(source)).join(',')+'}=globalThis.workflowDeps;\n'+source;return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const registrations=await route('app/api/registrations/route.ts'),participants=await route('app/api/participants/route.ts'),results=await route('app/api/results/route.ts'),content=await route('app/api/content/route.ts'),cards=await route('app/api/result-card/route.ts');
const origin='https://test.levelup.local';
function request(path,body,method='POST',cross=false){return new Request(origin+path,{method,headers:{origin:cross?'https://other.test':origin,...(!(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body instanceof FormData?body:JSON.stringify(body)})}
function form(name='Test child',session='session-1'){const f=new FormData();for(const [k,v] of Object.entries({name,school:'Test School',parent:'Test Parent',phone:'+919876543210',age:'10',session,consent:'yes'}))f.set(k,v);return f}
sql.prepare("INSERT INTO site_content(id,kind,title,location,city,dates,date,image,created,status) VALUES(?,?,?,?,?,?,?,?,?,?)").run('event-1','event','Test event','Test venue','Test city','["2099-01-01"]','2099-01-01','test-image','2026-01-01','upcoming');
sql.prepare('INSERT INTO event_sessions VALUES(?,?,?,?,?)').run('session-1','event-1','2099-01-01','09:00',1);
assert.equal((await registrations.POST(request('/api/registrations',form()))).status,401);
user={userId:'parent-a',email:'parent-a@example.test'};
assert.equal((await registrations.POST(request('/api/registrations',form(),'POST',true))).status,403);
const invalid=form();invalid.delete('consent');assert.equal((await registrations.POST(request('/api/registrations',invalid))).status,400);
const first=await registrations.POST(request('/api/registrations',form()));assert.equal(first.status,201);const {id}=await first.json();assert.match(id,/^LU-[A-F0-9]{16}$/);
assert.equal((await (await registrations.POST(request('/api/registrations',form()))).json()).id,id);
assert.equal((await registrations.POST(request('/api/registrations',form('Another child')))).status,409);
sql.prepare('UPDATE event_sessions SET capacity=2').run();
const contested=await Promise.all(['Second child','Third child'].map(n=>registrations.POST(request('/api/registrations',form(n)))));assert.deepEqual(contested.map(r=>r.status).sort(),[201,409]);assert.equal(sql.prepare('SELECT COUNT(*) n FROM registrations').get().n,2);
sql.prepare("UPDATE site_content SET status='closed'").run();assert.equal((await registrations.POST(request('/api/registrations',form('Fourth')))).status,409);
sql.prepare("UPDATE site_content SET status='upcoming',closing='2020-01-01'").run();assert.equal((await registrations.POST(request('/api/registrations',form('Fourth')))).status,409);
assert.equal((await participants.GET(new Request(origin+'/api/participants?event=event-1'))).status,403);admin=true;
const listing=await (await participants.GET(new Request(origin+'/api/participants?event=event-1'))).json();assert.equal(listing.length,2);assert.equal('check_token' in listing[0],false);assert.equal('owner_id' in listing[0],false);
let check=await participants.POST(request('/api/participants',{eventId:'event-1',code:id}));assert.equal(check.status,200);assert.equal(sql.prepare('SELECT checked_in FROM registrations WHERE id=?').get(id).checked_in,'');
check=await participants.POST(request('/api/participants',{eventId:'event-1',code:id,confirm:true}));assert.equal(check.status,200);assert.ok(sql.prepare('SELECT checked_in FROM registrations WHERE id=?').get(id).checked_in);
assert.equal((await participants.POST(request('/api/participants',{eventId:'another-event',code:id,confirm:true}))).status,404);
assert.equal(csvCell('=SUM(A1)'),"\"'=SUM(A1)\"");
// Results must be completed, linked to a valid participant and explicitly confirmed.
sql.prepare("UPDATE site_content SET date='2020-01-01',dates='[\"2020-01-01\"]',status='completed'").run();
const csv='rank,participant,school,age_category,total_time,score,account_email,participant_id\n1,Wrong name,Wrong school,10–11,12:34,,,'+id+'\n';
function upload(mode='preview',text=csv,completed='yes'){const f=new FormData();f.set('eventId','event-1');f.set('mode',mode);f.set('completed',completed);f.set('file',new File([text],'results.csv'));return f}
let res=await results.POST(request('/api/results',upload()));assert.equal(res.status,200);assert.equal((await res.json()).rows[0].participant,'Test child');assert.equal(sql.prepare('SELECT COUNT(*) n FROM event_results').get().n,0);
assert.equal((await results.POST(request('/api/results',upload('publish',csv,'')))).status,400);
assert.equal((await results.POST(request('/api/results',upload('publish',csv.replace('10–11','12–13'))))).status,400);
assert.equal((await results.POST(request('/api/results',upload('publish')))).status,200);
assert.equal(sql.prepare('SELECT COUNT(*) n FROM result_history').get().n,1);
const card=await cards.GET(new Request(origin+'/api/result-card?event=event-1&row=0'));assert.equal(card.status,200);assert.equal(card.headers.get('Cache-Control'),'private, no-store');
user={userId:'other-parent',email:'other@example.test'};assert.equal((await cards.GET(new Request(origin+'/api/result-card?event=event-1&row=0'))).status,404);user={userId:'parent-a',email:'parent-a@example.test'};
assert.equal((await results.DELETE(request('/api/results',{eventId:'event-1'},'DELETE'))).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM event_results').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM result_history').get().n,2);
const restore=upload('restore');restore.set('version',sql.prepare('SELECT id FROM result_history LIMIT 1').get().id);assert.equal((await results.POST(request('/api/results',restore))).status,200);
assert.throws(()=>parseResults(csv+csv.split('\n')[1]+'\n'),/duplicate participant/);
const many='rank,participant,school,age_category,total_time,score\n'+Array.from({length:1000},(_,i)=>`${i+1},Child ${i},School,10–11,12:34,`).join('\n');assert.equal(parseResults(many).length,1000);
// Content edits enforce session integrity and preserve booked sessions.
function editEvent(sessions){const f=new FormData();for(const [k,v] of Object.entries({id:'event-1',kind:'event',title:'Test event',location:'Test venue',city:'Test city',dates:'2099-01-01',status:'upcoming',contact:'Test organiser',sessions:JSON.stringify(sessions)}))f.set(k,v);return f;}
assert.equal((await content.POST(request('/api/content',editEvent([])))).status,400);
assert.equal((await content.POST(request('/api/content',editEvent([{id:'session-1',date:'2099-01-01',time:'09:00',capacity:1}])))).status,409);
assert.equal((await content.POST(request('/api/content',editEvent([{id:'session-1',date:'2099-01-01',time:'10:00',capacity:3}])))).status,409);
assert.equal((await content.POST(request('/api/content',editEvent([{id:'session-1',date:'2099-01-01',time:'09:00',capacity:3}])))).status,200);
assert.equal(sql.prepare('SELECT capacity FROM event_sessions').get().capacity,3);
assert.equal((await content.DELETE(request('/api/content',{id:'event-1'},'DELETE'))).status,200);assert.equal(sql.prepare('SELECT status FROM site_content').get().status,'archived');assert.equal(sql.prepare('SELECT COUNT(*) n FROM registrations').get().n,2);assert.equal(sql.prepare('SELECT COUNT(*) n FROM event_results').get().n,1);
sql.close();delete globalThis.workflowDeps;
console.log('PASS: migrations, authentication, CSRF, consent, atomic capacity, duplicate retry, closed bookings, private exports, check-in, result preview/publish/history/restore, owner-only downloads, 1,000 results, and archival retention.');
