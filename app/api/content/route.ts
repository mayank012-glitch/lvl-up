import { isAdmin } from "@/lib/admin";
import { contentDb, contentBucket, listContent, type ContentRecord } from "@/lib/content";
import {validEventDate} from "@/lib/event-dates";
export const dynamic = "force-dynamic";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
export async function GET() {
  if (!await isAdmin()) return json({error:"Admin access required."},403);
  try { return json(await listContent()); }
  catch (error) { console.error("Content load failed",error); return json({error:"Unable to load content. Please retry."},503); }
}
export async function POST(request: Request) {
  if (!await isAdmin() || !sameOrigin(request)) return json({error:"Admin access required."},403);
  let newImage = "";
  try {
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) return json({error:"Choose an image smaller than 5 MB."},400);
    const form = await request.formData();
    const kind = String(form.get("kind") || "");
    const title = String(form.get("title") || "").trim();
    const location = kind === "event" ? String(form.get("location") || "").trim() : "";
    const city = kind === "event" ? String(form.get("city") || "").trim() : "";
    const dates = kind === "event" ? [...new Set(form.getAll("dates").map(String))].sort() : [];
    const date = dates[0] || "";
    const status=String(form.get('status')||'draft'),closing=String(form.get('closing')||''),reporting=String(form.get('reporting')||'').trim(),address=String(form.get('address')||'').trim(),contact=String(form.get('contact')||'').trim();
    if(!['draft','upcoming','closed','completed','archived'].includes(status)||closing&&!validEventDate(closing)||reporting.length>300||address.length>500||contact.length>200)return json({error:'Check the event status, closing date and contact information.'},400);
    let sessions:{id:string;date:string;time:string;capacity:number}[]=[];
    try{sessions=JSON.parse(String(form.get('sessions')||'[]'));}catch{return json({error:'Invalid sessions.'},400);}
    if(kind==='event'&&(!Array.isArray(sessions)||sessions.length>100||sessions.some(s=>!s||!/^[a-zA-Z0-9-]{1,64}$/.test(s.id)||!dates.includes(s.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)||!Number.isInteger(s.capacity)||s.capacity<1||s.capacity>10000)||new Set(sessions.map(s=>s.id)).size!==sessions.length||new Set(sessions.map(s=>s.date+' '+s.time)).size!==sessions.length))return json({error:'Each session needs a unique date/time on an event day and 1–10,000 places.'},400);
    if(kind==='event'&&status==='upcoming'&&!contact)return json({error:'Add organiser contact details before opening registration.'},400);
    if(kind==='event'&&status==='upcoming'&&!sessions.length)return json({error:'Add at least one session before opening registration.'},400);
    const id = String(form.get("id") || crypto.randomUUID());
    if (!/^[a-zA-Z0-9-]{1,64}$/.test(id) || !["event","brand"].includes(kind) || !title || title.length > 100 || location.length > 180) return json({error:"Please enter a valid name and location."},400);
    if (kind === "event" && (!location || !city || city.length > 100 || !dates.length || dates.length > 60 || !dates.every(validEventDate))) return json({error:"Add a venue, city and valid event dates."},400);
    const db = contentDb();
    const previous = await db.prepare("SELECT * FROM site_content WHERE id = ?").bind(id).first<ContentRecord>();
    if (previous && previous.kind !== kind) return json({error:"Content type cannot be changed."},400);
    const oldSessions=await db.prepare('SELECT s.*,COUNT(r.id) AS booked FROM event_sessions s LEFT JOIN registrations r ON r.session_id=s.id WHERE s.event_id=? GROUP BY s.id').bind(id).all<{id:string;date:string;time:string;booked:number}>();
    for(const old of oldSessions.results){const next=sessions.find(s=>s.id===old.id);if(old.booked&&(!next||next.date!==old.date||next.time!==old.time||next.capacity<old.booked))return json({error:'Booked sessions cannot be removed or rescheduled, and capacity cannot be lower than registrations.'},409);}
    let image = previous?.image || "";
    const file = form.get("image");
    if (file instanceof File && file.size) {
      if (file.size > 5 * 1024 * 1024) return json({error:"Choose an image smaller than 5 MB."},400);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const signature = new TextDecoder().decode(bytes.slice(0,12));
      const type = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "image/jpeg" : bytes[0] === 137 && signature.slice(1,4) === "PNG" ? "image/png" : signature.startsWith("RIFF") && signature.slice(8,12) === "WEBP" ? "image/webp" : "";
      if (!type) return json({error:"Upload a JPG, PNG or WebP image."},400);
      newImage = crypto.randomUUID();
      await contentBucket().put(newImage,bytes,{httpMetadata:{contentType:type}});
      image = newImage;
    }
    if (!image) return json({error:kind === "event" ? "Add an event image before publishing." : "Add a brand logo before publishing."},400);
    const statements=[db.prepare("INSERT INTO site_content (id,kind,title,location,city,dates,date,image,created,status,closing,reporting,address,contact) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,location=excluded.location,city=excluded.city,dates=excluded.dates,date=excluded.date,image=excluded.image,status=excluded.status,closing=excluded.closing,reporting=excluded.reporting,address=excluded.address,contact=excluded.contact").bind(id,kind,title,location,city,JSON.stringify(dates),date,image,previous?.created||new Date().toISOString(),status,closing,reporting,address,contact)];
    if(kind==='event'){
      for(const session of sessions){
        const foreign=await db.prepare('SELECT event_id FROM event_sessions WHERE id=?').bind(session.id).first<{event_id:string}>();if(foreign&&foreign.event_id!==id)return json({error:'A session belongs to another event.'},400);
        statements.push(db.prepare(`INSERT INTO event_sessions(id,event_id,date,time,capacity) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
        date=CASE WHEN EXISTS(SELECT 1 FROM registrations WHERE session_id=excluded.id) THEN event_sessions.date ELSE excluded.date END,
        time=CASE WHEN EXISTS(SELECT 1 FROM registrations WHERE session_id=excluded.id) THEN event_sessions.time ELSE excluded.time END,
        capacity=MAX(excluded.capacity,(SELECT COUNT(*) FROM registrations WHERE session_id=excluded.id))`).bind(session.id,id,session.date,session.time,session.capacity));
      }
      for(const old of oldSessions.results.filter(o=>!sessions.some(s=>s.id===o.id)))statements.push(db.prepare('DELETE FROM event_sessions WHERE id=?').bind(old.id));
    }
    await db.batch(statements);
    newImage = "";
    if (previous?.image && previous.image !== image) await contentBucket().delete(previous.image).catch(error => console.error("Old image cleanup failed",error));
    return json({ok:true});
  } catch (error) {
    if (newImage) await contentBucket().delete(newImage).catch(()=>{});
    console.error("Content save failed",error);
    return json({error:"Unable to save. Your entries are still here; please retry."},503);
  }
}
export async function DELETE(request: Request) {
  if (!await isAdmin() || !sameOrigin(request)) return json({error:"Admin access required."},403);
  try {
    const payload = await request.json() as {id?: unknown} | null;
    const id = payload?.id;
    if (typeof id !== "string") return json({error:"Choose an item to remove."},400);
    const db = contentDb();
    const row = await db.prepare("SELECT * FROM site_content WHERE id = ?").bind(id).first<ContentRecord>();
    if(row?.kind==='event'){await db.prepare("UPDATE site_content SET status='archived' WHERE id=?").bind(id).run();return json({ok:true,archived:true});}
    await db.prepare("DELETE FROM site_content WHERE id = ?").bind(id).run();
    if (row) await contentBucket().delete(row.image).catch(error => console.error("Removed image cleanup failed",error));
    return json({ok:true});
  } catch (error) { console.error("Content remove failed",error); return json({error:"Unable to remove the item. Please retry."},503); }
}
