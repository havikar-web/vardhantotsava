import { Readable } from 'node:stream';
import { getRuntime, startWorker } from './runtime.mjs';

// Apply the protected handler to Next.js routes. The startup hook runs the worker.
export async function handleNextRequest(request){
 try{
 const chunks=[];let size=0;
 if(request.body){const reader=request.body.getReader();for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return Response.json({error:'Request too large'},{status:413});}chunks.push(Buffer.from(value));}}
 const bytes=Buffer.concat(chunks);
 const req=Readable.from(bytes.length?[bytes]:[]);req.method=request.method;req.url=request.url;req.headers=Object.fromEntries(request.headers);req.socket={remoteAddress:'next-route'};
 const headers=new Headers();let status=200;
 return await new Promise(resolve=>{
 const res={setHeader(name,value){headers.set(name,String(value));},writeHead(code,values={}){status=code;for(const [k,v] of Object.entries(values))headers.set(k,String(v));},end(data){resolve(new Response(data||null,{status,headers}));}};
 const runtime=getRuntime();
 startWorker(runtime);
 runtime.http.emit('request',req,res);
 });
 }catch{return Response.json({error:'Booking and payment services are temporarily unavailable. Please contact support.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
