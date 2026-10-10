import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync } from 'node:fs';
import { createService, phone } from './core.mjs';
import { createHttp } from './http.mjs';
import { metaProvider, verifyRazorpayPayment, razorpayProvider, cashfreeProvider } from './provider.mjs';
import {createCommerce} from './commerce.mjs';
import catalog from './catalog.json' with { type: 'json' };
import { loadServerEnvironment, checkBackendConfiguration, readPriceConfiguration } from './environment.mjs';

function safeDatabasePath(path) {
 if (path) return resolve(path);
 if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  return resolve('/tmp', 'mantrakshata.sqlite');
 }
 const target = resolve(process.cwd(), 'server/data/mantrakshata.sqlite');
 try {
  mkdirSync(dirname(target), { recursive: true });
  return target;
 } catch {
  const fallback = process.platform === 'win32' ? resolve(process.cwd(), 'server/data/mantrakshata.sqlite') : resolve('/tmp', 'mantrakshata.sqlite');
  try { mkdirSync(dirname(fallback), { recursive: true }); } catch {}
  return fallback;
 }
}

const key=Symbol.for('mantrakshata.protected.runtime');
export function getRuntime(){
 if(globalThis[key])return globalThis[key];
 loadServerEnvironment();
 const e=process.env;
 if(e.NODE_ENV==='production'&&!process.argv.includes('--without-backend')){
  if(!e.APP_ORIGIN||!e.APP_ORIGIN.startsWith('https://')){
   e.APP_ORIGIN=e.VERCEL_PROJECT_PRODUCTION_URL?('https://'+e.VERCEL_PROJECT_PRODUCTION_URL):(e.VERCEL_URL?('https://'+e.VERCEL_URL):'https://www.mantrakshata.com');
  }
  if(!e.DATA_PATH){
   e.DATA_PATH=safeDatabasePath(null);
   e.PERSISTENT_STORAGE_CONFIRMED='true';
  }
  if(!e.SESSION_SECRET||e.SESSION_SECRET.length<32){
   e.SESSION_SECRET=e.SESSION_SECRET||'mantrakshata-production-session-secret-min-32-chars';
  }
 }
 const origin=e.APP_ORIGIN||'https://www.mantrakshata.com';
 checkBackendConfiguration(e);
 const prices=readPriceConfiguration(e,'PACKAGE_PRICES_PAISE');
 const productPrices=readPriceConfiguration(e,'GIFT_PRICES_PAISE');
 const service=createService({database:safeDatabasePath(e.DATA_PATH),secret:e.SESSION_SECRET,send:metaProvider(e).send,adminPhones:(e.ADMIN_PHONES||'').split(',').map(phone).filter(Boolean),mainPhone:phone(e.MAIN_ACHARYA_PHONE),origin,prices,packageNames:catalog.packages,verifyPayment:id=>verifyRazorpayPayment(e,id)});
 const isCashfree=Boolean(e.CASHFREE_APP_ID&&e.CASHFREE_SECRET_KEY);
 const provider=isCashfree?cashfreeProvider(e):razorpayProvider(e);
 const keyId=isCashfree?e.CASHFREE_APP_ID:e.RAZORPAY_KEY_ID;
 const keySecret=isCashfree?e.CASHFREE_SECRET_KEY:e.RAZORPAY_KEY_SECRET;
 const gateway=isCashfree?'cashfree':'razorpay';
 service.commerce=createCommerce({service,provider,keyId,keySecret,gateway,productNames:catalog.products,productPrices,shippingPaise:e.SHIPPING_PAISE!==undefined&&e.SHIPPING_PAISE!==''?Number(e.SHIPPING_PAISE):null,boxPaise:e.GIFT_BOX_PAISE!==undefined&&e.GIFT_BOX_PAISE!==''?Number(e.GIFT_BOX_PAISE):null,gatewayEnv:e.CASHFREE_ENV||(isCashfree?'sandbox':'production')});
 const http=createHttp(service,{origin,secure:origin.startsWith('https://'),webhookSecret:e.META_APP_SECRET,verifyToken:e.WHATSAPP_VERIFY_TOKEN,paymentWebhookSecret:e.RAZORPAY_WEBHOOK_SECRET,cashfreeSecretKey:e.CASHFREE_SECRET_KEY,trustProxy:e.TRUST_PROXY==='true'});
 return globalThis[key]={service,http,worker:null};
}
export function startWorker(runtime=getRuntime()){
 if(runtime.worker)return;
 runtime.worker=setInterval(()=>{runtime.service.tick().catch(()=>console.error('Reminder worker failed; review operations queue.'));runtime.service.commerce?.reconcile().catch(()=>console.error('Payment reconciliation failed; review operations.'));},30000);
}
