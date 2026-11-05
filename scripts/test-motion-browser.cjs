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
  const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|Program Info Log/.test(m.text()))errors.push(m.text());});
  await p.goto(url);const studio=p.locator('[data-motion-studio]'),hero=p.locator('[data-sculpture=hero-ribbon]'),toggle=p.locator('.motion-pause');
  await studio.scrollIntoViewIfNeeded();await hero.waitFor({state:'visible'});await p.waitForFunction(()=>document.querySelector('[data-sculpture=hero-ribbon]').dataset.renderer==='webgl',{timeout:20000});
  await p.waitForTimeout(1000);await p.screenshot({path:path.join(artifacts,'three-desktop.png')});
  const t0=Number(await hero.evaluate(e=>e.motionTime));await p.waitForTimeout(700);assert(Number(await hero.evaluate(e=>e.motionTime))>t0,'3D keeps rotating');
  await toggle.click();await p.waitForTimeout(100);const stopped=await hero.evaluate(e=>e.motionTime);await p.waitForTimeout(900);assert.equal(await hero.evaluate(e=>e.motionTime),stopped,'pause freezes rendered time');
  await toggle.click();await p.waitForTimeout(700);assert(Number(await hero.evaluate(e=>e.motionTime))>Number(stopped),'play resumes');
  const artBounds=await hero.boundingBox();await p.mouse.move(artBounds.x+artBounds.width*.85,artBounds.y+artBounds.height*.25);await p.waitForTimeout(700);await p.screenshot({path:path.join(artifacts,'ribbon-cursor.png')});
  await p.evaluate(()=>scrollBy(0,100));await p.waitForTimeout(900);await p.screenshot({path:path.join(artifacts,'ribbon-scroll.png')});await studio.scrollIntoViewIfNeeded();await p.mouse.move(0,0);
  await toggle.click();
  const startPose=await hero.evaluate(e=>e.ribbonSample(0));
  for(const phase of [0,3.5,7,10.5]){await hero.evaluate((e,t)=>e.ribbonSample(t),phase);await p.screenshot({path:path.join(artifacts,'ribbon-phase-'+phase+'.png')});}
  await hero.evaluate(e=>e.ribbonSample(0));
  await hero.locator('canvas').screenshot({path:path.join(artifacts,'ribbon-poster.png')});
  const endPose=await hero.evaluate(e=>e.ribbonSample(14));
  assert(Math.max(...startPose.map((n,i)=>Math.abs(n-endPose[i])))<.00001,'14 second deformation is seamless');
  await toggle.click();
  for(const [i,selector] of [[1,'.campaign-poster'],[2,'.content-format']]){
   await p.locator('.motion-select').nth(i).click();const a=p.locator(selector).first();await p.waitForTimeout(600);const before=await a.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(600);assert.notEqual(await a.evaluate(e=>getComputedStyle(e).transform),before,'continuous scene loop');
   await toggle.click();const frozen=await a.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(700);assert.equal(await a.evaluate(e=>getComputedStyle(e).transform),frozen,'GSAP freezes');await toggle.click();
  }
  const work=p.locator('[data-work-motion]');await work.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-sculpture=work]').dataset.renderer==='webgl');
  await p.waitForTimeout(600);await p.screenshot({path:path.join(artifacts,'three-work.png')});await work.locator('button').click();await p.waitForTimeout(100);const wt=await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime);await p.waitForTimeout(700);assert.equal(await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime),wt,'work pause independent');
  await work.locator('button').click();await p.waitForTimeout(500);assert.notEqual(await p.locator('[data-sculpture=work]').evaluate(e=>e.motionTime),wt);
  for(const width of [320,390,760,1920]){await p.setViewportSize({width,height:900});await p.goto(url);await p.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+width);if(width===390)await p.screenshot({path:path.join(artifacts,'three-mobile.png')});}
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert(await p.locator('.motion-pause').isHidden());const reduced=await p.locator('[data-sculpture=hero-ribbon]').evaluate(e=>e.motionTime);await p.waitForTimeout(700);assert.equal(await p.locator('[data-sculpture=hero-ribbon]').evaluate(e=>e.motionTime),reduced);
  const cold=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:900}});await cold.goto(url);await cold.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await cold.waitForFunction(()=>document.querySelector('[data-sculpture=hero-ribbon]').motionTime===0);
  assert.equal(await cold.locator('[data-sculpture=hero-ribbon]').getAttribute('data-renderer'),'poster','reduced motion gets a static poster');
  await cold.locator('.hero-ribbon-poster').evaluate(img=>img.decode());
  assert(await cold.locator('.hero-ribbon-poster').evaluate(img=>img.naturalWidth>0),'rendered static image loaded');
  const noJS=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});await noJS.goto(url);await noJS.locator('.hero-ribbon-poster').evaluate(img=>img.decode());assert(await noJS.locator('.hero-ribbon-poster').isVisible(),'static fallback survives without JavaScript');
  const fallback=await browser.newPage({viewport:{width:390,height:900}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});await fallback.goto(url);await fallback.locator('[data-motion-studio]').scrollIntoViewIfNeeded();await fallback.waitForFunction(()=>document.querySelector('[data-sculpture=hero-ribbon]').dataset.renderer==='poster');
  assert(await fallback.locator('.hero-ribbon-poster').isVisible(),'no-WebGL static poster visible');assert(await fallback.locator('.motion-pause').isHidden(),'static fallback has no misleading playback control');
  assert.deepEqual(errors,[]);console.log('PASS: glass WebGL renderer, exact 14s loop closure, four reviewed phases, cursor/scroll screenshots, pause/resume, 320–1920px layouts, rendered reduced-motion/no-WebGL/no-JS poster, no runtime or shader errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
