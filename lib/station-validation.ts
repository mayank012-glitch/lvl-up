export type StationEdit = {title:string;tag:string;alt:string;description:string;steps:string[];focus:string;safety:string;values:string[]};
export function validateStationEdit(form:FormData):StationEdit {
 function field(name:string,max:number){const value=form.get(name);if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`Enter ${name} (maximum ${max} characters).`);return value.trim();}
 const title=field('title',100),tag=field('tag',100),alt=field('alt',300),description=field('description',2000),focus=field('focus',500),safety=field('safety',1000);
 const steps=field('steps',4500).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(steps.length<1||steps.length>10||steps.some(s=>s.length>400))throw new Error('Add 1–10 pointers, one per line, up to 400 characters each.');
 const raw=form.getAll('values');
 if(raw.length!==4||raw.some(value=>typeof value!=='string'||!value.trim()||value.trim().length>100))throw new Error('Enter a format for each of the four age groups (maximum 100 characters each).');
 return {title,tag,alt,description,steps,focus,safety,values:raw.map(value=>String(value).trim())};
}
