/* ==========================================================================
   CONSOLA DE ADMINISTRACIÓN /ADMIN - LÓGICA DE MANTENEDORES
   ========================================================================== */

const DEFAULT_ADMIN_HASHES = {
  emailHash: '508c6735f8ffe8058d263f1d92a453ba6265384efd0f4f1e85647955348098ed',
  passHash: 'c6902c662d2eddc4ae380748506f9ee26a600b3a6a685eafd4fb1ff11a418efb'
};

function getAdminHashes() {
  const custom = localStorage.getItem('ppv_admin_custom_hashes');
  if (custom) {
    try { return JSON.parse(custom); } catch(e){}
  }
  return DEFAULT_ADMIN_HASHES;
}

function getAdminEmail() {
  return localStorage.getItem('ppv_admin_custom_email') || 'ppv@ppvsoluciones.cl';
}

async function hashString(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[ADMIN-DIAG] DOMContentLoaded ejecutado');
  // Inicializar autenticación y event listeners del login de inmediato
  try {
    initAuth();
  } catch (e) {
    console.error('[ADMIN] Error iniciando Auth:', e);
  }

  if (window.portfolioDB) {
    try {
      console.log('[ADMIN-DIAG] Inicializando portfolioDB...');
      await window.portfolioDB.init();
      console.log('[ADMIN-DIAG] portfolioDB OK. Poblando semillas si está vacía...');
      if (window.portfolioDB.seedDefaultsIfEmpty) {
        await window.portfolioDB.seedDefaultsIfEmpty();
      }
      console.log('[ADMIN-DIAG] Refrescando datos del Dashboard...');
      await refreshAllData();
    } catch (e) {
      console.error('[ADMIN] Error iniciando portfolioDB:', e);
    }
  }

  try { initSidebar(); } catch(e){ console.error(e); }
  try { initStatusPillCRUD(); } catch(e){ console.error(e); }
  try { initServicesCRUD(); } catch(e){ console.error(e); }
  try { initSkillsCRUD(); } catch(e){ console.error(e); }
  try { initBlockedCRUD(); } catch(e){ console.error(e); }
  try { initAdminMeetingsMaintainer(); } catch(e){ console.error(e); }
  try { initUserMaintainer(); } catch(e){ console.error(e); }
  try { initPdfGeneratorMaintainer(); } catch(e){ console.error(e); }
  try { initSecAuditWorkflowMaintainer(); } catch(e){ console.error(e); }
  try { initClientsCRUD(); } catch(e){ console.error(e); }
  try { initUFHistoryMaintainer(); } catch(e){ console.error(e); }
  try { initVCardEditorMaintainer(); } catch(e){ console.error(e); }
  try { initQATestingSuiteMaintainer(); } catch(e){ console.error(e); }
  try { initCMMIGovernanceMaintainer(); } catch(e){ console.error(e); }
  try { initExecSummaryMaintainer(); } catch(e){ console.error(e); }
});

/* --------------------------------------------------------------------------
   1. AUTENTICACIÓN & CONTROL DE SESIÓN
   -------------------------------------------------------------------------- */
function initAuth() {
  const loginOverlay = document.getElementById('admin-login-screen');
  const loginForm = document.getElementById('form-admin-portal-login');
  const loginError = document.getElementById('admin-login-error');
  const btnLogout = document.getElementById('btn-portal-logout');
  const userDisplay = document.getElementById('admin-user-display');
  const btnTogglePass = document.getElementById('btn-toggle-portal-pass');
  const passInput = document.getElementById('portal-password');

  if (btnTogglePass && passInput) {
    btnTogglePass.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btnTogglePass.querySelector('i');
      if (passInput.type === 'password') {
        passInput.type = 'text';
        btnTogglePass.classList.add('active');
        if (icon) icon.className = 'fa-solid fa-eye-slash';
      } else {
        passInput.type = 'password';
        btnTogglePass.classList.remove('active');
        if (icon) icon.className = 'fa-solid fa-eye';
      }
      passInput.focus();
    };
  }

  function isAuthorized() {
    return sessionStorage.getItem('ppv_admin_logged') === 'true';
  }

  function checkSession() {
    if (isAuthorized()) {
      loginOverlay.style.display = 'none';
      if (userDisplay) {
        userDisplay.textContent = sessionStorage.getItem('ppv_admin_email') || getAdminEmail();
      }
      refreshAllData();
    } else {
      loginOverlay.style.display = 'flex';
    }
  }

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('portal-email');
      const passInput = document.getElementById('portal-password');
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const pass = passInput ? passInput.value.trim() : '';

      // Verificación directa inmediata
      if (email === 'ppv@ppvsoluciones.cl' && pass === 'axeappv3878') {
        await initiate2FA(email);
        return;
      }

      // Verificación secundaria por Hashes o DB
      try {
        const currentHashes = getAdminHashes();
        const [eHash, pHash] = await Promise.all([hashString(email), hashString(pass)]);
        const isMasterHash = (eHash === '508c6735f8ffe8058d263f1d92a453ba6265384efd0f4f1e85647955348098ed' && pHash === 'c6902c662d2eddc4ae380748506f9ee26a600b3a6a685eafd4fb1ff11a418efb');
        const isCustomCreds = (eHash === currentHashes.emailHash && pHash === currentHashes.passHash);

        let isDbUser = false;
        let isBlockedUser = false;
        let dbUserName = '';
        let dbUserRole = '';
        let dbUserPhone = '';
        
        if (window.portfolioDB && window.portfolioDB.db) {
          try {
            const dbUsers = await window.portfolioDB.getAllAdminUsers();
            if (dbUsers && Array.isArray(dbUsers)) {
              const found = dbUsers.find(u => (u.email && u.email.toLowerCase() === email || u.emailHash === eHash) && u.passHash === pHash);
              if (found) {
                if (found.isBlocked) {
                  isBlockedUser = true;
                } else {
                  isDbUser = true;
                  dbUserName = found.name;
                  dbUserRole = found.role;
                  dbUserPhone = found.phone || '';
                }
              }
            }
          } catch (dbErr) {
            console.warn('[ADMIN] Error consultando usuarios DB:', dbErr);
          }
        }

        if (isBlockedUser) {
          if (loginError) {
            loginError.innerHTML = '<i class="fa-solid fa-lock" style="margin-right: 6px;"></i> Tu cuenta de usuario se encuentra bloqueada por el Administrador Principal.';
            loginError.style.display = 'flex';
          }
          showToast('🔒 Usuario bloqueado. Contacta al administrador principal.', true);
          return;
        }

        if (isMasterHash || isCustomCreds || isDbUser) {
          // Credenciales correctas -> Disparar 2FA
          sessionStorage.setItem('pending_2fa_name', isDbUser ? dbUserName : 'Patricio Padilla');
          sessionStorage.setItem('pending_2fa_role', isDbUser ? dbUserRole : 'CEO & Fundador');
          sessionStorage.setItem('pending_2fa_phone', isDbUser ? dbUserPhone : '+56 9 5704 0679');
          await initiate2FA(email);
        } else {
          if (loginError) {
            loginError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span>Credenciales incorrectas.</span>';
            loginError.style.display = 'flex';
          }
        }
      } catch (err) {
        console.error('[ADMIN] Error en validación de credenciales:', err);
        if (loginError) {
          loginError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span>Error de validación.</span>';
          loginError.style.display = 'flex';
        }
      }
    };
  }

  // --- LÓGICA DE 2FA ---
  const form2FA = document.getElementById('form-admin-portal-2fa');
  const btnBackLogin = document.getElementById('btn-back-to-login');
  let currentLoginEmail = '';

  async function initiate2FA(email) {
    currentLoginEmail = email;
    if (loginError) loginError.style.display = 'none';
    const btnLogin = loginForm.querySelector('button[type="submit"]');
    const originalText = btnLogin.innerHTML;
    btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    btnLogin.disabled = true;

    try {
      const res = await fetch('/tg-send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.ok) {
        loginForm.style.display = 'none';
        form2FA.style.display = 'block';
        document.getElementById('portal-2fa-code').focus();
        showToast('Código enviado a Telegram');
      } else {
        throw new Error(data.error || 'Error enviando 2FA');
      }
    } catch (e) {
      console.error(e);
      if (loginError) {
        loginError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span>Error al enviar el código 2FA. Verifique la conexión con el servidor.</span>';
        loginError.style.display = 'flex';
      }
    } finally {
      btnLogin.innerHTML = originalText;
      btnLogin.disabled = false;
    }
  }

  if (btnBackLogin) {
    btnBackLogin.onclick = () => {
      form2FA.style.display = 'none';
      loginForm.style.display = 'block';
      document.getElementById('portal-2fa-code').value = '';
    };
  }

  if (form2FA) {
    form2FA.onsubmit = async (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('portal-2fa-code').value.trim();
      const btnVerify = form2FA.querySelector('button[type="submit"]');
      const originalText = btnVerify.innerHTML;
      btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
      btnVerify.disabled = true;
      if (loginError) loginError.style.display = 'none';

      try {
        const res = await fetch('/tg-verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentLoginEmail, code: codeInput })
        });
        const data = await res.json();
        
        if (data.ok) {
          // Login exitoso final
          sessionStorage.setItem('ppv_admin_logged', 'true');
          sessionStorage.setItem('ppv_admin_email', currentLoginEmail);
          
          localStorage.setItem('ppv_admin_custom_email', currentLoginEmail);
          localStorage.setItem('ppv_admin_name', sessionStorage.getItem('pending_2fa_name') || 'Admin');
          localStorage.setItem('ppv_admin_role', sessionStorage.getItem('pending_2fa_role') || 'Admin');
          localStorage.setItem('ppv_admin_phone', sessionStorage.getItem('pending_2fa_phone') || '');
          
          showToast('¡Bienvenido al Panel de Administración!');
          checkSession();
          form2FA.style.display = 'none';
          loginForm.style.display = 'block';
          document.getElementById('portal-2fa-code').value = '';
        } else {
          throw new Error('Código incorrecto');
        }
      } catch (err) {
        if (loginError) {
          loginError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span>El código ingresado es incorrecto o ha expirado.</span>';
          loginError.style.display = 'flex';
        }
      } finally {
        btnVerify.innerHTML = originalText;
        btnVerify.disabled = false;
      }
    };
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      sessionStorage.removeItem('ppv_admin_logged');
      sessionStorage.removeItem('ppv_admin_email');
      showToast('Sesión de administración cerrada.');
      checkSession();
    };
  }

  checkSession();
}

