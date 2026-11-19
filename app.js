const $=s=>document.querySelector(s);
const key='entregardes.journal.v1';
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const date=s=>new Date(s+'T12:00:00');
const add=(s,n)=>{let d=date(s);d.setDate(d.getDate()+n);return iso(d)};
const format=(s,options)=>date(s).toLocaleDateString('fr-FR',options);
let selected=iso(new Date()),tab='planning';
const shifts={jour:'Jour',nuit:'Nuit',repos:'Repos'};
const fields=[['sleep','Sommeil principal (h)',24,.25],['nap','Sieste (min)',1440,1],['fatigue','Fatigue au réveil (0 à 10)',10,1],['steps','Nombre de pas',null,1],['active','Activité (min)',1440,1],['heart','Fréquence au repos (bpm)',null,1]];
const pages={planning:['Mon planning','Retrouve tes postes et choisis une journée à renseigner.'],jour:['Ma journée','Rattache tes mesures au poste choisi, même si tu as dormi le lendemain.'],bilan:['Mes tendances','Compare tes mesures selon ton rythme de travail.']};
let data={};
function read(){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):{}}
try{data=read()}catch{$('#status').textContent='Lecture du carnet impossible dans ce navigateur.'}
function save(patch){try{let latest=read();latest[selected]={...latest[selected],...patch};localStorage.setItem(key,JSON.stringify(latest));data=latest;render();$('#status').textContent='Journée enregistrée.'}catch{$('#status').textContent='Enregistrement impossible. Vérifie le stockage du navigateur.'}}
function navigate(t){tab=t;$('#status').textContent='';render()}
function picker(){return '<label>Journée du poste<input id="date" type="date" value="'+selected+'" required></label>'}
function shiftSelect(){return '<label>Type de poste<select id="shift"><option value="">À définir</option>'+Object.entries(shifts).map(([id,name])=>'<option value="'+id+'" '+(data[selected]?.shift===id?'selected':'')+'>'+name+'</option>').join('')+'</select></label>'}
function planning(){
 const monday=add(selected,-((date(selected).getDay()+6)%7));
 const days=Array.from({length:7},(_,i)=>add(monday,i));
 return '<article><div class="row"><h2>Semaine du '+format(monday,{day:'numeric',month:'long',year:'numeric'})+'</h2><div><button data-move="-7" aria-label="Semaine précédente">‹</button> <button id="today">Aujourd’hui</button> <button data-move="7" aria-label="Semaine suivante">›</button></div></div><div class="days week">'+days.map(s=>'<button data-day="'+s+'" class="day '+(selected===s?'on':'')+'" aria-pressed="'+(selected===s)+'"><span>'+format(s,{weekday:'short'})+'</span><strong>'+date(s).getDate()+'</strong><span>'+(shifts[data[s]?.shift]||'—')+'</span></button>').join('')+'</div></article><article><h2>Organiser ma journée</h2><div class="grid">'+picker()+shiftSelect()+'</div><p class="sub">Le poste sert de repère pour comparer tes journées.</p><button class="primary" id="saveShift">Enregistrer le poste</button> <button id="openDay">Ouvrir le journal</button></article>'
}
function journal(){
 const inputs=fields.map(([id,label,max,step])=>'<label>'+label+'<input name="'+id+'" type="number" min="'+(id==='heart'?1:0)+'" '+(max?'max="'+max+'"':'')+' step="'+step+'" value="'+(Number.isFinite(data[selected]?.[id])?data[selected][id]:'')+'"></label>');
 return '<article><form id="journal"><div class="grid">'+picker()+shiftSelect()+'</div><h2 class="sectionHead">Sommeil et récupération</h2><div class="grid">'+inputs.slice(0,3).join('')+'</div><h2 class="sectionHead">Activité et cœur</h2><div class="grid">'+inputs.slice(3).join('')+'</div><p class="sub">Laisse vides les mesures que tu n’as pas relevées.</p><button class="primary">Enregistrer ma journée</button></form></article>'
}
function trends(){
 const end=iso(new Date()),start=add(end,-29);
 const records=Object.entries(data).filter(([d,r])=>d>=start&&d<=end&&shifts[r.shift]&&fields.some(([k])=>Number.isFinite(r[k]))).map(([,r])=>r);
 const mean=(rows,k)=>{let nums=rows.map(r=>r[k]).filter(Number.isFinite);return nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toLocaleString('fr-FR',{maximumFractionDigits:1})+' ('+nums.length+')':'—'};
 return '<article><h2>Les 30 derniers jours</h2><p class="sub">'+format(start,{day:'numeric',month:'long'})+' au '+format(end,{day:'numeric',month:'long'})+' · '+records.length+' journée(s) avec un poste et une mesure.</p>'+(records.length?'<div class="scroll"><table><caption>Moyenne par poste. Le nombre de journées mesurées figure entre parenthèses.</caption><thead><tr><th>Mesure</th>'+Object.values(shifts).map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+fields.map(([k,label])=>'<tr><th>'+label+'</th>'+Object.keys(shifts).map(s=>'<td>'+mean(records.filter(r=>r.shift===s),k)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<h3>Ton bilan commence avec une journée.</h3><p>Choisis ton type de poste et ajoute une première mesure dans ton journal.</p><button class="primary" id="openDay">Renseigner ma journée</button>')+'</article>'
}
function render(){
 $('h1').textContent=pages[tab][0];$('#intro').textContent=pages[tab][1];
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);b.setAttribute('aria-pressed',b.dataset.tab===tab)});
 $('#view').innerHTML=tab==='planning'?planning():tab==='jour'?journal():trends();
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.tab)return navigate(b.dataset.tab);
 if(b.id==='openDay')return navigate('jour');
 if(b.id==='saveShift')return save({shift:$('#shift').value});
 if(b.dataset.move||b.dataset.day||b.id==='today'){selected=b.dataset.day||(b.id==='today'?iso(new Date()):add(selected,Number(b.dataset.move)));navigate(tab)}
});
document.addEventListener('change',e=>{if(e.target.id==='date'&&e.target.value){selected=e.target.value;navigate(tab)}});
document.addEventListener('submit',e=>{if(e.target.id!=='journal')return;e.preventDefault();const f=new FormData(e.target);save({shift:$('#shift').value,...Object.fromEntries(fields.map(([k])=>[k,f.get(k)===''?null:Number(f.get(k))]))})});
render();
