
(() => {
  'use strict';
  // The browser sends commands; only an authenticated Android companion talks to watch sensors.
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const metrics = [['heart_rate','Fréquence cardiaque'],['steps','Nombre de pas'],['activity','Activité physique'],['sleep','Sommeil']];
  let active=false,cycle=0,channel=null,timer=null,devices=[],commands=[],pairing=null,selected='',busy=false,loading=false,notice='',errorNotice=false,draft=null;
  const me=()=> typeof mode!=='undefined' && mode==='account' && typeof user!=='undefined' && user && client ? user : null;
  const root=()=>$('#wearables-root');
  const online=d=>!!d?.last_seen_at && Date.now()-new Date(d.last_seen_at).getTime()<120000;
  const current=()=>devices.find(d=>d.id===selected)||devices[0]||null;
  const dateLabel=d=>d?new Date(d).toLocaleString(window.PEMESA_I18N?.dateLocale()||'fr-FR',{dateStyle:'short',timeStyle:'short'}):'—';
  function announce(message,isError=false){notice=message;errorNotice=isError;}
  function render(){
    if(!active||!root())return;
    const u=me(),d=current(),isLive=online(d),opted=!!d?.collection_opt_in;const currentDraft=draft?.deviceId===d?.id?draft:null;
    if(d)selected=d.id;
    const cmd=commands.find(c=>c.device_id===d?.id);
    const currentPair=pairing&&pairing.status==='pending'&&new Date(pairing.expires_at).getTime()>Date.now();
    const states={stopped:'Collecte arrêtée',running:'Collecte active',paused:'Collecte en pause'};
    const actions={start:'Démarrage',pause:'Pause',stop:'Arrêt'};
    const results={pending:'En attente de la montre',applied:'Confirmée par la montre',failed:'Échec signalé par la montre'};
    root().innerHTML=`
    <div class="wearables">
      <section class="watch-hero"><div class="watch-hero-copy"><span class="watch-eyebrow"><i aria-hidden="true"></i> SAMSUNG · GALAXY WATCH</span><h2>Votre montre, sous votre contrôle.</h2><p>Associez une Galaxy Watch compatible Wear OS, définissez vos mesures autorisées et pilotez la collecte depuis PEMESA.</p><div class="watch-hero-tags"><span>✓ Accès sécurisé</span><span>◉ État en direct</span><span>⌁ Consentement maîtrisé</span></div></div><div class="watch-device-art" aria-hidden="true"><div class="watch-strap watch-strap-top"></div><div class="watch-face"><div class="watch-face-inner"><span>♥</span><strong>PEMESA</strong><small>GALAXY WATCH</small></div></div><div class="watch-strap watch-strap-bottom"></div></div></section>
      ${!u?`<section class="watch-empty"><span class="watch-empty-symbol">⌚</span><h3>Connectez-vous pour associer votre montre.</h3><p>Cette fonctionnalité est réservée aux comptes personnels. Le mode démo ne collecte aucune donnée de montre.</p><button type="button" class="watch-button watch-button-primary" data-open-auth="signin">Se connecter à PEMESA</button></section>`:`
      <div class="watch-stat-grid"><div class="watch-stat"><span>Montres associées</span><strong>${devices.length}</strong><small>Sur votre compte personnel</small></div><div class="watch-stat"><span>Montres en ligne</span><strong>${devices.filter(online).length}</strong><small>Contact il y a moins de 2 min</small></div><div class="watch-stat"><span>Collecte confirmée</span><strong class="watch-stat-state">${esc(d?states[d.actual_state]||'Inconnu':'Non configurée')}</strong><small>Signal renvoyé par l'application mobile</small></div></div>
      <div class="watch-columns"><div class="watch-primary-column">
        <section class="watch-panel">
          <div class="watch-panel-head"><div><span class="watch-kicker">01 · ASSOCIATION</span><h3>Mes appareils</h3><p>Associez une montre à votre téléphone Android et à l'application PEMESA.</p></div><button class="watch-button watch-button-outline" data-watch-action="refresh">↻ Actualiser</button></div>
          ${devices.length?`<div class="watch-device-list">${devices.map(item=>`<button class="watch-device-item ${item.id===selected?'selected':''}" data-watch-action="select" data-id="${esc(item.id)}" aria-pressed="${item.id===selected}"><span class="watch-device-glyph">⌚</span><span class="watch-device-text"><strong>${esc(item.display_name)}</strong><small>${esc(item.model||'Samsung Galaxy Watch')}</small></span><span class="watch-online ${online(item)?'yes':'no'}"><i></i>${online(item)?'En ligne':'Hors ligne'}</span></button>`).join('')}</div>`:`<div class="watch-no-device"><span>⌚</span><div><strong>Aucune montre associée</strong><p>Créez un code puis saisissez-le dans l'application Android PEMESA.</p></div></div>`}
          ${currentPair?`<div class="watch-pair-code"><div><span>Code d’association temporaire</span><strong dir="ltr">${esc(pairing.pairing_code.slice(0,3))} ${esc(pairing.pairing_code.slice(3))}</strong><small>Valable jusqu’au ${esc(dateLabel(pairing.expires_at))}</small></div><div class="watch-pair-actions"><button class="watch-button watch-button-outline" data-watch-action="copy">Copier</button><button class="watch-button watch-button-quiet" data-watch-action="cancel">Annuler</button></div></div>`:`<button class="watch-button watch-button-primary watch-add" data-watch-action="pair" ${busy?'disabled':''}>+ Associer une Galaxy Watch</button>`}
          <p class="watch-footnote">L'association n'est confirmée que lorsque l'application Android PEMESA a accepté le code et déclaré la montre.</p>
        </section>
        ${d?`
        <section class="watch-panel">
          <div class="watch-panel-head"><div><span class="watch-kicker">02 · PILOTAGE</span><h3>Contrôle de la collecte</h3><p>${esc(d.display_name)} · commandes transmises au téléphone</p></div><span class="watch-device-pill ${isLive?'online':'offline'}">${isLive?'● En ligne':'● Hors ligne'}</span></div>
          <div class="watch-metadata"><div><span>Batterie</span><strong>${d.battery_percent==null?'—':esc(d.battery_percent)+' %'}</strong></div><div><span>Dernier contact</span><strong>${esc(dateLabel(d.last_seen_at))}</strong></div><div><span>Dernier transfert</span><strong>${esc(dateLabel(d.last_sample_at))}</strong></div><div><span>Mesures déclarées</span><strong>${Number(d.sample_count||0).toLocaleString(window.PEMESA_I18N?.dateLocale()||'fr-FR')}</strong></div></div>
          <div class="watch-controls"><button class="watch-button watch-button-primary" data-watch-action="start" ${!isLive||!opted||busy?'disabled':''}>▶ Démarrer</button><button class="watch-button watch-button-outline" data-watch-action="pause" ${!isLive||d.actual_state!=='running'||busy?'disabled':''}>Ⅱ Pause</button><button class="watch-button watch-button-stop" data-watch-action="stop" ${busy?'disabled':''}>■ Arrêter</button></div>
          <p class="watch-footnote">Les commandes sont des demandes. L'état change seulement lorsque la montre confirme leur exécution via l'application mobile.</p>
          ${cmd?`<div class="watch-command ${cmd.status==='failed'?'watch-command-error':''}"><span>Dernière commande : <strong>${esc(actions[cmd.action]||cmd.action)}</strong></span><span>${esc(results[cmd.status]||cmd.status)}</span>${cmd.error_message?`<small>${esc(cmd.error_message)}</small>`:''}</div>`:''}
          ${d.last_error?`<p class="watch-error">${esc(d.last_error)}</p>`:''}
        </section>
        <section class="watch-panel">
          <div class="watch-panel-head"><div><span class="watch-kicker">03 · DONNÉES</span><h3>Capteurs et autorisations</h3><p>Choisissez les données demandées à l'application. Leur disponibilité dépend du modèle et des permissions Android.</p></div></div>
          <form id="watch-preferences"><div class="watch-metrics">${metrics.map(([key,label])=>`<label><input type="checkbox" name="metric" value="${key}" ${(currentDraft?currentDraft.metrics:(d.requested_metrics||[])).includes(key)?'checked':''}>${esc(label)}</label>`).join('')}</div><label class="watch-opt-in"><input type="checkbox" name="opt_in" ${(currentDraft?currentDraft.optIn:opted)?'checked':''}><span>J’autorise la collecte des catégories sélectionnées pour mon compte PEMESA. Je peux retirer cette autorisation à tout moment.</span></label><div class="watch-form-actions"><button class="watch-button watch-button-primary" type="submit" ${busy?'disabled':''}>Enregistrer les autorisations</button><button class="watch-button watch-button-quiet" type="button" data-watch-action="remove">Dissocier la montre</button></div></form>
          <p class="watch-footnote">Ce module ne conserve pas les mesures physiologiques brutes. Toute collecte de santé destinée à la recherche nécessite un cadre de sécurité et de conformité adapté.</p>
        </section>`:''}
        </div><aside class="watch-aside">
          <section class="watch-panel watch-steps"><span class="watch-kicker">GUIDE D’ASSOCIATION</span><h3>Connecter votre Galaxy Watch</h3><ol><li><span>1</span><div><strong>Associer la montre au téléphone</strong><p>Vérifiez sa connexion dans l'application Samsung Galaxy Wearable.</p></div></li><li><span>2</span><div><strong>Ouvrir PEMESA sur Android</strong><p>Connectez-vous au même compte et accordez les permissions nécessaires.</p></div></li><li><span>3</span><div><strong>Valider le code à 6 chiffres</strong><p>Dans l'application, entrez le code temporaire créé ici.</p></div></li><li><span>4</span><div><strong>Vérifier le retour de la montre</strong><p>Son état s'affiche ici après synchronisation.</p></div></li></ol></section>
          <section class="watch-panel watch-warning"><span class="watch-kicker">APPLICATION NÉCESSAIRE</span><h3>Connecteur mobile requis</h3><p>Les écrans, la base sécurisée et les commandes sont prêts. Le connecteur de l'application Android/Wear OS doit encore être relié à cette API pour lire les capteurs et exécuter les commandes.</p></section>
        </aside></div>`}
      ${notice?`<p role="status" aria-live="polite" class="watch-notice ${errorNotice?'watch-notice-error':''}">${esc(notice)}</p>`:''}
    </div>`;
    window.PEMESA_I18N?.apply();
  }
  async function load(){
    if(!active||loading||!me())return;
    const u=me(),visit=cycle;loading=true;
    try{
      const [a,b,c]=await Promise.all([
        client.from('wearable_devices').select('id,user_id,display_name,model,battery_percent,last_seen_at,actual_state,requested_metrics,collection_opt_in,collection_opt_in_at,sample_count,last_sample_at,last_error').eq('user_id',u.id).order('created_at',{ascending:false}),
        client.from('wearable_pairings').select('id,user_id,pairing_code,status,expires_at').eq('user_id',u.id).eq('status','pending').order('created_at',{ascending:false}).limit(1),
        client.from('wearable_commands').select('id,user_id,device_id,action,status,created_at,error_message').eq('user_id',u.id).order('created_at',{ascending:false}).limit(100)
      ]);
      if(!active||visit!==cycle||me()?.id!==u.id)return;
      const err=a.error||b.error||c.error;if(err)throw err;
      devices=a.data||[];pairing=b.data?.[0]||null;commands=c.data||[];
      if(!devices.some(d=>d.id===selected))selected=devices[0]?.id||'';
      render();
    }catch(e){if(active&&visit===cycle){announce('Synchronisation indisponible : '+(e.message||'Erreur inconnue'),true);render()}}
    finally{loading=false}
  }
  function mount(){
    if(active)unmount();
    active=true;cycle++;devices=[];commands=[];pairing=null;selected='';draft=null;announce('');
    render();
    const u=me();if(!u)return;
    const onChange=()=>{if(active)load()};
    channel=client.channel('pemesa-watch-'+u.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'wearable_devices',filter:'user_id=eq.'+u.id},onChange)
      .on('postgres_changes',{event:'*',schema:'public',table:'wearable_pairings',filter:'user_id=eq.'+u.id},onChange)
      .on('postgres_changes',{event:'*',schema:'public',table:'wearable_commands',filter:'user_id=eq.'+u.id},onChange)
      .subscribe();
    load();
    timer=setInterval(()=>{if(!me())unmount();else load()},15000);
  }
  function unmount(){
    active=false;cycle++;if(timer){clearInterval(timer);timer=null}
    if(channel){client?.removeChannel(channel);channel=null}
  }
  async function pair(){
    const u=me(),bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
    const code=String(bytes[0]%1000000).padStart(6,'0');
    const x=await client.from('wearable_pairings').update({status:'cancelled'}).eq('user_id',u.id).eq('status','pending');
    if(x.error)throw x.error;
    const y=await client.from('wearable_pairings').insert({user_id:u.id,pairing_code:code});
    if(y.error)throw y.error;
    announce('Code créé. Saisissez-le dans l’application Android PEMESA connectée au même compte.');
  }
  async function send(action){
    const u=me(),d=current();if(!d)return;
    if(action==='start'&&(!online(d)||!d.collection_opt_in))throw Error('Autorisez la collecte et vérifiez que la montre est en ligne.');
    if(action==='pause'&&(!online(d)||d.actual_state!=='running'))throw Error('La collecte doit être active et la montre en ligne.');
    const x=await client.from('wearable_commands').insert({user_id:u.id,device_id:d.id,action});
    if(x.error)throw x.error;
    announce('Commande enregistrée. Attente de confirmation par l’application mobile.');
  }
  async function save(form){
    const u=me(),d=current();if(!d)return;
    const chosen=[...form.querySelectorAll('input[name=metric]:checked')].map(e=>e.value);
    const optIn=form.elements.namedItem('opt_in').checked;
    if(optIn&&!chosen.length)throw Error('Sélectionnez au moins une catégorie de données.');
    const x=await client.from('wearable_devices').update({requested_metrics:chosen,collection_opt_in:optIn,collection_opt_in_at:optIn?(d.collection_opt_in_at||new Date().toISOString()):null}).eq('id',d.id).eq('user_id',u.id);
    if(x.error)throw x.error;
    draft=null;
    if(!optIn&&d.collection_opt_in){await send('stop');announce('Autorisation retirée. Demande d’arrêt transmise, en attente de confirmation.')}
    else announce('Autorisations de collecte enregistrées.');
  }
  async function run(action,node){
    if(!me()||busy)return;
    if(action==='select'){selected=node.dataset.id;draft=null;announce('');render();return}
    if(action==='copy'){
      try{if(pairing){await navigator.clipboard.writeText(pairing.pairing_code);announce('Code copié.');render()}}
      catch{announce('Copie indisponible : sélectionnez le code affiché.',true);render()}
      return;
    }
    if(action==='remove'&&!confirm('Dissocier cette montre ? Arrêtez la collecte depuis l’application mobile si elle est hors ligne.'))return;
    busy=true;
    try{
      if(action==='pair')await pair();
      else if(action==='cancel'&&pairing){const x=await client.from('wearable_pairings').update({status:'cancelled'}).eq('id',pairing.id).eq('user_id',me().id);if(x.error)throw x.error;announce('Association annulée.')}
      else if(action==='remove'&&current()){const x=await client.from('wearable_devices').delete().eq('id',current().id).eq('user_id',me().id);if(x.error)throw x.error;announce('Montre dissociée du compte.')}
      else if(['start','pause','stop'].includes(action))await send(action);
      else if(action==='refresh')announce('État actualisé.');
      await load();
    }catch(e){announce(e.message||'Opération impossible.',true)}
    finally{busy=false;render()}
  }
  document.addEventListener('click',event=>{
    if(!active||!event.target.closest('#wearables-root'))return;
    const button=event.target.closest('[data-watch-action]');
    if(button){event.preventDefault();run(button.dataset.watchAction,button)}
  });
  document.addEventListener('change',event=>{
    if(!active||!event.target.closest?.('#watch-preferences'))return;
    const form=event.target.closest('#watch-preferences'),d=current();if(!d)return;
    draft={deviceId:d.id,metrics:[...form.querySelectorAll('input[name=metric]:checked')].map(x=>x.value),optIn:form.elements.namedItem('opt_in').checked};
  });
  document.addEventListener('submit',async event=>{
    if(!active||event.target.id!=='watch-preferences')return;
    event.preventDefault();if(busy)return;busy=true;
    try{await save(event.target);await load()}
    catch(e){announce(e.message||'Impossible d’enregistrer les autorisations.',true)}
    finally{busy=false;render()}
  });
  window.PEMESA_WEARABLES={mount,unmount,refresh:load};
})();