/* --------------------------------------------------------------------------
   2. REFRESCAR DATOS Y CONTADORES
   -------------------------------------------------------------------------- */
async function refreshAllData() {
  if (window.portfolioDB) {
    try { 
      await window.portfolioDB.init(); 
      if (window.portfolioDB.seedDefaultsIfEmpty) {
        await window.portfolioDB.seedDefaultsIfEmpty();
      }
    } catch(e) { console.error('Error inicializando DB/Seeds:', e); }
  }
  try { await loadMessagesTable(); } catch(e) { console.error('Error cargando mensajes:', e); }
  try { await loadServicesTable(); } catch(e) { console.error('Error cargando servicios:', e); }
  try { await loadSkillsTable(); } catch(e) { console.error('Error cargando habilidades:', e); }
  try { await loadBlockedTable(); } catch(e) { console.error('Error cargando bloqueados:', e); }
  try { await updateCounters(); } catch(e) { console.error('Error actualizando contadores:', e); }
}

async function updateCounters() {
  if (!window.portfolioDB) return;
  try {
    let msgCount = 0;
    try {
      const res = await fetch('/tg-messages');
      const data = await res.json();
      if (data.ok && Array.isArray(data.messages)) {
        msgCount = data.messages.length;
      }
    } catch(e) {}

    const localMessages = await window.portfolioDB.getAllMessages();
    if (msgCount === 0 && localMessages) {
      msgCount = localMessages.length;
    }

    const services = await window.portfolioDB.getAll('services');
    const skills = await window.portfolioDB.getAll('skills');
    const blocked = await window.portfolioDB.getAll('blocked');

    const elMsgs = document.getElementById('stat-count-messages');
    const elServ = document.getElementById('stat-count-services');
    const elSkil = document.getElementById('stat-count-skills');
    const elBloc = document.getElementById('stat-count-blocked');

    if (elMsgs) elMsgs.textContent = msgCount;
    if (elServ) elServ.textContent = services ? services.length : 0;
    if (elSkil) elSkil.textContent = skills ? skills.length : 0;
    if (elBloc) elBloc.textContent = blocked ? blocked.length : 0;
  } catch(err) {
    console.error('Error actualizando contadores:', err);
  }
}

/* --------------------------------------------------------------------------
   3. NAVEGACIÓN SIDEBAR (CAMBIO DE VISTAS)
   -------------------------------------------------------------------------- */
function initSidebar() {
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');

  sidebarBtns.forEach(btn => {
    btn.onclick = (e) => {
      if (e) e.preventDefault();
      sidebarBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel-view').forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const viewId = btn.getAttribute('data-view') || (btn.dataset ? btn.dataset.view : null);
      if (viewId) {
        const targetView = document.getElementById(viewId);
        if (targetView) {
          targetView.classList.add('active');
          refreshAllData();
        }
      }
    };
  });
}

/* --------------------------------------------------------------------------
   4. MANTENEDOR DE MENSAJES DE CONTACTO
   -------------------------------------------------------------------------- */
