import * as THREE from './vendor/three.module.min.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createHeroRibbon} from './hero-ribbon.js?v=1';

export function createSculpture(host) {
  if(host.dataset.sculpture==='hero-ribbon')return createHeroRibbon(host);
  const dark=host.dataset.sculpture==='work';
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:760px)').matches?1.25:1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(0,0,7.5);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x76662f,2));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffe087,3);rim.position.set(-4,-1,2);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const segments=192,sides=12,positions=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments*Math.PI*2,center=new THREE.Vector3(1.32*Math.cos(t),1.32*Math.sin(t),.22*Math.sin(t*2));
    const radial=new THREE.Vector3(Math.cos(t),Math.sin(t),0),binormal=new THREE.Vector3(0,0,1);
    const across=radial.clone().multiplyScalar(Math.cos(t*1.5)).addScaledVector(binormal,Math.sin(t*1.5));
    const normal=radial.clone().multiplyScalar(-Math.sin(t*1.5)).addScaledVector(binormal,Math.cos(t*1.5));
    for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,p=center.clone().addScaledVector(across,.46*Math.cos(a)).addScaledVector(normal,.075*Math.sin(a));positions.push(p.x,p.y,p.z);if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xe4ce61,metalness:.86,roughness:.22,side:THREE.DoubleSide,envMapIntensity:1.3});
  const ribbon=new THREE.Mesh(geometry,material);ribbon.rotation.set(.45,-.45,.3);group.add(ribbon);
  if(dark){const inner=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xc7c9c9,metalness:.92,roughness:.18,side:THREE.DoubleSide}));inner.scale.setScalar(.55);inner.rotation.set(-.8,.6,-.3);group.add(inner);}
  let playing=false,frame=0,last=0,time=0,px=0,py=0,tx=0,ty=0;Object.defineProperty(host,'motionTime',{get:()=>time});
  function render(now){frame=0;if(playing){time+=Math.min((now-last)/1000,.04);last=now;px+=(tx-px)*.04;py+=(ty-py)*.04;group.rotation.set(.2+Math.sin(time*.45)*.2+py,time*.23+px,Math.sin(time*.3)*.12);group.position.y=Math.sin(time*.7)*.10;if(dark)group.children[1].rotation.y=-time*.35;}renderer.render(scene,camera);if(playing)frame=requestAnimationFrame(render);}
  function draw(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=camera.aspect<.8?9:7.5;camera.updateProjectionMatrix();if(playing)draw();else renderer.render(scene,camera);}
  new ResizeObserver(resize).observe(host);
  host.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!playing)return;const b=host.getBoundingClientRect();tx=((e.clientX-b.left)/b.width-.5)*.6;ty=((e.clientY-b.top)/b.height-.5)*.3;});host.addEventListener('pointerleave',()=>{tx=ty=0;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;cancelAnimationFrame(frame);frame=0;host.dataset.renderer='fallback';});renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';resize();setPlaying(host.dataset.playing==='true');});
  function setPlaying(value){playing=value;if(value){last=performance.now();draw();}else{cancelAnimationFrame(frame);frame=0;}}
  host.dataset.renderer='webgl';resize();return {setPlaying};
}
