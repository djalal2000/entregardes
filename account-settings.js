/* PEMESA — Account settings and private profile photos. */
(() => {
  'use strict';
  const bucket = 'pemesa-avatars';
  const maxAvatarBytes = 2 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  let avatarUrl = '';
  let avatarOwner = '';
  let avatarBusy = false;
  let accountBusy = false;

  const signedIn = () => mode === 'account' && Boolean(client && user);
  const profile = () => user?.user_metadata || {};
  const field = (value) => escapeHtml(value || '');

  function settingsView() {
    if (!signedIn()) return '<section class="settings-card"><p>Connectez-vous pour accéder aux paramètres de votre compte.</p></section>';
    const p = profile();
    return [
      '<div class="settings-layout">',
      '<section class="settings-card settings-profile">',
      '<div class="settings-card-title"><span class="settings-icon">◉</span><div><h2>Informations personnelles</h2><p>Complétez votre profil. Les champs facultatifs restent privés.</p></div></div>',
      '<div class="settings-photo-row"><div class="settings-photo-preview"><img data-settings-avatar-image alt="Photo de profil" hidden><span data-settings-avatar-initials>👤</span></div><div><strong>Photo de profil</strong><p class="settings-hint">JPG, PNG ou WebP · 2 Mo maximum</p><button type="button" class="settings-secondary" data-avatar-trigger>Voir ou changer ma photo</button></div></div>',
      '<form id="settings-profile-form" class="settings-form">',
      '<div class="settings-grid">',
      '<label>Nom complet <span aria-hidden="true">*</span><input name="full_name" autocomplete="name" maxlength="80" required value="' + field(p.full_name) + '"></label>',
      '<label>Date de naissance <input name="birth_date" type="date" max="' + iso(new Date()) + '" value="' + field(p.birth_date) + '"></label>',
      '<label>Profession / fonction <input name="job_title" autocomplete="organization-title" maxlength="100" value="' + field(p.job_title) + '" placeholder="Ex. infirmier, chercheur…"></label>',
      '<label>Établissement / organisation <input name="organization" autocomplete="organization" maxlength="120" value="' + field(p.organization) + '" placeholder="Facultatif"></label>',
      '<label>Ville <input name="city" autocomplete="address-level2" maxlength="100" value="' + field(p.city) + '"></label>',
      '<label>Téléphone <input name="phone" type="tel" autocomplete="tel" maxlength="30" value="' + field(p.phone) + '" placeholder="Facultatif"></label>',
      '</div><div class="settings-actions"><button type="submit" class="settings-primary">Enregistrer les modifications</button></div>',
      '</form></section>',
      '<div class="settings-side">',
      '<section class="settings-card">',
      '<div class="settings-card-title"><span class="settings-icon orange">✉</span><div><h2>Adresse e-mail</h2><p>Une confirmation par e-mail peut être demandée.</p></div></div>',
      '<form id="settings-email-form" class="settings-form">',
      '<label>Adresse e-mail actuelle <input value="' + field(user?.email) + '" readonly aria-readonly="true"></label>',
      '<label>Nouvelle adresse e-mail <input type="email" name="email" autocomplete="email" maxlength="254" required placeholder="nouveau@exemple.fr"></label>',
      '<button type="submit" class="settings-secondary">Modifier l’adresse e-mail</button>',
      '</form></section>',
      '<section class="settings-card">',
      '<div class="settings-card-title"><span class="settings-icon">♢</span><div><h2>Sécurité du compte</h2><p>Utilisez un mot de passe unique et suffisamment long.</p></div></div>',
      '<form id="settings-password-form" class="settings-form">',
      '<label>Mot de passe actuel <input name="current_password" type="password" autocomplete="current-password" required></label>',
      '<label>Nouveau mot de passe <input name="new_password" type="password" autocomplete="new-password" minlength="12" required placeholder="12 caractères minimum"></label>',
      '<label>Confirmer le nouveau mot de passe <input name="confirm_password" type="password" autocomplete="new-password" minlength="12" required></label>',
      '<button type="submit" class="settings-secondary">Changer mon mot de passe</button>',
      '</form></section>',
      '<section class="settings-card settings-note"><strong>Confidentialité</strong><p>Votre photo est privée et vos paramètres sont liés à votre compte connecté. Évitez de saisir des informations médicales dans votre profil.</p></section>',
      '</div></div>'
    ].join('');
  }

  function initials() {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.trim().split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toLocaleUpperCase() || 'PM';
  }

  function updateAvatarUI() {
    const label = initials();
    document.querySelectorAll('[data-account-avatar-initials]').forEach(el => {
      el.textContent = signedIn() ? label : 'PM';
      el.hidden = signedIn() && Boolean(avatarUrl);
    });
    document.querySelectorAll('[data-settings-avatar-initials]').forEach(el => {
      el.textContent = label || '👤';
      el.hidden = Boolean(avatarUrl);
    });
    document.querySelectorAll('[data-account-avatar-image], [data-settings-avatar-image]').forEach(img => {
      if (avatarUrl && signedIn()) {
        if (img.src !== avatarUrl) img.src = avatarUrl;
        img.hidden = false;
      } else {
        img.hidden = true;
        img.removeAttribute('src');
      }
    });
    const view = document.querySelector('[data-avatar-action="view"]');
    const remove = document.querySelector('[data-avatar-action="remove"]');
    if (view) view.disabled = !avatarUrl;
    if (remove) remove.disabled = !avatarUrl;
  }

  async function syncAvatar(force = false) {
    if (!signedIn()) return clearAvatar();
    const owner = user.id;
    if (!force && avatarOwner === owner) { updateAvatarUI(); return; }
    avatarOwner = owner;
    avatarUrl = '';
    updateAvatarUI();
    const storage = client.storage.from(bucket);
    try {
      const { data: objects, error } = await storage.list(owner, { limit: 20 });
      if (error) throw error;
      if (!objects?.some(obj => obj.name === 'avatar')) return;
      const { data, error: urlError } = await storage.createSignedUrl(owner + '/avatar', 3600);
      if (urlError) throw urlError;
      if (signedIn() && user.id === owner) {
        avatarUrl = data.signedUrl;
        updateAvatarUI();
      }
    } catch (err) {
      console.warn('PEMESA profile image:', err.message || err);
    }
  }

  function clearAvatar() {
    avatarOwner = '';
    avatarUrl = '';
    updateAvatarUI();
  }

  function showPhotoMenu() {
    if (!signedIn()) return;
    updateAvatarUI();
    const dialog = document.querySelector('#avatar-actions-dialog');
    if (dialog && !dialog.open) dialog.showModal();
  }

  async function viewPhoto() {
    if (!signedIn()) return;
    await syncAvatar(true);
    if (!avatarUrl) { toast('Aucune photo de profil pour le moment.'); return; }
    const img = document.querySelector('#avatar-large-image');
    img.src = avatarUrl;
    const dialog = document.querySelector('#avatar-view-dialog');
    if (!dialog.open) dialog.showModal();
  }

  async function uploadPhoto(file) {
    if (!signedIn() || !file || avatarBusy) return;
    if (!allowedTypes.includes(file.type)) return toast('Choisissez une image JPG, PNG ou WebP.');
    if (file.size > maxAvatarBytes || file.size === 0) return toast('La photo doit faire moins de 2 Mo.');
    avatarBusy = true;
    const owner = user.id;
    try {
      const { error } = await client.storage.from(bucket).upload(owner + '/avatar', file, {
        upsert: true,
        cacheControl: '60',
        contentType: file.type
      });
      if (error) throw error;
      await syncAvatar(true);
      toast('Votre photo de profil a été mise à jour.');
    } catch (err) {
      toast('Impossible de modifier la photo : ' + (err.message || 'erreur inconnue'));
    } finally {
      avatarBusy = false;
      document.querySelector('#avatar-file-input').value = '';
    }
  }

  async function removePhoto() {
    if (!signedIn() || avatarBusy || !avatarUrl) return;
    if (!confirm('Supprimer votre photo de profil ?')) return;
    avatarBusy = true;
    try {
      const { error } = await client.storage.from(bucket).remove([user.id + '/avatar']);
      if (error) throw error;
      await syncAvatar(true);
      toast('Votre photo de profil a été supprimée.');
    } catch (err) {
      toast('Impossible de supprimer la photo : ' + (err.message || 'erreur inconnue'));
    } finally {
      avatarBusy = false;
    }
  }

  async function submitProfile(form) {
    if (!signedIn() || accountBusy) return;
    const f = new FormData(form);
    const values = Object.fromEntries(['full_name', 'birth_date', 'job_title', 'organization', 'city', 'phone']
      .map(k => [k, String(f.get(k) || '').trim()]));
    if (!values.full_name) return toast('Veuillez indiquer votre nom complet.');
    if (values.birth_date && (values.birth_date > iso(new Date()) || values.birth_date < '1900-01-01'))
      return toast('Vérifiez votre date de naissance.');
    accountBusy = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { data, error } = await client.auth.updateUser({ data: values });
      if (error) throw error;
      if (data?.user) user = data.user;
      updateAccount();
      render();
      toast('Vos informations ont été enregistrées.');
    } catch (err) {
      toast('Enregistrement impossible : ' + (err.message || 'erreur inconnue'));
    } finally {
      accountBusy = false;
      if (button.isConnected) button.disabled = false;
    }
  }

  async function submitEmail(form) {
    if (!signedIn() || accountBusy) return;
    const email = String(new FormData(form).get('email') || '').trim().toLowerCase();
    if (!email || email === (user.email || '').toLowerCase()) return toast('Indiquez une nouvelle adresse e-mail.');
    accountBusy = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { error } = await client.auth.updateUser(
        { email }, { emailRedirectTo: location.origin + location.pathname }
      );
      if (error) throw error;
      form.reset();
      toast('Vérifiez les e-mails de confirmation pour valider votre nouvelle adresse.');
    } catch (err) {
      toast('Modification de l’e-mail impossible : ' + (err.message || 'erreur inconnue'));
    } finally {
      accountBusy = false;
      button.disabled = false;
    }
  }

  async function submitPassword(form) {
    if (!signedIn() || accountBusy) return;
    const f = new FormData(form);
    const current = String(f.get('current_password') || '');
    const next = String(f.get('new_password') || '');
    const confirm = String(f.get('confirm_password') || '');
    if (next.length < 12) return toast('Le mot de passe doit contenir au moins 12 caractères.');
    if (next !== confirm) return toast('Les nouveaux mots de passe ne correspondent pas.');
    if (current === next) return toast('Choisissez un mot de passe différent de l’ancien.');
    accountBusy = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { error } = await client.auth.updateUser({ password: next, current_password: current });
      if (error) throw error;
      form.reset();
      toast('Votre mot de passe a été modifié.');
    } catch (err) {
      toast('Changement de mot de passe impossible : ' + (err.message || 'erreur inconnue'));
    } finally {
      accountBusy = false;
      button.disabled = false;
    }
  }

  document.addEventListener('click', async event => {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.matches('[data-avatar-trigger]')) { showPhotoMenu(); return; }
    if (btn.matches('[data-avatar-close]')) {
      const dialog = btn.closest('dialog');
      if (dialog?.open) dialog.close();
      return;
    }
    if (!btn.dataset.avatarAction) return;
    const actions = document.querySelector('#avatar-actions-dialog');
    if (actions.open) actions.close();
    if (btn.dataset.avatarAction === 'view') await viewPhoto();
    if (btn.dataset.avatarAction === 'change') document.querySelector('#avatar-file-input').click();
    if (btn.dataset.avatarAction === 'remove') await removePhoto();
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'avatar-file-input') uploadPhoto(event.target.files?.[0]);
  });

  document.addEventListener('submit', event => {
    const id = event.target.id;
    if (!['settings-profile-form', 'settings-email-form', 'settings-password-form'].includes(id)) return;
    event.preventDefault();
    if (id === 'settings-profile-form') submitProfile(event.target);
    if (id === 'settings-email-form') submitEmail(event.target);
    if (id === 'settings-password-form') submitPassword(event.target);
  });

  window.PEMESA_ACCOUNT = { render: settingsView, syncAvatar, clearAvatar, refresh: updateAvatarUI };
})();
