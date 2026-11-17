import {AdminDashboard} from '@/components/admin-dashboard';
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isAdmin } from "@/lib/admin";
import { listContent } from "@/lib/content";
import {getStationDetails} from '@/lib/station-content';
export const dynamic = "force-dynamic";
export const metadata = {title:"Manage LVL Up",robots:{index:false,follow:false}};
export default async function AdminPage(){
 await requireChatGPTUser("/admin");
 if(!await isAdmin())return <main className="inner-page page-shell"><h1>Admin access required</h1><p>Only the event administrator can manage this page.</p><a href="/">Back to LVL Up</a></main>;
 try{const [items,stations]=await Promise.all([listContent(),getStationDetails()]);return <main className="inner-page"><div className="page-shell"><p className="section-kicker">EVENT ADMIN</p><h1 className="admin-title">MANAGE LVL UP</h1><p className="admin-intro">Manage events, associated brands and station details. Saved station changes publish immediately.</p><a className="text-link admin-back" href="/">View landing page ↗</a><a className="text-link admin-back" href="#admin-stations">Edit station details ↓</a><AdminDashboard initial={items} initialStations={stations}/></div></main>;}catch(error){console.error("Admin page unavailable",error);return <main className="inner-page page-shell"><h1>Content is temporarily unavailable</h1><p>Your saved content has not been changed. Please reload to try again.</p><a href="/admin" className="button button-dark">Retry</a></main>;}
}
