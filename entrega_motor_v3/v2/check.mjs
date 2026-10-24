import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const b = await chromium.launch({ args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'] })
const p = await b.newPage({ viewport:{width:360,height:640} })
p.on('pageerror', e=>console.log('[pageerr]',e.message))
await p.goto('file://'+process.cwd()+'/video2.html')
await p.waitForFunction('window.done||window.err',null,{timeout:120000})
const err=await p.evaluate('window.err'); if(err){console.log('ERR',err);process.exit(1)}
let bad=0
for(let n=0;n<840;n+=15){
  const r=await p.evaluate((n)=>G.check(n),n)
  const fails=r.res.filter(x=>!x[4]&&x[1]!=='torso')
  if(fails.length){bad++; console.log(`f${n} t=${(n/30).toFixed(1)} ${r.shot}/${r.env} cam=${r.cam}  FUERA: `+fails.map(x=>`${x[0]}.${x[1]}(${x[2]},${x[3]})`).join(' '))}
}
console.log('muestras con fallo:',bad,'de',Math.ceil(840/15))
await b.close()
