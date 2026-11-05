import * as THREE from './vendor/three.module.min.js';

// An original open folded band: a soft V silhouette, not a torus or helix.
export function createHeroRibbon(host) {
  const mobile=matchMedia('(max-width:760px)').matches;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.setClearColor(0xfafaf9,1);host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xfafaf9);
  const camera=new THREE.PerspectiveCamera(33,1,.1,40);
  const room=new THREE.Scene();room.background=new THREE.Color(0xb4acbc);
  function softbox(w,h,x,y,z,power){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);}
  softbox(9,5,-4,5,3,4);softbox(1.4,7,4,0,2,2.5);softbox(10,6,0,-5,-3,.35);
  const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(room,.035);scene.environment=env.texture;
  room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xd6c3f0,1.5);rim.position.set(4,1,-3);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const steps=mobile?120:176,sides=20,ringCount=(steps+1)*(sides+1),positions=new Float32Array((ringCount+2)*3),indices=[];
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
  for(let j=0;j<sides;j++){indices.push(ringCount,j+1,j,ringCount+1,steps*(sides+1)+j,steps*(sides+1)+j+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setIndex(indices);
  geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),4);
  const glass=new THREE.MeshPhysicalMaterial({color:0xf8f2ff,metalness:0,roughness:.085,transmission:1,thickness:.22,ior:1.45,clearcoat:1,clearcoatRoughness:.08,attenuationColor:0x9a73c2,attenuationDistance:3.6,side:THREE.DoubleSide});
  glass.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float ribbonFresnel=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.5);
    vec3 ribbonRefract=refract(-normalize(vViewPosition),normal,1./1.45);
    vec3 ribbonStudio=textureCubeUV(envMap,inverseTransformDirection(ribbonRefract,viewMatrix),.18).rgb;
    outgoingLight=mix(outgoingLight,ribbonStudio*vec3(.9,.8,1.),.18);
    outgoingLight=mix(outgoingLight,vec3(.35,.21,.51),ribbonFresnel*.24);
    #include <opaque_fragment>`);};
  const mesh=new THREE.Mesh(geometry,glass);group.add(mesh);
  const center=new THREE.Vector3(),before=new THREE.Vector3(),after=new THREE.Vector3(),tangent=new THREE.Vector3(),across=new THREE.Vector3(),normal=new THREE.Vector3(),frameU=new THREE.Vector3(),frameV=new THREE.Vector3(),up=new THREE.Vector3(0,0,1);
  const spine=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.22,1.25,-.8),new THREE.Vector3(-1.65,.65,-.3),new THREE.Vector3(-1.1,-.12,.55),new THREE.Vector3(-.22,-1.08,.5),new THREE.Vector3(.35,-.72,-.15),new THREE.Vector3(.95,.25,-.64),new THREE.Vector3(1.58,1.02,.05),new THREE.Vector3(1.15,1.58,.8)],false,'centripetal');
  function path(t,phase,target){spine.getPoint(THREE.MathUtils.clamp(t,0,1),target);target.y+=.045*Math.sin(phase+t*Math.PI*2);target.z+=.065*Math.sin(phase+t*Math.PI);return target;}
  function deform(phase){
    for(let i=0;i<=steps;i++){
      const t=i/steps;path(t,phase,center);path(t-.0005,phase,before);path(t+.0005,phase,after);tangent.subVectors(after,before).normalize();
      const twist=-.2+t*1.8+.27*Math.sin(t*Math.PI*2+phase);
      frameU.crossVectors(tangent,up).normalize();frameV.crossVectors(tangent,frameU).normalize();
      across.copy(frameU).multiplyScalar(Math.cos(twist)).addScaledVector(frameV,Math.sin(twist));normal.crossVectors(tangent,across).normalize();
      const taper=.15+.85*THREE.MathUtils.smoothstep(t,0,.07)*THREE.MathUtils.smoothstep(1-t,0,.07);
      const width=(.27+.15*Math.pow(Math.sin(t*Math.PI),2))*(1+.035*Math.sin(phase+t*5))*taper;
      const thickness=(.040+.018*Math.sin(t*Math.PI))*Math.sqrt(taper);
      for(let j=0;j<=sides;j++){
        const a=j/sides*Math.PI*2,w=Math.cos(a)*width,h=Math.sin(a)*thickness,k=(i*(sides+1)+j)*3;
        positions[k]=center.x+across.x*w+normal.x*h;positions[k+1]=center.y+across.y*w+normal.y*h;positions[k+2]=center.z+across.z*w+normal.z*h;
      }
    }
    path(0,phase,center);positions.set(center.toArray(),ringCount*3);path(1,phase,center);positions.set(center.toArray(),(ringCount+1)*3);
    geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();
    const n=geometry.attributes.normal;for(let i=0;i<=steps;i++){const a=i*(sides+1),b=a+sides;normal.set(n.getX(a)+n.getX(b),n.getY(a)+n.getY(b),n.getZ(a)+n.getZ(b)).normalize();n.setXYZ(a,normal.x,normal.y,normal.z);n.setXYZ(b,normal.x,normal.y,normal.z);}n.needsUpdate=true;
  }
  let time=0,playing=false,frame=0,last=0,tx=0,ty=0,px=0,py=0,scrollTarget=0,scrollValue=0;
  Object.defineProperty(host,'motionTime',{get:()=>time});
  host.ribbonLoopDuration=14;
  function pose(seconds){const phase=(seconds%14)/14*Math.PI*2;deform(phase);group.rotation.set(.10+Math.sin(phase)*.055+py+scrollValue*.07,-.22+Math.sin(phase)*.11+px+scrollValue*.1,-.12+Math.cos(phase)*.035);group.position.y=.12+Math.sin(phase)*.035+scrollValue*.09;}
  function render(now){frame=0;if(playing){time+=Math.min((now-last)/1000,.07);last=now;px+=(tx-px)*.04;py+=(ty-py)*.04;scrollValue+=(scrollTarget-scrollValue)*.035;pose(time);}renderer.render(scene,camera);if(playing)frame=requestAnimationFrame(render);}
  function draw(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){const b=host.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.position.set(0,.1,camera.aspect<.8?10.5:9);camera.updateProjectionMatrix();if(playing)draw();else renderer.render(scene,camera);}
  new ResizeObserver(resize).observe(host);
  host.addEventListener('pointermove',e=>{if(!playing||e.pointerType==='touch')return;const b=host.getBoundingClientRect();tx=((e.clientX-b.left)/b.width-.5)*.13;ty=((e.clientY-b.top)/b.height-.5)*.08;});host.addEventListener('pointerleave',()=>{tx=ty=0;});
  let scrollPending=false;
  function onScroll(){
    if(scrollPending || !playing)return;
    scrollPending=true;
    requestAnimationFrame(()=>{
      scrollPending=false;
      if(!playing)return;
      const b=host.getBoundingClientRect();
      scrollTarget=THREE.MathUtils.clamp((innerHeight*.5-b.top-b.height*.5)/innerHeight,-1,1);
    });
  }
  addEventListener('scroll',onScroll,{passive:true});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;cancelAnimationFrame(frame);frame=0;host.dataset.renderer='poster';host.dispatchEvent(new Event('ribbon-fallback',{bubbles:true}));});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';resize();setPlaying(host.dataset.playing==='true');host.dispatchEvent(new Event('ribbon-fallback',{bubbles:true}));});
  function setPlaying(value){playing=value;if(value){last=performance.now();draw();}else{cancelAnimationFrame(frame);frame=0;}}
  // Read-only review helper: inspect every quarter of the exact same 14s loop.
  host.ribbonSample=seconds=>{setPlaying(false);time=seconds;px=py=scrollValue=0;pose(seconds);renderer.render(scene,camera);return Array.from(positions);};
  pose(0);host.dataset.renderer='webgl';resize();return {setPlaying};
}