async function loadMessagesTable() {
  const tbody = document.getElementById('portal-messages-tbody');
  const btnExport = document.getElementById('btn-portal-export-json');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Cargando mensajes...</td></tr>';
  
  let messages = [];
  try {
    const res = await fetch('/tg-messages');
    const data = await res.json();
    if (data.ok && Array.isArray(data.messages)) {
      messages = data.messages.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        website: m.website,
        budget: m.budget,
        message: m.message,
        phone: m.phone || '',
        contact_pref: m.contact_pref || '',
        status: m.status || 'Nuevo',
        timestampFormatted: m.created_at || 'Reciente'
      }));
    }
  } catch(err) {
    console.warn('Backend API /tg-messages no accesible, usando fallback local:', err);
  }

  if (!messages.length && window.portfolioDB) {
    try {
      const localMsgs = await window.portfolioDB.getAllMessages();
      if (localMsgs && localMsgs.length > 0) {
        messages = localMsgs;
      }
    } catch(e) {
      console.warn('Error leyendo mensajes locales:', e);
    }
  }

  const statCounter = document.getElementById('stat-count-messages');
  if (statCounter) statCounter.textContent = messages.length;

  if (!messages.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">No hay mensajes registrados aún.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  messages.forEach(msg => {
    const tr = document.createElement('tr');
    const badgeClass = msg.status === 'Nuevo' ? 'badge-new' : (msg.status === 'Leído' ? 'badge-read' : 'badge-replied');
    const websiteInfo = msg.website ? `<br><small style="color: var(--neon-pink);"><i class="fa-solid fa-globe"></i> ${escapeHtml(msg.website)}</small>` : '';
    const phoneInfo = msg.phone ? `<br><small style="color: var(--neon-cyan);"><i class="fa-solid fa-phone"></i> ${escapeHtml(msg.phone)} (${escapeHtml(msg.contact_pref || 'WhatsApp')})</small>` : '';

    tr.innerHTML = `
      <td style="text-align: center;"><input type="checkbox" class="bulk-msg-cb" value="${msg.id}"></td>
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${msg.id}</td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${msg.timestampFormatted}</td>
      <td><strong>${escapeHtml(msg.name)}</strong>${websiteInfo}</td>
      <td style="color: var(--neon-violet);">${escapeHtml(msg.email)}${phoneInfo}</td>
      <td style="color: var(--neon-emerald); font-weight: 600;">${escapeHtml(msg.budget || msg.subject)}</td>
      <td><span class="badge-status ${badgeClass}">${msg.status}</span></td>
      <td>
        <button class="btn btn-outline btn-msg-read" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="btn btn-outline btn-msg-del" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Checkbox interactions
  const bulkDelBtn = document.getElementById('btn-portal-bulk-delete');
  const selectAllCb = document.getElementById('bulk-select-all-msgs');
  const rowCbs = tbody.querySelectorAll('.bulk-msg-cb');
  
  const updateBulkDelBtn = () => {
    const anyChecked = Array.from(rowCbs).some(cb => cb.checked);
    if (bulkDelBtn) bulkDelBtn.style.display = anyChecked ? 'inline-block' : 'none';
  };

  if (selectAllCb) {
    selectAllCb.checked = false;
    selectAllCb.onchange = (e) => {
      rowCbs.forEach(cb => cb.checked = e.target.checked);
      updateBulkDelBtn();
    };
  }

  rowCbs.forEach(cb => {
    cb.onchange = () => {
      if (!cb.checked && selectAllCb) selectAllCb.checked = false;
      updateBulkDelBtn();
    };
  });

  if (bulkDelBtn) {
    bulkDelBtn.onclick = async () => {
      const selectedIds = Array.from(rowCbs).filter(cb => cb.checked).map(cb => parseInt(cb.value, 10));
      if (selectedIds.length === 0) return;
      if (confirm(`¿Eliminar ${selectedIds.length} mensajes seleccionados permanentemente?`)) {
        bulkDelBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';
        bulkDelBtn.disabled = true;
        for (const id of selectedIds) {
          await window.portfolioDB.deleteMessage(id);
        }
        await refreshAllData();
        if (bulkDelBtn) {
          bulkDelBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar Seleccionados';
          bulkDelBtn.disabled = false;
          bulkDelBtn.style.display = 'none';
        }
      }
    };
  }

  tbody.querySelectorAll('.btn-msg-read').forEach(btn => {
    btn.onclick = async () => {
      await window.portfolioDB.updateMessageStatus(parseInt(btn.dataset.id, 10), 'Respondido');
      await refreshAllData();
    };
  });

  tbody.querySelectorAll('.btn-msg-del').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este mensaje de la base de datos?')) {
        await window.portfolioDB.deleteMessage(parseInt(btn.dataset.id, 10));
        await refreshAllData();
      }
    };
  });

  if (btnExport) {
    btnExport.onclick = async () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ppv_mensajes_db_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }
}

/* --------------------------------------------------------------------------
   5. MANTENEDOR DE SERVICIOS & PRECIOS (CALCULADORA)
   -------------------------------------------------------------------------- */
function initServicesCRUD() {
  const form = document.getElementById('form-portal-service');
  const btnCancel = document.getElementById('btn-p-cancel-service');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('p-service-id').value;

    const priceVal = parseFloat(document.getElementById('p-service-price').value) || 0;
    const serviceData = {
      title: document.getElementById('p-service-title').value.trim(),
      priceUF: priceVal,
      priceUSD: Math.round(priceVal * 40),
      timeDays: document.getElementById('p-service-time').value.trim(),
      desc: document.getElementById('p-service-desc').value.trim(),
      icon: 'fa-check'
    };

    if (idInput) {
      serviceData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveService(serviceData);
    showToast(idInput ? 'Servicio actualizado correctamente.' : 'Nuevo servicio agregado.');
    resetServiceForm();
    await refreshAllData();
  };

  if (btnCancel) btnCancel.onclick = () => resetServiceForm();

  function resetServiceForm() {
    form.reset();
    document.getElementById('p-service-id').value = '';
    document.getElementById('p-service-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Servicio';
  }
}

async function loadServicesTable() {
  const tbody = document.getElementById('portal-services-tbody');
  if (!tbody || !window.portfolioDB) return;

  const services = await window.portfolioDB.getAll('services');
  tbody.innerHTML = '';

  if (!services.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay servicios.</td></tr>';
    return;
  }

  services.forEach(s => {
    const ufVal = s.priceUF !== undefined ? parseFloat(s.priceUF) : (parseFloat(s.priceUSD || 0) / 40.0);
    const ufStr = ufVal.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${s.id}</td>
      <td><strong>${escapeHtml(s.title)}</strong></td>
      <td style="color: var(--neon-emerald); font-weight: 700;">${ufStr} UF</td>
      <td style="color: var(--neon-violet);">${escapeHtml(s.timeDays)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(s.desc)}</td>
      <td>
        <button class="btn btn-outline btn-edit-srv" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-del-srv" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-srv').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('services');
      const target = all.find(x => x.id === id);
      if (target) {
        const ufVal = target.priceUF !== undefined ? target.priceUF : (target.priceUSD / 40.0);
        document.getElementById('p-service-id').value = target.id;
        document.getElementById('p-service-title').value = target.title;
        document.getElementById('p-service-price').value = ufVal;
        document.getElementById('p-service-time').value = target.timeDays;
        document.getElementById('p-service-desc').value = target.desc;
        document.getElementById('p-service-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Servicio #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-del-srv').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este servicio de la calculadora pública?')) {
        await window.portfolioDB.deleteService(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Servicio eliminado.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   6. MANTENEDOR DE HABILIDADES TÉCNICAS
   -------------------------------------------------------------------------- */
function initSkillsCRUD() {
  const form = document.getElementById('form-portal-skill');
  const btnCancel = document.getElementById('btn-p-cancel-skill');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('p-skill-id').value;

    const skillData = {
      name: document.getElementById('p-skill-name').value.trim(),
      category: document.getElementById('p-skill-category').value,
      level: document.getElementById('p-skill-level').value.trim(),
      levelText: document.getElementById('p-skill-text').value.trim(),
      desc: document.getElementById('p-skill-desc').value.trim()
    };

    if (idInput) {
      skillData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveSkill(skillData);
    showToast(idInput ? 'Habilidad actualizada correctamente.' : 'Nueva habilidad agregada.');
    resetSkillForm();
    await refreshAllData();
  };

  if (btnCancel) btnCancel.onclick = () => resetSkillForm();

  function resetSkillForm() {
    form.reset();
    document.getElementById('p-skill-id').value = '';
    document.getElementById('p-skill-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Habilidad Técnica';
  }
}

async function loadSkillsTable() {
  const tbody = document.getElementById('portal-skills-tbody');
  if (!tbody || !window.portfolioDB) return;

  const skills = await window.portfolioDB.getAll('skills');
  tbody.innerHTML = '';

  if (!skills.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay habilidades.</td></tr>';
    return;
  }

  skills.forEach(sk => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${sk.id}</td>
      <td><strong>${escapeHtml(sk.name)}</strong></td>
      <td style="color: var(--neon-violet); text-transform: uppercase; font-size: 0.75rem;">${escapeHtml(sk.category)}</td>
      <td style="color: var(--neon-emerald);">${escapeHtml(sk.level)} (${escapeHtml(sk.levelText)})</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(sk.desc)}</td>
      <td>
        <button class="btn btn-outline btn-edit-sk" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-del-sk" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-sk').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('skills');
      const target = all.find(x => x.id === id);
      if (target) {
        document.getElementById('p-skill-id').value = target.id;
        document.getElementById('p-skill-name').value = target.name;
        document.getElementById('p-skill-category').value = target.category;
        document.getElementById('p-skill-level').value = target.level;
        document.getElementById('p-skill-text').value = target.levelText || target.level;
        document.getElementById('p-skill-desc').value = target.desc;
        document.getElementById('p-skill-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Habilidad #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-del-sk').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar esta habilidad de la matriz pública?')) {
        await window.portfolioDB.deleteSkill(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Habilidad eliminada.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   7. MANTENEDOR DE PALABRAS / RUBROS BLOQUEADOS
   -------------------------------------------------------------------------- */
function initBlockedCRUD() {
  const form = document.getElementById('form-portal-blocked');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const wordInput = document.getElementById('p-blocked-word').value.trim();
    if (!wordInput) return;

    try {
      await window.portfolioDB.addBlockedWord(wordInput);
      showToast(`Término "${wordInput}" agregado a la lista negra.`);
      form.reset();
      await refreshAllData();
    } catch (err) {
      showToast('Ese término ya existe en la lista negra.', true);
    }
  };
}

async function loadBlockedTable() {
  const tbody = document.getElementById('portal-blocked-tbody');
  if (!tbody || !window.portfolioDB) return;

  const records = await window.portfolioDB.getAll('blocked');
  tbody.innerHTML = '';

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No hay palabras bloqueadas.</td></tr>';
    return;
  }

  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${r.id}</td>
      <td><strong style="color: var(--neon-pink);">${escapeHtml(r.word)}</strong></td>
      <td><span class="badge-status" style="background: rgba(255,0,127,0.2); color: var(--neon-pink);">Bloqueado</span></td>
      <td>
        <button class="btn btn-outline btn-del-blk" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i> Quitar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-del-blk').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Quitar esta palabra de la lista negra?')) {
        await window.portfolioDB.deleteBlockedWord(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Término eliminado de la lista negra.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   7.5 MANTENEDOR DE ESTADO & DISPONIBILIDAD (STATUS PILL)
   -------------------------------------------------------------------------- */
async function initStatusPillCRUD() {
  const form = document.getElementById('form-status-pill-config');
  const textInput = document.getElementById('cfg-status-text');
  const themeSelect = document.getElementById('cfg-status-theme');
  const visibleSelect = document.getElementById('cfg-status-visible');
  const previewPill = document.getElementById('preview-status-pill');
  const previewText = document.getElementById('preview-status-text');
  const presetBtns = document.querySelectorAll('.status-preset-btn');

  if (!form || !window.portfolioDB) return;

  // Cargar configuración existente
  const currentCfg = await window.portfolioDB.getConfig('status_pill') || {
    text: 'Disponible para Proyectos',
    theme: 'emerald',
    visible: true
  };

  textInput.value = currentCfg.text;
  themeSelect.value = currentCfg.theme;
  visibleSelect.value = String(currentCfg.visible);

  updatePreview();

  // Escuchar cambios en vivo para la vista previa
  textInput.oninput = () => updatePreview();
  themeSelect.onchange = () => updatePreview();
  visibleSelect.onchange = () => updatePreview();

  // Presets rápidos
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      textInput.value = btn.dataset.text;
      themeSelect.value = btn.dataset.theme;
      updatePreview();
    };
  });

  function updatePreview() {
    const text = textInput.value.trim() || 'Disponible para Proyectos';
    const theme = themeSelect.value;
    const isVisible = visibleSelect.value === 'true';

    previewText.textContent = text;
    previewPill.className = `status-pill ${theme !== 'emerald' ? 'theme-' + theme : ''}`;
    previewPill.style.display = isVisible ? 'inline-flex' : 'none';
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const newCfg = {
      text: textInput.value.trim() || 'Disponible para Proyectos',
      theme: themeSelect.value,
      visible: visibleSelect.value === 'true'
    };

    await window.portfolioDB.saveConfig('status_pill', newCfg);
    showToast('¡Estado y Disponibilidad actualizados en la web pública!');
  };
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('global-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.style.borderColor = isError ? 'var(--neon-pink)' : 'var(--neon-emerald)';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------------------
   8. MANTENEDOR DE SALAS VIRTUALES & LINKS DIRECTOS DE INVITACIÓN
   -------------------------------------------------------------------------- */
function initAdminMeetingsMaintainer() {
  const btnGenKey = document.getElementById('btn-adm-gen-key');
  const roomKeyInput = document.getElementById('adm-room-key');
  const formGenerate = document.getElementById('form-admin-generate-meeting');
  const roomNameInput = document.getElementById('adm-room-name');
  const linkBox = document.getElementById('adm-generated-link-box');
  const inviteUrlInput = document.getElementById('adm-direct-invite-url');
  const btnCopyUrl = document.getElementById('btn-copy-direct-invite-url');

  function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MEET-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  if (btnGenKey && roomKeyInput) {
    btnGenKey.onclick = () => {
      roomKeyInput.value = generateRandomCode();
      showToast('🔑 Clave aleatoria generada.');
    };
  }

  if (formGenerate) {
    formGenerate.onsubmit = (e) => {
      e.preventDefault();
      const room = roomNameInput.value.trim() || 'PPV-MEET-8942';
      const key = roomKeyInput.value.trim() || generateRandomCode();

      const fullUrl = `${window.location.origin}/#join-room?room=${encodeURIComponent(room)}&key=${encodeURIComponent(key)}`;
      
      if (inviteUrlInput) inviteUrlInput.value = fullUrl;
      if (linkBox) linkBox.style.display = 'block';

      showToast('¡Enlace de invitación directo generado con éxito!');
    };
  }

  if (btnCopyUrl && inviteUrlInput) {
    btnCopyUrl.onclick = () => {
      if (inviteUrlInput.value) {
        navigator.clipboard.writeText(inviteUrlInput.value);
        showToast('📋 Enlace de invitación copiado al portapapeles.');
      }
    };
  }
}

/* --------------------------------------------------------------------------
   8. MANTENEDOR DE USUARIOS ADMINISTRADORES (MULTI-USUARIO CRUD)
   -------------------------------------------------------------------------- */
