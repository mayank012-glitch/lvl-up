import { env } from "cloudflare:workers";
import type {EventSession} from "./event-state";
export type ContentRecord = { id: string; kind: "event" | "brand"; title: string; location: string; city: string; dates: string; date: string; image: string; created: string; status:string; closing:string; reporting:string; address:string; contact:string; sessions?:EventSession[] };
export function contentDb() {
  if (!env.DB) throw new Error("Content database is unavailable");
  return env.DB;
}
export function contentBucket() {
  if (!env.BUCKET) throw new Error("Image storage is unavailable");
  return env.BUCKET;
}
export async function listContent() {
  const result = await contentDb().prepare("SELECT * FROM site_content ORDER BY date ASC, created ASC").all<ContentRecord>();
  const sessions=await contentDb().prepare("SELECT s.*, COUNT(r.id) AS booked FROM event_sessions s LEFT JOIN registrations r ON r.session_id=s.id GROUP BY s.id ORDER BY s.date,s.time").all<EventSession>();
  return result.results.map(e=>({...e,sessions:sessions.results.filter(s=>s.event_id===e.id)}));
}
