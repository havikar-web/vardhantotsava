import React, { useEffect, useId, useRef, useState } from 'react';
import { MapPin, LoaderCircle } from 'lucide-react';
type Place = { label: string; key: string };
const cache = new Map<string, Place[]>();
export function BirthplaceInput({ value, onChange, required = false, className = '' }: { value: string; onChange: (value: string) => void; required?: boolean; className?: string }) {
 const id=useId(); const [open,setOpen]=useState(false); const [results,setResults]=useState<Place[]>([]); const [status,setStatus]=useState(''); const [loading,setLoading]=useState(false); const [active,setActive]=useState(-1); const [query,setQuery]=useState(''); const selected=useRef('');
 useEffect(()=>{
  const term=query.trim(); setResults([]); setActive(-1);
  if(term.length<3 || term===selected.current){setLoading(false);setStatus('Type at least 3 characters to search across India.');return;}
  const controller=new AbortController(); let alive=true;
  const timer=window.setTimeout(async()=>{
   setLoading(true);setStatus('Searching Indian cities, towns and villages…');
   try {
    let found=cache.get(term.toLowerCase());
    if(!found){
     const params=new URLSearchParams({q:term,countrycode:'IN',limit:'8',lang:'en'});
     const response=await fetch('https://photon.komoot.io/api/?'+params,{signal:controller.signal});
     if(!response.ok)throw new Error('Search unavailable');
     const data=await response.json();
     const seen=new Set<string>();
     found=(data.features || []).filter((f:any)=>f.properties?.countrycode?.toUpperCase()==='IN').map((f:any)=>{const p=f.properties;const parts=[p.name,p.city || p.county,p.state].filter(Boolean);const label=[...new Set(parts)].join(', ');return {label,key:String(p.osm_id || label)};}).filter((p:Place)=>{if(!p.label||seen.has(p.label))return false;seen.add(p.label);return true;});
     if(cache.size>100)cache.clear();cache.set(term.toLowerCase(),found!);
    }
    if(alive){setResults(found!);setStatus(found!.length ? found!.length+' places found. Choose one or keep your own entry.' : 'No match found. You can keep this place as a manual entry.');}
   }catch(e){if(alive&&!controller.signal.aborted)setStatus('Location search is unavailable. You can still enter your place manually.');}
   finally{clearTimeout(timeout);if(alive)setLoading(false);}
  },650);
  const timeout=window.setTimeout(()=>{controller.abort();if(alive){setLoading(false);setStatus('Search timed out. You can still enter your place manually.');}},9000);
  return()=>{alive=false;clearTimeout(timer);clearTimeout(timeout);controller.abort();};
 },[query]);
 const choose=(label:string)=>{selected.current=label;onChange(label);setQuery('');setResults([]);setOpen(false);setActive(-1);};
 return <div className="place-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <div className="relative"><input type="text" role="combobox" aria-label="Place of birth" aria-autocomplete="list" aria-expanded={open} aria-controls={id} aria-activedescendant={active>=0 ? id+'-'+active : undefined} aria-describedby={id+'-hint'} autoComplete="off" value={value} onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setQuery(e.target.value);setOpen(true);setActive(-1);}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);setActive(-1);}if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(n=>Math.min(n+1,results.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(n-1,0));}if(e.key==='Enter'&&open&&active>=0&&results[active]){e.preventDefault();choose(results[active].label);}}} required={required} pattern={required ? '.*\\S.*' : undefined} placeholder="Search any Indian village, town or city" className={className} />{loading&&<LoaderCircle size={16} className="absolute right-3 top-4 animate-spin text-amber-700" aria-hidden="true" />}</div>
  {open&&<div className="place-results"><div id={id} role="listbox" aria-label="Indian places">{results.map((place,index)=><button key={place.key} id={id+'-'+index} type="button" role="option" aria-selected={index===active} className={index===active?'active':''} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(place.label)}><MapPin size={15}/><span>{place.label}</span></button>)}</div><p role="status">{status || 'Type at least 3 characters to search across India.'}</p>{value.trim()&&<button type="button" className="manual-place" onMouseDown={e=>e.preventDefault()} onClick={()=>choose(value.trim())}>Use “{value.trim()}” as entered</button>}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · Photon search</a></div>}
  <p id={id+'-hint'} className="mt-1 text-[11px] leading-relaxed text-[#756858]">Search India-wide, or enter a place manually. Add a district or state to narrow results.</p>
 </div>;
}
