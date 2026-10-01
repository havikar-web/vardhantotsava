import next from 'next';
import { createServer } from 'node:http';
import { getRuntime,startWorker } from './runtime.mjs';
const dev=process.argv.includes('--dev');
process.env.NODE_ENV=dev?'development':'production';
const runtime=getRuntime();
const port=Number(process.env.PORT||process.env.WEB_PORT||3201);
const app=next({dev,hostname:'0.0.0.0',port});await app.prepare();
const handle=app.getRequestHandler();
const server=createServer((req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/'))runtime.http.emit('request',req,res);
 else handle(req,res);
});
server.listen(port,process.env.WEB_HOST||'0.0.0.0',()=>{startWorker(runtime);console.log('Next.js website, protected API and reminder worker ready on port '+port);});
const stop=()=>{clearInterval(runtime.worker);server.close(()=>{runtime.service.db.close();process.exit(0);});};
process.once('SIGTERM',stop);process.once('SIGINT',stop);
