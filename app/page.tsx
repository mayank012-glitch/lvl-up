import {ParentFAQ} from '@/components/parent-faq';
import {eventState} from '@/lib/event-state';
import { listContent, type ContentRecord } from "@/lib/content";
import { EventList } from "@/components/event-list";
import { SponsorCarousel } from "@/components/sponsor-carousel";
import {getStationDetails,defaultStationDetails} from '@/lib/station-content';
import {stationImage,stationImageSet} from '@/lib/stations';
export const dynamic = "force-dynamic";
export default async function Home(){
 let content:ContentRecord[]=[];let unavailable=false;
 try{content=await listContent();}catch(error){console.error("Landing content unavailable",error);unavailable=true;}
 let hero=defaultStationDetails().find(station=>station.no==='05')!;
 try{hero=(await getStationDetails()).find(station=>station.no==='05')??hero;}catch(error){console.error('Landing station image unavailable',error);}
 const events=content.filter(i=>i.kind==="event"&&i.location&&i.date&&i.image&&! ["draft","archived","Completed"].includes(eventState(i))),brands=content.filter(i=>i.kind==="brand"&&i.title&&i.image);
 return <main className="landing">
 <section className="landing-hero"><img className="landing-hero-photo" src={stationImage(hero)} srcSet={stationImageSet(hero)} sizes="(max-width: 700px) 100vw, 100vw" alt={hero.alt} width={1536} height={1024} fetchPriority="high"/><div className="landing-hero-shade"/><div className="page-shell landing-hero-copy"><h1>SMALL FEET.<br/>BIG ENERGY.<br/><span>LVL UP.</span></h1></div></section>
 <div className="race-ribbon"><span>CARRY. CRAWL. PULL. FLIP. SLAM.</span><span>5 STATIONS. 1 FINISH LINE.</span></div>
 <section id="about" className="about-race page-shell"><div className="landing-section-heading"><p className="section-kicker">THIS IS LVL UP</p><h2>FITNESS BECOMES<br/>AN ADVENTURE.</h2></div><div className="about-copy"><p>LVL Up brings children aged 8–15 onto a course of five fitness challenges, connected by runs. From the first carry to the final slam ball, every station asks them to try something different: move fast, stay coordinated, lift with control and keep going.</p><p>Participants race in age categories, with station distances and loads adapted for their group. Marshals guide them through each challenge while families cheer from the sidelines.</p><a className="text-link" href="/stations">Know your stations ↗</a></div></section>
 <EventList events={events}/>

 {unavailable&&<p className="content-unavailable page-shell">Event and partner updates are temporarily unavailable. Please try again shortly.</p>}
 <ParentFAQ/>
 {brands.length>0&&<section className="partners-section"><div className="page-shell"><p className="section-kicker">PART OF THE LVL UP JOURNEY</p><h2>OUR ASSOCIATED BRANDS</h2><SponsorCarousel sponsors={brands.map(({id,title,image})=>({id,title,image}))}/></div></section>}
 </main>;
}
