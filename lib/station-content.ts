import {contentDb} from './content';
import {stations,type StationDetails} from './stations';
import {stationFormats} from './event-format';

type Row = {id:string;title:string;tag:string;image:string;alt:string;description:string;steps:string;focus:string;safety:string;age_values:string;revision:number;updated:string};
export function defaultStationDetails():StationDetails[] {
 return stations.map((station,i)=>({...station,steps:[...station.steps],values:[...stationFormats[i].values],revision:0,updated:''}));
}
export async function getStationDetails():Promise<StationDetails[]> {
 const rows=await contentDb().prepare('SELECT * FROM station_details').all<Row>();
 return defaultStationDetails().map(station=>{
  const row=rows.results.find(row=>row.id===station.no);
  if(!row)return station;
  const usesOldCargoPhoto = station.no === "02" && (row.image === "cargo-carry-india-separated" || row.image === "cargo-carry-india-separated-black-lime");
  return {...station,title:row.title,tag:row.tag,image:usesOldCargoPhoto ? station.image : row.image,alt:usesOldCargoPhoto ? station.alt : row.alt,description:row.description,steps:JSON.parse(row.steps),focus:row.focus,safety:row.safety,values:JSON.parse(row.age_values),revision:row.revision,updated:row.updated};
 });
}
