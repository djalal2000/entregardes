(() => {
  'use strict';
  const metrics={heart_rate:['Fréquence cardiaque','bpm'],steps:['Nombre de pas','pas'],acceleration:['Accéléromètre','m/s²'],gyroscope:['Gyroscope','rad/s'],gravity:['Gravité','m/s²'],linear_acceleration:['Accélération linéaire','m/s²'],rotation:['Vecteur de rotation',''],fatigue:['Fatigue déclarée','/5'],light:['Luminosité','lux'],pressure:['Pression atmosphérique','hPa']};
  const periods={live:5*60000,day:86400000,week:7*86400000,month:30*86400000};
  const colors=['#d76a30','#2775bd','#25936b','#8b5ac3'];
  let generation=0,timer=null,root=null,points=[],request=0;
  function unmount(){generation++;request++;clearInterval(timer);timer=null;points=[];if(root)root.replaceChildren();root=null;}
  const el=(tag,content,cls)=>{const n=document.createElement(tag);if(content!=null)n.textContent=content;if(cls)n.className=cls;return n;};
  const svg=(tag,attrs)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;};
  const localDate=(d)=>{const t=new Date(d.getTime()-d.getTimezoneOffset()*60000);return t.toISOString().slice(0,16);};
  async function mount(){
    unmount();root=document.getElementById('pemesa-monitoring-root');if(!root)return;
    const g=generation;const active=()=>generation===g&&root?.isConnected&&tab==='monitoring'&&mode==='account'&&user?.id===uid;
    const uid=typeof user!=='undefined'?user?.id:null;
    root.className='pemesa-monitoring';
    const panel=el('section',null,'pm-panel');root.append(panel);
    panel.append(el('h2','Monitoring des capteurs'),el('p','Mesures InfluxDB réelles · lecture seule · aucune donnée simulée','pm-muted'));
    if(mode!=='account'||!uid||!client){panel.append(el('p','Connectez-vous à votre compte PEMESA pour consulter vos participants autorisés.'));return;}
    const status=el('p','Chargement des autorisations…','pm-status');status.setAttribute('role','status');panel.append(status);
    const call=async(body)=>{const {data,error}=await client.functions.invoke('pemesa-monitoring',{body});if(error)throw error;return data;};
    let participants;
    try{participants=(await call({action:'participants'})).participants;}catch{if(active())status.textContent='Service de monitoring indisponible. Réessayez plus tard.';return;}
    if(!active())return;
    if(!Array.isArray(participants)||!participants.length){status.textContent='Aucun participant autorisé pour ce compte. Contactez l’administrateur PEMESA.';return;}
    const controls=el('div',null,'pm-controls');panel.append(controls);
    function select(label,options){const wrap=el('label',label);const sel=el('select');for(const [value,title] of options){const o=el('option',title);o.value=value;sel.append(o);}wrap.append(sel);controls.append(wrap);return sel;}
    const participant=select('Participant',participants.map(x=>[x,x]));
    const metric=select('Mesure',Object.entries(metrics).map(([k,v])=>[k,v[0]]));
    const period=select('Période',[['live','Direct · 5 minutes'],['day','24 heures'],['week','7 jours'],['month','30 jours'],['custom','Personnalisée']]);
    const startWrap=el('label','Début'),endWrap=el('label','Fin');
    const start=el('input'),end=el('input');start.type=end.type='datetime-local';start.value=localDate(new Date(Date.now()-86400000));end.value=localDate(new Date());startWrap.append(start);endWrap.append(end);controls.append(startWrap,endWrap);
    const refresh=el('button','Actualiser','pm-button');refresh.type='button';
    const download=el('button','Exporter CSV','pm-button');download.type='button';download.disabled=true;
    controls.append(refresh,download);
    const stats=el('div',null,'pm-stats'),graph=el('div',null,'pm-graph'),legend=el('div',null,'pm-legend'),note=el('p','','pm-muted');panel.append(stats,graph,legend,note);
    function clear(){points=[];stats.replaceChildren();graph.replaceChildren();legend.replaceChildren();note.textContent='';download.disabled=true;}
    function draw(data){
      clear();points=Array.isArray(data.points)?data.points.filter(p=>Number.isFinite(p.value)&&Number.isFinite(Date.parse(p.time))):[];
      if(!points.length){status.textContent='Aucune mesure disponible sur cette période.';return;}
      const by=new Map();points.forEach(p=>{if(!by.has(p.field))by.set(p.field,[]);by.get(p.field).push(p);});
      const unit=metrics[metric.value][1];
      for(const [field,list] of by){const vals=list.map(p=>p.value),card=el('div',null,'pm-stat');card.append(el('span',field,'pm-muted'),el('strong',vals[vals.length-1].toLocaleString('fr-FR',{maximumFractionDigits:2})+' '+unit),el('small','Dernier point · min '+Math.min(...vals).toFixed(2)+' · max '+Math.max(...vals).toFixed(2)));stats.append(card);}
      const xs=points.map(p=>Date.parse(p.time)),ys=points.map(p=>p.value),t0=Date.parse(data.start),t1=Date.parse(data.end),lo=Math.min(...ys),hi=Math.max(...ys),pad=hi===lo?Math.max(1,Math.abs(lo)*.1):(hi-lo)*.1;
      const y0=lo-pad,y1=hi+pad,x=t=>65+700*(t-t0)/Math.max(1,t1-t0),y=v=>235-200*(v-y0)/(y1-y0);
      const chart=svg('svg',{viewBox:'0 0 800 280',role:'img','aria-label':metrics[metric.value][0]+' selon le temps'});
      for(let i=0;i<=4;i++){const v=y0+(y1-y0)*i/4;chart.append(svg('line',{x1:65,x2:765,y1:y(v),y2:y(v),stroke:'#94a3b8','stroke-opacity':.3}));const label=svg('text',{x:58,y:y(v)+4,'text-anchor':'end',fill:'currentColor','font-size':12});label.textContent=v.toFixed(2);chart.append(label);}
      let index=0;for(const [field,list] of by){const color=colors[index++%colors.length];let segment=[];const flush=()=>{if(segment.length>1)chart.append(svg('polyline',{points:segment.map(p=>x(Date.parse(p.time))+','+y(p.value)).join(' '),fill:'none',stroke:color,'stroke-width':2}));else if(segment.length===1)chart.append(svg('circle',{cx:x(Date.parse(segment[0].time)),cy:y(segment[0].value),r:3,fill:color}));segment=[];};for(const p of list){if(segment.length&&Date.parse(p.time)-Date.parse(segment[segment.length-1].time)>data.interval_ms*3)flush();segment.push(p);}flush();const key=el('span','● '+field);key.style.color=color;legend.append(key);}
      for(let i=0;i<=2;i++){const t=t0+(t1-t0)*i/2;const l=svg('text',{x:x(t),y:258,'text-anchor':i===0?'start':i===2?'end':'middle',fill:'currentColor','font-size':11});l.textContent=new Date(t).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});chart.append(l);}
      graph.append(chart);status.textContent='Dernier point affiché : '+new Date(Math.max(...xs)).toLocaleString('fr-FR');note.textContent=points.length+' points affichés · dernier échantillon par fenêtre de '+(data.interval_ms/1000).toLocaleString('fr-FR')+' s. L’export contient les points affichés, pas le signal brut.';download.disabled=false;
    }
    let pending=false;
    async function load(){
      if(!active()||document.hidden)return;const seq=++request;pending=true;refresh.disabled=true;
      let finish=Date.now(),begin=finish-periods[period.value];if(period.value==='custom'){begin=new Date(start.value).getTime();finish=new Date(end.value).getTime();}
      if(!Number.isFinite(begin)||!Number.isFinite(finish)||begin>=finish||finish-begin>30*86400000||finish>Date.now()+60000){clear();status.textContent='Période invalide : maximum 30 jours, sans date future.';pending=false;refresh.disabled=false;return;}
      status.textContent='Lecture InfluxDB…';
      try{const data=await call({action:'query',participant:participant.value,metric:metric.value,start:new Date(begin).toISOString(),end:new Date(finish).toISOString()});if(active()&&seq===request)draw(data);}
      catch{if(active()&&seq===request){clear();status.textContent='Lecture impossible. Vérifiez vos autorisations ou la disponibilité du service.';}}
      finally{if(active()&&seq===request){pending=false;refresh.disabled=false;}}
    }
    function reset(){clearInterval(timer);request++;pending=false;clear();startWrap.hidden=endWrap.hidden=period.value!=='custom';load();if(period.value==='live')timer=setInterval(()=>{if(!active()){clearInterval(timer);return;}if(!pending)load();},10000);}
    [participant,metric,period,start,end].forEach(n=>n.addEventListener('change',reset));refresh.addEventListener('click',()=>{if(!pending)load();});
    download.addEventListener('click',()=>{if(!active()||!points.length)return;const csv='timestamp,field,value\n'+points.map(p=>p.time+','+p.field+','+p.value).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download='pemesa-'+metric.value+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    reset();
  }
  window.PEMESA_MONITORING={mount,unmount};
})();