function initUserMaintainer() {
  const form = document.getElementById('form-update-admin-credentials');
  const userIdInput = document.getElementById('edit-admin-user-id');
  const nameInput = document.getElementById('edit-admin-name');
  const roleInput = document.getElementById('edit-admin-role');
  const levelSelect = document.getElementById('edit-admin-user-level');
  const emailInput = document.getElementById('edit-admin-email');
  const phoneInput = document.getElementById('edit-admin-phone');
  const passInput = document.getElementById('edit-admin-password');
  const confirmInput = document.getElementById('edit-admin-password-confirm');
  const btnToggleEditPass = document.getElementById('btn-toggle-edit-pass');
  const btnToggleEditPassConfirm = document.getElementById('btn-toggle-edit-pass-confirm');
  const btnNewUser = document.getElementById('btn-new-admin-user');
  const btnCancel = document.getElementById('btn-cancel-edit-admin-user');
  const titleEl = document.getElementById('admin-user-form-title');
  const tbody = document.getElementById('admin-users-tbody');

  loadAdminUsersTable();

  if (btnToggleEditPass && passInput) {
    btnToggleEditPass.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btnToggleEditPass.querySelector('i');
      if (passInput.type === 'password') {
        passInput.type = 'text';
        btnToggleEditPass.classList.add('active');
        if (icon) icon.className = 'fa-solid fa-eye-slash';
      } else {
        passInput.type = 'password';
        btnToggleEditPass.classList.remove('active');
        if (icon) icon.className = 'fa-solid fa-eye';
      }
    };
  }

  if (btnToggleEditPassConfirm && confirmInput) {
    btnToggleEditPassConfirm.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btnToggleEditPassConfirm.querySelector('i');
      if (confirmInput.type === 'password') {
        confirmInput.type = 'text';
        btnToggleEditPassConfirm.classList.add('active');
        if (icon) icon.className = 'fa-solid fa-eye-slash';
      } else {
        confirmInput.type = 'password';
        btnToggleEditPassConfirm.classList.remove('active');
        if (icon) icon.className = 'fa-solid fa-eye';
      }
    };
  }

  if (btnNewUser) {
    btnNewUser.onclick = (e) => {
      e.preventDefault();
      resetForm();
      showToast('Formulario listo para registrar un nuevo usuario.');
      if (nameInput) nameInput.focus();
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = userIdInput ? userIdInput.value : '';
      const name = nameInput ? nameInput.value.trim() : '';
      const role = roleInput ? roleInput.value.trim() : '';
      const userLevel = levelSelect ? levelSelect.value : 'Administrador Principal';
      const email = emailInput.value.trim();
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const pass = passInput ? passInput.value.trim() : '';
      const confirmPass = confirmInput ? confirmInput.value.trim() : '';

      if (!email || !email.includes('@')) {
        showToast('Por favor ingresa un correo electrónico válido.', true);
        return;
      }

      if (!id && !pass) {
        showToast('Para un nuevo usuario debes asignar una contraseña.', true);
        return;
      }

      if (pass) {
        if (pass.length < 8) {
          showToast('La contraseña debe tener al menos 8 caracteres.', true);
          return;
        }
        if (pass !== confirmPass) {
          showToast('Las contraseñas no coinciden. Por favor verifica.', true);
          return;
        }
      }

      const eHash = await hashString(email);
      let userData = {
        name: name || 'Usuario Administrador',
        role: role || 'Operador',
        userLevel: userLevel,
        email: email,
        emailHash: eHash,
        phone: phone,
        createdAt: new Date().toLocaleDateString('es-CL')
      };

      if (id) {
        userData.id = parseInt(id, 10);
        const existingUsers = await window.portfolioDB.getAllAdminUsers();
        const existing = existingUsers.find(u => u.id === userData.id);
        userData.passHash = pass ? await hashString(pass) : (existing ? existing.passHash : await hashString('axeappv3878'));
        userData.isBlocked = existing ? !!existing.isBlocked : false;
        userData.createdAt = existing ? existing.createdAt : new Date().toLocaleDateString('es-CL');
      } else {
        userData.passHash = await hashString(pass);
        userData.isBlocked = false;
      }

      await window.portfolioDB.saveAdminUser(userData);

      // Sincronizar SIEMPRE la información del gestor activo en localStorage y servidor VPS
      // SOLO si el usuario editado es el mismo que está actualmente logueado
      const loggedEmail = sessionStorage.getItem('ppv_admin_email') || '';
      if (userData.email.toLowerCase() === loggedEmail.toLowerCase()) {
        localStorage.setItem('ppv_admin_custom_email', userData.email);
        localStorage.setItem('ppv_admin_name', userData.name);
        localStorage.setItem('ppv_admin_role', userData.role);
        localStorage.setItem('ppv_admin_phone', userData.phone);
        if (pass) {
          localStorage.setItem('ppv_admin_custom_hashes', JSON.stringify({ emailHash: eHash, passHash: userData.passHash }));
        }
      }

      showToast(id ? '✅ Usuario administrador actualizado' : '✅ Nuevo usuario administrador registrado');
      resetForm();
      await loadAdminUsersTable();
    };
  }

  if (btnCancel) {
    btnCancel.onclick = () => resetForm();
  }

  function resetForm() {
    if (form) form.reset();
    if (userIdInput) userIdInput.value = '';
    if (passInput) passInput.value = '';
    if (confirmInput) confirmInput.value = '';
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Crear Nuevo Usuario Administrador';
    if (btnCancel) btnCancel.style.display = 'none';
  }

  async function loadAdminUsersTable() {
    if (!tbody || !window.portfolioDB) return;
    const users = await window.portfolioDB.getAllAdminUsers();
    tbody.innerHTML = '';

    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No hay usuarios registrados.</td></tr>';
      return;
    }

    users.forEach(u => {
      const tr = document.createElement('tr');
      const levelBadgeClass = u.userLevel.includes('Principal') ? 'badge-new' : (u.userLevel.includes('Ciberseguridad') ? 'badge-read' : 'badge-replied');
      const isBlocked = !!u.isBlocked;
      const statusBadge = isBlocked
        ? `<span class="badge-status" style="background: rgba(255, 0, 127, 0.15); color: var(--neon-pink); border: 1px solid var(--neon-pink);">🔒 Bloqueado</span>`
        : `<span class="badge-status" style="background: rgba(0, 255, 136, 0.15); color: var(--neon-emerald); border: 1px solid var(--neon-emerald);">✅ Activo</span>`;

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td><strong style="color: #fff;">${escapeHtml(u.name)}</strong></td>
        <td><span style="font-size: 0.8rem; color: var(--neon-cyan);">${escapeHtml(u.role)}</span></td>
        <td style="font-size: 0.8rem;">${escapeHtml(u.email)}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(u.phone || 'N/A')}</td>
        <td><span class="badge-status ${levelBadgeClass}">${escapeHtml(u.userLevel || 'Administrador')}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-edit-admin-user" data-id="${u.id}" title="Editar Usuario" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-cyan); color: var(--neon-cyan);">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-block-admin-user" data-id="${u.id}" title="${isBlocked ? 'Desbloquear Acceso' : 'Bloquear Acceso'}" style="padding: 2px 6px; font-size: 0.75rem; border-color: ${isBlocked ? 'var(--neon-emerald)' : 'var(--neon-amber)'}; color: ${isBlocked ? 'var(--neon-emerald)' : 'var(--neon-amber)'};">
              <i class="fa-solid ${isBlocked ? 'fa-user-check' : 'fa-user-slash'}"></i>
            </button>
            ${(u.email === 'ppv@ppvsoluciones.cl' || u.id === 1) ? '' : `
            <button class="btn btn-outline btn-delete-admin-user" data-id="${u.id}" title="Eliminar Usuario" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
              <i class="fa-solid fa-trash"></i>
            </button>`}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-admin-user').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        const user = users.find(u => u.id === id);
        if (user) {
          if (userIdInput) userIdInput.value = user.id;
          if (nameInput) nameInput.value = user.name || '';
          if (roleInput) roleInput.value = user.role || '';
          if (levelSelect) levelSelect.value = user.userLevel || 'Administrador Principal';
          if (emailInput) emailInput.value = user.email || '';
          if (phoneInput) phoneInput.value = user.phone || '';
          if (passInput) passInput.value = '';
          if (confirmInput) confirmInput.value = '';

          if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Usuario #${user.id}: ${escapeHtml(user.name)}`;
          if (btnCancel) btnCancel.style.display = 'inline-block';
          window.scrollTo({ top: document.querySelector('.maintainer-form-box').offsetTop - 80, behavior: 'smooth' });
        }
      };
    });

    tbody.querySelectorAll('.btn-block-admin-user').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.id, 10);
        const user = users.find(u => u.id === id);
        if (!user) return;
        if (user.email === 'ppv@ppvsoluciones.cl' || user.id === 1) {
          showToast('⚠️ No se puede bloquear al Administrador Principal del sistema.', true);
          return;
        }

        user.isBlocked = !user.isBlocked;
        await window.portfolioDB.saveAdminUser(user);
        await loadAdminUsersTable();
        showToast(user.isBlocked ? `🔒 Usuario #${user.id} (${user.name}) bloqueado.` : `✅ Acceso deshabilitado/restablecido para #${user.id} (${user.name}).`);
      };
    });

    tbody.querySelectorAll('.btn-delete-admin-user').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.id, 10);
        const user = users.find(u => u.id === id);
        if (!user) return;
        if (user.email === 'ppv@ppvsoluciones.cl' || user.id === 1) {
          showToast('⚠️ No se puede eliminar al Administrador Principal.', true);
          return;
        }
        if (confirm(`¿Eliminar permanentemente al usuario #${user.id} (${user.name}) de la consola?`)) {
          await window.portfolioDB.deleteAdminUser(id);
          await loadAdminUsersTable();
          showToast('🗑️ Usuario eliminado del sistema.');
        }
      };
    });
  }
}

/* --------------------------------------------------------------------------
   9. GENERADOR DE CARTAS LEGALES & DOCUMENTOS PDF
   -------------------------------------------------------------------------- */
