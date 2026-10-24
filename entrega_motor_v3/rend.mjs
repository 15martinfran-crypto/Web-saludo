import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
// uso: node rend.mjs <w> <h> <outdir> <step> <start> <end>   (renderiza start..end-1 con salto step)
const [w,h,out,step,s0,s1]=[+process.argv[2],+process.argv[3],process.argv[4],+process.argv[5],+process.argv[6],+process.argv[7]]
fs.mkdirSync(out,{recursive:true})
const b = await chromium.launch({ args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'] })
const p = await b.newPage({ viewport:{width:w,height:h} })
p.on('pageerror', e=>console.log('[pageerr]',e.message))
p.on('console', m=>{ if(m.type()==='error') console.log('[console]',m.text()) })
await p.goto('file://'+process.cwd()+'/video.html')
await p.waitForFunction('window.done||window.err',null,{timeout:120000})
const err=await p.evaluate('window.err'); if(err){console.log('ERR',err);process.exit(1)}
for(let n=s0;n<s1;n+=step){
  const t0=Date.now()
  const d=await p.evaluate(([n,w,h])=>G.png(n,w,h),[n,w,h])
  fs.writeFileSync(`${out}/f${String(n).padStart(4,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))
  fs.appendFileSync(`${out}/times.log`,`${n} ${Date.now()-t0}\n`)
}
await b.close()
