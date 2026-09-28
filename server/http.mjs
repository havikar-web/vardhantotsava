import { createServer } from 'node:http';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
export function createHttp(service,{origin,secure=true,webhookSecret='',verifyToken='',dist,trustProxy=false}){
 const cookieName=secure?'__Host-mantrakshata_session':'mantrakshata_session';
 return createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Cache-Control','no-store');if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000');
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1)||'';
 const setCookie=(value,maxAge)=>res.setHeader('Set-Cookie',`${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure?'; Secure':''}`);
 try{const url=new URL(req.url,'http://localhost');const path=url.pathname;
 if(!path.startsWith('/api/')){if(!['GET','HEAD'].includes(req.method)||!dist)return json(404,{error:'Not found'});const root=resolve(dist);let file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+sep)&&file!==root)return json(404,{error:'Not found'});if(path==='/'||!extname(path))file=resolve(root,'index.html');const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.md':'text/markdown'};try{const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});return res.end(req.method==='HEAD'?undefined:data);}catch{return json(404,{error:'Not found'});}}
 const ip=trustProxy?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',').at(-1).trim():req.socket.remoteAddress;
 let raw=Buffer.alloc(0);if(req.method!=='GET'){for await(const chunk of req){raw=Buffer.concat([raw,chunk]);if(raw.length>65536)return json(413,{error:'Request too large'});}}
 if(path==='/api/webhooks/whatsapp'){
 if(req.method==='GET'){if(verifyToken&&url.searchParams.get('hub.verify_token')===verifyToken&&url.searchParams.get('hub.mode')==='subscribe'){res.writeHead(200);return res.end(url.searchParams.get('hub.challenge'));}return json(403,{error:'Invalid verification token'});}
 const expected='sha256='+createHmac('sha256',webhookSecret).update(raw).digest('hex'),actual=String(req.headers['x-hub-signature-256']||'');if(!webhookSecret||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return json(403,{error:'Invalid signature'});const event=JSON.parse(raw);for(const entry of event.entry||[])for(const change of entry.changes||[])for(const status of change.value?.statuses||[])service.recordDelivery(status.id,status.status);return json(200,{ok:true});}
 if(!['GET','POST'].includes(req.method))return json(405,{error:'Method not allowed'});
 if(req.method==='POST'&&(req.headers.origin!==origin||!String(req.headers['content-type']||'').startsWith('application/json')))return json(403,{error:'Invalid request origin or content type'});
 const input=raw.length?JSON.parse(raw):{};
 if(path==='/api/health'&&req.method==='GET')return json(200,{ok:true});
 if(path==='/api/auth/request'&&req.method==='POST')return json(200,await service.requestOtp(input.phone,ip));
 if(path==='/api/auth/verify'&&req.method==='POST'){const result=service.verifyOtp(input.challengeId,input.code,ip);if(token)service.logout(token);setCookie(result.token,86400);return json(200,{user:result.user});}
 if(path==='/api/auth/logout'&&req.method==='POST'){service.logout(token);setCookie('',0);return json(200,{ok:true});}
 const u=service.session(token);
 if(path==='/api/session'&&req.method==='GET')return json(200,{user:u});
 if(path==='/api/profile'&&req.method==='POST')return json(200,{user:service.saveProfile(u,input)});
 if(path==='/api/bookings'&&req.method==='GET')return json(200,{bookings:service.listBookings(u)});
 if(path==='/api/bookings'&&req.method==='POST')return json(201,{booking:service.createBooking(u,input)});
 if(path==='/api/admin/jobs'&&req.method==='GET')return json(200,{jobs:service.jobs(u)});
 const retry=path.match(/^\/api\/admin\/jobs\/([^/]+)\/retry$/);if(retry&&req.method==='POST')return json(200,service.retryJob(u,decodeURIComponent(retry[1]),input.acknowledgeUnknown));
 const match=path.match(/^\/api\/bookings\/([A-Za-z0-9-]+)(?:\/(confirm|assign|reschedule|cancel|complete))?$/);
 if(match){if(req.method==='GET'&&!match[2])return json(200,{booking:service.unpack(service.own(u,match[1]))});if(req.method==='POST'&&match[2])return json(200,{booking:match[2]==='confirm'?await service.confirm(u,match[1],input):service.change(u,match[1],match[2],input)});}
 return json(404,{error:'Not found'});
 }catch(e){json(e.status||500,{error:e.status?e.message:'The server could not complete this request. Please try again or contact support.'});}});
}
