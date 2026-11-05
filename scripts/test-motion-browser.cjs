const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {createServer}=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),errors=[];
 const artifacts=process.env.MOTION_REVIEW_DIR || path.join(require('node:os').tmpdir(),'vorellia-motion-review');
 await fs.mkdir(artifacts,{recursive:true});
 const server=createServer(async(req,res)=>{try{let name=new URL(req.url,'http://local').pathname;if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+decodeURIComponent(name));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);const studio=p.locator('[data-motion-studio]'),hero=p.locator('[data-sculpture=dna]'),toggle=p.locator('.motion-pause');
  await studio.scrollIntoViewIfNeeded();await hero.waitFor({state:'visible'});await p.waitForFunction(()=>document.querySelector('[data-sculpture=dna]').dataset.renderer==='webgl',{timeout:20000});
  await p.waitForTimeout(1000);await p.screenshot({path:path.join(artifacts,'three-desktop.png')});
  const t0=Number(await hero.evaluate(e=>e.motionTime));await p.waitForTimeout(700);assert(Number(await hero.evaluate(e=>e.motionTime))>t0,'3D keeps rotating');
  await toggle.click();await p.waitForTimeout(100);const stopped=await hero.evaluate(e=>e.motionTime);await p.waitForTimeout(900);assert.equal(await hero.evaluate(e=>e.motionTime),stopped,'pause freezes rendered time');
  await toggle.click();await p.waitForTimeout(700);assert(Number(await hero.evaluate(e=>e.motionTime))>Number(stopped),'play resumes');
  for(const [i,selector] of [[1,'.campaign-poster'],[2,'.content-format']]){
   await p.locator('.motion-select').nth(i).click();const a=p.locator(selector).first();await p.waitForTimeout(600);const before=await a.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(600);assert.notEqual(await a.evaluate(e=>getComputedStyle(e).transform),before,'continuous scene loop');
   await toggle.click();const frozen=await a.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(700);assert.equal(await a.evaluate(e=>getComputedStyle(e).transform),frozen,'GSAP freezes');await toggle.click();
  }
  const work=p.locator('[data-work-motion]');await work.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-sculpture=work]').dataset.renderer==='webgl');
  await p.waitForTimeout(600);await p.screenshot({path:path.join(artifacts,'three-work.png')});await work.locator('button').click();await p.waitForTimeout(100);const wt=await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime);await p.waitForTimeout(700);assert.equal(await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime),wt,'work pause independent');
  await work.locator('button').click();await p.waitForTimeout(500);assert.notEqual(await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime),wt);
  for(const width of [320,390,760,1920]){await p.setViewportSize({width,height:900});await p.goto(url);await p.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+width);if(width===390)await p.screenshot({path:path.join(artifacts,'three-mobile.png')});}
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert(await p.locator('.motion-pause').isHidden());const reduced=await p.locator('[data-sculpture=dna]').evaluate(e=>e.motionTime);await p.waitForTimeout(700);assert.equal(await p.locator('[data-sculpture=dna]').evaluate(e=>e.motionTime),reduced);
  const cold=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:900}});await cold.goto(url);await cold.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await cold.waitForFunction(()=>document.querySelector('[data-sculpture=dna]').motionTime===0);
  assert.equal(await cold.locator('[data-sculpture=dna]').getAttribute('data-renderer'),'webgl','reduced motion gets a rendered still');
  const fallback=await browser.newPage({viewport:{width:390,height:900}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});await fallback.goto(url);await fallback.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await fallback.waitForFunction(()=>document.querySelector('[data-sculpture=dna]').dataset.renderer==='fallback');
  await fallback.locator('.motion-pause').click();const ft=await fallback.locator('[data-sculpture=dna] .dna-fallback').evaluate(e=>e.getAnimations()[0].currentTime);await fallback.waitForTimeout(700);assert.equal(await fallback.locator('[data-sculpture=dna] .dna-fallback').evaluate(e=>e.getAnimations()[0].currentTime),ft,'CSS fallback freezes in place');
  assert.deepEqual(errors,[]);console.log('PASS: real WebGL rendering, continuous animation, exact freeze/resume in all scenes and work preview, 320–1920px layouts, cold-start reduced motion still, no-WebGL fallback pause, no runtime errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
