export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
export const sameOrigin=(r:Request)=>r.headers.get('origin')===new URL(r.url).origin&&r.headers.get('sec-fetch-site')!=='cross-site';
export function csvCell(value:unknown){let v=String(value??'');if(/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}
