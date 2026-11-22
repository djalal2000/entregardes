
(async () => {
  'use strict';
  const canvas = document.getElementById('pemesa-cinematic-canvas');
  if (!canvas) return;
  const container = canvas.closest('.cinematic-visual');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function fallback() {
    if (canvas.dataset.fallbackLoaded === 'true') return;
    canvas.dataset.fallbackLoaded = 'true';
    const el = document.createElement('script');
    el.src = 'cinematic-hero.js?v=20261122-ref1';
    document.body.appendChild(el);
  }
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { fallback(); return; }
  let THREE, renderer;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js');
    renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  } catch (err) {
    console.warn('PEMESA: animation 3D indisponible, mode de secours.',err);
    fallback();return;
  }
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,50);
  camera.position.set(0,.05,7.6);
  const stage=new THREE.Group();scene.add(stage);
  const mobile=window.matchMedia('(max-width: 680px)').matches;
  const count=mobile?340:(navigator.deviceMemory||8)<=4?570:850;
  const segments=mobile?46:67;
  const tau=Math.PI*2;
  const fract=x=>x-Math.floor(x);
  const hash=n=>fract(Math.sin(n*12.9898+78.233)*43758.5453);
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  const attrSize=count*(segments+1)*2;
  const fiber=new Float32Array(attrSize);
  const tArr=new Float32Array(attrSize);
  const side=new Float32Array(attrSize);
  const width=new Float32Array(attrSize);
  const random=new Float32Array(attrSize);
  let ptr=0;
  for(let i=0;i<count;i++){
    const id=(i+.5)/count,v=hash(i+3),w=(mobile?.0058:.0037)*(.75+hash(i*3)*.95);
    for(let j=0;j<=segments;j++){
      const t=j/segments;
      for(let k=0;k<2;k++){
        fiber[ptr]=id;tArr[ptr]=t;side[ptr]=k?1:-1;
        width[ptr]=w;random[ptr]=v;ptr++;
      }
    }
  }
  const indexes=new Uint32Array(count*segments*6);
  ptr=0;
  for(let i=0;i<count;i++){
    const base=i*(segments+1)*2;
    for(let j=0;j<segments;j++){
      const a=base+j*2;
      indexes[ptr++]=a;indexes[ptr++]=a+1;indexes[ptr++]=a+2;
      indexes[ptr++]=a+1;indexes[ptr++]=a+3;indexes[ptr++]=a+2;
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(attrSize*3),3));
  geo.setAttribute('aId',new THREE.BufferAttribute(fiber,1));
  geo.setAttribute('aT',new THREE.BufferAttribute(tArr,1));
  geo.setAttribute('aSide',new THREE.BufferAttribute(side,1));
  geo.setAttribute('aWidth',new THREE.BufferAttribute(width,1));
  geo.setAttribute('aVariation',new THREE.BufferAttribute(random,1));
  geo.setIndex(new THREE.BufferAttribute(indexes,1));
  geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5.5);
  const u={
    uTime:{value:0},uHead:{value:1},uRing:{value:0},
    uStream:{value:0},uMotion:{value:1},uLight:{value:0},
    uFade:{value:0},uReveal:{value:1},uTip:{value:0}
  };
  const filaments=new THREE.Mesh(geo,new THREE.ShaderMaterial({
    uniforms:u,side:THREE.DoubleSide,transparent:true,depthTest:true,depthWrite:false,
    vertexShader:`
      precision highp float;
      attribute float aId,aT,aSide,aWidth,aVariation;
      uniform float uTime,uHead,uRing,uStream,uMotion;
      varying float vT,vDepth,vVariation;
      const float TAU=6.28318530718;
      vec3 headShape(float id,float t,float rand,float tm){
        float lat=mix(-1.39,1.39,t);
        float az=id*TAU*2.0+t*.63+tm*.12;
        float jaw=smoothstep(-1.3,-.54,lat);
        float radius=.85*max(.12,cos(lat))*mix(.59,1.,jaw);
        radius*=1.0+.045*sin(id*71.+t*25.);
        float x=radius*sin(az)*.85;
        float y=1.25*sin(lat);
        float z=radius*cos(az)*.78;
        float front=pow(max(0.,cos(az)),14.);
        z+=front*(.21*exp(-pow((y-.10)/.27,2.))+.10*exp(-pow((y-.57)/.22,2.)));
        return vec3(x,y,z)+vec3(cos(az),0.,sin(az))*aSide*aWidth*1.5;
      }
      vec3 ringShape(float id,float t,float rand,float tm){
        float theta=t*TAU*1.01+id*.2+tm*.028;
        float phi=id*TAU*41.+theta*2.9+rand*.22;
        float minor=.45*(1.+.018*sin(t*57.+id*400.));
        float major=1.12+minor*cos(phi);
        vec3 p=vec3(major*cos(theta),major*sin(theta),minor*sin(phi));
        p.x+=.025*sin(id*52.+t*18.+tm*.28);
        return p+vec3(cos(theta),sin(theta),0.)*aSide*aWidth;
      }
      vec3 streamShape(float id,float t,float rand,float tm){
        float spread=id-.5;
        vec3 start=vec3(2.6+spread*2.15,2.05+spread*.67,rand*.6-.3);
        vec3 end=vec3(-.62+spread*1.65,-1.0+spread*.81,rand*.7-.36);
        vec3 p=mix(start,end,t);
        p.x+=sin(t*3.14159)*.12*sin(id*63.+tm*.19);
        p.y+=.14*sin(id*25.+t*3.9+tm*.2);
        return p+vec3(aSide*aWidth,0.,0.);
      }
      void main(){
        float tm=uTime*uMotion;
        vec3 p=headShape(aId,aT,aVariation,tm)*uHead
             +ringShape(aId,aT,aVariation,tm)*uRing
             +streamShape(aId,aT,aVariation,tm)*uStream;
        p+=vec3(sin(aT*17.+aId*260.+tm*.8),cos(aT*11.+aId*64.-tm*.9),0.)*.003*uMotion;
        vT=aT;vDepth=p.z;vVariation=aVariation;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }
    `,
    fragmentShader:`
      precision highp float;
      uniform float uRing,uStream,uLight,uFade,uReveal,uTip;
      varying float vT,vDepth,vVariation;
      void main(){
        float shade=clamp(.76+.10*vDepth+.07*sin(vVariation*17.),.52,.99);
        float detail=.96+.045*sin(vT*56.+vVariation*20.);
        vec3 white=vec3(1.0,.98,.956)*shade*detail;
        vec3 gray=vec3(.78,.755,.745)*shade;
        vec3 color=mix(gray,white,clamp(.72+vVariation*.22,0.,1.));
        float tip=smoothstep(.84,.985,vT)*max(uStream,uTip);
        color=mix(color,vec3(1.,.31,.055)*(1.+uLight*.21),tip*.98);
        color+=vec3(.035,.028,.026)*uRing;
        float reveal=smoothstep(-.17,.025,uReveal-(vVariation*.69+vT*.31));
        gl_FragColor=vec4(color,clamp((.53+vDepth*.12)*uFade*reveal,0.,.81));
      }
    `
  }));
  filaments.frustumCulled=false;
  stage.add(filaments);
  const coreU={uTime:{value:0},uPower:{value:0}};
  const core=new THREE.Mesh(new THREE.SphereGeometry(.40,38,30),new THREE.ShaderMaterial({
    uniforms:coreU,transparent:true,depthWrite:false,
    vertexShader:`
      varying vec3 vN,vP;
      void main(){vN=normalize(normalMatrix*normal);vP=position;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
    `,
    fragmentShader:`
      uniform float uTime,uPower;
      varying vec3 vN,vP;
      void main(){
        float rim=pow(1.-abs(vN.z),2.2);
        float ember=sin(vP.y*33.+uTime*2.1)*sin(vP.x*29.-uTime*1.6);
        float glow=.45+.2*ember+.35*rim;
        vec3 fire=mix(vec3(.94,.21,.04),vec3(1.,.72,.24),glow);
        gl_FragColor=vec4(fire,clamp(glow*uPower*.78,0.,.78));
      }
    `
  }));
  stage.add(core);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(.87,30,24),new THREE.ShaderMaterial({
    uniforms:coreU,transparent:true,depthWrite:false,side:THREE.BackSide,
    blending:THREE.AdditiveBlending,
    vertexShader:`
      varying vec3 vN;
      void main(){vN=normalize(normalMatrix*normal);
       gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
    `,
    fragmentShader:`
      uniform float uTime,uPower;
      varying vec3 vN;
      void main(){float rim=pow(1.-abs(vN.z),4.);
        gl_FragColor=vec4(.98,.30,.065,rim*uPower*.17);}
    `
  }));
  stage.add(halo);
  const n=mobile?340:870;
  const dotsGeo=new THREE.BufferGeometry();
  const dots=new Float32Array(n*3),dotIds=new Float32Array(n),dotSize=new Float32Array(n);
  for(let i=0;i<n;i++){
    const a=hash(i*11+2)*tau,h=hash(i*19+8)*2-1,r=Math.sqrt(1-h*h);
    dots[i*3]=Math.cos(a)*r;dots[i*3+1]=h;dots[i*3+2]=Math.sin(a)*r;
    dotIds[i]=hash(i*23+13);dotSize[i]=1+hash(i*29+7)*3;
  }
  dotsGeo.setAttribute('position',new THREE.BufferAttribute(dots,3));
  dotsGeo.setAttribute('aId',new THREE.BufferAttribute(dotIds,1));
  dotsGeo.setAttribute('aSize',new THREE.BufferAttribute(dotSize,1));
  dotsGeo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
  const dustU={uTime:{value:0},uPower:{value:0},uShape:{value:0}};
  const dust=new THREE.Points(dotsGeo,new THREE.ShaderMaterial({
    uniforms:dustU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`
      precision highp float;
      attribute float aId,aSize;
      uniform float uTime,uPower,uShape;
      varying float vGold,vAlpha;
      void main(){
        vec3 p=position;
        vec3 torus=vec3((1.22+.45*p.z)*cos(aId*6.28318*2.),
                        (1.22+.45*p.z)*sin(aId*6.28318*2.),.45*p.y);
        vec3 burst=p*(1.66+.62*sin(aId*29.+uTime*.7));
        vec3 finalP=mix(burst,torus,uShape*.8);
        finalP+=vec3(sin(aId*113.+uTime*.5),cos(aId*78.+uTime*.4),0.)*.05;
        vec4 mv=modelViewMatrix*vec4(finalP,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(aSize*8.0/(-mv.z),.8,7.);
        vGold=step(.65,aId);
        vAlpha=clamp(uPower,0.,1.)*(.28+.42*step(.65,aId));
      }
    `,
    fragmentShader:`
      precision mediump float;
      varying float vGold,vAlpha;
      void main(){
        float d=length(gl_PointCoord-.5);
        float a=1.-smoothstep(.04,.49,d);
        vec3 c=mix(vec3(.69,.66,.64),vec3(1.,.38,.11),vGold);
        gl_FragColor=vec4(c,a*vAlpha);
      }
    `
  }));
  stage.add(dust);


  // A licensed natural portrait is displayed in the DOM behind this scene.
  // WebGL intentionally renders only its evolving fibers; no distorted bust.
  const photo=document.getElementById('pemesa-portrait-photo');
  if(photo){
    let backup=false;
    photo.addEventListener('error',()=>{
      if(!backup){backup=true;photo.src='https://images.pexels.com/photos/6337501/pexels-photo-6337501.jpeg?auto=compress&cs=tinysrgb&w=1100'}
      else {photo.classList.add('cinematic-portrait-unavailable');}
    });
  }

  // Warm glow inside the final knitted ring, independent of postprocessing
  // so it remains lightweight on phones and does not affect site UI elements.
  const glowCanvas=document.createElement('canvas');
  glowCanvas.width=128;glowCanvas.height=128;
  const g=glowCanvas.getContext('2d');
  if(g){
    const gradient=g.createRadialGradient(64,64,1,64,64,63);
    gradient.addColorStop(0,'rgba(255,249,193,1)');
    gradient.addColorStop(.16,'rgba(255,192,79,.96)');
    gradient.addColorStop(.38,'rgba(255,117,42,.75)');
    gradient.addColorStop(.72,'rgba(255,105,45,.20)');
    gradient.addColorStop(1,'rgba(255,105,45,0)');
    g.fillStyle=gradient;g.fillRect(0,0,128,128);
  }
  const aura=new THREE.Sprite(new THREE.SpriteMaterial({
    map:new THREE.CanvasTexture(glowCanvas),
    color:0xffffff,transparent:true,depthWrite:false,
    blending:THREE.AdditiveBlending,opacity:0
  }));
  aura.scale.set(1.55,1.55,1);
  stage.add(aura);

  let w=0,h=0,frame=0,last=0,seconds=0,running=false,visible=true;
  let px=0,py=0,tx=0,ty=0;

  // Storyboard derived from the six supplied reference frames.
  // 01 portrait; 02 face-to-filaments; 03 rear head; 04 emergence;
  // 05 diagonal cables; 06 torus with a molten center and reset.
  const duration=39;
  const labels={
    fr:['Portrait','Métamorphose du visage','Rotation et maillage','Émergence des fibres','Filaments lumineux','Anneau organique'],
    en:['Portrait','Face to fiber mesh','Head rotation','Emerging fibers','Glowing strands','Organic torus'],
    ar:['صورة الوجه','تحول الوجه إلى خيوط','دوران الرأس','ظهور الألياف','خيوط مضيئة','حلقة عضوية']
  };
  let previousScene=-1;
  function frameAt(seconds){
    const v=((seconds%duration)+duration)%duration;
    const f={
      id:0,portrait:1,head:1,ring:0,stream:0,
      wire:0,reveal:1,tip:0,particles:0,glow:0,
      yaw:0,pitch:0,roll:0,camZ:5.3,camX:0,camY:.05,scale:1
    };
    if(v<5.2){
      // Portrait still and luminous; only a subtle breathing camera drift.
      f.id=0;
      f.yaw=-.08+Math.sin(v*.3)*.023;
      f.camZ=5.25+.04*Math.sin(v*.6);
    }else if(v<10.9){
      const a=smooth((v-5.2)/5.7);
      f.id=1;f.head=1;f.portrait=1-smooth((a-.20)/.67);
      f.wire=.10+.74*a;f.reveal=.06+a*1.15;
      f.particles=.24*a;f.yaw=-.08+1.18*a;
      f.pitch=-.08-.18*a;f.roll=-.05*a;
      f.camZ=5.25+1.22*a;f.camX=.05*a;
    }else if(v<16.9){
      const a=smooth((v-10.9)/6);
      f.id=2;f.head=1-.26*a;f.stream=.26*a;
      f.portrait=0;f.wire=.84+.16*a;f.reveal=1.4;
      f.tip=.08+.72*a;f.particles=.30+.55*a;
      f.yaw=1.10+2.15*a;f.pitch=-.26+.16*a;
      f.roll=-.05+.13*a;f.camZ=6.47-.18*a;
    }else if(v<22.1){
      const a=smooth((v-16.9)/5.2);
      f.id=3;f.head=.74*(1-a);f.stream=.26+.74*a;
      f.portrait=0;f.wire=1;f.reveal=1.4;
      f.tip=.80+.20*a;f.particles=.85;
      f.yaw=3.25-2.90*a;f.pitch=-.10+.27*a;
      f.roll=.08-.28*a;f.camZ=6.29-1.0*a;
      f.camX=.06+.38*a;f.camY=.05-.23*a;
    }else if(v<28.1){
      const a=smooth((v-22.1)/6);
      f.id=4;f.head=0;f.stream=1;
      f.portrait=0;f.wire=1;f.reveal=1.4;
      f.tip=1;f.particles=.85-.18*a;
      f.yaw=.35-.19*a;f.pitch=.17-.04*a;
      f.roll=-.20+.10*a;f.camZ=5.29-.85*a;
      f.camX=.44+.25*a;f.camY=-.18-.08*a;
    }else if(v<35.1){
      const a=smooth((v-28.1)/2.5);
      const hold=smooth((v-30.6)/4.5);
      f.id=5;f.head=0;f.stream=1-a;f.ring=a;
      f.portrait=0;f.wire=1;f.reveal=1.4;
      f.tip=1-a;f.particles=.67+.27*a;
      f.glow=a*(.84+.16*Math.sin(v*1.9));
      f.yaw=.16+.50*hold;f.pitch=.13+.1*hold;
      f.roll=-.10+.10*hold;f.camZ=4.44+1.33*a;
      f.camX=.69*(1-a);f.camY=-.26*(1-a);
      f.scale=1+.055*a;
    }else{
      // Invisible seam: a short return to the initial portrait closes the loop.
      const a=smooth((v-35.1)/3.9);
      const b=smooth((a-.35)/.65);
      f.id=5;f.ring=1-a;f.head=a*(1-b);f.stream=0;
      f.portrait=b;f.wire=1-b;f.reveal=1.4;
      f.tip=0;f.glow=(1-a)*.88;f.particles=(1-a)*.82;
      f.yaw=.66*(1-a)-.08*a;f.pitch=.22*(1-a);
      f.roll=0;f.camZ=5.77-.52*a;
    }
    return f;
  }
  function updateScene(){
    const f=frameAt(reduced.matches?32:seconds);
    const time=reduced.matches?32:seconds;
    u.uTime.value=time;u.uHead.value=f.head;u.uRing.value=f.ring;
    u.uStream.value=f.stream;u.uFade.value=f.wire;
    u.uReveal.value=f.reveal;u.uTip.value=f.tip;
    u.uMotion.value=reduced.matches?0:1;u.uLight.value=f.glow;
    px+=(tx-px)*.032;py+=(ty-py)*.032;
    stage.rotation.y=f.yaw+px*.065;
    stage.rotation.x=f.pitch+py*.045;
    stage.rotation.z=f.roll;
    stage.scale.setScalar(f.scale);
    if(photo){
      photo.style.opacity=String(Math.max(0,Math.min(1,f.portrait)));
      const turn=Math.max(-.08,Math.min(.55,f.yaw*.3));
      photo.style.transform='translate3d(0,0,0) perspective(1100px) rotateY('+turn+'rad) scale('+(1.03+.035*f.wire)+')';
    }
    core.visible=f.glow>.025;
    halo.visible=f.glow>.025;
    core.scale.setScalar(.86+.22*Math.sin(time*1.6));
    coreU.uTime.value=time;coreU.uPower.value=f.glow;
    halo.scale.setScalar(1.18+.15*Math.sin(time*1.3));
    aura.visible=f.glow>.02;
    aura.material.opacity=Math.min(.91,f.glow*.95);
    aura.scale.setScalar(1.5+.18*Math.sin(time*1.6));
    dustU.uTime.value=time;
    dustU.uShape.value=f.ring;
    dustU.uPower.value=f.particles;
    dust.rotation.y=-time*.055;
    camera.position.set(f.camX,f.camY,f.camZ);
    camera.lookAt(0,0,0);
    if(previousScene!==f.id){
      previousScene=f.id;
      const lang=window.PEMESA_I18N?.language||'fr';
      const captions=labels[lang]||labels.fr;
      const target=document.querySelector('.cinematic-visual-caption');
      if(target)target.textContent=String(f.id+1).padStart(2,'0')+' / 06 — '+captions[f.id];
      const index=document.querySelector('.cinematic-side-index span:first-child');
      if(index)index.textContent=String(f.id+1).padStart(2,'0');
      document.documentElement.dataset.cinematicScene=String(f.id+1);
    }
  }
  function render(){
    updateScene();
    renderer.render(scene,camera);
  }
  function size(){
    const rect=container.getBoundingClientRect();
    const W=Math.max(1,Math.floor(rect.width)),H=Math.max(1,Math.floor(rect.height));
    if(W===w&&H===h)return;
    w=W;h=H;
    camera.aspect=w/h;camera.fov=mobile?42:35;camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.35:1.7));
    renderer.setSize(w,h,false);render();
  }
  function tick(now){
    if(!running)return;
    if(last)seconds+=Math.min((now-last)/1000,.05);
    last=now;render();frame=requestAnimationFrame(tick);
  }
  function stop(){running=false;cancelAnimationFrame(frame);frame=0;last=0}
  function play(){
    if(running||!visible||document.hidden||reduced.matches)return;
    running=true;last=0;frame=requestAnimationFrame(tick);
  }
  function visibility(){
    if(reduced.matches){stop();seconds=32;render();return}
    if(visible&&!document.hidden)play();else stop();
  }
  if('ResizeObserver' in window)new ResizeObserver(size).observe(container);
  else window.addEventListener('resize',size,{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(e=>{
    visible=!!e[0]?.isIntersecting;visibility();
  },{threshold:.02}).observe(container);
  window.addEventListener('pointermove',ev=>{
    if(reduced.matches)return;
    const r=container.getBoundingClientRect();
    if(ev.clientX<r.left-200||ev.clientX>r.right+200||
       ev.clientY<r.top-200||ev.clientY>r.bottom+200){tx=0;ty=0;return}
    tx=Math.max(-.7,Math.min(.7,(ev.clientX-r.left)/r.width-.5));
    ty=Math.max(-.7,Math.min(.7,(ev.clientY-r.top)/r.height-.5));
  },{passive:true});
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener?.('change',visibility);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop()});
  canvas.addEventListener('webglcontextrestored',()=>{size();visibility()});
  size();visibility();
})();
