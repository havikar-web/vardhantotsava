import React, { useId } from 'react';
import { NAKSHATRAS, RASHIS } from '../lib/panchanga';
export type ManualVedic = { nakshatra: string; rashi: string; gotra: string; pada: string };
export const emptyVedic: ManualVedic = {nakshatra:'',rashi:'',gotra:'',pada:''};
export function ManualVedicFields({enabled,onToggle,value,onChange}:{enabled:boolean;onToggle:(enabled:boolean)=>void;value:ManualVedic;onChange:(value:ManualVedic)=>void}) {
 const id=useId();
 return <div className="manual-vedic"><label className="manual-toggle"><input type="checkbox" checked={enabled} onChange={e=>onToggle(e.target.checked)} /><span>I know my Nakshatra / Rashi — enter manually</span></label>
 {enabled&&<div className="manual-vedic-grid">{(['nakshatra','rashi','gotra','pada'] as const).map(field=><label key={field}>{field==='nakshatra'?'Janma Nakshatra *':field==='rashi'?'Rashi *':field==='gotra'?'Gotra (optional)':'Pada (optional)'}<input aria-label={field==='nakshatra'?'Manual Nakshatra':field==='rashi'?'Manual Rashi':field==='gotra'?'Gotra':'Pada'} value={value[field]} onChange={e=>onChange({...value,[field]:e.target.value})} required={field==='nakshatra'||field==='rashi'} pattern={field==='pada'?'[1-4]':'.*\\S.*'} list={field==='nakshatra'||field==='rashi'?id+field:undefined} placeholder={field==='pada'?'1–4':field==='gotra'?'Enter Gotra':'Choose or type your own'} /></label>)}<datalist id={id+'nakshatra'}>{NAKSHATRAS.map(n=><option key={n.name} value={n.name}/>)}</datalist><datalist id={id+'rashi'}>{RASHIS.map(r=><option key={r.name} value={r.name}/>)}</datalist><p>Your entered details will be used for the booking. Your coordinator will confirm the ritual date.</p></div>}
 </div>;
}
