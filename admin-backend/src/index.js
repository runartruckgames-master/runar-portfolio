/**
 * Cloudflare Worker publishing API.
 * Requires a Cloudflare Access application protecting this route AND verifies
 * the Access JWT independently. Never publish without both controls.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const allowedOrigin=(request)=>{const origin=request.headers.get("Origin");return !origin||origin===new URL(request.url).origin};
const configured=(env)=>["GITHUB_TOKEN","GITHUB_OWNER","GITHUB_REPO","GITHUB_BRANCH","ACCESS_TEAM_DOMAIN","ACCESS_AUD","OWNER_EMAIL"].every(k=>typeof env[k]==="string"&&env[k].trim());
async function authorize(request,env){
  const token=request.headers.get("Cf-Access-Jwt-Assertion");
  if(!token)return false;
  const domain=env.ACCESS_TEAM_DOMAIN.replace(/\/$/,"");
  if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain))return false;
  const keys=createRemoteJWKSet(new URL(domain+"/cdn-cgi/access/certs"));
  const {payload}=await jwtVerify(token,keys,{issuer:domain,audience:env.ACCESS_AUD,algorithms:["RS256"]});
  return typeof payload.email==="string"&&payload.email.toLowerCase()===env.OWNER_EMAIL.trim().toLowerCase();
}
async function github(env,path,method="GET",body){
  const url="https://api.github.com/repos/"+encodeURIComponent(env.GITHUB_OWNER)+"/"+encodeURIComponent(env.GITHUB_REPO)+"/contents/"+path;
  const response=await fetch(url,{method,headers:{"Authorization":"Bearer "+env.GITHUB_TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"runar-portfolio-admin","Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
  if(!response.ok)throw new Error("GitHub HTTP "+response.status);
  return response.json();
}
function encode(bytes){let out="";for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(out)}
function decode(text){return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,"")),c=>c.charCodeAt(0)))}
function validContent(v){
  if(!v||v.version!==1||typeof v!=="object"||Array.isArray(v))return false;
  for(const [field,max] of [["lead",600],["about",1500],["contact",350]])if(typeof v[field]!=="string"||v[field].length>max)return false;
  if(typeof v.profilePhoto!=="string"||!(v.profilePhoto===""||/^assets\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/.test(v.profilePhoto)))return false;
  if(!v.projects||typeof v.projects!=="object"||Array.isArray(v.projects)||Object.keys(v.projects).length>100)return false;
  return Object.entries(v.projects).every(([k,x])=>k.length<=150&&typeof x==="string"&&x.length<=350);
}
export default {async fetch(request,env){
  if(!configured(env))return json({error:"Backend is not configured"},503);
  if(!allowedOrigin(request))return json({error:"Cross-origin request denied"},403);
  let ok=false;try{ok=await authorize(request,env)}catch(_){}
  if(!ok)return json({error:"Unauthorized"},401);
  const url=new URL(request.url);
  if(url.pathname==="/api/content"&&request.method==="GET"){
    try{const f=await github(env,"site-content.json");return json({content:JSON.parse(decode(f.content)),sha:f.sha})}catch(_){return json({error:"Unable to read content"},502)}
  }
  if(url.pathname==="/api/content"&&request.method==="PUT"){
    if(Number(request.headers.get("content-length")||0)>100000)return json({error:"Payload too large"},413);
    let body;try{body=await request.json()}catch(_){return json({error:"Invalid JSON"},400)}
    if(!validContent(body?.content)||typeof body.sha!=="string"||!/^[a-f0-9]{40}$/.test(body.sha))return json({error:"Invalid content or revision"},400);
    const bytes=new TextEncoder().encode(JSON.stringify(body.content,null,2)+"\n");
    if(bytes.length>100000)return json({error:"Payload too large"},413);
    try{const result=await github(env,"site-content.json","PUT",{message:"Publish portfolio content",content:encode(bytes),sha:body.sha,branch:env.GITHUB_BRANCH});return json({published:true,sha:result.content.sha})}catch(_){return json({error:"Publish failed; refresh and retry if content changed"},409)}
  }
  if(url.pathname==="/api/photo"&&request.method==="PUT"){
    if(request.headers.get("content-type")!=="image/jpeg")return json({error:"JPEG required"},415);
    const bytes=new Uint8Array(await request.arrayBuffer());
    if(bytes.length<4||bytes.length>2*1024*1024||bytes[0]!==0xff||bytes[1]!==0xd8||bytes[bytes.length-2]!==0xff||bytes[bytes.length-1]!==0xd9)return json({error:"Invalid JPEG or file size"},400);
    const path="assets/profile-photo.jpg";
    try{let sha;try{sha=(await github(env,path)).sha}catch(_){}
      const result=await github(env,path,"PUT",{message:"Publish profile photo",content:encode(bytes),...(sha?{sha}:{}),branch:env.GITHUB_BRANCH});
      return json({published:true,path,sha:result.content.sha});
    }catch(_){return json({error:"Photo upload failed"},502)}
  }
  return json({error:"Not found"},404);
}};
