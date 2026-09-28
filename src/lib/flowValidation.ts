export function normalizeIndianPhone(value:string):string { const digits=value.replace(/\D/g,''); const phone=digits.length===12&&digits.startsWith('91')?digits.slice(2):digits; return /^[6-9]\d{9}$/.test(phone)?'91'+phone:''; }
export function localDate(date=new Date()):string {return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
export function nextBirthday(dob:string):string {if(!/^\d{4}-\d{2}-\d{2}$/.test(dob))return ''; const today=localDate();let year=new Date().getFullYear();const [,month,day]=dob.split('-').map(Number);let date=new Date(year,month-1,day);if(localDate(date)<today)date=new Date(++year,month-1,day);return localDate(date);}
export function addressError(address:string,pin:string,email:string,mapsLink?:string):string {
  if(address.trim().length<8)return 'Enter a complete street address.';
  if(!/^560\d{3}$/.test(pin.trim()))return 'Home ceremonies currently require a Bengaluru PIN code (560xxx).';
  const maps=(mapsLink||'').trim();
  if(!maps)return 'Google Maps location link is compulsory for the Acharya to navigate to your venue.';
  if(!maps.includes('maps') && !maps.includes('goo.gl') && !/^https?:\/\//i.test(maps)) return 'Please provide a valid Google Maps link (e.g. https://maps.app.goo.gl/...).';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))return 'Enter a valid email address.';
  return '';
}
type Challenge={phone:string;code:string;expires:number;attempts:number;requested:number};
const key='mantrakshata_demo_otp';const verifiedKey='mantrakshata_demo_phone_verified';
export function requestDemoOtp(value:string):{code?:string;error?:string}{const phone=normalizeIndianPhone(value);if(!phone)return {error:'Enter a valid Indian mobile number.'};let existing:Challenge|null=null;try{existing=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}if(existing&&existing.phone===phone&&Date.now()-existing.requested<30000)return {error:'Wait 30 seconds before requesting another demo code.'};const random=new Uint32Array(1);crypto.getRandomValues(random);const code=String(100000+random[0]%900000);sessionStorage.setItem(key,JSON.stringify({phone,code,expires:Date.now()+300000,attempts:0,requested:Date.now()}));return {code};}
export function verifyDemoOtp(value:string,code:string):{ok:boolean;error?:string}{let challenge:Challenge|null=null;try{challenge=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}if(!challenge||challenge.phone!==normalizeIndianPhone(value))return {ok:false,error:'Request a demo code for this phone first.'};if(Date.now()>challenge.expires)return {ok:false,error:'Code expired. Request another demo code.'};if(challenge.attempts>=5)return {ok:false,error:'Too many attempts. Request another demo code.'};challenge.attempts++;sessionStorage.setItem(key,JSON.stringify(challenge));if(code.trim()!==challenge.code)return {ok:false,error:'Incorrect demo code.'};sessionStorage.removeItem(key);sessionStorage.setItem(verifiedKey,JSON.stringify({phone:challenge.phone,expires:Date.now()+1800000}));return {ok:true};}
export function isDemoPhoneVerified(value:string):boolean {try{const item=JSON.parse(sessionStorage.getItem(verifiedKey)||'null');return !!item&&item.phone===normalizeIndianPhone(value)&&item.expires>Date.now();}catch{return false;}}
export function clearDemoVerification(){sessionStorage.removeItem(key);sessionStorage.removeItem(verifiedKey);}

// Two calendar days of notice; ceremony dates are entered in the local India service calendar.
export function earliestCeremonyDate(): string {const d=new Date();d.setDate(d.getDate()+2);return localDate(d);}
