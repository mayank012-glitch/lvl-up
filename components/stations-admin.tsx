"use client";
import {useState,useRef,useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {divisions} from '@/lib/event-format';
import {stationImage,type StationDetails} from '@/lib/stations';

export function StationsAdmin({initial}:{initial:StationDetails[]}){
 const [items,setItems]=useState(initial),[selected,setSelected]=useState(initial[0].no),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[preview,setPreview]=useState('');
 const form=useRef<HTMLFormElement>(null),editing=items.find(station=>station.no===selected)!;
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 function choose(no:string){if(no===selected)return;if(form.current?.dataset.dirty==='true'&&!window.confirm('Discard the unsaved edits to this station?'))return;setSelected(no);setPreview('');setMessage('');}
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/stations',{method:'POST',body:new FormData(event.currentTarget)});
   const data=await response.json() as {error?:string;station?:StationDetails};
   if(!response.ok||!data.station)throw new Error(data.error||'Unable to save. Please retry.');
   setItems(previous=>previous.map(station=>station.no===data.station!.no?data.station!:station));setPreview('');setMessage('Saved. Your station details and age-group formats are now published.');
  }catch(error){setMessage(error instanceof Error?error.message:'Unable to save. Please retry.');}finally{setBusy(false);}
 }
 return <section id="admin-stations" className="stations-admin" aria-labelledby="stations-admin-title">
  <h2 id="stations-admin-title">EDIT STATIONS</h2><p>Update the five stations and their age-group formats. Save changes to publish them on Stations and The Race Format. The Tyre Flip station’s image also appears on the landing page.</p>
  <div className="station-editor-layout">
   <nav className="station-editor-list" aria-label="Choose a station to edit">{items.map((station,index)=><button type="button" disabled={busy} key={station.no} aria-current={station.no===selected?'true':undefined} onClick={()=>choose(station.no)}><span>{index+1}</span>{station.title}</button>)}</nav>
   <form key={editing.no+'-'+editing.revision} ref={form} className="admin-editor station-editor" onSubmit={save} onChange={()=>{if(form.current)form.current.dataset.dirty='true';}}>
    <h3>Station {items.findIndex(station=>station.no===selected)+1}</h3><fieldset disabled={busy}>
     <input type="hidden" name="id" value={editing.no}/><input type="hidden" name="revision" value={editing.revision}/>
     <div className="form-grid"><label className="field">Station name<Input name="title" required maxLength={100} defaultValue={editing.title}/></label><label className="field">Challenge label<Input name="tag" required maxLength={100} defaultValue={editing.tag}/></label></div>
     <label className="field">Description<textarea name="description" required maxLength={2000} rows={4} defaultValue={editing.description}/></label>
     <label className="field">How it works — pointers<textarea name="steps" required maxLength={4500} rows={5} defaultValue={editing.steps.join('\n')}/><small>One pointer per line. Edit, add, remove or rearrange the lines to update the bullet list. Up to 10 pointers, 400 characters each.</small></label>
     <div className="form-grid"><label className="field">The challenge<textarea name="focus" required maxLength={500} rows={3} defaultValue={editing.focus}/></label><label className="field">Before you start<textarea name="safety" required maxLength={1000} rows={3} defaultValue={editing.safety}/></label></div>
     <h3>Age-group formats</h3><p>Include the units, such as “30 m” or “4 kg”, or enter “To be confirmed”.</p>
     <div className="form-grid">{divisions.map((division,i)=><label className="field" key={division}>Ages {division}<Input name="values" required maxLength={100} defaultValue={editing.values[i]}/></label>)}</div>
     <label className="field">Station image<Input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];setPreview(file?URL.createObjectURL(file):'');}}/><small>JPG, PNG or WebP, up to 5 MB. A 3:2 landscape image works best. Leave empty to keep the current image.</small></label>
     <img className="station-editor-preview" src={preview||stationImage(editing)} alt={editing.alt}/>
     <label className="field">Image description<Input name="alt" required maxLength={300} defaultValue={editing.alt}/><small>Describe what the picture shows for visitors using a screen reader.</small></label>
     <Button type="submit">{busy?'Saving…':'Save station changes'}</Button>
    </fieldset>
   </form>
  </div><p className="admin-message" role="status" aria-live="polite">{message}</p>
 </section>;
}