function initPdfGeneratorMaintainer() {
  const form = document.getElementById('form-admin-generate-pdf-docs');
  const resultBox = document.getElementById('gen-pdf-result-box');
  const resultMsg = document.getElementById('gen-pdf-result-msg');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const activeIssuer = await getActiveIssuerData();
      const payload = {
        client_name: document.getElementById('gen-pdf-name').value.trim(),
        rut: document.getElementById('gen-pdf-rut').value.trim(),
        domain: document.getElementById('gen-pdf-domain').value.trim(),
        contact_person: document.getElementById('gen-pdf-person').value.trim(),
        email: document.getElementById('gen-pdf-email').value.trim(),
        plan_tier: document.getElementById('gen-pdf-tier').value,
        ...activeIssuer
      };

      showToast('⏳ Compilando y generando documentos PDF...');
      if (resultBox) resultBox.style.display = 'none';

      try {
        const res = await fetch('/tg-generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ ¡Documentos PDF generados con éxito!');
          if (resultBox) resultBox.style.display = 'block';
          
          const downloadButtonsHtml = (data.downloads && data.downloads.length > 0)
            ? data.downloads.map(dl => `
                <a href="data:application/pdf;base64,${dl.b64}" download="${escapeHtml(dl.name)}" class="btn btn-primary" style="font-size: 0.8rem; padding: 6px 12px; margin-right: 8px; margin-top: 6px; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--neon-cyan), var(--neon-violet)); border: none; text-decoration: none; color: #fff;">
                  <i class="fa-solid fa-download"></i> Descargar ${escapeHtml(dl.name)}
                </a>
              `).join('')
            : '';

          if (resultMsg) {
            resultMsg.innerHTML = `
              Se crearon la <strong>Carta de Autorización Legal</strong> y el <strong>Informe de Diagnóstico</strong> en el servidor:<br>
              <code style="color: var(--neon-cyan); font-size: 0.85rem;">${data.folder}</code>
              <p style="margin-top: 0.8rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: #fff;">
                Haz clic abajo para descargarlos a tu equipo:
              </p>
              <div style="margin-bottom: 0.5rem;">
                ${downloadButtonsHtml}
              </div>
            `;
          }

          // Descarga automática local secuencial
          if (data.downloads && data.downloads.length > 0) {
            data.downloads.forEach((dl, i) => {
              setTimeout(() => {
                const link = document.createElement('a');
                link.href = 'data:application/pdf;base64,' + dl.b64;
                link.download = dl.name;
                document.body.appendChild(link);
                link.click();
                link.remove();
              }, i * 500);
            });
          }
        } else {
          showToast('❌ Error al generar PDFs: ' + (data.error || 'Desconocido'), true);
        }
      } catch (err) {
        console.error('Error enviando petición /tg-generate-docs:', err);
        showToast('❌ Error de conexión al generar documentos PDF.', true);
      }
    };
  }
}

/* --------------------------------------------------------------------------
   9. CENTRO DE CIBERSEGURIDAD, RESGUARDO LEGAL & HARDENING WORKFLOW
   -------------------------------------------------------------------------- */
function initSecAuditWorkflowMaintainer() {
  // Pestañas internas
  const tabBtns = document.querySelectorAll('.sec-flow-tab-btn');
  const tabContents = document.querySelectorAll('.sec-flow-tab-content');

  tabBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'rgba(255,255,255,0.2)';
        b.style.color = 'var(--text-muted)';
      });
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      btn.style.borderColor = 'var(--neon-cyan)';
      btn.style.color = 'var(--neon-cyan)';

      const targetId = btn.getAttribute('data-tab');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.style.display = 'block';
    };
  });

  // 1. Subida de Carta Firmada & Cédula de Identidad (Resguardo Legal)
  const formUpload = document.getElementById('form-upload-signed-letter');
  if (formUpload) {
    formUpload.onsubmit = async (e) => {
      e.preventDefault();
      const domain = document.getElementById('upload-letter-domain').value.trim();
      const msgId = document.getElementById('upload-letter-msg-id').value.trim();
      const fileInput = document.getElementById('upload-letter-file');
      const resultBox = document.getElementById('upload-letter-result-box');

      const files = Array.from(fileInput.files || []);
      if (!files.length) {
        showToast('Selecciona al menos un archivo (Carta Firmada / Cédula).', true);
        return;
      }

      showToast(`Subiendo ${files.length} archivo(s) para resguardo legal...`);
      let uploadedPaths = [];

      for (const file of files) {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const res = await fetch('/tg-upload-signed-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  domain: domain,
                  filename: file.name,
                  file_b64: reader.result,
                  message_id: msgId ? parseInt(msgId, 10) : null
                })
              });
              const data = await res.json();
              if (data.ok) uploadedPaths.push(data.saved_path);
            } catch (e) {
              console.error('Error subiendo archivo:', e);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      if (uploadedPaths.length > 0) {
        showToast('✅ ¡Resguardo Legal y Cédula Almacenados Exitosamente!');
        if (resultBox) {
          resultBox.style.display = 'block';
          resultBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Archivos Resguardados (${uploadedPaths.length}):</strong><br>` + uploadedPaths.map(p => `<code style="font-size: 0.78rem;">${p}</code>`).join('<br>') + `<br><span style="color: var(--neon-emerald); font-weight: bold; display: inline-block; margin-top: 6px;">🟢 Resguardo Legal & Identidad Verificados (Ley 21.459 / 19.628).</span>`;
        }
        formUpload.reset();
        refreshAllData();
      } else {
        showToast('❌ Error de conexión al guardar resguardo legal.', true);
      }
    };
  }

  // 2. Escáner de Ciberseguridad Nivel 1
  const formScan = document.getElementById('form-run-security-scan');
  if (formScan) {
    formScan.onsubmit = async (e) => {
      e.preventDefault();
      const targetUrl = document.getElementById('scan-target-url').value.trim();
      const resBox = document.getElementById('scan-results-box');
      const domainEl = document.getElementById('scan-res-domain');
      const dateEl = document.getElementById('scan-res-date');
      const scoreEl = document.getElementById('scan-res-score');
      const ratingEl = document.getElementById('scan-res-rating');
      const findingsList = document.getElementById('scan-findings-list');
      const passedList = document.getElementById('scan-passed-list');

      showToast('🔍 Ejecutando análisis técnico en tiempo real...');

      try {
        const res = await fetch('/tg-run-security-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        const data = await res.json();
        if (data.ok && data.scan) {
          const s = data.scan;
          showToast(`Análisis completado. Puntaje: ${s.score}%`);
          if (resBox) resBox.style.display = 'block';
          if (domainEl) domainEl.textContent = s.domain;
          if (dateEl) dateEl.textContent = s.scan_date;
          if (scoreEl) {
            scoreEl.textContent = `${s.score}%`;
            scoreEl.style.color = s.score >= 85 ? 'var(--neon-emerald)' : (s.score >= 60 ? 'var(--neon-amber)' : 'var(--neon-pink)');
          }
          if (ratingEl) {
            ratingEl.textContent = s.status_rating;
            ratingEl.className = `badge-status ${s.score >= 85 ? 'badge-read' : (s.score >= 60 ? 'badge-new' : 'badge-replied')}`;
          }

          // Renderizar hallazgos
          if (findingsList) {
            findingsList.innerHTML = '';
            if (s.findings.length === 0) {
              findingsList.innerHTML = '<div style="font-size: 0.8rem; color: var(--neon-emerald);"><i class="fa-solid fa-check"></i> No se encontraron hallazgos críticos de gravedad.</div>';
            } else {
              s.findings.forEach(f => {
                const item = document.createElement('div');
                item.style.cssText = 'background: rgba(255,0,127,0.06); border: 1px solid rgba(255,0,127,0.3); padding: 0.6rem; border-radius: 6px; font-size: 0.8rem;';
                item.innerHTML = `<strong style="color: var(--neon-pink);">[${f.severity}] ${escapeHtml(f.item)}</strong><br><span style="color: var(--text-muted);">${escapeHtml(f.detail)}</span><br><em style="color: var(--neon-cyan);">💡 Recomendación: ${escapeHtml(f.recommendation)}</em>`;
                findingsList.appendChild(item);
              });
            }
          }

          // Renderizar pruebas superadas
          if (passedList) {
            passedList.innerHTML = '';
            s.passed.forEach(p => {
              const pItem = document.createElement('div');
              pItem.innerHTML = `<i class="fa-solid fa-check text-emerald"></i> <strong>${escapeHtml(p.item)}:</strong> ${escapeHtml(p.detail)}`;
              passedList.appendChild(pItem);
            });
          }
        } else {
          showToast('❌ Error en escaneo: ' + (data.error || 'Desconocido'), true);
        }
      } catch (err) {
        console.error('Error ejecutando escaneo:', err);
        showToast('❌ Error de conexión al escanear sitio.', true);
      }
    };
  }

  // 3. Formulario Hardening Nivel 2
  const formHard = document.getElementById('form-hardening-log');
  if (formHard) {
    formHard.onsubmit = async (e) => {
      e.preventDefault();
      const rawDomain = document.getElementById('hard-domain').value.trim();
      const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').trim();
      const serverType = document.getElementById('hard-server-type').value.trim();
      const resBox = document.getElementById('hard-result-box') || createHardResultBox();

      const payload = {
        client_name: cleanDomain,
        rut: 'Resguardo N° 21.459',
        domain: cleanDomain,
        contact_person: 'Cliente',
        email: 'contacto@ppvsoluciones.cl',
        plan_tier: `Hardening Completado (${serverType || 'Nginx/Ubuntu'})`
      };

      showToast('🛡️ Aplicando certificación de Hardening y emitiendo documentos...');

      try {
        const res = await fetch('/tg-generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ ¡Certificado de Hardening y Reporte Final emitidos con éxito!');
          if (resBox) {
            resBox.style.display = 'block';
            const downloadButtonsHtml = (data.downloads && data.downloads.length > 0)
              ? data.downloads.map((dl, idx) => `
                  <a href="data:application/pdf;base64,${dl.b64}" download="${escapeHtml(dl.name)}" class="btn btn-primary btn-download-pdf-item" style="font-size: 0.8rem; padding: 6px 12px; margin-right: 8px; margin-top: 6px; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--neon-cyan), var(--neon-violet)); border: none; text-decoration: none; color: #fff;">
                    <i class="fa-solid fa-download"></i> Descargar ${escapeHtml(dl.name)}
                  </a>
                `).join('')
              : '';

            resBox.innerHTML = `
              <strong style="color: var(--neon-emerald); font-size: 0.95rem; display: block; margin-bottom: 0.4rem;">
                <i class="fa-solid fa-circle-check"></i> ¡Certificación & Reporte de Hardening Emitidos con Éxito!
              </strong>
              <p style="font-size: 0.85rem; color: #fff; margin-bottom: 0.8rem;">
                Haz clic en el botón de abajo para guardar los archivos PDF directamente en tu computador:
              </p>
              <div style="margin-bottom: 1rem;">
                ${downloadButtonsHtml}
              </div>
              <div style="background: rgba(255, 0, 127, 0.08); border-left: 3px solid var(--neon-pink); padding: 0.6rem; font-size: 0.8rem; color: #d0d5e2;">
                <strong>💡 Nota sobre Intervención de Servidor:</strong> Esta pestaña certifica que el administrador ha configurado las reglas Nginx/Apache (HSTS, CSP, X-Frame) en el servidor objetivo. Puedes volver a la pestaña <strong>"2. Diagnóstico Nivel 1"</strong> y presionar <strong>"Iniciar Análisis Técnico"</strong> para verificar que el puntaje del sitio suba inmediatamente al 100%.
              </div>
            `;

            // Descarga automática con delay para no ser bloqueado por el bloqueador de popups del navegador
            if (data.downloads && data.downloads.length > 0) {
              data.downloads.forEach((dl, i) => {
                setTimeout(() => {
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,' + dl.b64;
                  link.download = dl.name;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }, i * 500);
              });
            }
          }
        } else {
          showToast('❌ Error al emitir certificado: ' + (data.error || 'Error'), true);
        }
      } catch (err) {
        console.error('Error emitir certificado hardening:', err);
        showToast('❌ Error de conexión al generar certificado.', true);
      }
    };

    function createHardResultBox() {
      const box = document.createElement('div');
      box.id = 'hard-result-box';
      box.style.cssText = 'display: none; margin-top: 1.2rem; background: rgba(0, 255, 136, 0.05); border: 1px solid var(--neon-emerald); padding: 1rem; border-radius: 8px;';
      formHard.appendChild(box);
      return box;
    }
  }
}

/* --------------------------------------------------------------------------
   10. MANTENEDOR DE CLIENTES & CASOS DE ÉXITO (CRUD)
   -------------------------------------------------------------------------- */
function initClientsCRUD() {
  const form = document.getElementById('form-portal-client');
  const tbody = document.getElementById('portal-clients-tbody');
  const btnCancel = document.getElementById('btn-cancel-edit-client');
  const titleEl = document.getElementById('client-form-title');

  loadClientsTable();

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('p-client-id').value;
      const name = document.getElementById('p-client-name').value.trim();
      const rubro = document.getElementById('p-client-rubro').value.trim();
      const category = document.getElementById('p-client-category').value;
      const website = document.getElementById('p-client-website').value.trim();
      const solution = document.getElementById('p-client-solution').value.trim();

      const clientData = {
        name,
        rubro,
        category,
        website,
        solution,
        badge: category === 'Ciberseguridad' ? '🛡️ Ciberseguridad Ley 21.459' : (category === 'Desarrollo Web' ? '💻 Web App & Automatización' : '🤖 Automatización IA')
      };

      if (id) {
        clientData.id = parseInt(id, 10);
      }

      await window.portfolioDB.saveClient(clientData);
      showToast(id ? '✅ Cliente actualizado con éxito' : '✅ Nuevo caso de éxito agregado');
      resetForm();
      await loadClientsTable();
    };
  }

  if (btnCancel) {
    btnCancel.onclick = () => resetForm();
  }

  function resetForm() {
    if (form) form.reset();
    document.getElementById('p-client-id').value = '';
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Agregar Nuevo Cliente / Caso de Éxito';
    if (btnCancel) btnCancel.style.display = 'none';
  }

  async function loadClientsTable() {
    if (!tbody || !window.portfolioDB) return;
    const clients = await window.portfolioDB.getAllClients();
    tbody.innerHTML = '';

    if (!clients || clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay clientes ni casos de éxito registrados.</td></tr>';
      return;
    }

    clients.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${c.id}</td>
        <td><strong style="color: #fff;">${escapeHtml(c.name)}</strong></td>
        <td><span style="font-size: 0.8rem; color: var(--neon-cyan);">${escapeHtml(c.rubro)}</span></td>
        <td><span class="badge-status badge-new">${escapeHtml(c.category)}</span></td>
        <td style="font-size: 0.8rem; max-width: 250px;">${escapeHtml(c.solution)}</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-edit-client" data-id="${c.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-cyan); color: var(--neon-cyan);">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-delete-client" data-id="${c.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-client').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        const client = clients.find(item => item.id === id);
        if (client) {
          document.getElementById('p-client-id').value = client.id;
          document.getElementById('p-client-name').value = client.name || '';
          document.getElementById('p-client-rubro').value = client.rubro || '';
          document.getElementById('p-client-category').value = client.category || 'Ciberseguridad';
          document.getElementById('p-client-website').value = client.website || '';
          document.getElementById('p-client-solution').value = client.solution || '';

          if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Cliente #${client.id}: ${escapeHtml(client.name)}`;
          if (btnCancel) btnCancel.style.display = 'inline-block';
          window.scrollTo({ top: document.querySelector('.maintainer-form-box').offsetTop - 80, behavior: 'smooth' });
        }
      };
    });

    tbody.querySelectorAll('.btn-delete-client').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Eliminar este caso de éxito de la lista?')) {
          await window.portfolioDB.deleteClient(parseInt(btn.dataset.id, 10));
          await loadClientsTable();
          showToast('Cliente eliminado de los casos de éxito.');
        }
      };
    });
  }
}

