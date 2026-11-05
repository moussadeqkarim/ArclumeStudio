import * as THREE from './vendor/three.module.min.js';

// Original, deterministic organic reconstruction from the supplied MYDNA frames.
// No wireframe rendering: broken membranes, branching filaments and clustered volume.
export function createOrganicDNA(host) {
  const mobile=matchMedia('(max-width:760px)').matches;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
  host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50),group=new THREE.Group();scene.add(group);
  let seed=73641;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  const signed=()=>random()*2-1;
  const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(random(),.00001)))*Math.cos(random()*Math.PI*2);
  const length=10,turns=Math.PI*3.4;
  function center(f,side=0){const t=f*turns+side,r=.85+.028*Math.sin(f*29);return new THREE.Vector3(Math.cos(t)*r,(f-.5)*length,Math.sin(t)*r);}
  function tone(f,variation=0){return new THREE.Color().setHSL(.755+variation*.07,.48+f*.35,.53-f*.25+variation*.08);}
  const uniforms={uTime:{value:0}};
  const noise=`
    float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `;
  const tissueMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms,vertexShader:`
    uniform float uTime;attribute vec3 color;attribute float aKind;varying vec3 vColor;varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;varying vec2 vUv;varying float vKind;
    void main(){vec3 p=position;p+=normal*sin(p.y*4.+uTime*.22)*.008*aKind;vec4 mv=modelViewMatrix*vec4(p,1.);vColor=color;vPosition=p;vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;vUv=uv;vKind=aKind;gl_Position=projectionMatrix*mv;}
  `,fragmentShader:`
    ${noise}
    varying vec3 vColor;varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;varying vec2 vUv;varying float vKind;
    void main(){float n=noise(vPosition*8.)*.5+noise(vPosition*23.)*.35+noise(vPosition*57.)*.15;
      float broken=smoothstep(.37,.57,n);float edge=pow(max(0.,sin(vUv.y*3.14159)*sin(vUv.x*3.14159)),.6);
      float alpha=mix(.62,(.18+.70*broken)*edge,vKind);if(vKind>.5&&n<.37)discard;
      float fresnel=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),2.);float light=.64+.36*max(dot(normalize(vNormal),normalize(vec3(-.4,.7,1.))),0.);
      float depth=smoothstep(8.,14.,vView.z);vec3 color=mix(vColor*light,vec3(.86,.83,.9),depth*.35);color=mix(color,vec3(.96,.91,1.),fresnel*.12);
      gl_FragColor=vec4(color,alpha*(1.-depth*.35));}
  `});
  const vertices=[],uvs=[],colors=[],kinds=[],indices=[];
  function vertex(p,c,u,v,kind){vertices.push(...p.toArray());colors.push(c.r,c.g,c.b);uvs.push(u,v);kinds.push(kind);}
  function tube(curve,radius,f,steps=80){const base=vertices.length/3,frames=curve.computeFrenetFrames(steps,false),sides=8;
    for(let i=0;i<=steps;i++){const p=curve.getPointAt(i/steps),radiusHere=radius*(.8+.18*Math.sin(i*.74)+.13*Math.sin(i*1.9));
      for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;vertex(p.clone().addScaledVector(frames.normals[i],Math.cos(a)*radiusHere).addScaledVector(frames.binormals[i],Math.sin(a)*radiusHere),tone(f(i/steps),.1),i/steps,j/sides,0);
        if(i<steps&&j<sides){const k=base+i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}
  }
  [0,Math.PI].forEach(side=>tube(new THREE.CatmullRomCurve3(Array.from({length:161},(_,i)=>center(i/160,side))),.027,t=>t,200));
  const rungs=[];
  for(let i=0;i<25;i++){const f=(i+.3+random()*.3)/25,a=center(f),b=center(f,Math.PI),mid=a.clone().lerp(b,.5);mid.y+=signed()*.045;mid.z+=signed()*.055;
    const curve=new THREE.CatmullRomCurve3([a,mid,b]);rungs.push({curve,f});tube(curve,.012+random()*.004,()=>f,16);}
  const clusters=[];
  [0,Math.PI].forEach(side=>{
    for(let i=0;i<21;i++){const f=(i+random())/21,point=center(f,side);const density=Math.pow(random(),.6);
      clusters.push({f,point,spread:.045+random()*.16,density,side});}
  });
  // Thin curved membranes grow around selected regions; noise cuts soft irregular holes.
  for(const cluster of clusters){if(cluster.density<.48)continue;
    for(let sheet=0;sheet<6;sheet++){
      const base=vertices.length/3,along=12,across=5,arc=random()*Math.PI*2,patchLength=.012+random()*.028,width=.055+random()*.2,offset=signed()*.025;
      for(let i=0;i<=along;i++){const u=i/along,f=Math.max(0,Math.min(1,cluster.f+offset+(u-.5)*patchLength));const c=center(f,cluster.side);
        for(let j=0;j<=across;j++){const v=j/across,a=arc+(v-.5)*2.6,scallop=.65+.35*Math.sin(u*Math.PI),w=width*scallop*(1+.25*Math.sin(u*21+v*14));
          const p=c.clone().add(new THREE.Vector3(Math.cos(a)*w,(v-.5)*w*.65,Math.sin(a)*w));vertex(p,tone(f,random()*.4),u,v,1);
          if(i<along&&j<across){const k=base+i*(across+1)+j;indices.push(k,k+across+1,k+1,k+1,k+across+1,k+across+2);}}}
    }
  }
  // Sparse internal fragments break the repeated ladder pattern without filling every gap.
  const internalRungs=rungs.filter((_,i)=>i%4===1);
  for(const rung of internalRungs){for(let patch=0;patch<5;patch++){
    const c=rung.curve.getPoint(.12+random()*.76),base=vertices.length/3,span=.08+random()*.18;
    for(let i=0;i<=7;i++){for(let j=0;j<=5;j++){const u=i/7,v=j/5;const p=c.clone().add(new THREE.Vector3((u-.5)*span,(v-.5)*span*.8,Math.sin(u*5+v*2)*span*.23));vertex(p,tone(rung.f,.1),u,v,1);if(i<7&&j<5){const k=base+i*6+j;indices.push(k,k+6,k+1,k+1,k+6,k+7);}}}
  }}
  const tissue=new THREE.BufferGeometry();tissue.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));tissue.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));tissue.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));tissue.setAttribute('aKind',new THREE.Float32BufferAttribute(kinds,1));tissue.setIndex(indices);tissue.computeVertexNormals();group.add(new THREE.Mesh(tissue,tissueMaterial));
  const count=mobile?26000:52000,points=[],pointColors=[],sizes=[],alphas=[],phases=[];
  for(let i=0;i<count;i++){
    const cluster=clusters[Math.floor(random()*clusters.length)],f=cluster.f,spread=cluster.spread;
    let p=cluster.point.clone(),alpha=.38+random()*.5,size=.009+Math.pow(random(),2)*.025;
    const category=random();
    if(category<.77){p.x+=gaussian()*spread;p.y+=gaussian()*spread*1.1;p.z+=gaussian()*spread;}
    else if(category<.96){const rung=internalRungs[Math.floor(random()*internalRungs.length)];p=rung.curve.getPoint(random());p.add(new THREE.Vector3(gaussian(),gaussian(),gaussian()).multiplyScalar(.018+random()*.065));}
    else{p.add(new THREE.Vector3(gaussian(),gaussian(),gaussian()).multiplyScalar(.25));alpha*=.35;size*=.7;}
    const c=tone((p.y/length)+.5,signed()*.4);points.push(...p.toArray());pointColors.push(c.r,c.g,c.b);sizes.push(size);alphas.push(alpha*cluster.density*cluster.density);phases.push(random()*Math.PI*2);
  }
  const volume=new THREE.BufferGeometry();volume.setAttribute('position',new THREE.Float32BufferAttribute(points,3));volume.setAttribute('color',new THREE.Float32BufferAttribute(pointColors,3));volume.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));volume.setAttribute('aAlpha',new THREE.Float32BufferAttribute(alphas,1));volume.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));
  const pointUniforms={uTime:uniforms.uTime,uResolution:{value:1}};
  const volumeMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:pointUniforms,vertexShader:`
    uniform float uTime;uniform float uResolution;attribute vec3 color;attribute float aSize;attribute float aAlpha;attribute float aPhase;varying vec3 vColor;varying float vAlpha;varying float vBlur;varying float vPhase;
    void main(){vec3 p=position;p.x+=sin(aPhase+uTime*.19+p.y)*.009;p.z+=cos(aPhase+uTime*.16)*.009;vec4 mv=modelViewMatrix*vec4(p,1.);float depth=smoothstep(9.,14.,-mv.z);vColor=mix(color,vec3(.83,.81,.88),depth*.32);vAlpha=aAlpha*(1.-depth*.4);vBlur=depth;vPhase=aPhase;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uResolution/-mv.z,1.,9.);}
  `,fragmentShader:`varying vec3 vColor;varying float vAlpha;varying float vBlur;varying float vPhase;
    void main(){vec2 p=(gl_PointCoord-.5)*2.;p.x*=1.+.2*sin(vPhase);float d=dot(p,p);if(d>1.)discard;float edge=exp(-d*mix(3.,5.,vBlur))*(1.-smoothstep(.65,1.,d));float light=.64+.36*sqrt(1.-d);gl_FragColor=vec4(vColor*light,edge*vAlpha);}
  `});group.add(new THREE.Points(volume,volumeMaterial));
  // Branches are short curved filaments rather than cross-connected triangle edges.
  const lines=[],lineColors=[];
  for(const cluster of clusters){for(let j=0;j<5;j++){let p=cluster.point.clone();const direction=new THREE.Vector3(signed(),signed(),signed()).normalize().multiplyScalar(.018);
    for(let k=0;k<11;k++){const next=p.clone().add(direction).add(new THREE.Vector3(signed(),signed(),signed()).multiplyScalar(.008));lines.push(...p.toArray(),...next.toArray());const c=tone(cluster.f,.1);lineColors.push(c.r,c.g,c.b,c.r,c.g,c.b);p=next;}}}
  const filaments=new THREE.BufferGeometry();filaments.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));filaments.setAttribute('color',new THREE.Float32BufferAttribute(lineColors,3));group.add(new THREE.LineSegments(filaments,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.16,depthWrite:false})));
  let playing=false,frame=0,last=0,time=0,px=0,py=0,tx=0,ty=0;
  Object.defineProperty(host,'motionTime',{get:()=>time});group.rotation.set(-.08,.25,.34);
  function render(now){frame=0;if(playing){time+=Math.min((now-last)/1000,.05);last=now;px+=(tx-px)*.035;py+=(ty-py)*.035;group.rotation.set(-.08+py*.2,.25+time*.14+px,.34+Math.sin(time*.2)*.012);uniforms.uTime.value=time;}renderer.render(scene,camera);if(playing)frame=requestAnimationFrame(render);}
  function draw(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);pointUniforms.uResolution.value=height*renderer.getPixelRatio()*1.4;camera.aspect=width/height;camera.position.z=camera.aspect<.8?13:10.5;camera.updateProjectionMatrix();if(playing)draw();else renderer.render(scene,camera);}
  new ResizeObserver(resize).observe(host);
  host.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!playing)return;const b=host.getBoundingClientRect();tx=((e.clientX-b.left)/b.width-.5)*.14;ty=((e.clientY-b.top)/b.height-.5)*.10;});host.addEventListener('pointerleave',()=>{tx=ty=0;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;cancelAnimationFrame(frame);frame=0;host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';resize();setPlaying(host.dataset.playing==='true');});
  function setPlaying(value){playing=value;if(value){last=performance.now();draw();}else{cancelAnimationFrame(frame);frame=0;}}
  host.dataset.renderer='webgl';resize();return {setPlaying};
}
