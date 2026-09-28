import { resolve } from 'node:path';
import { phone, createService } from './core.mjs';
import { createHttp } from './http.mjs';
import { metaProvider,verifyRazorpayPayment } from './provider.mjs';
try{process.loadEnvFile(resolve('.env.server'));}catch(e){if(e.code!=='ENOENT')throw e;}
const env=process.env,origin=env.APP_ORIGIN||'http://localhost:3200',secure=origin.startsWith('https://');
if(env.NODE_ENV==='production'&&(!env.DATA_PATH||env.PERSISTENT_STORAGE_CONFIRMED!=='true'))throw new Error('Production requires a persistent private DATA_PATH and PERSISTENT_STORAGE_CONFIRMED=true after verifying storage survives redeploys');
if(env.NODE_ENV==='production'&&!secure)throw new Error('Production requires an HTTPS APP_ORIGIN');
const provider=metaProvider(env);
const service=createService({database:resolve(env.DATA_PATH||'server/data/mantrakshata.sqlite'),secret:env.SESSION_SECRET,send:provider.send,adminPhones:(env.ADMIN_PHONES||'').split(',').map(phone).filter(Boolean),mainPhone:phone(env.MAIN_ACHARYA_PHONE),origin,prices:JSON.parse(env.PACKAGE_PRICES_PAISE||'{}'),verifyPayment:id=>verifyRazorpayPayment(env,id)});
const server=createHttp(service,{origin,secure,webhookSecret:env.META_APP_SECRET,verifyToken:env.WHATSAPP_VERIFY_TOKEN,dist:resolve('dist'),trustProxy:env.TRUST_PROXY==='true'});
server.listen(Number(env.PORT||env.API_PORT||3202),env.API_HOST||'127.0.0.1',()=>console.log('Mantrakshata API ready on configured host/port; secrets are server-only.'));
const interval=setInterval(()=>service.tick().catch(()=>console.error('Reminder worker failed; inspect queue.')),30000);
process.on('SIGTERM',()=>{clearInterval(interval);server.close(()=>{service.db.close();process.exit(0);});});
