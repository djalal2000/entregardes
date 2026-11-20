const $=s=>document.querySelector(s);
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const date=s=>new Date(s+'T12:00:00');
const add=(s,n)=>{const d=date(s);d.setDate(d.getDate()+n);return iso(d)};
const format=(s,options)=>date(s).toLocaleDateString(window.PEMESA_I18N?.dateLocale()||'fr-FR',options);
const shifts={jour:'Jour',nuit:'Nuit',repos:'Repos'};
const fields=[['sleep','Sommeil principal (h)',24,.25,0],['nap','Sieste (min)',1440,1,0],['fatigue','Fatigue au réveil (0 à 10)',10,1,0],['steps','Nombre de pas',null,1,0],['active','Activité (min)',1440,1,0],['heart','Fréquence cardiaque au repos (bpm)',null,1,1],['temperature','Température ambiante (°C)',60,.1,-30],['humidity','Humidité relative (%)',100,1,0],['noise','Niveau sonore ambiant (dB)',150,1,0],['penibilite','Pénibilité perçue (0 à 10)',10,1,0]];
const pages={overview:['Vue d’ensemble','Aperçu des données que vous avez renseignées manuellement.'],planning:['Planning des postes','Contextualisez vos observations par type de poste.'],jour:['Saisie des mesures','Renseignez vos observations d’ambiance, d’activité et votre ressenti.'],bilan:['Analyses','Comparez vos mesures renseignées selon le type de poste.']};
const settings=window.ENTREGARDES_CONFIG||{};
const configured=Boolean(settings.supabaseUrl&&settings.supabaseAnonKey&&window.supabase?.createClient);
let client=configured?window.supabase.createClient(settings.supabaseUrl,settings.supabaseAnonKey):null;
let user=null,mode='demo',data={},tab='overview',selected=iso(new Date()),authMode='signin',busy=false;
const demoKey='entregardes.demo.journal.v2';
const readDemo=()=>{try{return JSON.parse(localStorage.getItem(demoKey)||'{}')||{}}catch{return {}}};
function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;window.PEMESA_I18N?.apply();clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4000)}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function showWorkspace(nextMode='demo'){mode=nextMode;$('#site').hidden=true;$('#workspace').hidden=false;document.body.scrollTop=0;window.scrollTo(0,0);data=nextMode==='demo'?readDemo():data;tab='overview';updateAccount();render()}
function showSite(){if(mode==='demo'){$('#workspace').hidden=true;$('#site').hidden=false;window.scrollTo(0,0)}else{signOut()} }
function updateAccount(){const name=user?.user_metadata?.full_name||user?.email||'Mon espace';$('#account-name').textContent=mode==='demo'?'Mode démo':name;$('#account-caption').textContent=mode==='demo'?'Stockage sur cet appareil':'Compte personnel';$('#mode-badge').textContent=mode==='demo'?'Mode démo':'Compte connecté';$('#data-note').textContent=mode==='demo'?'Mode démo : les saisies restent sur cet appareil. N’y enregistrez pas de données personnelles sensibles.':'Les données renseignées sont enregistrées dans votre espace personnel configuré sur Supabase.';$('#leave-workspace').textContent=mode==='demo'?'Quitter la démo ↗':'Se déconnecter ↗';window.PEMESA_I18N?.apply()}
async function loadAccount(){if(!client||!user)return;const {data:rows,error}=await client.from('journal_entries').select('entry_date,record').eq('user_id',user.id);if(error){toast('Lecture de vos données impossible : '+error.message);return}data=Object.fromEntries((rows||[]).map(r=>[r.entry_date,r.record]));render()}
async function save(patch){const next={...(data[selected]||{}),...patch};data[selected]=next;render();if(mode==='demo'){try{localStorage.setItem(demoKey,JSON.stringify(data));toast('Journée enregistrée dans ce navigateur.')}catch{toast('Stockage local indisponible.')}return}
if(!client||!user)return toast('Veuillez vous reconnecter.');
const {error}=await client.from('journal_entries').upsert({user_id:user.id,entry_date:selected,record:next},{onConflict:'user_id,entry_date'});
toast(error?'Enregistrement impossible : '+error.message:'Journée enregistrée.')}
function navigate(t){tab=t;render()}
function picker(){return '<label>Journée du poste<input id="date" type="date" value="'+selected+'" required></label>'}
function shiftSelect(){return '<label>Type de poste<select id="shift"><option value="">À définir</option>'+Object.entries(shifts).map(([id,name])=>'<option value="'+id+'" '+(data[selected]?.shift===id?'selected':'')+'>'+name+'</option>').join('')+'</select></label>'}
function planning(){const monday=add(selected,-((date(selected).getDay()+6)%7));const days=Array.from({length:7},(_,i)=>add(monday,i));return '<section class="panel"><div class="row"><h2>Semaine du '+format(monday,{day:'numeric',month:'long',year:'numeric'})+'</h2><div><button data-move="-7" aria-label="Semaine précédente">‹</button> <button id="today">Aujourd’hui</button> <button data-move="7" aria-label="Semaine suivante">›</button></div></div><div class="days week">'+days.map(s=>'<button data-day="'+s+'" class="day '+(selected===s?'on':'')+'" aria-pressed="'+(selected===s)+'"><span>'+format(s,{weekday:'short'})+'</span><strong>'+date(s).getDate()+'</strong><span>'+(shifts[data[s]?.shift]||'—')+'</span></button>').join('')+'</div></section><section class="panel"><h2>Contextualiser les mesures</h2><div class="grid">'+picker()+shiftSelect()+'</div><p class="sub">Le poste sert de contexte pour comparer vos observations.</p><button class="primary" id="saveShift">Enregistrer le poste</button> <button id="openDay">Renseigner les mesures →</button></section>'}
function journal(){
 const inputs=fields.map(([id,label,max,step,min])=>'<label>'+label+'<input name="'+id+'" type="number" min="'+min+'" '+(max!=null?'max="'+max+'"':'')+' step="'+step+'" value="'+(Number.isFinite(data[selected]?.[id])?data[selected][id]:'')+'"></label>');
 return '<section class="panel"><form id="journal"><div class="grid">'+picker()+shiftSelect()+'</div>'+
 '<h2 class="sectionHead">Pénibilité ambiante · observations manuelles</h2><div class="grid">'+inputs.slice(6,9).join('')+'</div>'+
 '<h2 class="sectionHead">Activité & indicateurs physiologiques</h2><div class="grid">'+inputs.slice(0,2).concat(inputs.slice(3,6)).join('')+'</div>'+
 '<h2 class="sectionHead">Pénibilité subjective</h2><div class="grid">'+[inputs[2],inputs[9]].join('')+'</div>'+
 '<p class="sub">Saisissez uniquement des valeurs que vous avez relevées. Ces champs ne sont pas reliés à des capteurs et ne remplacent pas un avis médical. En mode démo, évitez les données sensibles.</p>'+
 '<button class="primary">Enregistrer les observations →</button></form></section>';
}
function means(rows,k){const nums=rows.map(r=>r[k]).filter(Number.isFinite);return nums.length?{value:nums.reduce((a,b)=>a+b,0)/nums.length,n:nums.length}:null}
function trends(){const end=iso(new Date()),start=add(end,-29);const records=Object.entries(data).filter(([d,r])=>d>=start&&d<=end&&shifts[r.shift]&&fields.some(([k])=>Number.isFinite(r[k]))).map(([,r])=>r);return '<section class="panel"><h2>Les 30 derniers jours</h2><p class="sub">'+format(start,{day:'numeric',month:'long'})+' au '+format(end,{day:'numeric',month:'long'})+' · '+records.length+' journée(s) avec un poste et une mesure.</p>'+(records.length?'<div class="scroll"><table><caption>Moyennes par poste. Nombre de journées mesurées entre parenthèses.</caption><thead><tr><th>Mesure</th>'+Object.values(shifts).map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+fields.map(([k,label])=>'<tr><th>'+label+'</th>'+Object.keys(shifts).map(s=>{const m=means(records.filter(r=>r.shift===s),k);return '<td>'+(m?m.value.toLocaleString(window.PEMESA_I18N?.dateLocale()||'fr-FR',{maximumFractionDigits:1})+' ('+m.n+')':'—')+'</td>'}).join('')+'</tr>').join('')+'</tbody></table></div>':'<h3>Votre bilan commence avec une journée.</h3><p class="sub">Choisissez votre type de poste et ajoutez une première mesure dans votre journal.</p><button class="primary" id="openDay">Renseigner ma journée →</button>')+'</section>'}
function overview(){
 const recent=Object.entries(data).filter(([day])=>day<=iso(new Date())&&day>=add(iso(new Date()),-29)).map(([,r])=>r);
 const number=(k,digits=1)=>{const m=means(recent,k);return m?m.value.toLocaleString(window.PEMESA_I18N?.dateLocale()||'fr-FR',{maximumFractionDigits:digits}):'—'};
 const count=recent.filter(r=>r.shift).length;
 const all=Object.entries(data).sort(([a],[b])=>b.localeCompare(a)).slice(0,5);
 const chartDays=Array.from({length:7},(_,i)=>add(iso(new Date()),i-6));
 const points=chartDays.map((d,i)=>{const v=data[d]?.penibilite;return Number.isFinite(v)?[i*70+12,160-Math.min(v,10)*11]:null});
 const dots=points.filter(Boolean);const line=dots.length>1?'<polyline points="'+dots.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#41bbe6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>':'';
 return '<div class="app-cards"><article class="metric-card"><span class="metric-label">☾ &nbsp; Pénibilité perçue</span><div class="metric-value">'+number('penibilite')+' <small>/10</small></div><div class="metric-sub">Moyenne des mesures renseignées (30 jours)</div></article><article class="metric-card"><span class="metric-label">◉ &nbsp; Niveau sonore</span><div class="metric-value">'+number('noise')+' <small>dB</small></div><div class="metric-sub">Observations manuelles (30 jours)</div></article><article class="metric-card"><span class="metric-label">⌁ &nbsp; Fréquence cardiaque</span><div class="metric-value">'+number('heart',0)+' <small>bpm</small></div><div class="metric-sub">Observations renseignées (30 jours)</div></article></div><div class="overview-panels"><section class="panel overview-chart"><div class="row"><div><h2>Pénibilité perçue</h2><p class="sub">Vos 7 derniers jours</p></div><button data-tab="bilan">Voir le bilan ↗</button></div><svg viewBox="0 0 450 180" aria-label="Évolution de la pénibilité perçue (7 derniers jours)" role="img" preserveAspectRatio="none"><g stroke="#eaf0f7"><path d="M0 28H450M0 72H450M0 116H450M0 160H450"/></g>'+line+dots.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#41bbe6" stroke="#fff" stroke-width="3"/>').join('')+(dots.length===0?'<text x="225" y="95" text-anchor="middle" fill="#98a8bb" font-size="13">Ajoutez vos observations de pénibilité</text>':'')+'</svg><div class="overview-chart-labels">'+chartDays.map(s=>'<span>'+format(s,{weekday:'short'})+'</span>').join('')+'</div></section><section class="panel"><div class="row"><div><h2>Vos derniers postes</h2><p class="sub">Un aperçu de vos journées enregistrées</p></div><button data-tab="planning">Planning ↗</button></div><div class="insight-list">'+(all.length?all.map(([d,r])=>'<div class="insight-item"><span>'+format(d,{weekday:'long',day:'numeric',month:'short'})+'</span><strong>'+(shifts[r.shift]||'Non défini')+'</strong></div>').join(''):'<p class="sub">Aucun poste renseigné pour le moment. Commencez par créer votre planning.</p>')+'</div><p class="sub">'+count+' journée(s) avec un poste sur 30 jours.</p><button class="primary" data-tab="jour">Renseigner les mesures →</button></section></div>'
}
function render(){const [title,intro]=pages[tab];$('#app-title').textContent=title;$('#app-intro').textContent=intro;$('#page-breadcrumb').textContent=title;$('#today-label').textContent=format(iso(new Date()),{weekday:'long',day:'numeric',month:'long'});document.querySelectorAll('.app-nav [data-tab]').forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false')});$('#view').innerHTML=({overview,planning,jour:journal,bilan:trends})[tab]();window.PEMESA_I18N?.apply();window.PEMESA_MOTION?.refresh()}
function openAuth(next='signin'){authMode=next;syncAuth();const dialog=$('#auth-dialog');if(!dialog.open)dialog.showModal()}
function closeAuth(){if($('#auth-dialog').open)$('#auth-dialog').close()}
function syncAuth(){const signup=authMode==='signup',reset=authMode==='reset';$('#auth-title').textContent=reset?'Réinitialiser le mot de passe':signup?'Créez votre espace personnel':'Heureux de vous revoir';$('#auth-subtitle').textContent=reset?'Recevez un lien pour choisir un nouveau mot de passe.':signup?'Commencez à suivre votre rythme à votre façon.':'Connectez-vous pour retrouver vos données.';$('#name-wrap').hidden=!signup;$('#password-wrap').hidden=reset;$('#auth-name').required=signup;$('#auth-password').required=!reset;$('#auth-password').autocomplete=signup?'new-password':'current-password';$('#forgot-password').hidden=reset||signup;$('#auth-submit').textContent=reset?'Envoyer le lien →':signup?'Créer mon compte →':'Se connecter →';$('#auth-switch').hidden=reset;document.querySelectorAll('[data-auth-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.authMode===authMode));$('#auth-feedback').textContent='';$('#auth-feedback').className='auth-feedback';$('#auth-config-note').textContent=configured?'Vos identifiants sont gérés par Supabase Auth.':'Les comptes ne sont pas encore activés. Vous pouvez tester le mode démo.';window.PEMESA_I18N?.apply()}
function feedback(message,error=false){$('#auth-feedback').textContent=message;$('#auth-feedback').className='auth-feedback '+(error?'error':'success');window.PEMESA_I18N?.apply()}
async function signOut(){if(client&&user)await client.auth.signOut();user=null;data={};mode='demo';$('#workspace').hidden=true;$('#site').hidden=false;window.scrollTo(0,0)}
async function authSubmit(event){event.preventDefault();if(busy)return;if(!client)return feedback('La connexion n’est pas encore configurée. Essayez le mode démo.',true);
 const email=$('#auth-email').value.trim(),password=$('#auth-password').value;const name=$('#auth-name').value.trim();
 busy=true;$('#auth-submit').disabled=true;
 try{if(authMode==='reset'){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;feedback('Si un compte correspond à cette adresse, vous recevrez un e-mail.');return}
 if(authMode==='signup'){const {data:res,error}=await client.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;if(!res.session){feedback('Compte créé. Vérifiez votre e-mail pour confirmer votre inscription.');return}}
 else{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error}
 const {data:session}=await client.auth.getUser();user=session?.user||null;if(!user)throw Error('Session indisponible.');closeAuth();data={};showWorkspace('account');await loadAccount()}catch(e){feedback(e.message||'Connexion impossible.',true)}finally{busy=false;$('#auth-submit').disabled=false}}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
 if(b.matches('[data-open-auth]')){e.preventDefault();openAuth(b.dataset.openAuth);return}
 if(b.matches('[data-demo]')){e.preventDefault();closeAuth();user=null;showWorkspace('demo');return}
 if(b.matches('[data-home]')){e.preventDefault();showSite();return}
 if(b.dataset.authMode){authMode=b.dataset.authMode;syncAuth();return}
 if(b.id==='forgot-password'){authMode='reset';syncAuth();return}
 if(b.id==='close-auth'){closeAuth();return}
 if(b.id==='leave-workspace'||b.id==='topbar-exit'){showSite();return}
 if(b.dataset.tab){navigate(b.dataset.tab);return}
 if(b.id==='openDay'){navigate('jour');return}
 if(b.id==='saveShift'){save({shift:$('#shift').value});return}
 if(b.dataset.move||b.dataset.day||b.id==='today'){selected=b.dataset.day||(b.id==='today'?iso(new Date()):add(selected,Number(b.dataset.move)));navigate(tab)}
});
document.addEventListener('change',e=>{if(e.target.id==='date'&&e.target.value){selected=e.target.value;navigate(tab)}});
document.addEventListener('submit',e=>{if(e.target.id==='journal'){e.preventDefault();const f=new FormData(e.target);save({shift:$('#shift').value,...Object.fromEntries(fields.map(([k])=>[k,f.get(k)===''?null:Number(f.get(k))]))})}});
$('#auth-form').addEventListener('submit',authSubmit);
$('#year').textContent=new Date().getFullYear();
if(window.PEMESA_I18N){
  window.PEMESA_I18N.onChange=()=>{
    if(!$('#workspace').hidden){
      // Preserve unsaved numeric entries and shift selections during locale updates.
      const draft=Array.from($('#view').querySelectorAll('input,select')).map(el=>el.value);
      updateAccount();
      render();
      $('#view').querySelectorAll('input,select').forEach((el,i)=>{if(draft[i]!==undefined)el.value=draft[i]});
    }
    if($('#auth-dialog').open) syncAuth();
  };
}
(async()=>{if(!client)return;try{const {data:session}=await client.auth.getUser();if(session?.user){user=session.user;showWorkspace('account');await loadAccount()}client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'&&mode==='account'){user=null;data={};$('#workspace').hidden=true;$('#site').hidden=false}})}catch(e){console.warn('Session:',e)}})();