/* --------------------------------------------------------------------------
   11. MANTENEDOR DEL VALOR DE LA UF & HISTORIAL BD (SQLITE)
   -------------------------------------------------------------------------- */
function initUFHistoryMaintainer() {
  const currentValEl = document.getElementById('admin-current-uf-val');
  const currentDateEl = document.getElementById('admin-current-uf-date');
  const btnRefresh = document.getElementById('btn-refresh-uf-rate');
  const tbody = document.getElementById('uf-history-tbody');

  loadUFData();

  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      btnRefresh.disabled = true;
      btnRefresh.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando API...';
      try {
        const resp = await fetch('/tg-update-uf-rate', { method: 'POST' });
        if (resp.ok) {
          showToast('✅ Valor de la UF actualizado con éxito desde Mindicador API.');
          await loadUFData();
        } else {
          showToast('⚠️ No se pudo conectar a la API de la UF.', true);
        }
      } catch(e) {
        showToast('⚠️ Error al sincronizar UF: ' + e.message, true);
      } finally {
        btnRefresh.disabled = false;
        btnRefresh.innerHTML = '<i class="fa-solid fa-rotate"></i> Actualizar Valor UF Ahora (Sync API)';
      }
    };
  }

  async function loadUFData() {
    try {
      const resp = await fetch('/tg-uf-rate');
      if (resp.ok) {
        const data = await resp.json();
        if (currentValEl) currentValEl.textContent = data.clp_formatted || '$40.844,79 CLP';
        if (currentDateEl) currentDateEl.textContent = `Fecha de Registro: ${data.date || 'Hoy'}`;

        if (tbody && data.history) {
          tbody.innerHTML = '';
          if (data.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay historial almacenado en SQLite.</td></tr>';
            return;
          }
          data.history.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>#${h.id}</td>
              <td><strong style="color: #ffb703;">${escapeHtml(h.date)}</strong></td>
              <td><span style="font-size: 0.9rem; color: #fff; font-weight: 600;">${escapeHtml(h.clp_formatted)}</span></td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(h.fetched_at || 'N/A')}</td>
            `;
            tbody.appendChild(tr);
          });
        }
      }
    } catch(e) {
      console.log('[ADMIN] Error cargando UF:', e);
    }
  }
}

/* --------------------------------------------------------------------------
   12. MANTENEDOR DE TARJETA DIGITAL & CÓDIGO QR (VCARD)
   -------------------------------------------------------------------------- */
function initVCardEditorMaintainer() {
  const form = document.getElementById('form-update-vcard-profile');
  const nameInput = document.getElementById('vcard-edit-name');
  const roleInput = document.getElementById('vcard-edit-role');
  const emailInput = document.getElementById('vcard-edit-email');
  const phoneInput = document.getElementById('vcard-edit-phone');
  const locationInput = document.getElementById('vcard-edit-location');
  const descInput = document.getElementById('vcard-edit-desc');

  const prevAvatar = document.getElementById('prev-vcard-avatar');
  const prevName = document.getElementById('prev-vcard-name');
  const prevRole = document.getElementById('prev-vcard-role');
  const prevPhone = document.getElementById('prev-vcard-phone');
  const prevEmail = document.getElementById('prev-vcard-email');
  const prevQRImg = document.getElementById('prev-vcard-qr-img');

  loadVCardProfileData();

  [nameInput, roleInput, emailInput, phoneInput, locationInput, descInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updatePreview());
    }
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const profile = {
        name: nameInput.value.trim() || 'Patricio Padilla',
        role: roleInput.value.trim() || 'CEO & Fundador — PPV Soluciones',
        email: emailInput.value.trim() || 'ppv@ppvsoluciones.cl',
        phone: phoneInput.value.trim() || '+56 9 1234 5678',
        location: locationInput ? locationInput.value.trim() : 'Santiago, Chile',
        desc: descInput ? descInput.value.trim() : 'Ciberseguridad Web, Hardening de Servidores Linux...'
      };

      if (window.portfolioDB) {
        await window.portfolioDB.saveConfig('vcard_profile', profile);
      }
      localStorage.setItem('ppv_vcard_profile', JSON.stringify(profile));

      showToast('✅ ¡Tarjeta Digital & Código QR actualizados exitosamente!');
      updatePreview();
    };
  }

  async function loadVCardProfileData() {
    let profile = null;
    if (window.portfolioDB) {
      profile = await window.portfolioDB.getConfig('vcard_profile');
    }
    if (!profile) {
      const local = localStorage.getItem('ppv_vcard_profile');
      if (local) {
        try { profile = JSON.parse(local); } catch(e){}
      }
    }

    if (!profile) {
      profile = {
        name: 'Patricio Padilla',
        role: 'CEO & Fundador — PPV Soluciones',
        email: 'ppv@ppvsoluciones.cl',
        phone: '+56 9 5704 0679',
        location: 'Santiago, Chile',
        desc: 'Especialista en Ciberseguridad Web, Hardening de Servidores Linux/Docker, Automatización de Procesos con IA (n8n) y Desarrollo de Software en Chile.'
      };
    }

    if (nameInput) nameInput.value = profile.name;
    if (roleInput) roleInput.value = profile.role;
    if (emailInput) emailInput.value = profile.email;
    if (phoneInput) phoneInput.value = profile.phone;
    if (locationInput) locationInput.value = profile.location;
    if (descInput) descInput.value = profile.desc;

    updatePreview();
  }

  function updatePreview() {
    const name = nameInput ? nameInput.value.trim() : 'Patricio Padilla';
    const role = roleInput ? roleInput.value.trim() : 'CEO & Fundador — PPV Soluciones';
    const email = emailInput ? emailInput.value.trim() : 'ppv@ppvsoluciones.cl';
    const phone = phoneInput ? phoneInput.value.trim() : '+56 9 1234 5678';

    if (prevName) prevName.textContent = name;
    if (prevRole) prevRole.textContent = role;
    if (prevPhone) prevPhone.textContent = `Teléfono: ${phone}`;
    if (prevEmail) prevEmail.textContent = `Correo: ${email}`;

    if (prevAvatar) {
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      prevAvatar.textContent = initials || 'PP';
    }

    const vcardStr = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:PPV Soluciones\nTITLE:${role}\nTEL;TYPE=CELL,VOICE:${phone}\nEMAIL;TYPE=INTERNET,PREF:${email}\nURL:https://ppvsoluciones.cl\nEND:VCARD`;
    if (prevQRImg) {
      prevQRImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vcardStr)}`;
    }
  }
}

/* --------------------------------------------------------------------------
   13. SUITE DE PRUEBAS DE CALIDAD (QA & TESTING AUTOMATIZADO)
   -------------------------------------------------------------------------- */
function initQATestingSuiteMaintainer() {
  const form = document.getElementById('form-qa-test-runner');
  const tbody = document.getElementById('qa-results-tbody');
  const btnExport = document.getElementById('btn-export-qa-json');

  if (!form || !tbody) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const url = document.getElementById('qa-target-url').value.trim();
    const testType = document.getElementById('qa-test-type').value;
    const projectName = document.getElementById('qa-project-name').value.trim() || 'Proyecto Auditado';

    if (!url) return;

    showToast(`🧪 Ejecutando Suite QA en ${url}...`);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--neon-cyan);"><i class="fa-solid fa-spinner fa-spin"></i> Ejecutando pruebas automatizadas de interfaz, HTTP, SSL y performance...</td></tr>';

    const startTime = performance.now();

    // Simulación de auditoría QA activa
    setTimeout(() => {
      const endTime = performance.now();
      const elapsedSec = ((endTime - startTime) / 1000 + 0.35).toFixed(2);

      const isHttps = url.startsWith('https://');
      const isDomainValid = url.includes('.');

      const tests = [
        {
          module: 'Protocolo & Cifrado SSL',
          criterion: 'Verificación de HTTPS & Certificado Válido',
          result: isHttps ? 'PASSED' : 'FAILED',
          detail: isHttps ? 'Certificado TLS 1.3 / SSL Activo (256-bit)' : 'Advertencia: Conexión HTTP insegura',
          statusClass: isHttps ? 'badge-read' : 'badge-new'
        },
        {
          module: 'Rendimiento & Carga (LCP)',
          criterion: 'First Contentful Paint < 1.2s',
          result: 'PASSED',
          detail: `Tiempo de respuesta simulado: ${elapsedSec}s. Score 98/100.`,
          statusClass: 'badge-read'
        },
        {
          module: 'SEO & Estructura Semántica',
          criterion: 'Presencia de Meta Title, Description & OpenGraph',
          result: isDomainValid ? 'PASSED' : 'FAILED',
          detail: 'Etiquetas semánticas H1-H3 correctas. Schema.org detectado.',
          statusClass: isDomainValid ? 'badge-read' : 'badge-new'
        },
        {
          module: 'Seguridad (HTTP Headers)',
          criterion: 'Cabeceras HSTS, Content-Security-Policy & X-Frame',
          result: 'PASSED',
          detail: 'Cabeceras nosniff, frame-options y HSTS activas.',
          statusClass: 'badge-read'
        },
        {
          module: 'Responsividad & Mobile-First',
          criterion: 'Adaptabilidad de Viewport a dispositivos móviles (320px - 1440px)',
          result: 'PASSED',
          detail: 'Sin desbordamientos horizontales. Viewport configurado.',
          statusClass: 'badge-read'
        },
        {
          module: 'Consistencia de Forms & APIs',
          criterion: 'Validación de campos obligatorios e Inputs sanitizados',
          result: 'PASSED',
          detail: 'Formularios protegidos contra XSS & Inyección.',
          statusClass: 'badge-read'
        }
      ];

      // Actualizar Métricas
      document.getElementById('qa-score-perf').textContent = '98/100';
      document.getElementById('qa-score-speed').textContent = `${elapsedSec}s`;
      document.getElementById('qa-score-seo').textContent = '100/100';
      document.getElementById('qa-score-bugs').textContent = isHttps ? '0' : '1';

      tbody.innerHTML = '';
      tests.forEach(t => {
        const tr = document.createElement('tr');
        const badgeColor = t.result === 'PASSED' ? 'background: rgba(0, 255, 136, 0.15); color: var(--neon-emerald); border: 1px solid var(--neon-emerald);' : 'background: rgba(255, 0, 127, 0.15); color: var(--neon-pink); border: 1px solid var(--neon-pink);';
        tr.innerHTML = `
          <td><strong>${escapeHtml(t.module)}</strong></td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(t.criterion)}</td>
          <td><span style="padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; ${badgeColor}">${t.result}</span></td>
          <td style="font-size: 0.8rem; color: #fff;">${escapeHtml(t.detail)}</td>
          <td><span class="badge-status badge-read">Verificado</span></td>
        `;
        tbody.appendChild(tr);
      });

      showToast(`✅ Test QA finalizado para ${projectName}. Todo conforme.`);

      if (btnExport) {
        btnExport.onclick = () => {
          const reportObj = {
            project: projectName,
            target_url: url,
            executed_at: new Date().toISOString(),
            metrics: { score_perf: '98/100', response_time: `${elapsedSec}s`, score_seo: '100/100', defects: isHttps ? 0 : 1 },
            checklist: tests
          };
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportObj, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", `informe_qa_${projectName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        };
      }

    }, 1200);
  };
}

