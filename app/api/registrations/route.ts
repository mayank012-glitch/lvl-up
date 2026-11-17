import {getChatGPTUser} from '@/app/chatgpt-auth';
import {contentDb} from '@/lib/content';
import {json,sameOrigin} from '@/lib/http';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Sign in to register a child.'},401);if(!sameOrigin(request))return json({error:'Request not allowed.'},403);
 try{
 const f=await request.formData();const value=(n:string)=>String(f.get(n)||'').trim();
 const name=value('name'),school=value('school'),parent=value('parent'),phone=value('phone'),session=value('session'),age=Number(value('age'));
 if(!name||name.length>100||!school||school.length>160||!parent||parent.length>100||!/^\+?[\d ()-]{7,25}$/.test(phone)||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15||!Number.isInteger(age)||age<8||age>15||f.get('consent')!=='yes')return json({error:'Check the participant details, parent contact and consent.'},400);
 const db=contentDb();const s=await db.prepare('SELECT s.*,c.status,c.closing FROM event_sessions s JOIN site_content c ON c.id=s.event_id WHERE s.id=?').bind(session).first<{event_id:string;date:string;time:string;status:string;closing:string}>();
 if(!s)return json({error:'Choose a valid event session.'},400);
 const key=name.normalize('NFKC').toLowerCase().replace(/\s+/g,' ');
 const existing=await db.prepare('SELECT id FROM registrations WHERE event_id=? AND owner_id=? AND child_key=?').bind(s.event_id,user.userId,key).first<{id:string}>();
 if(existing)return json({id:existing.id,existing:true});
 const id='LU-'+crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase(),created=new Date().toISOString(),token=crypto.randomUUID();
 // One SQL statement makes the capacity check and reservation atomic, including concurrent requests.
 const result=await db.prepare(`INSERT INTO registrations (id,event_id,session_id,owner_id,child_name,child_key,age,school,parent_name,phone,email,public_consent,photo_consent,consent_version,created,check_token,checked_in)
 SELECT ?,s.event_id,s.id,?,?,?,?,?,?,?,?,?,?,?,?,?,'' FROM event_sessions s JOIN site_content c ON c.id=s.event_id
 WHERE s.id=? AND c.status='upcoming' AND (c.closing='' OR c.closing>=date('now','+5 hours','+30 minutes'))
 AND datetime(s.date||'T'||s.time||':00','-5 hours','-30 minutes')>datetime('now')
 AND (SELECT COUNT(*) FROM registrations WHERE session_id=s.id)<s.capacity
 ON CONFLICT(event_id,owner_id,child_key) DO NOTHING`).bind(id,user.userId,name,key,age,school,parent,phone,user.email,f.get('publicConsent')==='yes'?1:0,f.get('photoConsent')==='yes'?1:0,'2026-09-v1',created,token,session).run();
 if(!result.meta.changes){const old=await db.prepare('SELECT id FROM registrations WHERE event_id=? AND owner_id=? AND child_key=?').bind(s.event_id,user.userId,key).first<{id:string}>();return old?json({id:old.id,existing:true}):json({error:'This session is now full or registration has closed. Please choose another session.'},409);}
 return json({id},201);
 }catch(error){console.error('Registration failed',error);return json({error:'Unable to confirm your registration. Your details remain in the form; please retry.'},503);}
}
