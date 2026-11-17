import type {ContentRecord} from './content';
export type EventSession={id:string;event_id:string;date:string;time:string;capacity:number;booked:number};
export const todayIndia=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
export function sessionOpen(s:EventSession){return new Date(s.date+'T'+s.time+':00+05:30').getTime()>Date.now()&&s.booked<s.capacity;}
export function eventState(e:ContentRecord){
 if(e.status==='archived'||e.status==='draft')return e.status;
 if(e.status==='completed'||Math.max(...(e.sessions||[]).map(s=>new Date(s.date+'T'+s.time+':00+05:30').getTime()),new Date((JSON.parse(e.dates||'[]').at(-1)||e.date)+'T23:59:59+05:30').getTime())<Date.now())return 'Completed';
 if(e.status==='closed'||(e.closing&&new Date(e.closing+'T23:59:59+05:30').getTime()<Date.now()))return 'Registration closed';
 if(!e.sessions?.length)return 'Dates announced';
 if(!e.sessions.some(s=>new Date(s.date+'T'+s.time+':00+05:30').getTime()>Date.now()))return 'Registration closed';
 return e.sessions.some(sessionOpen)?'Upcoming':'Sold out';
}
export const canRegister=(e:ContentRecord)=>eventState(e)==='Upcoming';
export const ageCategory=(age:number)=>age<10?'8–9':age<12?'10–11':age<14?'12–13':'14–15';
