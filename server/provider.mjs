export function metaProvider(env,fetcher=fetch){let cache=[],loaded=0;
 const token=env.WHATSAPP_TOKEN,phoneId=env.WHATSAPP_PHONE_NUMBER_ID,waba=env.WHATSAPP_WABA_ID,version=env.META_API_VERSION||'v23.0';
 async function schemas(){if(Date.now()-loaded<300000)return cache;if(!token||!phoneId||!waba)throw new Error('WhatsApp server configuration missing');let url=`https://graph.facebook.com/${version}/${waba}/message_templates?fields=name,status,language,components&limit=100`;const rows=[];for(let page=0;url&&page<10;page++){const res=await fetcher(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error('Cannot verify approved WhatsApp templates');const data=await res.json();rows.push(...(data.data||[]));const next=data.paging?.next;url=next&&new URL(next).hostname==='graph.facebook.com'?next:null;}cache=rows;loaded=Date.now();return rows;}
  async function send(to,name,params,button){const templates=await schemas();const candidates=templates.filter(t=>t.name===name&&t.status==='APPROVED');const t=candidates.find(t=>t.language===(env.WHATSAPP_LANGUAGE||'en'))||candidates.find(t=>t.language==='en_US');if(!t)throw new Error('Template is not approved in the configured language');const body=t.components.find(c=>c.type==='BODY');const count=Math.max(0,...[...(body?.text||'').matchAll(/\{\{(\d+)\}\}/g)].map(x=>+x[1]));if(name==='hav_otp1'&&count===1)params=[params[0]];if(count!==params.length||params.some(p=>p===undefined||p===null||String(p).trim()===''))throw new Error('Template parameters do not match the approved template');const sanitizeParam=v=>String(v??'').replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim();const components=count?[{type:'body',parameters:params.map(p=>({type:'text',text:sanitizeParam(p)}))}]:[];const buttons=t.components.find(c=>c.type==='BUTTONS')?.buttons||[];for(const [index,b] of buttons.entries()){if(b.type==='URL'&&b.url?.includes('{{1}}')||b.type==='OTP'){if(!button)throw new Error('Template needs a dynamic button value');components.push({type:'button',sub_type:'url',index:String(index),parameters:[{type:'text',text:String(button)}]});}}
 let res;try{res=await fetcher(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'template',template:{name,language:{code:t.language},components}}),signal:AbortSignal.timeout(15000)});}catch{throw Object.assign(new Error('Unknown provider outcome'),{ambiguous:true});}const data=await res.json().catch(()=>({}));if(!res.ok)throw Object.assign(new Error('Provider rejected message'),{safeRetry:res.status===429,ambiguous:res.status>=500});if(!data.messages?.[0]?.id)throw Object.assign(new Error('Missing provider message ID'),{ambiguous:true});return {id:data.messages[0].id};}
 return {send};
}
export async function verifyRazorpayPayment(env,id){if(!/^pay_[A-Za-z0-9]+$/.test(id)||!env.RAZORPAY_KEY_ID||!env.RAZORPAY_KEY_SECRET)throw new Error('Payment verification not configured');const res=await fetch('https://api.razorpay.com/v1/payments/'+id,{headers:{Authorization:'Basic '+Buffer.from(env.RAZORPAY_KEY_ID+':'+env.RAZORPAY_KEY_SECRET).toString('base64')},signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error('Could not verify payment');return res.json();}

export function razorpayProvider(env,fetcher=fetch){
 async function request(path,body){if(!env.RAZORPAY_KEY_ID||!env.RAZORPAY_KEY_SECRET)throw new Error('Payment configuration missing');let res;try{res=await fetcher('https://api.razorpay.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Basic '+Buffer.from(env.RAZORPAY_KEY_ID+':'+env.RAZORPAY_KEY_SECRET).toString('base64'),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});}catch{throw Object.assign(new Error('Unknown payment provider result'),{ambiguous:true});}if(!res.ok)throw Object.assign(new Error('Payment provider rejected request'),{ambiguous:res.status>=500});try{return await res.json();}catch{throw Object.assign(new Error('Invalid payment provider response'),{ambiguous:!!body});}}
 const safe=(id,prefix)=>{if(!new RegExp('^'+prefix+'_[A-Za-z0-9]+$').test(id))throw new Error('Invalid provider identifier');return id;};
 return {createOrder:body=>request('orders',body),order:id=>request('orders/'+safe(id,'order')),payment:id=>request('payments/'+safe(id,'pay')),orderPayments:id=>request('orders/'+safe(id,'order')+'/payments'),refund:id=>request('refunds/'+safe(id,'rfnd')),paymentRefunds:id=>request('payments/'+safe(id,'pay')+'/refunds')};
}

export function cashfreeProvider(env,fetcher=fetch){
 const appId=env.CASHFREE_APP_ID,secretKey=env.CASHFREE_SECRET_KEY,version=env.CASHFREE_API_VERSION||'2023-08-01';
 const baseUrl=(env.CASHFREE_ENV==='sandbox'?'https://sandbox.cashfree.com/pg':'https://api.cashfree.com/pg');
 async function request(path,method='GET',body=null){
  if(!appId||!secretKey)throw new Error('Cashfree payment configuration missing');
  let res;
  try{
   res=await fetcher(`${baseUrl}/${path}`,{
    method,
    headers:{'x-client-id':appId,'x-client-secret':secretKey,'x-api-version':version,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,
    signal:AbortSignal.timeout(15000)
   });
  }catch{throw Object.assign(new Error('Unknown Cashfree payment provider result'),{ambiguous:true});}
  if(!res.ok){
   let errData={};try{errData=await res.json();}catch{}
   const msg=errData.message||errData.code||'Cashfree payment provider rejected request';
   throw Object.assign(new Error(msg),{ambiguous:res.status>=500,safeRetry:res.status===429,status:res.status});
  }
  try{return await res.json();}catch{throw Object.assign(new Error('Invalid Cashfree payment provider response'),{ambiguous:!!body});}
 }
 return {
  gateway:'cashfree',
  createOrder:async input=>{
   const rawPhone=String(input.customer?.phone||'').replace(/\D/g,'');
   const cleanPhone=rawPhone.length>=10?rawPhone.slice(-10):'9902045009';
   const customerId=cleanPhone||('cust_'+Date.now());
   const orderId=String(input.receipt||input.order_id||('PO-'+Date.now())).slice(0,50);
   const amountRupees=Number((input.amount/100).toFixed(2));
   const payload={
    order_id:orderId,
    order_amount:amountRupees,
    order_currency:input.currency||'INR',
    customer_details:{
     customer_id:customerId,
     customer_phone:cleanPhone,
     customer_name:(input.customer?.name||'Devotee').slice(0,100),
     customer_email:(input.customer?.email||'devotee@mantrakshata.com').slice(0,100)
    },
    order_note:(input.notes?.target_kind==='gift'?'Mantrakshata Sacred Gift':'Mantrakshata Ceremony Booking').slice(0,200),
    order_tags:{
     target_id:String(input.notes?.target_id||'').slice(0,50),
     target_kind:String(input.notes?.target_kind||'').slice(0,50)
    }
   };
   if(input.return_url)payload.order_meta={return_url:input.return_url};
   const data=await request('orders','POST',payload);
   return {
    id:data.order_id,
    cf_order_id:data.cf_order_id,
    payment_session_id:data.payment_session_id,
    amount:Math.round(Number(data.order_amount)*100),
    currency:data.order_currency||'INR',
    status:data.order_status,
    receipt:data.order_id,
    gateway:'cashfree'
   };
  },
  order:async id=>{
   const safeId=encodeURIComponent(String(id).replace(/[^A-Za-z0-9_-]/g,''));
   const data=await request(`orders/${safeId}`,'GET');
   return {
    id:data.order_id,
    cf_order_id:data.cf_order_id,
    amount:Math.round(Number(data.order_amount)*100),
    currency:data.order_currency||'INR',
    status:data.order_status,
    receipt:data.order_id,
    notes:data.order_tags||{},
    payment_session_id:data.payment_session_id,
    gateway:'cashfree'
   };
  },
  orderPayments:async id=>{
   const safeId=encodeURIComponent(String(id).replace(/[^A-Za-z0-9_-]/g,''));
   const data=await request(`orders/${safeId}/payments`,'GET');
   const items=(Array.isArray(data)?data:[]).map(p=>({
    id:String(p.cf_payment_id),
    order_id:String(p.order_id||id),
    amount:Math.round(Number(p.payment_amount)*100),
    currency:p.payment_currency||'INR',
    status:p.payment_status==='SUCCESS'?'captured':String(p.payment_status||'').toLowerCase(),
    method:p.payment_group,
    raw:p
   }));
   return {items};
  },
  payment:async id=>{
   const safeId=encodeURIComponent(String(id).replace(/[^A-Za-z0-9_-]/g,''));
   const data=await request(`payments/${safeId}`,'GET');
   return {
    id:String(data.cf_payment_id),
    order_id:String(data.order_id),
    amount:Math.round(Number(data.payment_amount)*100),
    currency:data.payment_currency||'INR',
    status:data.payment_status==='SUCCESS'?'captured':String(data.payment_status||'').toLowerCase()
   };
  },
  refund:async id=>{
   const safeId=encodeURIComponent(String(id).replace(/[^A-Za-z0-9_-]/g,''));
   const data=await request(`refunds/${safeId}`,'GET');
   return {
    id:String(data.refund_id),
    payment_id:String(data.cf_payment_id||''),
    amount:Math.round(Number(data.refund_amount)*100),
    status:data.refund_status==='SUCCESS'?'processed':String(data.refund_status||'').toLowerCase()
   };
  },
  paymentRefunds:async()=>({items:[]})
 };
}