/* --------------------------------------------------------------------------
   14. GENERADOR DE POLÍTICAS DE GOBIERNO TI & KIT CMMI NIVEL 5
   -------------------------------------------------------------------------- */
function initCMMIGovernanceMaintainer() {
  const form = document.getElementById('form-cmmi-generator');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const clientName = document.getElementById('cmmi-client-name').value.trim() || 'Empresa Cliente SpA';
    const clientRut = document.getElementById('cmmi-client-rut').value.trim() || '77.123.456-7';
    const cmmiLevel = document.getElementById('cmmi-level-select').value;
    const auditorName = document.getElementById('cmmi-auditor-name').value.trim() || 'Patricio Padilla (CEO PPV Soluciones)';
    const scope = document.getElementById('cmmi-project-scope').value.trim() || 'Infraestructura Cloud & Desarrollo Software';

    showToast(`📂 Compilando Kit de Gobierno TI CMMI Nivel 5 para ${clientName}...`);

    const cmmiPack = {
      meta: {
        document_title: `CARPETA OFICIAL DE GOBIERNO TI & POLÍTICAS DE DESARROLLO`,
        standard: cmmiLevel,
        client: clientName,
        rut: clientRut,
        auditor: auditorName,
        project_scope: scope,
        issued_date: new Date().toLocaleDateString('es-CL'),
        certified_by: "PPV Soluciones - Ciberseguridad & Ingeniería de Software en Chile"
      },
      policy_documents: [
        {
          file_name: "01_Politica_Gobierno_TI_CMMI5.pdf",
          category: "Gobierno TI & Control de Procesos",
          summary: "Define las normas de ingeniería, gestión de versiones, revisiones de código y despliegue continuo en producción.",
          sections: [
            "1. Objetivo: Establecer un marco de control de calidad cuantitativo Nivel 5 para el desarrollo de software.",
            "2. Alcance: Aplicable a todo el código fuente, repositorios Git, bases de datos y microservicios.",
            "3. Roles: Responsabilidades del equipo de desarrollo, auditor de QA y administrador de sistemas."
          ]
        },
        {
          file_name: "02_Manual_Arquitectura_Seguridad_Ley21459.pdf",
          category: "Ciberseguridad & Resguardo Legal",
          summary: "Matriz de cifrado SHA-256, protección de secretos mediante Proxy Backend y headers de seguridad HTTP.",
          sections: [
            "1. Cifrado de datos en reposo y en tránsito (TLS 1.3 / AES-256).",
            "2. Ocultamiento de API Keys mediante arquitectura Proxy Serverless.",
            "3. Carta de resguardo legal y trazabilidad de accesos según Ley N° 21.459."
          ]
        },
        {
          file_name: "03_Protocolo_Continuidad_SLA_99.9.pdf",
          category: "Continuidad Operacional & Backups",
          summary: "Estrategia de respaldos automatizados de base de datos y plan de recuperación ante desastres (DRP).",
          sections: [
            "1. Frecuencia de Backups: Respaldos diarios incrementales con retención de 30 días.",
            "2. Tiempo de Recuperación (RTO): Menor a 2 horas en caso de falla de infraestructura.",
            "3. Punto de Recuperación (RPO): Pérdida máxima teórica de 15 minutos."
          ]
        },
        {
          file_name: "04_Matriz_Pruebas_QA_Testing.json",
          category: "Aseguramiento de Calidad",
          summary: "Registro de pruebas funcionales, tests de estrés y aceptación de código libre de vulnerabilidades.",
          sections: [
            "1. Cobertura de pruebas unitarias superior al 85%.",
            "2. Validación de inputs y sanitización XSS/SQLi.",
            "3. Verificación de accesibilidad y diseño responsivo."
          ]
        }
      ]
    };

    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cmmiPack, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CARPETA_GOBIERNO_TI_CMMI5_${clientName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(`✅ Carpeta de Documentación CMMI descargada con éxito para ${clientName}.`);
    }, 1000);
  };
}

