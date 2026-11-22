/* Cinematic PEMESA motion sculpture.
   Procedural canvas: no third-party libraries, no personal imagery and no telemetry.
   Motion is decorative only and respects reduced-motion preferences. */
(() => {
  'use strict';
  const canvas=document.getElementById('pemesa-cinematic-canvas');
  if(!canvas)return;
  const context=canvas.getContext('2d',{alpha:true});
  if(!context)return;
  const container=canvas.closest('.cinematic-visual');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const TAU=Math.PI*2, ribCount=124, particles=[];
  let width=0,height=0,dpr=1,frame=0,visible=true,playing=false,elapsed=0,last=0;
  let pointer={x:0,y:0,tx:0,ty:0};
  const seeded=(n)=>{const x=Math.sin(n*146.29+12.17)*15731.776;return x-Math.floor(x)};
  for(let i=0;i<550;i++){
    const z=seeded(i*3+4)*2-1;
    const a=seeded(i*5+7)*TAU;
    const r=Math.sqrt(1-z*z);
    particles.push({x:Math.cos(a)*r,y:z,z:Math.sin(a)*r,size:.45+seeded(i+23)*1.6,ember:seeded(i*17+9)>.89,phase:seeded(i*13)*TAU});
  }
  const clamp=(a,l,h)=>Math.min(h,Math.max(l,a));
  const vectorRotate=(x,y,z,rx,ry)=>{
    const cosY=Math.cos(ry),sinY=Math.sin(ry),cosX=Math.cos(rx),sinX=Math.sin(rx);
    const a=x*cosY+z*sinY,b=-x*sinY+z*cosY;
    return [a,y*cosX-b*sinX,y*sinX+b*cosX];
  };
  function measure(){
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(250,Math.floor(rect.width)),h=Math.max(260,Math.floor(rect.height));
    if(Math.abs(w-width)<2 && Math.abs(h-height)<2)return;
    width=w;height=h;dpr=Math.min(window.devicePixelRatio||1,1.8);
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
    draw(elapsed);
  }
  function draw(t){
    if(!width||!height)return;
    const ctx=context;
    ctx.clearRect(0,0,width,height);
    const scale=clamp(Math.min(width*.325,height*.395),100,300);
    const centerX=width*(width>580?.52:.49),centerY=height*.51;
    pointer.x+=(pointer.tx-pointer.x)*.035;
    pointer.y+=(pointer.ty-pointer.y)*.035;
    const rotY=t*.13+pointer.x*.18;
    const rotX=-.28+Math.sin(t*.23)*.07+pointer.y*.15;
    const pulse=1+Math.sin(t*.93)*.012;
    function project(x,y,z){
      const v=vectorRotate(x,y,z,rotX,rotY);
      const persp=3.7/(3.7-v[2]*.38);
      return [centerX+v[0]*scale*persp,centerY+v[1]*scale*persp,v[2],persp];
    }
    // A luminous, warm core is surrounded by hundreds of desaturated threads.
    const bloom=ctx.createRadialGradient(centerX-scale*.12,centerY+scale*.12,0,centerX,centerY,scale*1.15);
    bloom.addColorStop(0,'rgba(249,134,65,.22)');
    bloom.addColorStop(.25,'rgba(255,188,135,.13)');
    bloom.addColorStop(.67,'rgba(255,244,229,.09)');
    bloom.addColorStop(1,'rgba(245,227,211,0)');
    ctx.fillStyle=bloom;
    ctx.beginPath();ctx.arc(centerX,centerY,scale*1.17,0,TAU);ctx.fill();

    // Back-to-front line ribbons mimic a rotating kinetic sculpture,
    // not a portrait or a medical measurement.
    const ribs=[];
    for(let i=0;i<ribCount;i++){
      const phi=TAU*i/ribCount;
      const depth=Math.sin(phi+rotY);
      ribs.push({i,phi,depth});
    }
    ribs.sort((a,b)=>a.depth-b.depth);
    ctx.lineCap='round';ctx.lineJoin='round';
    for(const rib of ribs){
      const front=rib.depth>-.05,points=39;
      ctx.beginPath();
      for(let j=0;j<=points;j++){
        const u=-Math.PI/2+(j/points)*Math.PI;
        const winding=.11*Math.sin(4*u+rib.phi*3+t*.16)+.025*Math.sin(14*u+rib.i*.12);
        const phi=rib.phi+winding;
        const wave=1+.038*Math.sin(8*u+rib.i*.33+t*.42);
        const bulge=wave*pulse*(.925+.06*Math.cos(2*u+rib.phi*4));
        const x=Math.cos(u)*Math.cos(phi)*bulge;
        const y=Math.sin(u)*(.96+.035*Math.sin(rib.i*.28+t*.2));
        const z=Math.cos(u)*Math.sin(phi)*bulge;
        const p=project(x,y,z);
        if(j===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);
      }
      const alpha=front?.34+.20*clamp(rib.depth,0,1):.10+.08*(rib.depth+1);
      ctx.strokeStyle='rgba(115,105,104,'+alpha.toFixed(3)+')';
      ctx.lineWidth=front?1.1+.85*clamp(rib.depth,0,1):.7;
      ctx.stroke();
    }

    // Fine woven parallels create an organic fibre-like moiré pattern.
    for(let k=0;k<32;k++){
      const u=-1.35+2.7*k/31;
      const latitude=Math.sin(u);
      ctx.beginPath();
      for(let j=0;j<=100;j++){
        const phi=TAU*j/100+t*.025;
        const ripple=.985+.034*Math.cos(phi*15+u*7+t*.35);
        const p=project(Math.cos(u)*Math.cos(phi)*ripple,latitude,
                        Math.cos(u)*Math.sin(phi)*ripple);
        if(j===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);
      }
      ctx.strokeStyle='rgba(190,174,167,'+(k%3===0?.17:.08)+')';
      ctx.lineWidth=.54;
      ctx.stroke();
    }

    // Metallic dust, with sparse orange electrodes orbiting around the core.
    const points=particles.map(p=>{
      const n=project(p.x*(1+.05*Math.sin(t*.38+p.phase)),p.y,p.z);
      return {x:n[0],y:n[1],z:n[2],size:p.size*n[3],ember:p.ember,phase:p.phase};
    }).sort((a,b)=>a.z-b.z);
    for(const p of points){
      const alpha=clamp((p.z+1.3)*.39,.07,.72);
      if(p.ember){
        ctx.fillStyle='rgba(219,105,55,'+(.25+alpha*.7)+')';
        ctx.shadowColor='rgba(240,105,47,.9)';ctx.shadowBlur=7+p.size*3;
      }else{
        ctx.fillStyle='rgba(89,81,80,'+(alpha*.65)+')';
        ctx.shadowBlur=0;
      }
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.3,p.size*(p.ember?1.5:.7)),0,TAU);ctx.fill();
    }
    ctx.shadowBlur=0;
    // Energetic glowing sparks emerge from the lower inside of the sculpture.
    for(let i=0;i<46;i++){
      const angle=TAU*(i/46)+t*.14;
      const spread=.13+seeded(i+310)*.35;
      const distance=scale*spread;
      const px=centerX-scale*.08+Math.cos(angle)*distance;
      const py=centerY+scale*.09+Math.sin(angle)*distance*.70;
      const rad=1.2+seeded(i*23)*2.4;
      ctx.fillStyle='rgba(229,108,50,'+(.18+.43*(.5+.5*Math.sin(t*1.3+i)))+')';
      ctx.shadowColor='rgba(255,139,65,.82)';ctx.shadowBlur=5+rad*3;
      ctx.beginPath();ctx.arc(px,py,rad,0,TAU);ctx.fill();
    }
    ctx.shadowBlur=0;
    // A subtle base shadow visually anchors the floating object.
    const shadow=ctx.createRadialGradient(centerX,centerY+scale*.99,scale*.1,centerX,centerY+scale*.99,scale*.9);
    shadow.addColorStop(0,'rgba(108,87,78,.09)');shadow.addColorStop(1,'rgba(108,87,78,0)');
    ctx.save();ctx.scale(1,.20);ctx.fillStyle=shadow;
    ctx.beginPath();ctx.arc(centerX,(centerY+scale*.99)/.20,scale*.8,0,TAU);ctx.fill();
    ctx.restore();
  }
  function tick(now){
    if(!playing)return;
    if(last)elapsed+=Math.min((now-last)/1000,.07);
    last=now;
    draw(elapsed);
    frame=requestAnimationFrame(tick);
  }
  function start(){
    if(playing || !visible || reduce.matches || document.hidden)return;
    playing=true;last=0;frame=requestAnimationFrame(tick);
  }
  function stop(){
    if(frame)cancelAnimationFrame(frame);frame=0;
    playing=false;last=0;
    if(reduce.matches)draw(0);
  }
  if('ResizeObserver' in window)new ResizeObserver(measure).observe(container);
  else window.addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop();else start();
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      visible=!!entries[0]?.isIntersecting;
      if(visible)start();else stop();
    },{threshold:.05}).observe(container);
  }
  window.addEventListener('pointermove',event=>{
    if(reduce.matches)return;
    const rect=container.getBoundingClientRect();
    if(event.clientX<rect.left-100 || event.clientX>rect.right+100 ||
       event.clientY<rect.top-100 || event.clientY>rect.bottom+100){
      pointer.tx=0;pointer.ty=0;return;
    }
    pointer.tx=clamp((event.clientX-(rect.left+rect.width/2))/Math.max(rect.width,1),-1,1);
    pointer.ty=clamp((event.clientY-(rect.top+rect.height/2))/Math.max(rect.height,1),-1,1);
  },{passive:true});
  if(reduce.addEventListener)reduce.addEventListener('change',()=>{
    if(reduce.matches)stop();else start();
  });
  measure();if(reduce.matches)draw(0);else start();
})();