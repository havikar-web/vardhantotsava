import fs from 'node:fs';
process.loadEnvFile('.env.server');
const keys=['WHATSAPP_TOKEN','RAZORPAY_KEY_SECRET','DATABASE_URL','SESSION_SECRET','META_APP_SECRET'];
const secrets=keys.filter(k=>process.env[k]?.length>12).map(k=>[k,process.env[k]]),hits=[];
function scan(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())scan(p);else if(/\.(js|ts|tsx|mjs|json|html)$/.test(p)){const text=fs.readFileSync(p,'utf8');for(const[k,value]of secrets)if(text.includes(value))hits.push({file:p,secret:k});}}}
scan('src');scan('app');scan('.next/static');
const result={checkedAt:new Date().toISOString(),paths:['src','app','.next/static'],secretsChecked:secrets.map(([k])=>k),hits,passed:!hits.length};fs.writeFileSync('docs/secret-scan-2026-10-01.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(hits.length)process.exitCode=1;
