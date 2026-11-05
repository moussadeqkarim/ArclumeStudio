import * as THREE from './vendor/three.module.min.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';

export function createSculpture(host) {
  const dark=host.dataset.sculpture==='work';
  const dna=host.dataset.sculpture==='dna';
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:760px)').matches?1.25:1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);
  camera.position.set(0,0,7.5);
  if(!dna){const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();}
  scene.add(new THREE.HemisphereLight(0xffffff,0x76662f,2));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffe087,3);rim.position.set(-4,-1,2);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  let particleMaterial,membraneMaterial;
  // Large molecular scaffold with a gathering, granular surface, matching the supplied motion reference.
  if (dna) {
    const length=10,turns=Math.PI*3.4,radius=.88;
    const dnaCurve = side => new THREE.CatmullRomCurve3(Array.from({length:161},(_,i)=>{
      const t=i/160*turns;
      return new THREE.Vector3(Math.cos(t+side)*radius,(i/160-.5)*length,Math.sin(t+side)*radius);
    }));
    const violet=new THREE.MeshStandardMaterial({color:0x8b46c9,metalness:.08,roughness:.5,transparent:true,opacity:.7});
    const violetLight=new THREE.MeshStandardMaterial({color:0xb991d5,metalness:.08,roughness:.5,transparent:true,opacity:.6});
    const strands=[dnaCurve(0),dnaCurve(Math.PI)];
    strands.forEach((curve,index)=>group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,240,.024,6,false),index?violetLight:violet)));
    // Irregular translucent facets give the strands the reference's porous, crystalline skin.
    const facets=[];
    for(const curve of strands){
      for(let j=0;j<180;j++){
        const f=j/180,c=curve.getPoint(f),next=curve.getPoint((j+1)/180);
        const thickness=.08+.18*Math.pow(Math.sin(f*44),2);
        for(let k=0;k<7;k++){
          const a=k/7*Math.PI*2,b=(k+1)/7*Math.PI*2;
          facets.push(c.x+Math.cos(a)*thickness,c.y+Math.sin(a*3)*.07,c.z+Math.sin(a)*thickness,next.x+Math.cos(a)*thickness,next.y,next.z+Math.sin(a)*thickness,c.x+Math.cos(b)*thickness,c.y+Math.sin(b*3)*.07,c.z+Math.sin(b)*thickness);
        }
      }
    }
    const skin=new THREE.BufferGeometry();skin.setAttribute('position',new THREE.Float32BufferAttribute(facets,3));
    membraneMaterial=new THREE.MeshBasicMaterial({color:0x8c3bc2,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false,wireframe:true});group.add(new THREE.Mesh(skin,membraneMaterial));
    for(let i=0;i<=24;i++) {
      const a=strands[0].getPoint(i/24),b=strands[1].getPoint(i/24);
      const rung=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,a.distanceTo(b),5),i%2?violet:violetLight);
      rung.position.copy(a).add(b).multiplyScalar(.5);rung.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());group.add(rung);
    }
    let seed=1831;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    const count=matchMedia('(max-width:760px)').matches?12000:24000;
    const points=[],scatter=[],colors=[],sizes=[];
    for(let i=0;i<count;i++){
      const f=rand(),t=f*turns,side=rand()>.5?Math.PI:0;
      const rung=rand()<.42,u=rand()*2-1;
      const spread=.04+Math.pow(rand(),3)*.24;
      const r=rung?radius*u:radius;
      points.push(Math.cos(t+side)*r+(rand()-.5)*spread,(f-.5)*length+(rand()-.5)*spread,Math.sin(t+side)*r+(rand()-.5)*spread);
      scatter.push((rand()-.5)*1.7,(rand()-.5)*1.1,(rand()-.5)*1.7);
      const color=new THREE.Color().setHSL(.72+f*.075,.42+rand()*.25,.42+rand()*.27);
      colors.push(color.r,color.g,color.b);sizes.push(1.4+rand()*2.5);
    }
    const particles=new THREE.BufferGeometry();particles.setAttribute('position',new THREE.Float32BufferAttribute(points,3));particles.setAttribute('aScatter',new THREE.Float32BufferAttribute(scatter,3));particles.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));particles.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
    particleMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{uTime:{value:0},uPixelRatio:{value:renderer.getPixelRatio()}},vertexShader:`
      uniform float uTime;uniform float uPixelRatio;attribute vec3 aScatter;attribute float aSize;varying vec3 vColor;varying float vAlpha;
      void main(){vColor=color;float build=smoothstep(0.,1.2,uTime);float wave=sin(position.y*1.8-uTime*.65);float shed=smoothstep(.5,1.,wave)*.16;vec3 p=position+aScatter*(1.-build+shed);vAlpha=(.35+.65*build)*(1.-shed);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uPixelRatio*(10./-mv.z),.8,5.);}
    `,fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vColor,(1.-smoothstep(.22,.5,d))*.76*vAlpha);}`});
    group.add(new THREE.Points(particles,particleMaterial));
    group.rotation.set(-.08,.25,.34);
  }
  // Closed ribbon with three half twists and a rounded physical cross-section.
  const segments=192,sides=12,positions=[],indices=[];
  for(let i=0;i<=segments;i++) {
    const t=i/segments*Math.PI*2;
    const center=new THREE.Vector3(1.32*Math.cos(t),1.32*Math.sin(t),.22*Math.sin(t*2));
    const radial=new THREE.Vector3(Math.cos(t),Math.sin(t),0),binormal=new THREE.Vector3(0,0,1);
    const across=radial.clone().multiplyScalar(Math.cos(t*1.5)).addScaledVector(binormal,Math.sin(t*1.5));
    const normal=radial.clone().multiplyScalar(-Math.sin(t*1.5)).addScaledVector(binormal,Math.cos(t*1.5));
    for(let j=0;j<=sides;j++) {
      const a=j/sides*Math.PI*2;
      const p=center.clone().addScaledVector(across,.46*Math.cos(a)).addScaledVector(normal,.075*Math.sin(a));
      positions.push(p.x,p.y,p.z);
      if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
    }
  }
  if (!dna) {
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({color:0xe4ce61,metalness:.86,roughness:.22,side:THREE.DoubleSide,envMapIntensity:1.3});
    const ribbon=new THREE.Mesh(geometry,material);ribbon.rotation.set(.45,-.45,.3);group.add(ribbon);
    if(dark){const inner=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xc7c9c9,metalness:.92,roughness:.18,side:THREE.DoubleSide}));inner.scale.setScalar(.55);inner.rotation.set(-.8,.6,-.3);group.add(inner);}
  }
  let playing=false,frame=0,last=0,time=0,px=0,py=0,tx=0,ty=0;
  Object.defineProperty(host,'motionTime',{get:()=>time});
  function render(now) {
    frame=0;
    if(playing) {
      time+=Math.min((now-last)/1000,.04);last=now;px+=(tx-px)*.04;py+=(ty-py)*.04;
      if (dna) {group.rotation.set(-.08+py*.3,time*.2+px,.34+Math.sin(time*.3)*.025);particleMaterial.uniforms.uTime.value=time;membraneMaterial.opacity=.22*Math.min(time/1.2,1);}
      else group.rotation.set(.2+Math.sin(time*.45)*.2+py,time*.23+px,Math.sin(time*.3)*.12);
      group.position.y=Math.sin(time*.7)*.10;
      if(dark)group.children[1].rotation.y=-time*.35;
    }
    renderer.render(scene,camera);
    if(playing)frame=requestAnimationFrame(render);
  }
  function draw(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=dna?(camera.aspect<.8?13:10.5):(camera.aspect<.8?9:7.5);camera.updateProjectionMatrix();if(dna&&!playing)particleMaterial.uniforms.uTime.value=Math.max(time,1.8);if(playing)draw();else renderer.render(scene,camera);}
  new ResizeObserver(resize).observe(host);
  host.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||!playing)return;const box=host.getBoundingClientRect();tx=((event.clientX-box.left)/box.width-.5)*.6;ty=((event.clientY-box.top)/box.height-.5)*.3;});
  host.addEventListener('pointerleave',()=>{tx=ty=0;});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();playing=false;cancelAnimationFrame(frame);frame=0;host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';resize();setPlaying(host.dataset.playing==='true');});
  function setPlaying(value){playing=value;if(value){last=performance.now();draw();}else{cancelAnimationFrame(frame);frame=0;}}
  host.dataset.renderer='webgl';resize();return {setPlaying};
}
