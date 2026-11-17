export function validEventDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function getEventDates(event:{date:string;dates?:string}):string[]{
 let values:unknown=[];try{values=JSON.parse(event.dates||'[]');}catch{}
 const dates=Array.isArray(values)?values.filter((v):v is string=>typeof v==='string'&&validEventDate(v)):[];
 return [...new Set(dates.length?dates:validEventDate(event.date)?[event.date]:[])].sort();
}
export function formatEventDates(event:{date:string;dates?:string}){return getEventDates(event).map(date=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'))).join(' · ');}
export function lastEventDate(event:{date:string;dates?:string}){return getEventDates(event).at(-1)||'';}
