import {isAdmin} from '@/lib/admin';
import {json,sameOrigin} from '@/lib/http';
import {contentDb,contentBucket} from '@/lib/content';
import {getStationDetails} from '@/lib/station-content';
import {stations} from '@/lib/stations';
import {validateStationEdit} from '@/lib/station-validation';
export const dynamic='force-dynamic';
export async function GET(){
 if(!await isAdmin())return json({error:'Admin access required.'},403);
 try{return json(await getStationDetails());}catch(error){console.error('Stations load failed',error);return json({error:'Unable to load stations. Please retry.'},503);}
}
export async function POST(request:Request){
 if(!await isAdmin()||!sameOrigin(request))return json({error:'Admin access required.'},403);
 let uploaded='';
 try{
  if(Number(request.headers.get('content-length'))>6*1024*1024)return json({error:'Choose an image smaller than 5 MB.'},400);
  const form=await request.formData(),id=String(form.get('id')||''),revision=Number(form.get('revision'));
  if(!stations.some(station=>station.no===id)||form.get('revision')===null||!Number.isInteger(revision)||revision<0)return json({error:'Choose a valid station and reload its latest details.'},400);
  let fields;try{fields=validateStationEdit(form);}catch(error){return json({error:error instanceof Error?error.message:'Check the station details.'},400);}
  const current=(await getStationDetails()).find(station=>station.no===id)!;
  if(current.revision!==revision)return json({error:'This station changed in another window. Reload the editor before saving.'},409);
  let image=current.image;
  const file=form.get('image');
  if(file instanceof File&&file.size){
   if(file.size>5*1024*1024)return json({error:'Choose an image smaller than 5 MB.'},400);
   const bytes=new Uint8Array(await file.arrayBuffer()),header=new TextDecoder().decode(bytes.slice(0,12));
   const type=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes[0]===137&&header.slice(1,4)==='PNG'?'image/png':header.startsWith('RIFF')&&header.slice(8,12)==='WEBP'?'image/webp':'';
   if(!type)return json({error:'Upload a JPG, PNG or WebP image.'},400);
   uploaded=crypto.randomUUID();await contentBucket().put(uploaded,bytes,{httpMetadata:{contentType:type}});image='/media/'+uploaded;
  }
  const db=contentDb(),updated=new Date().toISOString();
  const result=revision===0
   ? await db.prepare('INSERT INTO station_details(id,title,tag,image,alt,description,steps,focus,safety,age_values,revision,updated) VALUES(?,?,?,?,?,?,?,?,?,?,1,?) ON CONFLICT(id) DO NOTHING').bind(id,fields.title,fields.tag,image,fields.alt,fields.description,JSON.stringify(fields.steps),fields.focus,fields.safety,JSON.stringify(fields.values),updated).run()
   : await db.prepare('UPDATE station_details SET title=?,tag=?,image=?,alt=?,description=?,steps=?,focus=?,safety=?,age_values=?,revision=revision+1,updated=? WHERE id=? AND revision=?').bind(fields.title,fields.tag,image,fields.alt,fields.description,JSON.stringify(fields.steps),fields.focus,fields.safety,JSON.stringify(fields.values),updated,id,revision).run();
  if(!result.meta.changes){
   if(uploaded)await contentBucket().delete(uploaded).catch(()=>{});uploaded='';
   return json({error:'This station changed in another window. Reload the editor before saving.'},409);
  }
  uploaded='';
  return json({ok:true,station:{...current,...fields,image,revision:revision+1,updated}});
 }catch(error){if(uploaded)await contentBucket().delete(uploaded).catch(()=>{});console.error('Station save failed',error);return json({error:'Unable to save. Your edits are still here. Please retry.'},503);}
}
