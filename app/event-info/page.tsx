import {EventList} from '@/components/event-list';
import {listContent} from '@/lib/content';
import {getStationDetails,defaultStationDetails} from '@/lib/station-content';
export const dynamic='force-dynamic';
import {RaceFormat} from '@/components/race-format';
import type {Metadata} from 'next';
import {CheckCircle2,ArrowRight} from 'lucide-react';
import {PageHeading} from '@/components/page-heading';
export const metadata:Metadata={title:'The Race Format'};
const checklist=['Wear training shoes with good grip','Carry a labelled water bottle','Arrive before your allotted reporting time','Follow every station marshal’s instruction'];
export default async function InfoPage(){let stations=defaultStationDetails(),stationsUnavailable=false;try{stations=await getStationDetails();}catch(error){console.error('Race format updates unavailable',error);stationsUnavailable=true;}let events:Awaited<ReturnType<typeof listContent>>=[];let unavailable=false;try{events=(await listContent()).filter(e=>e.kind==='event'&&e.location&&e.date&&e.image);}catch(error){console.error('Event information unavailable',error);unavailable=true;}return <main className="inner-page dark-page"><div className="page-shell"><PageHeading kicker="BE RACE READY" title="THE RACE FORMAT" intro="Your age-wise race format and checklist for the start line."/>
 <div className="event-format-layout"><div>{stationsUnavailable&&<p role="status">Station updates are temporarily unavailable. The original formats are shown. Please check again later.</p>}<RaceFormat stations={stations.map(({no,title,values})=>({no,title,values}))}/></div>
 <aside className="ready-card event-checklist"><p className="section-kicker">BEFORE YOU ARRIVE</p><h2>RACE DAY CHECKLIST</h2>{checklist.map(item=><p key={item}><CheckCircle2 aria-hidden="true"/>{item}</p>)}<a href="/register" className="button button-primary">Register a participant <ArrowRight size={18}/></a></aside></div>
 </div><EventList events={events}/>{unavailable&&<p className="page-shell" role="status">Venue updates are temporarily unavailable. Please try again shortly.</p>}</main>;}
