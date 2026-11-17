import {listContent,type ContentRecord} from '@/lib/content';
import {eventState} from '@/lib/event-state';
export const metadata={title:'Contact for Support'};
export const dynamic='force-dynamic';
export default async function Support(){
 let events:ContentRecord[]=[];
 try{events=(await listContent()).filter(item=>item.kind==='event'&&item.contact&&!['draft','archived'].includes(eventState(item)));}catch(error){console.error('Support contacts unavailable',error);}
 return <main className="inner-page page-shell narrow"><p className="section-kicker">LVL UP</p><h1>CONTACT FOR SUPPORT</h1><div className="reading-copy"><p>For registration, race-day or cancellation enquiries, contact your event organiser. Include the event name and your participant ID if you have registered.</p>{events.length?events.map(event=><section key={event.id}><h2>{event.title}</h2><p>{[event.location,event.city].filter(Boolean).join(', ')}</p><p className="support-contact">{event.contact}</p></section>):<p>Contact details are provided with your event information or entry pass. If no event contact is listed, please check back when registrations open.</p>}<a className="text-link" href="/my-result">My account ↗</a></div></main>;
}