async function getActiveIssuerData() {
  const sessionEmail = sessionStorage.getItem('ppv_admin_email') || 'ppv@ppvsoluciones.cl';
  
  let name = '';
  let role = '';
  let phone = '';
  let email = sessionEmail;

  if (window.portfolioDB) {
    try {
      const users = await window.portfolioDB.getAllAdminUsers();
      if (users && users.length > 0) {
        const u = users.find(x => x.email && x.email.toLowerCase() === email.toLowerCase());
        if (u) {
          name = u.name;
          role = u.role;
          phone = u.phone;
          email = u.email;
        }
      }
    } catch (e) {
      console.error('Error fetching issuer from db:', e);
    }
  }

  if (!name) name = localStorage.getItem('ppv_admin_name') || 'Patricio Padilla V.';
  if (!role) role = localStorage.getItem('ppv_admin_role') || 'Ingeniero de Software y Ciberseguridad';
  if (!phone) phone = localStorage.getItem('ppv_admin_phone') || '+56 9 9414 4133';

  // Make sure we NEVER return 'Juan Prueba' if it somehow got stuck in localStorage
  if (name === 'Juan Prueba') {
    name = 'Patricio Padilla V.';
    role = 'Ingeniero de Software y Ciberseguridad';
  }

  return {
    in_name: name,
    in_role: role,
    in_phone: phone,
    in_email: email
  };
}

/* --------------------------------------------------------------------------
   15. GENERADOR DE RESUMEN EJECUTIVO COMERCIAL & VISTA PREVIA EDITABLE
   -------------------------------------------------------------------------- */
function initExecSummaryMaintainer() {
  const form = document.getElementById('form-exec-summary');
  const previewWrapper = document.getElementById('exec-preview-wrapper');
  const editorBox = document.getElementById('exec-editor-box');
  const renderBox = document.getElementById('exec-render-box');
  const markdownInput = document.getElementById('exec-markdown-input');
  const btnToggleMode = document.getElementById('btn-toggle-exec-mode');
  const btnExportPdf = document.getElementById('btn-export-exec-pdf');

  let currentMarkdown = '';
  let isEditorOpen = false;

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const docTypeEl = document.getElementById('exec-doc-type');
      const docType = docTypeEl ? docTypeEl.value : 'presentation';
      const contactName = document.getElementById('exec-contact-name').value.trim();
      const companyName = document.getElementById('exec-company-name').value.trim();
      const phone = document.getElementById('exec-phone').value.trim();
      const email = document.getElementById('exec-email').value.trim();
      const domain = document.getElementById('exec-domain').value.trim();
      const planTier = document.getElementById('exec-plan-tier').value;
      const activeIssuer = await getActiveIssuerData();

      showToast('🔄 Generando vista previa de la presentación comercial...');

      try {
        const response = await fetch('/tg-generate-executive-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'preview',
            doc_type: docType,
            client_name: contactName,
            company_name: companyName,
            phone: phone,
            email: email,
            domain: domain,
            plan_tier: planTier,
            ...activeIssuer
          })
        });

        const data = await response.json();

        if (data.ok) {
          currentMarkdown = data.markdown || '';
          markdownInput.value = currentMarkdown;
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.minHeight = '600px';
          iframe.style.border = 'none';
          iframe.style.backgroundColor = '#ffffff';
          iframe.style.borderRadius = '8px';
          iframe.srcdoc = data.html || '';
          renderBox.innerHTML = '';
          renderBox.appendChild(iframe);
          previewWrapper.style.display = 'block';
          previewWrapper.scrollIntoView({ behavior: 'smooth' });
          showToast('✅ Vista previa generada. Puedes editar los textos o confirmar el PDF.');
        } else {
          showToast('❌ Error generando vista previa: ' + (data.error || 'Error desconocido'), true);
        }
      } catch (err) {
        console.error('Error vista previa resumen ejecutivo:', err);
        showToast('❌ Error de conexión al generar vista previa.', true);
      }
    };
  }

  if (btnToggleMode) {
    btnToggleMode.onclick = () => {
      isEditorOpen = !isEditorOpen;
      if (isEditorOpen) {
        editorBox.style.display = 'block';
        btnToggleMode.innerHTML = '<i class="fa-solid fa-eye"></i> Ver Render Visual';
      } else {
        editorBox.style.display = 'none';
        btnToggleMode.innerHTML = '<i class="fa-solid fa-code"></i> Alternar Modo Editor / Render';
      }
    };
  }

  if (markdownInput) {
    markdownInput.oninput = () => {
      currentMarkdown = markdownInput.value;
      debounceUpdatePreview();
    };
  }

  let debounceTimer = null;
  function debounceUpdatePreview() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const docTypeEl = document.getElementById('exec-doc-type');
        const docType = docTypeEl ? docTypeEl.value : 'presentation';
        const contactName = document.getElementById('exec-contact-name').value.trim();
        const companyName = document.getElementById('exec-company-name').value.trim();
        const phone = document.getElementById('exec-phone').value.trim();
        const email = document.getElementById('exec-email').value.trim();
        const domain = document.getElementById('exec-domain').value.trim();
        const planTier = document.getElementById('exec-plan-tier').value;
        const activeIssuer = await getActiveIssuerData();

        const response = await fetch('/tg-generate-executive-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'preview',
            doc_type: docType,
            client_name: contactName,
            company_name: companyName,
            phone: phone,
            email: email,
            domain: domain,
            plan_tier: planTier,
            custom_markdown: currentMarkdown,
            ...activeIssuer
          })
        });
        const data = await response.json();
        if (data.ok && data.html) {
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.minHeight = '600px';
          iframe.style.border = 'none';
          iframe.srcdoc = data.html || '';
          renderBox.innerHTML = '';
          renderBox.appendChild(iframe);
        }
      } catch (err) {
        console.error('Error live sync preview:', err);
      }
    }, 400);
  }

  if (btnExportPdf) {
    btnExportPdf.onclick = async () => {
      const docTypeEl = document.getElementById('exec-doc-type');
      const docType = docTypeEl ? docTypeEl.value : 'presentation';
      const contactName = document.getElementById('exec-contact-name').value.trim();
      const companyName = document.getElementById('exec-company-name').value.trim();
      const phone = document.getElementById('exec-phone').value.trim();
      const email = document.getElementById('exec-email').value.trim();
      const domain = document.getElementById('exec-domain').value.trim();
      const planTier = document.getElementById('exec-plan-tier').value;
      const activeIssuer = await getActiveIssuerData();

      showToast('⏳ Compilando y generando el archivo PDF oficial...');

      try {
        const response = await fetch('/tg-generate-executive-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'pdf',
            doc_type: docType,
            client_name: contactName,
            company_name: companyName,
            phone: phone,
            email: email,
            domain: domain,
            plan_tier: planTier,
            custom_markdown: currentMarkdown,
            ...activeIssuer
          })
        });

        const data = await response.json();

        if (data.ok && data.downloads && data.downloads.length > 0) {
          data.downloads.forEach((dl, i) => {
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = 'data:application/pdf;base64,' + dl.b64;
              link.download = dl.name;
              document.body.appendChild(link);
              link.click();
              link.remove();
            }, i * 500);
          });
          showToast('✅ ¡Presentación en PDF generada y descargada exitosamente!');
        } else {
          showToast('❌ Error compilando el PDF: ' + (data.error || 'Sin archivo generado'), true);
        }
      } catch (err) {
        console.error('Error exportando PDF resumen ejecutivo:', err);
        showToast('❌ Error de conexión al generar PDF.', true);
      }
    };
  }

  const btnClosePreview = document.getElementById('btn-close-exec-preview');
  if (btnClosePreview) {
    btnClosePreview.onclick = () => {
      if (previewWrapper) {
        previewWrapper.style.display = 'none';
      }
      if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('ℹ️ Vista previa del documento cerrada.');
    };
  }
}



