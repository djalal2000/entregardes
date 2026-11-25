// PEMESA: user-scoped read-only sensor monitoring; no data in logs.
// Access is granted only by an administrator through app_metadata.pemesa_influx_participants.
const origin = "https://pemesa.shiftcare.me";
const headers = {"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store","Vary":"Origin","Content-Type":"application/json"};
const respond = (status:number, data:unknown)=>new Response(JSON.stringify(data),{status,headers});
const metrics:Record<string,{bucket:string,measurement:string,fields:string[]}> = {
  heart_rate:{bucket:"INFLUX_BUCKET",measurement:"heart_rate",fields:["bpm"]},
  steps:{bucket:"INFLUX_BUCKET",measurement:"steps",fields:["steps"]},
  fatigue:{bucket:"INFLUX_BUCKET",measurement:"fatigue_level",fields:["fatigue_level"]},
  light:{bucket:"INFLUX_BUCKET",measurement:"light",fields:["lux"]},
  pressure:{bucket:"INFLUX_BUCKET",measurement:"pressure",fields:["hPa"]},
  acceleration:{bucket:"INFLUX_ACTIVITY_BUCKET",measurement:"inertial_data",fields:["acceX","acceY","acceZ"]},
  gyroscope:{bucket:"INFLUX_ACTIVITY_BUCKET",measurement:"inertial_data",fields:["gyroX","gyroY","gyroZ"]},
  gravity:{bucket:"INFLUX_ACTIVITY_BUCKET",measurement:"inertial_data",fields:["gravityX","gravityY","gravityZ"]},
  linear_acceleration:{bucket:"INFLUX_ACTIVITY_BUCKET",measurement:"inertial_data",fields:["linAccX","linAccY","linAccZ"]},
  rotation:{bucket:"INFLUX_ACTIVITY_BUCKET",measurement:"inertial_data",fields:["rotX","rotY","rotZ","rotW"]}
};
function parseCSV(s:string):string[][] {
  const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;
  for(let i=0;i<s.length;i++){const c=s[i];if(quoted){if(c==='"'&&s[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
    else if(c==='"'&&cell==="")quoted=true;else if(c===","){row.push(cell);cell="";}else if(c==="\n"){row.push(cell.replace(/\r$/,""));rows.push(row);row=[];cell="";}else cell+=c;}
  if(cell||row.length){row.push(cell.replace(/\r$/,""));rows.push(row);}return rows;
}
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(req.method!=="POST")return respond(405,{code:"METHOD_NOT_ALLOWED"});
  if(req.headers.get("origin") && req.headers.get("origin")!==origin)return respond(403,{code:"ORIGIN_NOT_ALLOWED"});
  try {
    const auth=req.headers.get("authorization")||"";
    if(!/^Bearer [\w.-]+$/.test(auth))return respond(401,{code:"SIGN_IN_REQUIRED"});
    const supabaseUrl=Deno.env.get("SUPABASE_URL");
    let key=Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY")||"";
    if(!key){try{key=Object.values(JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")||"{}")).find((v):v is string=>typeof v==="string")||"";}catch{}}
    if(!supabaseUrl||!key)return respond(503,{code:"CONFIGURATION_MISSING"});
    const identity=await fetch(supabaseUrl+"/auth/v1/user",{headers:{authorization:auth,apikey:key},signal:AbortSignal.timeout(8000)});
    if(!identity.ok)return respond(401,{code:"SIGN_IN_REQUIRED"});
    const user=await identity.json();
    const raw=user.app_metadata?.pemesa_influx_participants;
    const allowed:string[]=Array.isArray(raw)?[...new Set<string>(raw.filter((x:unknown)=>typeof x==="string"&&/^[a-zA-Z0-9_. -]{1,80}$/.test(x)&&x!=="unknown"))].slice(0,100):[];
    if(!user.id||user.role!=="authenticated"||user.is_anonymous)return respond(401,{code:"SIGN_IN_REQUIRED"});
    const body=await req.json().catch(()=>null);
    if(!body||typeof body!=="object")return respond(400,{code:"INVALID_REQUEST"});
    if(body.action==="participants")return respond(200,{participants:allowed});
    if(!allowed.includes(body.participant))return respond(403,{code:"PARTICIPANT_NOT_AUTHORIZED"});
    const metric=typeof body.metric==="string"&&Object.hasOwn(metrics,body.metric)?metrics[body.metric]:null;
    if(!metric)return respond(400,{code:"INVALID_METRIC"});
    const now=Date.now(), start=Date.parse(body.start), end=Date.parse(body.end);
    if(!Number.isFinite(start)||!Number.isFinite(end)||start>=end||end>now+60000||end-start>30*86400000+1000)return respond(400,{code:"INVALID_PERIOD"});
    const interval=Math.max(200,Math.ceil((end-start)/480));
    const base=Deno.env.get("INFLUX_URL"),token=Deno.env.get("INFLUX_TOKEN"),org=Deno.env.get("INFLUX_ORG"),bucket=Deno.env.get(metric.bucket);
    if(!base||!token||!org||!bucket)return respond(503,{code:"CONFIGURATION_MISSING"});
    const endpoint=new URL("/api/v2/query",base);
    if(endpoint.origin!=="https://indb1.chl2.connected-health.fr")return respond(503,{code:"CONFIGURATION_INVALID"});
    endpoint.searchParams.set("org",org);
    const q=JSON.stringify;
    const query='from(bucket: '+q(bucket)+') |> range(start: time(v: '+q(new Date(start).toISOString())+'), stop: time(v: '+q(new Date(end).toISOString())+')) |> filter(fn: (r) => r.person_id == '+q(body.participant)+' and r._measurement == '+q(metric.measurement)+' and contains(value: r._field, set: '+q(metric.fields)+')) |> group(columns: ["_measurement", "_field"]) |> aggregateWindow(every: '+interval+'ms, fn: last, createEmpty: false) |> keep(columns: ["_time","_field","_value"])';
    const result=await fetch(endpoint,{method:"POST",redirect:"error",headers:{Authorization:"Token "+token,"Content-Type":"application/json",Accept:"application/csv"},body:JSON.stringify({query,type:"flux",dialect:{annotations:[]}}),signal:AbortSignal.timeout(18000)});
    if(!result.ok){await result.body?.cancel();return respond(502,{code:"INFLUX_QUERY_FAILED",upstream_status:result.status});}
    const csv=await result.text();let cols:string[]=[],points:{time:string,field:string,value:number}[]=[];
    for(const row of parseCSV(csv)){
      if(row.includes("error")&&row.includes("reference"))return respond(502,{code:"INFLUX_QUERY_FAILED"});
      if(row.includes("_time")&&row.includes("_field")&&row.includes("_value")){cols=row;continue;}
      if(!cols.length||!row.length)continue;
      const time=row[cols.indexOf("_time")],field=row[cols.indexOf("_field")],v=row[cols.indexOf("_value")],value=Number(v);
      if(metric.fields.includes(field)&&v!==""&&v!=null&&Number.isFinite(value)&&Number.isFinite(Date.parse(time)))points.push({time,field,value});
    }
    if(points.length>3000)return respond(502,{code:"RESPONSE_TOO_LARGE"});
    points.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
    return respond(200,{points,interval_ms:interval,aggregation:"last",start:new Date(start).toISOString(),end:new Date(end).toISOString()});
  }catch{return respond(502,{code:"REQUEST_FAILED"});}
});