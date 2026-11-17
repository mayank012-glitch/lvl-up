"use client";
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
export function EventDateFields({initial}:{initial:string[]}){
 const [dates,setDates]=useState(initial.length?initial:['']);
 return <div className="event-date-fields"><p>Event dates</p>{dates.map((date,index)=><div className="event-date-row" key={index}><label className="field">Date {index+1}<Input type="date" name="dates" required value={date} onChange={e=>setDates(dates.map((d,i)=>i===index?e.target.value:d))}/></label>{dates.length>1&&<Button type="button" variant="outline" aria-label={'Remove date '+(index+1)} onClick={()=>setDates(dates.filter((_,i)=>i!==index))}>Remove</Button>}</div>)}<Button type="button" variant="outline" disabled={dates.length>=60} onClick={()=>setDates([...dates,''])}>Add another date</Button><p className="date-help">Add every day the event takes place at this venue.</p></div>;
}
