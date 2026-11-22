(() => {
  'use strict';
  const el=id=>document.getElementById(id);
  const bucket='profile-avatars';
  let photoUrl='',photoPath='',activeUserId='',languageAccountId='';
  const validLanguage=code=>['fr','en','ar'].includes(code);
  function restoreAccountLanguage(u){
    if(languageAccountId===u.id)return;
    languageAccountId=u.id;
    const lang=u.user_metadata?.preferred_language;
    if(validLanguage(lang) && window.PEMESA_I18N?.language!==lang)window.PEMESA_I18N?.setLanguage(lang);
  }
  const current=()=>typeof user!=='undefined' && typeof mode!=='undefined' && mode==='account' ? user : null;
  const message=(id,text,error=false)=>{const node=el(id); if(node){node.textContent=text;node.dataset.error=error?'true':'false'}};
  const initials=u=>(u?.user_metadata?.full_name||u?.email||'PM').trim().split(/\s+/).slice(0,2).map(v=>v[0]?.toUpperCase()||'').join('');
  function showControls(){
    const u=current(),yes=!!u;
    el('profile-settings-open').hidden=!yes;
    el('profile-photo-open').hidden=!yes;
    el('demo-avatar').hidden=yes;
    if(!yes){el('profile-dialog').close?.();el('profile-photo-dialog').close?.();photoUrl='';photoPath='';activeUserId='';languageAccountId='';return}
    restoreAccountLanguage(u);
    const letters=initials(u);
    for(const id of ['profile-picture-initials','profile-photo-large-initials'])el(id).textContent=letters;
    el('profile-photo-open').querySelector('span').textContent=letters;
    if(activeUserId!==u.id || photoPath!==(u.user_metadata?.avatar_path||'')){activeUserId=u.id;photoPath=u.user_metadata?.avatar_path||'';refreshPhoto(u)}
  }
  async function refreshPhoto(u){
    const requested=u?.user_metadata?.avatar_path||'';
    if(!requested || !requested.startsWith(u.id+'/')){photoUrl='';paintPhoto();return}
    const {data,error}=await client.storage.from(bucket).createSignedUrl(requested,1800);
    if(current()?.id!==u.id || (current()?.user_metadata?.avatar_path||'')!==requested)return;
    photoUrl=error?'':data?.signedUrl||'';
    paintPhoto();
  }
  function paintPhoto(){
    const has=!!photoUrl;
    for(const id of ['profile-avatar-image','profile-picture-preview','profile-photo-large-image']){
      const img=el(id);img.hidden=!has;if(has)img.src=photoUrl;else img.removeAttribute('src');
    }
    for(const id of ['profile-picture-initials','profile-photo-large-initials'])el(id).hidden=has;
    el('profile-photo-open').querySelector('span').hidden=has;
    el('profile-photo-view').disabled=!has;
    el('profile-photo-remove').disabled=!photoPath;
  }
  const pending=()=>{showControls();if(current())refreshPhoto(current())};
  const previousUpdate=updateAccount;
  updateAccount=function(...args){const result=previousUpdate(...args);showControls();return result};
  function openSettings(){
    const u=current();if(!u)return;
    const m=u.user_metadata||{},f=el('profile-info-form'),email=el('profile-email-form');
    for(const key of ['full_name','birth_date','phone_contact','profession'])f.elements.namedItem(key).value=m[key]||'';
    f.elements.namedItem('preferred_language').value=validLanguage(m.preferred_language)?m.preferred_language:(window.PEMESA_I18N?.language||'fr');
    email.elements.namedItem('email').value=u.email||'';
    for(const id of ['profile-info-status','profile-email-status','profile-password-status'])message(id,'');
    el('profile-password-form').reset();
    el('profile-dialog').showModal();
    showControls();
  }
  function openPhoto(){if(!current())return;showControls();message('profile-photo-status','');el('profile-photo-dialog').showModal()}
  el('profile-settings-open').addEventListener('click',openSettings);
  for(const id of ['profile-photo-open','profile-picture-action','profile-edit-picture'])el(id).addEventListener('click',openPhoto);
  document.querySelectorAll('[data-profile-close]').forEach(b=>b.addEventListener('click',()=>el('profile-dialog').close()));
  document.querySelectorAll('[data-photo-close]').forEach(b=>b.addEventListener('click',()=>el('profile-photo-dialog').close()));
  el('profile-photo-view').addEventListener('click',()=>{if(!photoUrl)return;el('profile-photo-large-image').scrollIntoView({block:'nearest',behavior:'smooth'})});
  el('profile-photo-change').addEventListener('click',()=>el('profile-photo-file').click());
  async function submit(e,kind){
    e.preventDefault();const u=current();if(!u)return;
    const form=e.currentTarget,button=form.querySelector('[type=submit]'),id='profile-'+kind+'-status';button.disabled=true;message(id,'');
    try {
      if(kind==='info'){
        const vals=Object.fromEntries(new FormData(form).entries());
        vals.full_name=vals.full_name.trim(); vals.phone_contact=vals.phone_contact.trim();vals.profession=vals.profession.trim();
        if(!validLanguage(vals.preferred_language))throw Error('Choisissez une langue valide.');
        if(!vals.full_name)throw Error('Veuillez saisir votre nom.');
        if(vals.birth_date && vals.birth_date>new Date().toISOString().slice(0,10))throw Error('La date de naissance ne peut pas être future.');
        const {data,error}=await client.auth.updateUser({data:vals});if(error)throw error;user=data.user;updateAccount();
        if(window.PEMESA_I18N?.language!==vals.preferred_language)window.PEMESA_I18N?.setLanguage(vals.preferred_language);
        message(id,'Informations personnelles enregistrées.');
      } else if(kind==='email'){
        const address=form.elements.namedItem('email').value.trim();
        if(address.toLowerCase()===u.email?.toLowerCase())throw Error('Cette adresse est déjà utilisée pour votre compte.');
        const {error}=await client.auth.updateUser({email:address,emailRedirectTo:location.origin+location.pathname});if(error)throw error;
        message(id,'Demande envoyée. Vérifiez les e-mails de confirmation nécessaires avant le changement.');
      } else if(kind==='password'){
        const old=form.elements.namedItem('current_password').value,pass=form.elements.namedItem('new_password').value,confirm=form.elements.namedItem('confirm_password').value;
        if(pass.length<8)throw Error('Utilisez au moins 8 caractères.');
        if(pass!==confirm)throw Error('Les nouveaux mots de passe ne correspondent pas.');
        if(old===pass)throw Error('Choisissez un mot de passe différent.');
        const {error:verifyError}=await client.auth.signInWithPassword({email:u.email,password:old});if(verifyError)throw Error('Mot de passe actuel incorrect.');
        const {error}=await client.auth.updateUser({password:pass});if(error)throw error;
        form.reset();message(id,'Mot de passe modifié avec succès.');
      }
    }catch(err){message(id,err.message||'Modification impossible.',true)}finally{button.disabled=false}
  }
  for(const kind of ['info','email','password'])el('profile-'+kind+'-form').addEventListener('submit',e=>submit(e,kind));
  el('profile-photo-file').addEventListener('change',async e=>{
    const file=e.target.files?.[0],u=current();e.target.value='';if(!file||!u)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152){message('profile-photo-status','Choisissez une image JPG, PNG ou WebP de moins de 2 Mo.',true);return}
    const b=el('profile-photo-change');b.disabled=true;message('profile-photo-status','');
    const old=photoPath;
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
    const path=u.id+'/avatar-'+crypto.randomUUID()+'.'+ext;
    try{
      const {error:uploadError}=await client.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;
      const {data,error}=await client.auth.updateUser({data:{avatar_path:path}});
      if(error){await client.storage.from(bucket).remove([path]);throw error}
      user=data.user;activeUserId=u.id;photoPath=path;await refreshPhoto(data.user);
      if(old&&old.startsWith(u.id+'/'))await client.storage.from(bucket).remove([old]);
      message('profile-photo-status','Photo de profil enregistrée.');
    }catch(err){message('profile-photo-status',err.message||'Envoi de la photo impossible.',true)}finally{b.disabled=false}
  });
  el('profile-photo-remove').addEventListener('click',async ()=>{
    const u=current();if(!u||!photoPath)return;
    const old=photoPath,b=el('profile-photo-remove');b.disabled=true;
    try{
      const {data,error}=await client.auth.updateUser({data:{avatar_path:''}});if(error)throw error;
      user=data.user;photoPath='';photoUrl='';paintPhoto();await client.storage.from(bucket).remove([old]);
      message('profile-photo-status','Photo de profil supprimée.');
    }catch(err){message('profile-photo-status',err.message||'Suppression impossible.',true)}finally{b.disabled=false}
  });
  // Header language changes are account preferences as well as local display changes.
  let languageSave=Promise.resolve();
  document.addEventListener('change',event=>{
    if(!event.target.matches('[data-language-select]'))return;
    const u=current(),lang=event.target.value;
    if(!u||!validLanguage(lang))return;
    languageSave=languageSave.catch(()=>{}).then(async()=>{
      if(current()?.id!==u.id)return;
      const {data,error}=await client.auth.updateUser({data:{preferred_language:lang}});
      if(error){toast('La langue a été modifiée sur cet appareil, mais sa sauvegarde sur le compte a échoué.');return}
      if(current()?.id===u.id){user=data.user;const selector=el('profile-info-form').elements.namedItem('preferred_language');if(!el('profile-dialog').open)selector.value=lang;}
    });
  });
  if(client)client.auth.onAuthStateChange(()=>setTimeout(pending,30));
  showControls();
})();