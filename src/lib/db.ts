import {api} from './api';
import type {BookingPlan,GiftOrder} from './store';
export interface NeonConnectionStatus {ok:boolean;version?:string;error?:string;counts?:{bookings:number;giftOrders:number;whatsappLogs:number;[key:string]:number};}
export function getNeonConnectionString(){return '';}
export function setNeonConnectionString(_url:string){throw new Error('Database configuration is server-only.');}
export async function checkNeonConnection():Promise<NeonConnectionStatus>{try{await api('/admin/jobs');return {ok:true,version:'Protected server database'};}catch(e:any){return {ok:false,error:e.message};}}
export async function syncBookingToNeon(_b:BookingPlan){return false;}
export async function fetchBookingsFromNeon():Promise<BookingPlan[]>{return (await api('/bookings')).bookings;}
export async function syncGiftOrderToNeon(_o:GiftOrder){return false;}
export async function fetchGiftOrdersFromNeon():Promise<GiftOrder[]>{throw new Error('Gift fulfilment backend is not enabled.');}
export async function logWhatsAppToNeon(_log:any):Promise<void>{throw new Error('Message logging is server-only.');}
export async function fetchWhatsAppLogsFromNeon():Promise<any[]>{return (await api('/admin/jobs')).jobs;}
