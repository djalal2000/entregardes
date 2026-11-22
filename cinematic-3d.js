
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
    const id=(i+.5)/count,v=hash(i+3),w=(mobile?.009:.006)*(.65+hash(i*3)*1.2);
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
    uStream:{value:0},uMotion:{value:1},uLight:{value:0}
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
      uniform float uRing,uStream,uLight;
      varying float vT,vDepth,vVariation;
      void main(){
        float shade=clamp(.61+.21*vDepth+.14*sin(vVariation*17.),.32,.94);
        float detail=.83+.12*sin(vT*56.+vVariation*20.);
        vec3 white=vec3(.89,.85,.84)*shade*detail;
        vec3 gray=vec3(.51,.49,.50)*shade;
        vec3 color=mix(gray,white,clamp(.43+vVariation*.57,0.,1.));
        float tip=smoothstep(.87,.985,vT)*uStream;
        color=mix(color,vec3(1.,.31,.055)*(1.+uLight*.21),tip*.98);
        color+=vec3(.035,.028,.026)*uRing;
        gl_FragColor=vec4(color,clamp(.8+vDepth*.08,0.,1.));
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
        vAlpha=.18+.52*uPower;
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

  let w=0,h=0,frame=0,last=0,seconds=0,running=false,visible=true;
  let px=0,py=0,tx=0,ty=0;
  function render(){
    const phase=fract(seconds/29);
    let head=0,ring=0,stream=0,light=0;
    if(phase<.17){head=1}
    else if(phase<.34){const x=smooth((phase-.17)/.17);head=1-x;ring=x;light=x}
    else if(phase<.56){ring=1;light=1}
    else if(phase<.72){const x=smooth((phase-.56)/.16);ring=1-x;stream=x;light=1}
    else if(phase<.85){stream=1;light=1}
    else {const x=smooth((phase-.85)/.15);head=x;stream=1-x;light=1-x}
    const time=reduced.matches?10.5:seconds;
    u.uTime.value=time;u.uHead.value=head;u.uRing.value=ring;u.uStream.value=stream;
    u.uMotion.value=reduced.matches?0:1;u.uLight.value=light;
    px+=(tx-px)*.035;py+=(ty-py)*.035;
    stage.rotation.y=.17+Math.sin(time*.24)*.37+px*.24;
    stage.rotation.x=-.13+Math.sin(time*.17)*.14+py*.17;
    stage.rotation.z=-.16+Math.sin(time*.12)*.065-stream*.2;
    stage.scale.setScalar(1+Math.sin(time*.4)*.018);
    core.visible=ring+stream>.03;
    halo.visible=ring+stream>.03;
    core.scale.setScalar(.88+.36*Math.sin(time*1.9));
    coreU.uTime.value=time;coreU.uPower.value=Math.min(1,(ring+stream)*.88);
    halo.scale.setScalar(1.2+Math.sin(time*1.1)*.13);
    dustU.uTime.value=time;dustU.uShape.value=ring;dustU.uPower.value=Math.max(.35,ring,stream);
    dust.rotation.y=-time*.041;
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
    if(reduced.matches){stop();seconds=10.5;render();return}
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
