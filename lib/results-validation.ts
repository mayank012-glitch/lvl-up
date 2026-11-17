export type RaceResult={rank:number;participant:string;school:string;ageCategory:string;totalTime:string;score:string;accountEmail?:string;participantId?:string};
export const resultColumns=["rank","participant","school","age_category","total_time","score"];
export function parseResults(csv:string):RaceResult[]{
 const records:string[][]=[];let row:string[]=[],cell="",quoted=false;
 for(let i=0;i<csv.length;i++){
  const c=csv[i];
  if(c==='"'){if(quoted&&csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell="";}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&csv[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))records.push(row);row=[];cell="";}
  else cell+=c;
 }
 if(quoted)throw new Error("The CSV has an unclosed quote.");
 row.push(cell);if(row.some(v=>v.trim()))records.push(row);
 const header=records.shift()?.map(v=>v.replace(/^\uFEFF/,"").trim().toLowerCase());
 const hasId=header?.join(',')===[...resultColumns,'account_email','participant_id'].join(',');
 const hasEmail=hasId||header?.join(',')===[...resultColumns,'account_email'].join(',');
 if(!header||(!hasEmail&&header.join(',')!==resultColumns.join(',')))throw new Error("Use the template column headings in their original order.");
 if(records.length<1||records.length>5000)throw new Error("Upload between 1 and 5,000 results per event.");
 const categories=new Set(["8–9","10–11","12–13","14–15","13–14"]);
 const seen=new Set<string>();
 return records.map((values,index)=>{
  const fail=(message:string)=>{throw new Error(`Row ${index+2}: ${message}`);};
  if(values.length!==(hasId?8:hasEmail?7:6))fail("use the template columns; score and account_email may be blank.");
  const [rank,participant,school,category,totalTime,score]=values.map(v=>v.trim());
  const ageCategory=category.replace(/\s/g,'').replace(/-/g,'–');
  if(!/^\d+$/.test(rank)||Number(rank)<1||Number(rank)>5000)fail("rank must be from 1 to 5,000.");
  if(!participant||participant.length>100||!school||school.length>160)fail("add a participant name and school.");
  if(!categories.has(ageCategory))fail("use a supported age category.");
  if(!/^\d{1,3}:[0-5]\d(?:\.\d{1,3})?$/.test(totalTime))fail("total_time must be minutes:seconds, such as MM:SS.");
  if(score&&!/^\d{1,9}(?:\.\d{1,3})?$/.test(score))fail("score must be a non-negative number or blank.");
  const accountEmail=hasEmail?(values[6]||"").trim().toLowerCase():"";
  if(accountEmail&&(accountEmail.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(accountEmail)))fail("account_email must be a valid email or blank.");
  const participantId=hasId?(values[7]||'').trim():'';
  if(participantId&&!/^LU-[A-F0-9]{16}$/.test(participantId))fail('participant_id must match the registration export.');
  const key=participantId||[participant.toLowerCase(),school.toLowerCase(),ageCategory].join('|');if(seen.has(key))fail('duplicate participant.');seen.add(key);
  return {participantId:participantId||undefined,rank:Number(rank),participant,school,ageCategory,totalTime,score,...(accountEmail?{accountEmail}:{})};
 }).sort((a,b)=>Number(a.ageCategory.split('–')[0])-Number(b.ageCategory.split('–')[0])||a.rank-b.rank);
}
export function eventHasHappened(date:string,today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})){
 return /^\d{4}-\d{2}-\d{2}$/.test(date)&&date<=today;
}
