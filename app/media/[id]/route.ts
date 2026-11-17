import { contentDb, contentBucket } from "@/lib/content";
export async function GET(_request: Request, {params}: {params: Promise<{id:string}>}) {
  const {id} = await params;
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(id)) return new Response(null,{status:404});
  try {
    const row = await contentDb().prepare("SELECT id FROM site_content WHERE image = ? UNION ALL SELECT id FROM station_details WHERE image = ? LIMIT 1").bind(id,'/media/'+id).first();
    if (!row) return new Response(null,{status:404});
    const object = await contentBucket().get(id);
    if (!object) return new Response(null,{status:404});
    return new Response(object.body,{headers:{"Content-Type":object.httpMetadata?.contentType || "application/octet-stream","Cache-Control":"public, max-age=3600","X-Content-Type-Options":"nosniff"}});
  } catch (error) { console.error("Image load failed",error); return new Response(null,{status:503}); }
}
