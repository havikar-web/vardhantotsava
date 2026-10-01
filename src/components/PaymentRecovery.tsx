import React,{useState} from 'react';
import {api} from '../lib/api';
export function PaymentRecovery({record,busy,act}:{record:any;busy:boolean;act:(work:()=>Promise<any>)=>Promise<void>}){
 const [orderId,setOrderId]=useState('');
 if(!['unknown','creating'].includes(record.state))return null;
 return <form className="flex flex-wrap gap-2 py-2" onSubmit={e=>{e.preventDefault();void act(()=>api('/admin/payments/'+record.id+'/recover',{orderId}));}}><p className="w-full text-xs">Check Razorpay for receipt {record.id}. If an order was created, enter its ID. The server verifies the receipt, target and amount before recovering it.</p><label className="text-sm">Provider order ID<input required pattern="order_[A-Za-z0-9]+" value={orderId} onChange={e=>setOrderId(e.target.value)} className="block border rounded-lg p-2"/></label><button disabled={busy} className="underline text-sm">Recover existing order</button></form>;
}
