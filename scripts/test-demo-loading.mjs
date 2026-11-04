import {readFileSync} from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
function setup({reduced=false,saveData=false,width=390,dpr=2}={}) {
  const events={}, buttons=[], callbacks=[];
  const motion={matches:reduced,addEventListener(){}};
  const video={dataset:{src:"hq.mp4",mobile:"mobile.mp4"},paused:true,addEventListener(){},load(){this.loads=(this.loads||0)+1;},play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},closest(){return{querySelector(){return{textContent:"Demo"};}};},insertAdjacentElement(_,button){buttons.push(button);}};
  const document={hidden:false,querySelectorAll:()=>[video],createElement:()=>({setAttribute(){},addEventListener(name,fn){this[name]=fn;}}),addEventListener(name,fn){events[name]=fn;}};
  vm.runInNewContext(readFileSync("dist/demo-loops.js","utf8"),{document,navigator:{connection:{saveData}},matchMedia:()=>motion,innerWidth:width,devicePixelRatio:dpr,IntersectionObserver:class{constructor(fn){callbacks.push(fn);}observe(){}}});
  return {video,document,button:buttons[0],events,visible(value){callbacks[0]([{target:video,isIntersecting:value}]);}};
}
const mobile=setup();assert.equal(mobile.video.src,undefined);mobile.visible(true);assert.equal(mobile.video.src,"mobile.mp4");assert.equal(mobile.video.paused,false);mobile.visible(false);assert.equal(mobile.video.paused,true);mobile.visible(true);assert.equal(mobile.video.loads,1);mobile.button.click();assert.equal(mobile.video.paused,true);mobile.visible(false);mobile.visible(true);assert.equal(mobile.video.paused,true);
const desktop=setup({width:1440});desktop.visible(true);assert.equal(desktop.video.src,"hq.mp4");desktop.document.hidden=true;desktop.events.visibilitychange();assert.equal(desktop.video.paused,true);
for(const options of [{reduced:true},{saveData:true}]){const demo=setup(options);demo.visible(true);assert.equal(demo.video.src,undefined);demo.button.click();assert.equal(demo.video.paused,false);}
console.log("Passed: lazy loading, source selection, single download, offscreen/background pause, persistent user pause, reduced motion and Data Saver.");
