import { resolve } from 'node:path';
import { createService, phone } from './core.mjs';
import { createHttp } from './http.mjs';
import { metaProvider, verifyRazorpayPayment, razorpayProvider } from './provider.mjs';
import {createCommerce} from './commerce.mjs';
import {readFileSync} from 'node:fs';

const key=Symbol.for('mantrakshata.protected.runtime');
export function getRuntime(){
 if(globalThis[key])return globalThis[key];
 try{process.loadEnvFile(resolve('.env.server'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const e=process.env,origin=e.APP_ORIGIN||'http://127.0.0.1:3201';
 if(e.NODE_ENV==='production'&&(!origin.startsWith('https://')||!e.DATA_PATH||e.PERSISTENT_STORAGE_CONFIRMED!=='true'))throw new Error('Configure HTTPS origin and verified persistent private storage before production startup.');
 const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
 const service=createService({database:resolve(e.DATA_PATH||'server/data/mantrakshata.sqlite'),secret:e.SESSION_SECRET,send:metaProvider(e).send,adminPhones:(e.ADMIN_PHONES||'').split(',').map(phone).filter(Boolean),mainPhone:phone(e.MAIN_ACHARYA_PHONE),origin,prices:JSON.parse(e.PACKAGE_PRICES_PAISE||'{}'),packageNames:catalog.packages,verifyPayment:id=>verifyRazorpayPayment(e,id)});
 service.commerce=createCommerce({service,provider:razorpayProvider(e),keyId:e.RAZORPAY_KEY_ID,keySecret:e.RAZORPAY_KEY_SECRET,productNames:catalog.products,productPrices:JSON.parse(e.GIFT_PRICES_PAISE||'{}'),shippingPaise:e.SHIPPING_PAISE!==undefined&&e.SHIPPING_PAISE!==''?Number(e.SHIPPING_PAISE):null,boxPaise:e.GIFT_BOX_PAISE!==undefined&&e.GIFT_BOX_PAISE!==''?Number(e.GIFT_BOX_PAISE):null});
 const http=createHttp(service,{origin,secure:origin.startsWith('https://'),webhookSecret:e.META_APP_SECRET,verifyToken:e.WHATSAPP_VERIFY_TOKEN,paymentWebhookSecret:e.RAZORPAY_WEBHOOK_SECRET,trustProxy:e.TRUST_PROXY==='true'});
 return globalThis[key]={service,http,worker:null};
}
export function startWorker(runtime=getRuntime()){
 if(runtime.worker)return;
 runtime.worker=setInterval(()=>{runtime.service.tick().catch(()=>console.error('Reminder worker failed; review operations queue.'));runtime.service.commerce?.reconcile().catch(()=>console.error('Payment reconciliation failed; review operations.'));},30000);
}
