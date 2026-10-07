import { resolve } from 'node:path';
import { createService, phone } from './core.mjs';
import { createHttp } from './http.mjs';
import { metaProvider, verifyRazorpayPayment, razorpayProvider, cashfreeProvider } from './provider.mjs';
import {createCommerce} from './commerce.mjs';
import catalog from './catalog.json' with { type: 'json' };
import { loadServerEnvironment, checkBackendConfiguration, readPriceConfiguration } from './environment.mjs';

const key=Symbol.for('mantrakshata.protected.runtime');
export function getRuntime(){
 if(globalThis[key])return globalThis[key];
 loadServerEnvironment();
 const e=process.env,origin=e.APP_ORIGIN||'http://127.0.0.1:3201';
 checkBackendConfiguration(e);
 const prices=readPriceConfiguration(e,'PACKAGE_PRICES_PAISE');
 const productPrices=readPriceConfiguration(e,'GIFT_PRICES_PAISE');
 const service=createService({database:resolve(e.DATA_PATH||'server/data/mantrakshata.sqlite'),secret:e.SESSION_SECRET,send:metaProvider(e).send,adminPhones:(e.ADMIN_PHONES||'').split(',').map(phone).filter(Boolean),mainPhone:phone(e.MAIN_ACHARYA_PHONE),origin,prices,packageNames:catalog.packages,verifyPayment:id=>verifyRazorpayPayment(e,id)});
 const isCashfree=Boolean(e.CASHFREE_APP_ID&&e.CASHFREE_SECRET_KEY);
 const provider=isCashfree?cashfreeProvider(e):razorpayProvider(e);
 const keyId=isCashfree?e.CASHFREE_APP_ID:e.RAZORPAY_KEY_ID;
 const keySecret=isCashfree?e.CASHFREE_SECRET_KEY:e.RAZORPAY_KEY_SECRET;
 const gateway=isCashfree?'cashfree':'razorpay';
 service.commerce=createCommerce({service,provider,keyId,keySecret,gateway,productNames:catalog.products,productPrices,shippingPaise:e.SHIPPING_PAISE!==undefined&&e.SHIPPING_PAISE!==''?Number(e.SHIPPING_PAISE):null,boxPaise:e.GIFT_BOX_PAISE!==undefined&&e.GIFT_BOX_PAISE!==''?Number(e.GIFT_BOX_PAISE):null});
 const http=createHttp(service,{origin,secure:origin.startsWith('https://'),webhookSecret:e.META_APP_SECRET,verifyToken:e.WHATSAPP_VERIFY_TOKEN,paymentWebhookSecret:e.RAZORPAY_WEBHOOK_SECRET,cashfreeSecretKey:e.CASHFREE_SECRET_KEY,trustProxy:e.TRUST_PROXY==='true'});
 return globalThis[key]={service,http,worker:null};
}
export function startWorker(runtime=getRuntime()){
 if(runtime.worker)return;
 runtime.worker=setInterval(()=>{runtime.service.tick().catch(()=>console.error('Reminder worker failed; review operations queue.'));runtime.service.commerce?.reconcile().catch(()=>console.error('Payment reconciliation failed; review operations.'));},30000);
}
