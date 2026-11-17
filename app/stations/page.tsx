import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Stations" };
import {StationShowcase} from '@/components/station-showcase';
import {getStationDetails,defaultStationDetails} from '@/lib/station-content';
export const dynamic='force-dynamic';

export default async function StationsPage() {
  let stations=defaultStationDetails(),unavailable=false;
  try{stations=await getStationDetails();}catch(error){console.error('Station details unavailable',error);unavailable=true;}
  return <main className="inner-page dark-page stations-page"><div className="page-shell stations-shell">
    <PageHeading kicker="KNOW THE COURSE" title="5 STATIONS. 1 FINISH LINE." intro={`Follow the five-station course from ${stations[0].title} to ${stations[stations.length-1].title}.`} />
    {unavailable&&<p role="status">Station updates are temporarily unavailable. The original course details are shown below. Please check again later.</p>}
    <StationShowcase stations={stations}/>
  </div></main>;
}
